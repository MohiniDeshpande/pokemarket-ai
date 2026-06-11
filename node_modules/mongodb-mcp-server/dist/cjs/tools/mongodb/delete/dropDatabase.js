"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropDatabaseTool = void 0;
const mongodbTool_js_1 = require("../mongodbTool.js");
const zod_1 = require("zod");
const DropDatabaseOutputSchema = {
    database: zod_1.z.string(),
    dropped: zod_1.z.boolean(),
};
class DropDatabaseTool extends mongodbTool_js_1.MongoDBToolBase {
    constructor() {
        super(...arguments);
        this.description = "Removes the specified database, deleting the associated data files";
        this.argsShape = mongodbTool_js_1.DBOperationArgs;
        this.outputSchema = DropDatabaseOutputSchema;
    }
    async execute({ database, }) {
        const provider = await this.ensureConnected();
        const result = await provider.dropDatabase(database);
        return {
            content: [
                {
                    text: `${result.ok ? "Successfully dropped" : "Failed to drop"} database "${database}"`,
                    type: "text",
                },
            ],
            structuredContent: {
                database,
                dropped: Boolean(result.ok),
            },
        };
    }
    getConfirmationMessage({ database }) {
        return (`You are about to drop the \`${database}\` database:\n\n` +
            "This operation will permanently remove the database and ALL its collections, documents, and indexes.\n\n" +
            "**Do you confirm the execution of the action?**");
    }
}
exports.DropDatabaseTool = DropDatabaseTool;
DropDatabaseTool.toolName = "drop-database";
DropDatabaseTool.operationType = "delete";
//# sourceMappingURL=dropDatabase.js.map