import { CollOperationArgs, MongoDBToolBase } from "../mongodbTool.js";
import type { ToolArgs, OperationType, ToolExecutionContext, ToolResult } from "../../tool.js";
import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
declare const CollectionStorageSizeOutputSchema: {
    size: z.ZodNumber;
    units: z.ZodString;
};
export type CollectionStorageSizeOutput = z.infer<z.ZodObject<typeof CollectionStorageSizeOutputSchema>>;
export declare class CollectionStorageSizeTool extends MongoDBToolBase {
    static toolName: string;
    description: string;
    argsShape: {
        collection: z.ZodString;
        database: z.ZodString;
    };
    outputSchema: {
        size: z.ZodNumber;
        units: z.ZodString;
    };
    static operationType: OperationType;
    protected execute({ database, collection }: ToolArgs<typeof CollOperationArgs>, { signal }: ToolExecutionContext): Promise<ToolResult<typeof this.outputSchema>>;
    protected handleError(error: unknown, args: ToolArgs<typeof this.argsShape>): Promise<CallToolResult>;
    private static getStats;
}
export {};
//# sourceMappingURL=collectionStorageSize.d.ts.map