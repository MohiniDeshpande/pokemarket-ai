import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { type OperationType, type ToolArgs } from "../../tool.js";
import { AtlasToolBase } from "../atlasTool.js";
export declare const ListAlertsArgs: {
    projectId: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<{
        CLOSED: "CLOSED";
        OPEN: "OPEN";
        TRACKING: "TRACKING";
    }>>;
    limit: z.ZodDefault<z.ZodNumber>;
    pageNum: z.ZodDefault<z.ZodNumber>;
};
export declare class ListAlertsTool extends AtlasToolBase {
    static toolName: string;
    description: string;
    static operationType: OperationType;
    argsShape: {
        projectId: z.ZodString;
        status: z.ZodDefault<z.ZodEnum<{
            CLOSED: "CLOSED";
            OPEN: "OPEN";
            TRACKING: "TRACKING";
        }>>;
        limit: z.ZodDefault<z.ZodNumber>;
        pageNum: z.ZodDefault<z.ZodNumber>;
    };
    protected execute({ projectId, status, limit, pageNum, }: ToolArgs<typeof this.argsShape>): Promise<CallToolResult>;
}
//# sourceMappingURL=listAlerts.d.ts.map