import { ToolBase } from "../tool.js";
import { createFetch } from "@mongodb-js/devtools-proxy-support";
import { packageInfo } from "../../common/packageInfo.js";
export class AssistantToolBase extends ToolBase {
    constructor(params) {
        super(params);
        this.baseUrl = new URL(params.config.assistantBaseUrl);
        this.requiredHeaders = new Headers({
            "x-request-origin": "mongodb-mcp-server",
            "user-agent": packageInfo.version ? `mongodb-mcp-server/v${packageInfo.version}` : "mongodb-mcp-server",
        });
    }
    register(server) {
        this.server = server;
        return super.register(server);
    }
    resolveTelemetryMetadata() {
        // Assistant tool calls are not associated with a specific Atlas project or organization
        // Therefore, we don't have any values to add to the telemetry metadata
        return {};
    }
    async callAssistantApi(args) {
        const endpointUrl = new URL(args.endpoint, this.baseUrl);
        const headers = new Headers(this.requiredHeaders);
        if (args.method === "POST") {
            headers.set("Content-Type", "application/json");
        }
        // Use the same custom fetch implementation as the Atlas API client.
        // We need this to support enterprise proxies.
        const customFetch = createFetch({
            useEnvironmentVariableProxies: true,
        });
        return await customFetch(endpointUrl, {
            method: args.method,
            headers,
            body: JSON.stringify(args.body),
        });
    }
}
//# sourceMappingURL=assistantTool.js.map