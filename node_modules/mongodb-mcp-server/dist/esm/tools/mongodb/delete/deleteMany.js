import { CollOperationArgs, MongoDBToolBase } from "../mongodbTool.js";
import { checkIndexUsage } from "../../../helpers/indexCheck.js";
import { EJSON } from "bson";
import { zEJSON } from "../../args.js";
import { z } from "zod";
const DeleteManyOutputSchema = {
    database: z.string(),
    collection: z.string(),
    deletedCount: z.number(),
};
export class DeleteManyTool extends MongoDBToolBase {
    constructor() {
        super(...arguments);
        this.description = "Removes all documents that match the filter from a MongoDB collection";
        this.argsShape = {
            ...CollOperationArgs,
            filter: zEJSON()
                .optional()
                .describe("The query filter, specifying the deletion criteria. Matches the syntax of the filter argument of db.collection.deleteMany()"),
        };
        this.outputSchema = DeleteManyOutputSchema;
    }
    async execute({ database, collection, filter, }) {
        const provider = await this.ensureConnected();
        // Check if delete operation uses an index if enabled
        if (this.config.indexCheck) {
            await checkIndexUsage({
                database,
                collection,
                operation: "deleteMany",
                explainCallback: async () => {
                    return provider.runCommandWithCheck(database, {
                        explain: {
                            delete: collection,
                            deletes: [
                                {
                                    q: filter || {},
                                    limit: 0, // 0 means delete all matching documents
                                },
                            ],
                        },
                        verbosity: "queryPlanner",
                        ...(this.config.maxTimeMS !== undefined && { maxTimeMS: this.config.maxTimeMS }),
                    });
                },
                logger: this.session.logger,
            });
        }
        const result = await provider.deleteMany(database, collection, filter);
        return {
            content: [
                {
                    text: `Deleted \`${result.deletedCount}\` document(s) from collection "${collection}"`,
                    type: "text",
                },
            ],
            structuredContent: {
                database,
                collection,
                deletedCount: result.deletedCount,
            },
        };
    }
    getConfirmationMessage({ database, collection, filter }) {
        const filterDescription = filter && Object.keys(filter).length > 0
            ? "```json\n" + `{ "filter": ${EJSON.stringify(filter)} }\n` + "```\n\n"
            : "- **All documents** (No filter)\n\n";
        return (`You are about to delete documents from the \`${collection}\` collection in the \`${database}\` database:\n\n` +
            filterDescription +
            "This operation will permanently remove all documents matching the filter.\n\n" +
            "**Do you confirm the execution of the action?**");
    }
}
DeleteManyTool.toolName = "delete-many";
DeleteManyTool.operationType = "delete";
//# sourceMappingURL=deleteMany.js.map