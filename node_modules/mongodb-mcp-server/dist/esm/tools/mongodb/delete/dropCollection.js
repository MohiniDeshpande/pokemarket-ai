import { CollOperationArgs, MongoDBToolBase } from "../mongodbTool.js";
import { z } from "zod";
const DropCollectionOutputSchema = {
    database: z.string(),
    collection: z.string(),
    dropped: z.boolean(),
};
export class DropCollectionTool extends MongoDBToolBase {
    constructor() {
        super(...arguments);
        this.description = "Removes a collection or view from the database. The method also removes any indexes associated with the dropped collection.";
        this.argsShape = {
            ...CollOperationArgs,
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
DropCollectionTool.toolName = "drop-collection";
DropCollectionTool.operationType = "delete";
//# sourceMappingURL=dropCollection.js.map