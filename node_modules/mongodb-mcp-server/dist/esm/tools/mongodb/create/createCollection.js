import { CollOperationArgs, MongoDBToolBase } from "../mongodbTool.js";
import { z } from "zod";
const CreateCollectionOutputSchema = {
    database: z.string(),
    collection: z.string(),
    created: z.boolean(),
};
export class CreateCollectionTool extends MongoDBToolBase {
    constructor() {
        super(...arguments);
        this.description = "Creates a new collection in a database. If the database doesn't exist, it will be created automatically.";
        this.argsShape = CollOperationArgs;
        this.outputSchema = CreateCollectionOutputSchema;
    }
    async execute({ collection, database, }) {
        const provider = await this.ensureConnected();
        await provider.createCollection(database, collection);
        return {
            content: [
                {
                    type: "text",
                    text: `Collection "${collection}" created in database "${database}".`,
                },
            ],
            structuredContent: {
                database,
                collection,
                created: true,
            },
        };
    }
}
CreateCollectionTool.toolName = "create-collection";
CreateCollectionTool.operationType = "create";
//# sourceMappingURL=createCollection.js.map