"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantToolBase = void 0;
const tool_js_1 = require("../tool.js");
const devtools_proxy_support_1 = require("@mongodb-js/devtools-proxy-support");
const packageInfo_js_1 = require("../../common/packageInfo.js");
class AssistantToolBase extends tool_js_1.ToolBase {
    constructor(params) {
        super(params);
        this.baseUrl = new URL(params.config.assistantBaseUrl);
        this.requiredHeaders = new Headers({
            "x-request-origin": "mongodb-mcp-server",
            "user-agent": packageInfo_js_1.packageInfo.version ? `mongodb-mcp-server/v${packageInfo_js_1.packageInfo.version}` : "mongodb-mcp-server",
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
        const customFetch = (0, devtools_proxy_support_1.createFetch)({
            useEnvironmentVariableProxies: true,
        });
        return await customFetch(endpointUrl, {
            method: args.method,
            headers,
            body: JSON.stringify(args.body),
        });
    }
}
exports.AssistantToolBase = AssistantToolBase;
//# sourceMappingURL=assistantTool.js.map