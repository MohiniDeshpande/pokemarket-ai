"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenameCollectionTool = void 0;
const zod_1 = require("zod");
const mongodbTool_js_1 = require("../mongodbTool.js");
const RenameCollectionOutputSchema = {
    database: zod_1.z.string(),
    oldCollection: zod_1.z.string(),
    newCollection: zod_1.z.string(),
    renamed: zod_1.z.boolean(),
};
class RenameCollectionTool extends mongodbTool_js_1.MongoDBToolBase {
    constructor() {
        super(...arguments);
        this.description = "Renames a collection in a MongoDB database";
        this.outputSchema = RenameCollectionOutputSchema;
        this.argsShape = {
            ...mongodbTool_js_1.CollOperationArgs,
            newName: zod_1.z.string().describe("The new name for the collection"),
            dropTarget: zod_1.z.boolean().optional().default(false).describe("If true, drops the target collection if it exists"),
        };
    }
    async execute({ database, collection, newName, dropTarget, }) {
        const provider = await this.ensureConnected();
        const result = await provider.renameCollection(database, collection, newName, {
            dropTarget,
        });
        return {
            content: [
                {
                    text: `Collection "${collection}" renamed to "${result.collectionName}" in database "${database}".`,
                    type: "text",
                },
            ],
            structuredContent: {
                database,
                oldCollection: collection,
                newCollection: result.collectionName,
                renamed: true,
            },
        };
    }
    async handleError(error, args) {
        if (error instanceof Error && "codeName" in error) {
            switch (error.codeName) {
                case "NamespaceNotFound":
                    return Promise.resolve({
                        content: [
                            {
                                text: `Cannot rename "${args.database}.${args.collection}" because it doesn't exist.`,
                                type: "text",
                            },
                        ],
                        structuredContent: {
                            database: args.database,
                            oldCollection: args.collection,
                            newCollection: args.newName,
                            renamed: false,
                        },
                        isError: true,
                    });
                case "NamespaceExists":
                    return Promise.resolve({
                        content: [
                            {
                                text: `Cannot rename "${args.database}.${args.collection}" to "${args.newName}" because the target collection already exists. If you want to overwrite it, set the "dropTarget" argument to true.`,
                                type: "text",
                            },
                        ],
                        structuredContent: {
                            database: args.database,
                            oldCollection: args.collection,
                            newCollection: args.newName,
                            renamed: false,
                        },
                        isError: true,
                    });
            }
        }
        // For other errors, call parent but add structured content
        const parentResult = await super.handleError(error, args);
        return {
            content: parentResult.content,
            isError: parentResult.isError,
            structuredContent: {
                database: args.database,
                oldCollection: args.collection,
                newCollection: args.newName,
                renamed: false,
            },
        };
    }
}
exports.RenameCollectionTool = RenameCollectionTool;
RenameCollectionTool.toolName = "rename-collection";
RenameCollectionTool.operationType = "update";
//# sourceMappingURL=renameCollection.js.map