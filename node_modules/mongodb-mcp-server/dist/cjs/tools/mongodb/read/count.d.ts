import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { MongoDBToolBase } from "../mongodbTool.js";
import type { ToolArgs, OperationType, ToolExecutionContext } from "../../tool.js";
export declare const CountArgs: {
    query: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>>;
};
export declare class CountTool extends MongoDBToolBase {
    static toolName: string;
    description: string;
    argsShape: {
        query: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>>;
        collection: import("zod").ZodString;
        database: import("zod").ZodString;
    };
    static operationType: OperationType;
    protected execute({ database, collection, query }: ToolArgs<typeof this.argsShape>, { signal }: ToolExecutionContext): Promise<CallToolResult>;
}
//# sourceMappingURL=count.d.ts.map