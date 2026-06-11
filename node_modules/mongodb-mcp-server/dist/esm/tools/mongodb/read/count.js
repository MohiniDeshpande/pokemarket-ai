import { CollOperationArgs, MongoDBToolBase } from "../mongodbTool.js";
import { checkIndexUsage } from "../../../helpers/indexCheck.js";
import { zEJSON } from "../../args.js";
export const CountArgs = {
    query: zEJSON()
        .optional()
        .describe("A filter/query parameter. Allows users to filter the documents to count. Matches the syntax of the filter argument of db.collection.count()."),
};
export class CountTool extends MongoDBToolBase {
    constructor() {
        super(...arguments);
        this.description = "Gets the number of documents in a MongoDB collection using db.collection.count() and query as an optional filter parameter";
        this.argsShape = {
            ...CollOperationArgs,
            ...CountArgs,
        };
    }
    async execute({ database, collection, query }, { signal }) {
        const provider = await this.ensureConnected();
        // Check if count operation uses an index if enabled
        if (this.config.indexCheck) {
            await checkIndexUsage({
                database,
                collection,
                operation: "count",
                explainCallback: async () => {
                    return provider.runCommandWithCheck(database, {
                        explain: {
                            count: collection,
                            query,
                        },
                        verbosity: "queryPlanner",
                        ...(this.config.maxTimeMS !== undefined && { maxTimeMS: this.config.maxTimeMS }),
                    }, {
                        signal,
                    });
                },
                logger: this.session.logger,
            });
        }
        const count = await provider.countDocuments(database, collection, query, {
            ...this.getOperationOptions(signal),
        });
        return {
            content: [
                {
                    text: `Found ${count} documents in the collection "${collection}"${query ? " that matched the query" : ""}.`,
                    type: "text",
                },
            ],
        };
    }
}
CountTool.toolName = "count";
CountTool.operationType = "read";
//# sourceMappingURL=count.js.map