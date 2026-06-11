"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropCollectionTool = void 0;
const mongodbTool_js_1 = require("../mongodbTool.js");
const zod_1 = require("zod");
const DropCollectionOutputSchema = {
    database: zod_1.z.string(),
    collection: zod_1.z.string(),
    dropped: zod_1.z.boolean(),
};
class DropCollectionTool extends mongodbTool_js_1.MongoDBToolBase {
    constructor() {
        super(...arguments);
        this.description = "Removes a collection or view from the database. The method also removes any indexes associated with the dropped collection.";
        this.argsShape = {
            ...mongodbTool_js_1.CollOperationArgs,
        };
        this.outputSchema = DropCollectionOutputSchema;
    }
    async execute({ database, collection, }) {
        const provider = await this.ensureConnected();
        const result = await provider.dropCollection(database, collection);
        return {
            content: [
                {
                    text: `${result ? "Successfully dropped" : "Failed to drop"} collection "${collection}" from database "${database}"`,
                    type: "text",
                },
            ],
            structuredContent: {
                database,
                collection,
                dropped: result,
            },
        };
    }
    getConfirmationMessage({ database, collection }) {
        return (`You are about to drop the \`${collection}\` collection from the \`${database}\` database:\n\n` +
            "This operation will permanently remove the collection and all its data, including indexes.\n\n" +
            "**Do you confirm the execution of the action?**");
    }
}
exports.DropCollectionTool = DropCollectionTool;
DropCollectionTool.toolName = "drop-collection";
DropCollectionTool.operationType = "delete";
//# sourceMappingURL=dropCollection.js.map