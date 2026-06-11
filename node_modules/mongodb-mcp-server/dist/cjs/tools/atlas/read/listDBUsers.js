"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListDBUsersTool = exports.ListDBUsersArgs = void 0;
const atlasTool_js_1 = require("../atlasTool.js");
const tool_js_1 = require("../../tool.js");
const args_js_1 = require("../../args.js");
exports.ListDBUsersArgs = {
    projectId: args_js_1.AtlasArgs.projectId().describe("Atlas project ID to filter DB users"),
};
class ListDBUsersTool extends atlasTool_js_1.AtlasToolBase {
    constructor() {
        super(...arguments);
        this.description = "List MongoDB Atlas database users";
        this.argsShape = {
            ...exports.ListDBUsersArgs,
        };
    }
    async execute({ projectId }) {
        const data = await this.apiClient.listDatabaseUsers({
            params: {
                path: {
                    groupId: projectId,
                },
            },
        });
        if (!data?.results?.length) {
            return {
                content: [{ type: "text", text: " No database users found" }],
            };
        }
        const users = data.results.map((user) => ({
            username: user.username,
            roles: user.roles?.map((role) => ({
                roleName: role.roleName,
                databaseName: role.databaseName,
                collectionName: role.collectionName,
            })) ?? [],
            scopes: user.scopes?.map((scope) => ({
                type: scope.type,
                name: scope.name,
            })) ?? [],
        }));
        return {
            content: (0, tool_js_1.formatUntrustedData)(`Found ${data.results.length} database users in project ${projectId}`, JSON.stringify(users)),
        };
    }
}
exports.ListDBUsersTool = ListDBUsersTool;
ListDBUsersTool.toolName = "atlas-list-db-users";
ListDBUsersTool.operationType = "read";
//# sourceMappingURL=listDBUsers.js.map