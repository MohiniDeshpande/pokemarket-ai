import { MongoDBToolBase } from "../mongodbTool.js";
import type { OperationType, ToolResult } from "../../tool.js";
import { z } from "zod";
export declare const ListDatabasesOutputSchema: {
    databases: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        size: z.ZodNumber;
    }, z.core.$strip>>;
    totalCount: z.ZodNumber;
};
export type ListDatabasesOutput = z.infer<z.ZodObject<typeof ListDatabasesOutputSchema>>;
export declare class ListDatabasesTool extends MongoDBToolBase {
    static toolName: string;
    description: string;
    argsShape: {};
    outputSchema: {
        databases: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            size: z.ZodNumber;
        }, z.core.$strip>>;
        totalCount: z.ZodNumber;
    };
    static operationType: OperationType;
    protected execute(): Promise<ToolResult<typeof this.outputSchema>>;
}
//# sourceMappingURL=listDatabases.d.ts.map