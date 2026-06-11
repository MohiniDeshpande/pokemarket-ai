"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListDeploymentsTool = void 0;
const atlasLocalTool_js_1 = require("../atlasLocalTool.js");
const tool_js_1 = require("../../tool.js");
class ListDeploymentsTool extends atlasLocalTool_js_1.AtlasLocalToolBase {
    constructor() {
        super(...arguments);
        this.description = "List MongoDB Atlas local deployments";
        this.argsShape = {};
    }
    async executeWithAtlasLocalClient(_args, { client }) {
        // List the deployments
        const deployments = await client.listDeployments();
        // Format the deployments
        return this.formatDeploymentsTable(deployments);
    }
    formatDeploymentsTable(deployments) {
        // Check if deployments are absent
        if (!deployments?.length) {
            return {
                content: [{ type: "text", text: "No deployments found." }],
            };
        }
        // Filter out the fields we want to return to the user
        // We don't want to return the entire deployment object because it contains too much data
        const deploymentsJson = deployments.map((deployment) => {
            return {
                name: deployment.name,
                state: deployment.state,
                mongodbVersion: deployment.mongodbVersion,
            };
        });
        return {
            content: (0, tool_js_1.formatUntrustedData)(`Found ${deployments.length} deployments`, JSON.stringify(deploymentsJson)),
        };
    }
}
exports.ListDeploymentsTool = ListDeploymentsTool;
ListDeploymentsTool.toolName = "atlas-local-list-deployments";
ListDeploymentsTool.operationType = "read";
//# sourceMappingURL=listDeployments.js.map