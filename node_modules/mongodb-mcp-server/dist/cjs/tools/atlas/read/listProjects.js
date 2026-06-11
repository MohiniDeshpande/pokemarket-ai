"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListProjectsTool = void 0;
const atlasTool_js_1 = require("../atlasTool.js");
const tool_js_1 = require("../../tool.js");
const args_js_1 = require("../../args.js");
class ListProjectsTool extends atlasTool_js_1.AtlasToolBase {
    constructor() {
        super(...arguments);
        this.description = "List MongoDB Atlas projects";
        this.argsShape = {
            orgId: args_js_1.AtlasArgs.organizationId()
                .describe("Atlas organization ID to filter projects. If not provided, projects for all orgs are returned.")
                .optional(),
        };
    }
    async execute({ orgId }) {
        const orgData = await this.apiClient.listOrgs();
        if (!orgData?.results?.length) {
            return {
                content: [{ type: "text", text: "No organizations found in your MongoDB Atlas account." }],
            };
        }
        const orgs = orgData.results
            .filter((org) => org.id)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .reduce((acc, org) => ({ ...acc, [org.id]: org.name }), {});
        const data = orgId
            ? await this.apiClient.getOrgGroups({
                params: {
                    path: {
                        orgId,
                    },
                    query: {
                        itemsPerPage: 500,
                    },
                },
            })
            : await this.apiClient.listGroups({
                params: {
                    query: {
                        itemsPerPage: 500,
                    },
                },
            });
        if (!data?.results?.length) {
            return {
                content: [{ type: "text", text: `No projects found in organization ${orgId}.` }],
            };
        }
        const serializedProjects = JSON.stringify(data.results.map((project) => ({
            name: project.name,
            id: project.id,
            orgId: project.orgId,
            orgName: orgs[project.orgId] ?? "N/A",
            created: project.created ? new Date(project.created).toLocaleString() : "N/A",
        })), null, 2);
        return {
            content: (0, tool_js_1.formatUntrustedData)(`Found ${data.results.length} projects`, serializedProjects),
        };
    }
}
exports.ListProjectsTool = ListProjectsTool;
ListProjectsTool.toolName = "atlas-list-projects";
ListProjectsTool.operationType = "read";
//# sourceMappingURL=listProjects.js.map