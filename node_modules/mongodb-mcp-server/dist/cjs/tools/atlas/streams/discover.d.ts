import { z } from "zod";
import { StreamsToolBase } from "./streamsToolBase.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { OperationType, ToolArgs } from "../../tool.js";
export declare class StreamsDiscoverTool extends StreamsToolBase {
    static toolName: string;
    static operationType: OperationType;
    description: string;
    argsShape: {
        projectId: z.ZodString;
        action: z.ZodEnum<{
            "list-workspaces": "list-workspaces";
            "inspect-workspace": "inspect-workspace";
            "list-connections": "list-connections";
            "inspect-connection": "inspect-connection";
            "list-processors": "list-processors";
            "inspect-processor": "inspect-processor";
            "diagnose-processor": "diagnose-processor";
            "get-networking": "get-networking";
        }>;
        workspaceName: z.ZodOptional<z.ZodString>;
        resourceName: z.ZodOptional<z.ZodString>;
        responseFormat: z.ZodOptional<z.ZodEnum<{
            concise: "concise";
            detailed: "detailed";
        }>>;
        cloudProvider: z.ZodOptional<z.ZodString>;
        region: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodNumber>;
        pageNum: z.ZodOptional<z.ZodNumber>;
    };
    protected execute({ projectId, action, workspaceName, resourceName, responseFormat, cloudProvider, region, limit, pageNum, }: ToolArgs<typeof this.argsShape>): Promise<CallToolResult>;
    private requireWorkspaceName;
    private requireResourceName;
    private listWorkspaces;
    private inspectWorkspace;
    private listConnections;
    private inspectConnection;
    private listProcessors;
    private inspectProcessor;
    private diagnoseProcessor;
    private getNetworking;
}
//# sourceMappingURL=discover.d.ts.map