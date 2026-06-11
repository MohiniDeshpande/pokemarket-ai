"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListOrganizationsTool = void 0;
const atlasTool_js_1 = require("../atlasTool.js");
const tool_js_1 = require("../../tool.js");
class ListOrganizationsTool extends atlasTool_js_1.AtlasToolBase {
    constructor() {
        super(...arguments);
        this.description = "List MongoDB Atlas organizations";
        this.argsShape = {};
    }
    async execute() {
        const data = await this.apiClient.listOrgs();
        if (!data?.results?.length) {
            return {
                content: [{ type: "text", text: "No organizations found in your MongoDB Atlas account." }],
            };
        }
        const orgs = data.results.map((org) => ({
            name: org.name,
            id: org.id,
        }));
        return {
            content: (0, tool_js_1.formatUntrustedData)(`Found ${data.results.length} organizations in your MongoDB Atlas account.`, JSON.stringify(orgs)),
        };
    }
}
exports.ListOrganizationsTool = ListOrganizationsTool;
ListOrganizationsTool.toolName = "atlas-list-orgs";
ListOrganizationsTool.operationType = "read";
//# sourceMappingURL=listOrgs.js.map