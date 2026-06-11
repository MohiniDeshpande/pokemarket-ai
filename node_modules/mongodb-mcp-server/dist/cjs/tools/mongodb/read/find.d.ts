import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { MongoDBToolBase } from "../mongodbTool.js";
import type { ToolArgs, OperationType, ToolExecutionContext } from "../../tool.js";
export declare const FindArgs: {
    filter: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    projection: z.ZodOptional<z.ZodObject<{}, z.core.$loose>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sort: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<-1>, z.ZodLiteral<"asc">, z.ZodLiteral<"desc">, z.ZodLiteral<"ascending">, z.ZodLiteral<"descending">, z.ZodObject<{
        $meta: z.ZodString;
    }, z.core.$strip>]>>>;
};
export declare class FindTool extends MongoDBToolBase {
    static toolName: string;
    description: string;
    argsShape: {
        responseBytesLimit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        filter: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        projection: z.ZodOptional<z.ZodObject<{}, z.core.$loose>>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        sort: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<-1>, z.ZodLiteral<"asc">, z.ZodLiteral<"desc">, z.ZodLiteral<"ascending">, z.ZodLiteral<"descending">, z.ZodObject<{
            $meta: z.ZodString;
        }, z.core.$strip>]>>>;
        collection: z.ZodString;
        database: z.ZodString;
    };
    static operationType: OperationType;
    protected execute({ database, collection, filter, projection, limit, sort, responseBytesLimit }: ToolArgs<typeof this.argsShape>, { signal }: ToolExecutionContext): Promise<CallToolResult>;
    private safeCloseCursor;
    private generateMessage;
    private getLimitForFindCursor;
}
//# sourceMappingURL=find.d.ts.map