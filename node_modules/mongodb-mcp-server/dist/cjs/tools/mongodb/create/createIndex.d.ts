import { z } from "zod";
import { MongoDBToolBase } from "../mongodbTool.js";
import { type ToolArgs, type OperationType, type ToolResult } from "../../tool.js";
declare const CreateIndexOutputSchema: {
    database: z.ZodString;
    collection: z.ZodString;
    indexName: z.ZodString;
    indexType: z.ZodEnum<{
        search: "search";
        vectorSearch: "vectorSearch";
        classic: "classic";
    }>;
};
export type CreateIndexOutput = z.infer<z.ZodObject<typeof CreateIndexOutputSchema>>;
export declare class CreateIndexTool extends MongoDBToolBase {
    private filterFieldSchema;
    private vectorFieldSchema;
    private autoEmbedFieldSchema;
    private vectorSearchIndexDefinition;
    private atlasSearchIndexDefinition;
    static toolName: string;
    description: string;
    argsShape: {
        name: z.ZodOptional<z.ZodString>;
        definition: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"classic">;
            keys: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<-1>, z.ZodLiteral<"2d">, z.ZodLiteral<"2dsphere">, z.ZodLiteral<"text">, z.ZodLiteral<"geoHaystack">, z.ZodLiteral<"hashed">]>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"vectorSearch">;
            fields: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"filter">;
                path: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                type: z.ZodLiteral<"vector">;
                path: z.ZodString;
                numDimensions: z.ZodDefault<z.ZodNumber>;
                similarity: z.ZodDefault<z.ZodEnum<{
                    cosine: "cosine";
                    euclidean: "euclidean";
                    dotProduct: "dotProduct";
                }>>;
                quantization: z.ZodDefault<z.ZodEnum<{
                    binary: "binary";
                    none: "none";
                    scalar: "scalar";
                }>>;
            }, z.core.$strict>, z.ZodObject<{
                type: z.ZodLiteral<"autoEmbed">;
                path: z.ZodString;
                model: z.ZodEnum<{
                    "voyage-4": "voyage-4";
                    "voyage-4-large": "voyage-4-large";
                    "voyage-4-lite": "voyage-4-lite";
                    "voyage-code-3": "voyage-code-3";
                }>;
                modality: z.ZodEnum<{
                    text: "text";
                }>;
            }, z.core.$strict>], "type">>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"search">;
            analyzer: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            mappings: z.ZodObject<{
                dynamic: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                fields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
                    type: z.ZodEnum<{
                        string: "string";
                        number: "number";
                        boolean: "boolean";
                        date: "date";
                        uuid: "uuid";
                        autocomplete: "autocomplete";
                        document: "document";
                        embeddedDocuments: "embeddedDocuments";
                        geo: "geo";
                        objectId: "objectId";
                        token: "token";
                    }>;
                }, z.core.$loose>>>;
            }, z.core.$strip>;
            numPartitions: z.ZodPipe<z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"1">, z.ZodLiteral<"2">, z.ZodLiteral<"4">]>>, z.ZodTransform<number, "1" | "2" | "4">>;
        }, z.core.$strip>], "type">>;
        collection: z.ZodString;
        database: z.ZodString;
    };
    outputSchema: {
        database: z.ZodString;
        collection: z.ZodString;
        indexName: z.ZodString;
        indexType: z.ZodEnum<{
            search: "search";
            vectorSearch: "vectorSearch";
            classic: "classic";
        }>;
    };
    static operationType: OperationType;
    protected execute({ database, collection, name, definition: definitions, }: ToolArgs<typeof this.argsShape>): Promise<ToolResult<typeof this.outputSchema>>;
}
export {};
//# sourceMappingURL=createIndex.d.ts.map