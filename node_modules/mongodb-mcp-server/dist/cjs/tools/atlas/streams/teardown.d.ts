import { z } from "zod";
import { StreamsToolBase } from "./streamsToolBase.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { OperationType, ToolArgs } from "../../tool.js";
export declare class StreamsTeardownTool extends StreamsToolBase {
    static toolName: string;
    static operationType: OperationType;
    description: string;
    argsShape: {
        projectId: z.ZodString;
        resource: z.ZodEnum<{
            processor: "processor";
            connection: "connection";
            workspace: "workspace";
            privatelink: "privatelink";
            peering: "peering";
        }>;
        workspaceName: z.ZodOptional<z.ZodString>;
        resourceName: z.ZodOptional<z.ZodString>;
    };
    protected getConfirmationMessage(args: ToolArgs<typeof this.argsShape>): string;
    protected execute(args: ToolArgs<typeof this.argsShape>): Promise<CallToolResult>;
    private requireWorkspaceName;
    private requireResourceName;
    private deleteProcessor;
    private deleteConnection;
    private deleteWorkspace;
    private deletePrivateLink;
    private deletePeering;
}
//# sourceMappingURL=teardown.d.ts.map