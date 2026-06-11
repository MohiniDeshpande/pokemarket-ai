import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { MongoDBToolBase } from "../mongodbTool.js";
import type { ToolArgs, OperationType, ToolExecutionContext } from "../../tool.js";
export declare const AggregateArgs: {
    pipeline: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
};
export declare class AggregateDBTool extends MongoDBToolBase {
    static toolName: string;
    description: string;
    argsShape: {
        responseBytesLimit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        pipeline: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        database: z.ZodString;
    };
    static operationType: OperationType;
    protected execute({ database, pipeline, responseBytesLimit }: ToolArgs<typeof this.argsShape>, { signal }: ToolExecutionContext): Promise<CallToolResult>;
    private safeCloseCursor;
    private assertOnlyUsesPermittedStages;
    private countAggregationResultDocuments;
    private generateMessage;
    private isWriteStage;
}
//# sourceMappingURL=aggregateDB.d.ts.map