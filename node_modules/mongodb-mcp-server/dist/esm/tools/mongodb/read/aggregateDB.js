import { z } from "zod";
import { DBOperationArgs, MongoDBToolBase } from "../mongodbTool.js";
import { formatUntrustedData } from "../../tool.js";
import { EJSON } from "bson";
import { ErrorCodes, MongoDBError } from "../../../common/errors.js";
import { collectCursorUntilMaxBytesLimit } from "../../../helpers/collectCursorUntilMaxBytes.js";
import { operationWithFallback } from "../../../helpers/operationWithFallback.js";
import { AGG_COUNT_MAX_TIME_MS_CAP, ONE_MB, CURSOR_LIMITS_TO_LLM_TEXT } from "../../../helpers/constants.js";
import { LogId } from "../../../common/logging/index.js";
import { AnyAggregateStage, DB_AGGREGATE_STAGE_OPERATORS } from "../mongodbSchemas.js";
export const AggregateArgs = {
    pipeline: z
        .array(AnyAggregateStage)
        .min(1)
        .describe(`An array of aggregation stages to execute. The first stage must be a database-level aggregation stage (one of ${DB_AGGREGATE_STAGE_OPERATORS.map((op) => `\`${op}\``).join(", ")}). https://www.mongodb.com/docs/manual/reference/mql/aggregation-stages/#db.aggregate---stages`),
};
export class AggregateDBTool extends MongoDBToolBase {
    constructor() {
        super(...arguments);
        this.description = "Run an aggregation against a MongoDB database";
        this.argsShape = {
            ...DBOperationArgs,
            ...AggregateArgs,
            responseBytesLimit: z.number().optional().default(ONE_MB).describe(`\
The maximum number of bytes to return in the response. This value is capped by the server's configured maxBytesPerQuery and cannot be exceeded.`),
        };
    }
    async execute({ database, pipeline, responseBytesLimit }, { signal }) {
        let aggregationCursor = undefined;
        try {
            const provider = await this.ensureConnected();
            this.assertOnlyUsesPermittedStages(pipeline);
            let successMessage;
            let documents;
            if (pipeline.some((stage) => this.isWriteStage(stage))) {
                // This is a write pipeline, so special-case it and don't attempt to apply limits or caps
                aggregationCursor = provider.aggregateDb(database, pipeline, {
                    ...this.getOperationOptions(signal),
                });
                documents = await aggregationCursor.toArray();
                successMessage = "The aggregation pipeline executed successfully.";
            }
            else {
                const cappedResultsPipeline = [...pipeline];
                if (this.config.maxDocumentsPerQuery > 0) {
                    cappedResultsPipeline.push({ $limit: this.config.maxDocumentsPerQuery });
                }
                aggregationCursor = provider.aggregateDb(database, cappedResultsPipeline, {
                    ...this.getOperationOptions(signal),
                });
                const [totalDocuments, cursorResults] = await Promise.all([
                    this.countAggregationResultDocuments({
                        provider,
                        database,
                        pipeline,
                        abortSignal: signal,
                    }),
                    collectCursorUntilMaxBytesLimit({
                        cursor: aggregationCursor,
                        configuredMaxBytesPerQuery: this.config.maxBytesPerQuery,
                        toolResponseBytesLimit: responseBytesLimit,
                        abortSignal: signal,
                    }),
                ]);
                // If the total number of documents that the aggregation would've
                // resulted in would be greater than the configured
                // maxDocumentsPerQuery then we know for sure that the results were
                // capped.
                const aggregationResultsCappedByMaxDocumentsLimit = this.config.maxDocumentsPerQuery > 0 &&
                    !!totalDocuments &&
                    totalDocuments > this.config.maxDocumentsPerQuery;
                documents = cursorResults.documents;
                successMessage = this.generateMessage({
                    aggResultsCount: totalDocuments,
                    documents: cursorResults.documents,
                    appliedLimits: [
                        aggregationResultsCappedByMaxDocumentsLimit ? "config.maxDocumentsPerQuery" : undefined,
                        cursorResults.cappedBy,
                    ].filter((limit) => !!limit),
                });
            }
            return {
                content: formatUntrustedData(successMessage, ...(documents.length > 0 ? [EJSON.stringify(documents)] : [])),
            };
        }
        finally {
            if (aggregationCursor) {
                void this.safeCloseCursor(aggregationCursor);
            }
        }
    }
    async safeCloseCursor(cursor) {
        try {
            await cursor.close();
        }
        catch (error) {
            this.session.logger.warning({
                id: LogId.mongodbCursorCloseError,
                context: "aggregate-db tool",
                message: `Error when closing the cursor - ${error instanceof Error ? error.message : String(error)}`,
            });
        }
    }
    assertOnlyUsesPermittedStages(pipeline) {
        const firstStage = pipeline[0];
        if (!firstStage || !DB_AGGREGATE_STAGE_OPERATORS.some((op) => op in firstStage)) {
            throw new MongoDBError(ErrorCodes.InvalidPipeline, `The first stage of the pipeline must be a database-level aggregation stage (one of ${DB_AGGREGATE_STAGE_OPERATORS.join(", ")})`);
        }
        const writeOperations = ["update", "create", "delete"];
        let writeStageForbiddenError = "";
        if (this.config.readOnly) {
            writeStageForbiddenError = "In readOnly mode you can not run pipelines with $out or $merge stages.";
        }
        else if (this.config.disabledTools.some((t) => writeOperations.includes(t))) {
            writeStageForbiddenError =
                "When 'create', 'update', or 'delete' operations are disabled, you can not run pipelines with $out or $merge stages.";
        }
        for (const stage of pipeline) {
            // This validates that in readOnly mode or "write" operations are disabled, we can't use $out or $merge.
            // This is really important because aggregates are the only "multi-faceted" tool in the MQL, where you
            // can both read and write.
            if (this.isWriteStage(stage) && writeStageForbiddenError) {
                throw new MongoDBError(ErrorCodes.ForbiddenWriteOperation, writeStageForbiddenError);
            }
        }
    }
    async countAggregationResultDocuments({ provider, database, pipeline, abortSignal, }) {
        const resultsCountAggregation = [...pipeline, { $count: "totalDocuments" }];
        return await operationWithFallback(async () => {
            const aggregationResults = await provider
                .aggregateDb(database, resultsCountAggregation, {
                signal: abortSignal,
            })
                .maxTimeMS(this.config.maxTimeMS !== undefined
                ? Math.min(this.config.maxTimeMS, AGG_COUNT_MAX_TIME_MS_CAP)
                : AGG_COUNT_MAX_TIME_MS_CAP)
                .toArray();
            const documentWithCount = aggregationResults.length === 1 ? aggregationResults[0] : undefined;
            const totalDocuments = documentWithCount &&
                typeof documentWithCount === "object" &&
                "totalDocuments" in documentWithCount &&
                typeof documentWithCount.totalDocuments === "number"
                ? documentWithCount.totalDocuments
                : 0;
            return totalDocuments;
        }, undefined);
    }
    generateMessage({ aggResultsCount, documents, appliedLimits, }) {
        let message = `The aggregation resulted in ${aggResultsCount === undefined ? "indeterminable number of" : aggResultsCount} documents.`;
        // If we applied a limit or the count is different from the aggregation result count,
        // communicate what is the actual number of returned documents
        if (documents.length !== aggResultsCount || appliedLimits.length) {
            message += ` Returning ${documents.length} documents`;
            if (appliedLimits.length) {
                message += ` while respecting the applied limits of ${appliedLimits
                    .map((limit) => CURSOR_LIMITS_TO_LLM_TEXT[limit])
                    .join(", ")}`;
            }
            message += ".";
        }
        return message;
    }
    isWriteStage(stage) {
        return "$out" in stage || "$merge" in stage;
    }
}
AggregateDBTool.toolName = "aggregate-db";
AggregateDBTool.operationType = "read";
//# sourceMappingURL=aggregateDB.js.map