"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectClusterTool = exports.InspectClusterArgs = void 0;
const tool_js_1 = require("../../tool.js");
const atlasTool_js_1 = require("../atlasTool.js");
const cluster_js_1 = require("../../../common/atlas/cluster.js");
const args_js_1 = require("../../args.js");
exports.InspectClusterArgs = {
    projectId: args_js_1.AtlasArgs.projectId().describe("Atlas project ID"),
    clusterName: args_js_1.AtlasArgs.clusterName().describe("Atlas cluster name"),
};
class InspectClusterTool extends atlasTool_js_1.AtlasToolBase {
    constructor() {
        super(...arguments);
        this.description = "Inspect metadata of a MongoDB Atlas cluster";
        this.argsShape = {
            ...exports.InspectClusterArgs,
        };
    }
    async execute({ projectId, clusterName }) {
        const cluster = await (0, cluster_js_1.inspectCluster)(this.apiClient, projectId, clusterName);
        return this.formatOutput(cluster);
    }
    formatOutput(formattedCluster) {
        const clusterDetails = {
            name: formattedCluster.name || "Unknown",
            instanceType: formattedCluster.instanceType,
            instanceSize: formattedCluster.instanceSize || "N/A",
            state: formattedCluster.state || "UNKNOWN",
            mongoDBVersion: formattedCluster.mongoDBVersion || "N/A",
            connectionStrings: formattedCluster.connectionStrings || {},
        };
        return {
            content: (0, tool_js_1.formatUntrustedData)("Cluster details:", JSON.stringify(clusterDetails)),
        };
    }
}
exports.InspectClusterTool = InspectClusterTool;
InspectClusterTool.toolName = "atlas-inspect-cluster";
InspectClusterTool.operationType = "read";
//# sourceMappingURL=inspectCluster.js.map