"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectAccessListTool = exports.InspectAccessListArgs = void 0;
const tool_js_1 = require("../../tool.js");
const atlasTool_js_1 = require("../atlasTool.js");
const args_js_1 = require("../../args.js");
exports.InspectAccessListArgs = {
    projectId: args_js_1.AtlasArgs.projectId().describe("Atlas project ID"),
};
class InspectAccessListTool extends atlasTool_js_1.AtlasToolBase {
    constructor() {
        super(...arguments);
        this.description = "Inspect Ip/CIDR ranges with access to your MongoDB Atlas clusters.";
        this.argsShape = {
            ...exports.InspectAccessListArgs,
        };
    }
    async execute({ projectId }) {
        const accessList = await this.apiClient.listAccessListEntries({
            params: {
                path: {
                    groupId: projectId,
                },
            },
        });
        const results = accessList.results ?? [];
        if (!results.length) {
            return {
                content: [{ type: "text", text: "No access list entries found." }],
            };
        }
        const entries = results.map((entry) => ({
            ipAddress: entry.ipAddress,
            cidrBlock: entry.cidrBlock,
            comment: entry.comment,
        }));
        return {
            content: (0, tool_js_1.formatUntrustedData)(`Found ${results.length} access list entries`, JSON.stringify(entries)),
        };
    }
}
exports.InspectAccessListTool = InspectAccessListTool;
InspectAccessListTool.toolName = "atlas-inspect-access-list";
InspectAccessListTool.operationType = "read";
//# sourceMappingURL=inspectAccessList.js.map