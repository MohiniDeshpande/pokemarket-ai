import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { MongoDBToolBase } from "../mongodbTool.js";
import type { ToolArgs, OperationType, ToolExecutionContext } from "../../tool.js";
export declare const pipelineDescriptionWithVectorSearch = "An array of aggregation stages to execute.\nIf the user has asked for a vector search, `$vectorSearch` **MUST** be the first stage of the pipeline, or the first stage of a `$unionWith` subpipeline.\nIf the user has asked for lexical/Atlas search, use `$search` instead of `$text`.\n### Usage Rules for `$vectorSearch`\n- **Index Type Detection:**\n  Use the collection-indexes tool to determine if the target field has a classic vector index (type: 'vector') or an auto-embed index (type: 'autoEmbed').\n- **Classic Vector Search (type: 'vector'):**\n  Use 'queryVector' with embeddings as an array of numbers.\n- **Auto-Embed Vector Search (type: 'autoEmbed'):**\n  Use 'query' - MongoDB automatically generates embeddings at query time. Do NOT use 'queryVector' or 'embeddingParameters' for auto-embed indexes.\n- **Unset embeddings:**\n  Unless the user explicitly requests the embeddings, add an `$unset` stage **at the end of the pipeline** to remove the embedding field and avoid context limits. **The $unset stage in this situation is mandatory**.\n- **Pre-filtering:**\n  If the user requests additional filtering, include filters in `$vectorSearch.filter` only for pre-filter fields in the vector index.\n  NEVER include fields in $vectorSearch.filter that are not part of the vector index.\n- **Post-filtering:**\n  For all remaining filters, add a $match stage after $vectorSearch.\n- If unsure which fields are filterable, use the collection-indexes tool to determine valid prefilter fields.\n- If no requested filters are valid prefilters, omit the filter key from $vectorSearch.\n\n### Usage Rules for `$search`\n- Include the index name, unless you know for a fact there's a default index. If unsure, use the collection-indexes tool to determine the index name.\n- The `$search` stage supports multiple operators, such as 'autocomplete', 'text', 'geoWithin', and others. Choose the approprate operator based on the user's query. If unsure of the exact syntax, consult the MongoDB Atlas Search documentation, which can be found here: https://www.mongodb.com/docs/atlas/atlas-search/operators-and-collectors/\n";
export declare const AggregateArgs: {
    pipeline: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        $vectorSearch: z.ZodUnion<readonly [z.ZodObject<{
            exact: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            index: z.ZodString;
            path: z.ZodString;
            numCandidates: z.ZodOptional<z.ZodNumber>;
            limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            filter: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            queryVector: z.ZodArray<z.ZodNumber>;
        }, z.core.$strip>, z.ZodObject<{
            exact: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            index: z.ZodString;
            path: z.ZodString;
            numCandidates: z.ZodOptional<z.ZodNumber>;
            limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            filter: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            query: z.ZodObject<{
                text: z.ZodString;
            }, z.core.$strip>;
            model: z.ZodOptional<z.ZodEnum<{
                "voyage-4": "voyage-4";
                "voyage-4-large": "voyage-4-large";
                "voyage-4-lite": "voyage-4-lite";
                "voyage-code-3": "voyage-code-3";
            }>>;
        }, z.core.$strip>]>;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
};
export declare class AggregateTool extends MongoDBToolBase {
    static toolName: string;
    description: string;
    argsShape: {
        responseBytesLimit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        pipeline: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            $vectorSearch: z.ZodUnion<readonly [z.ZodObject<{
                exact: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                index: z.ZodString;
                path: z.ZodString;
                numCandidates: z.ZodOptional<z.ZodNumber>;
                limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                filter: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                queryVector: z.ZodArray<z.ZodNumber>;
            }, z.core.$strip>, z.ZodObject<{
                exact: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                index: z.ZodString;
                path: z.ZodString;
                numCandidates: z.ZodOptional<z.ZodNumber>;
                limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                filter: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                query: z.ZodObject<{
                    text: z.ZodString;
                }, z.core.$strip>;
                model: z.ZodOptional<z.ZodEnum<{
                    "voyage-4": "voyage-4";
                    "voyage-4-large": "voyage-4-large";
                    "voyage-4-lite": "voyage-4-lite";
                    "voyage-code-3": "voyage-code-3";
                }>>;
            }, z.core.$strip>]>;
        }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
        collection: z.ZodString;
        database: z.ZodString;
    };
    static operationType: OperationType;
    protected execute({ database, collection, pipeline, responseBytesLimit }: ToolArgs<typeof this.argsShape>, { signal }: ToolExecutionContext): Promise<CallToolResult>;
    private safeCloseCursor;
    private assertOnlyUsesPermittedStages;
    private countAggregationResultDocuments;
    private isVectorSearchIndexUsed;
    private generateMessage;
    private isSearchStage;
    private isWriteStage;
}
//# sourceMappingURL=aggregate.d.ts.map