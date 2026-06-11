"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAccessListTool = exports.CreateAccessListArgs = void 0;
const zod_1 = require("zod");
const atlasTool_js_1 = require("../atlasTool.js");
const accessListUtils_js_1 = require("../../../common/atlas/accessListUtils.js");
const args_js_1 = require("../../args.js");
exports.CreateAccessListArgs = {
    projectId: args_js_1.AtlasArgs.projectId().describe("Atlas project ID"),
    ipAddresses: zod_1.z.array(args_js_1.AtlasArgs.ipAddress()).describe("IP addresses to allow access from").optional(),
    cidrBlocks: zod_1.z.array(args_js_1.AtlasArgs.cidrBlock()).describe("CIDR blocks to allow access from").optional(),
    currentIpAddress: zod_1.z.boolean().describe("Add the current IP address").default(false),
    comment: args_js_1.CommonArgs.string()
        .describe("Comment for the access list entries")
        .default(accessListUtils_js_1.DEFAULT_ACCESS_LIST_COMMENT)
        .optional(),
};
class CreateAccessListTool extends atlasTool_js_1.AtlasToolBase {
    constructor() {
        super(...arguments);
        this.description = "Allow Ip/CIDR ranges to access your MongoDB Atlas clusters.";
        this.argsShape = {
            ...exports.CreateAccessListArgs,
        };
    }
    async execute({ projectId, ipAddresses, cidrBlocks, comment, currentIpAddress, }) {
        if (!ipAddresses?.length && !cidrBlocks?.length && !currentIpAddress) {
            throw new Error("One of  ipAddresses, cidrBlocks, currentIpAddress must be provided.");
        }
        const ipInputs = (ipAddresses || []).map((ipAddress) => ({
            groupId: projectId,
            ipAddress,
            comment: comment || accessListUtils_js_1.DEFAULT_ACCESS_LIST_COMMENT,
        }));
        if (currentIpAddress) {
            const input = await (0, accessListUtils_js_1.makeCurrentIpAccessListEntry)(this.apiClient, projectId, comment || accessListUtils_js_1.DEFAULT_ACCESS_LIST_COMMENT);
            ipInputs.push(input);
        }
        const cidrInputs = (cidrBlocks || []).map((cidrBlock) => ({
            groupId: projectId,
            cidrBlock,
            comment: comment || accessListUtils_js_1.DEFAULT_ACCESS_LIST_COMMENT,
        }));
        const inputs = [...ipInputs, ...cidrInputs];
        await this.apiClient.createAccessListEntry({
            params: {
                path: {
                    groupId: projectId,
                },
            },
            body: inputs,
        });
        return {
            content: [
                {
                    type: "text",
                    text: `IP/CIDR ranges added to access list for project ${projectId}.`,
                },
            ],
        };
    }
    getConfirmationMessage({ projectId, ipAddresses, cidrBlocks, comment, currentIpAddress, }) {
        const accessDescription = [];
        if (ipAddresses?.length) {
            accessDescription.push(`- **IP addresses**: ${ipAddresses.join(", ")}`);
        }
        if (cidrBlocks?.length) {
            accessDescription.push(`- **CIDR blocks**: ${cidrBlocks.join(", ")}`);
        }
        if (currentIpAddress) {
            accessDescription.push("- **Current IP address**");
        }
        return (`You are about to add the following entries to the access list for Atlas project "${projectId}":\n\n` +
            accessDescription.join("\n") +
            `\n\n**Comment**: ${comment || accessListUtils_js_1.DEFAULT_ACCESS_LIST_COMMENT}\n\n` +
            "This will allow network access to your MongoDB Atlas clusters from these IP addresses/ranges. " +
            "Do you want to proceed?");
    }
}
exports.CreateAccessListTool = CreateAccessListTool;
CreateAccessListTool.toolName = "atlas-create-access-list";
CreateAccessListTool.operationType = "create";
//# sourceMappingURL=createAccessList.js.map