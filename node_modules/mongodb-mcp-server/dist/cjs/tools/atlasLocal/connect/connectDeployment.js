"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectDeploymentTool = void 0;
const atlasLocalTool_js_1 = require("../atlasLocalTool.js");
const args_js_1 = require("../../args.js");
class ConnectDeploymentTool extends atlasLocalTool_js_1.AtlasLocalToolBase {
    constructor() {
        super(...arguments);
        this.description = "Connect to a MongoDB Atlas Local deployment";
        this.argsShape = {
            deploymentName: args_js_1.CommonArgs.string().describe("Name of the deployment to connect to"),
        };
    }
    async executeWithAtlasLocalClient({ deploymentName }, { client }) {
        // Get the connection string for the deployment
        const connectionString = await client.getConnectionString(deploymentName);
        // Connect to the deployment
        await this.session.connectToMongoDB({ connectionString });
        return {
            content: [
                {
                    type: "text",
                    text: `Successfully connected to Atlas Local deployment "${deploymentName}".`,
                },
            ],
            _meta: {
                ...(await this.lookupTelemetryMetadata(client, deploymentName)),
            },
        };
    }
    resolveTelemetryMetadata(args, { result }) {
        return { ...super.resolveTelemetryMetadata(args, { result }), ...this.getConnectionInfoMetadata() };
    }
}
exports.ConnectDeploymentTool = ConnectDeploymentTool;
ConnectDeploymentTool.toolName = "atlas-local-connect-deployment";
ConnectDeploymentTool.operationType = "connect";
//# sourceMappingURL=connectDeployment.js.map