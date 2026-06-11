"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteManyTool = void 0;
const mongodbTool_js_1 = require("../mongodbTool.js");
const indexCheck_js_1 = require("../../../helpers/indexCheck.js");
const bson_1 = require("bson");
const args_js_1 = require("../../args.js");
const zod_1 = require("zod");
const DeleteManyOutputSchema = {
    database: zod_1.z.string(),
    collection: zod_1.z.string(),
    deletedCount: zod_1.z.number(),
};
class DeleteManyTool extends mongodbTool_js_1.MongoDBToolBase {
    constructor() {
        super(...arguments);
        this.description = "Removes all documents that match the filter from a MongoDB collection";
        this.argsShape = {
            ...mongodbTool_js_1.CollOperationArgs,
            filter: (0, args_js_1.zEJSON)()
                .optional()
                .describe("The query filter, specifying the deletion criteria. Matches the syntax of the filter argument of db.collection.deleteMany()"),
        };
        this.outputSchema = DeleteManyOutputSchema;
    }
    async execute({ database, collection, filter, }) {
        const provider = await this.ensureConnected();
        // Check if delete operation uses an index if enabled
        if (this.config.indexCheck) {
            await (0, indexCheck_js_1.checkIndexUsage)({
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
            ? "```json\n" + `{ "filter": ${bson_1.EJSON.stringify(filter)} }\n` + "```\n\n"
            : "- **All documents** (No filter)\n\n";
        return (`You are about to delete documents from the \`${collection}\` collection in the \`${database}\` database:\n\n` +
            filterDescription +
            "This operation will permanently remove all documents matching the filter.\n\n" +
            "**Do you confirm the execution of the action?**");
    }
}
exports.DeleteManyTool = DeleteManyTool;
DeleteManyTool.toolName = "delete-many";
DeleteManyTool.operationType = "delete";
//# sourceMappingURL=deleteMany.js.map