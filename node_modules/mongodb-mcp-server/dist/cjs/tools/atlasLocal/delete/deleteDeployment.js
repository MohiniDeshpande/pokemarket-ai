"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteDeploymentTool = void 0;
const atlasLocalTool_js_1 = require("../atlasLocalTool.js");
const args_js_1 = require("../../args.js");
class DeleteDeploymentTool extends atlasLocalTool_js_1.AtlasLocalToolBase {
    constructor() {
        super(...arguments);
        this.description = "Delete a MongoDB Atlas local deployment";
        this.argsShape = {
            deploymentName: args_js_1.CommonArgs.string().describe("Name of the deployment to delete"),
        };
    }
    async executeWithAtlasLocalClient({ deploymentName }, { client }) {
        // Lookup telemetry metadata
        // We need to lookup the telemetry metadata before deleting the deployment
        // to ensure that the deployment ID is set in the result metadata
        const telemetryMetadata = await this.lookupTelemetryMetadata(client, deploymentName);
        // Delete the deployment
        await client.deleteDeployment(deploymentName);
        return {
            content: [{ type: "text", text: `Deployment "${deploymentName}" deleted successfully.` }],
            _meta: {
                ...telemetryMetadata,
            },
        };
    }
}
exports.DeleteDeploymentTool = DeleteDeploymentTool;
DeleteDeploymentTool.toolName = "atlas-local-delete-deployment";
DeleteDeploymentTool.operationType = "delete";
//# sourceMappingURL=deleteDeployment.js.map