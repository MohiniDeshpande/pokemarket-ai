import { z } from "zod";
import type { ToolArgs, ToolCategory } from "../tool.js";
import { ToolBase } from "../tool.js";
import type { NodeDriverServiceProvider } from "@mongosh/service-provider-node-driver";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { Server } from "../../server.js";
import type { ConnectionMetadata } from "../../telemetry/types.js";
export declare const DBOperationArgs: {
    database: z.ZodString;
};
export declare const CollOperationArgs: {
    collection: z.ZodString;
    database: z.ZodString;
};
export declare abstract class MongoDBToolBase extends ToolBase {
    protected server?: Server;
    static category: ToolCategory;
    protected ensureConnected(): Promise<NodeDriverServiceProvider>;
    /**
     * Returns common operation options (signal, maxTimeMS) to pass to service provider methods.
     * If `maxTimeMS` is configured, it will be included in the returned options.
     */
    protected getOperationOptions(signal?: AbortSignal): {
        signal?: AbortSignal;
        maxTimeMS?: number;
    };
    register(server: Server): boolean;
    protected handleError(error: unknown, args: ToolArgs<typeof this.argsShape>): Promise<CallToolResult>;
    /**
     * Resolves the tool metadata from the arguments passed to the mongoDB tools.
     *
     * Since MongoDB tools are executed against a MongoDB instance, the tool calls will always have the connection information.
     *
     * @param result - The result of the tool call.
     * @param args - The arguments passed to the tool
     * @returns The tool metadata
     */
    protected resolveTelemetryMetadata(_args: ToolArgs<typeof this.argsShape>, { result }: {
        result: CallToolResult;
    }): ConnectionMetadata;
}
//# sourceMappingURL=mongodbTool.d.ts.map