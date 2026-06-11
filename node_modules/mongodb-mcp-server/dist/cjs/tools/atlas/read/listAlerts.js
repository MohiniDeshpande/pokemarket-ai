"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListAlertsTool = exports.ListAlertsArgs = void 0;
const zod_1 = require("zod");
const tool_js_1 = require("../../tool.js");
const atlasTool_js_1 = require("../atlasTool.js");
const args_js_1 = require("../../args.js");
const AlertStatus = zod_1.z.enum(["OPEN", "TRACKING", "CLOSED"]);
exports.ListAlertsArgs = {
    projectId: args_js_1.AtlasArgs.projectId().describe("Atlas project ID to list alerts for"),
    status: AlertStatus.default("OPEN").describe("Status of the alerts to return. Defaults to OPEN. TRACKING means the alert condition exists but hasn't persisted beyond the notification delay. OPEN means the alert condition currently exists. CLOSED means the alert has been resolved."),
    limit: zod_1.z.number().int().min(1).max(500).default(100).describe("Max results per page."),
    pageNum: zod_1.z.number().int().min(1).default(1).describe("Page number."),
};
class ListAlertsTool extends atlasTool_js_1.AtlasToolBase {
    constructor() {
        super(...arguments);
        this.description = "List MongoDB Atlas alerts";
        this.argsShape = {
            ...exports.ListAlertsArgs,
        };
    }
    async execute({ projectId, status, limit, pageNum, }) {
        const data = await this.apiClient.listAlerts({
            params: {
                path: {
                    groupId: projectId,
                },
                query: {
                    status,
                    itemsPerPage: limit,
                    pageNum: pageNum,
                    includeCount: true,
                },
            },
        });
        if (!data?.results?.length) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No alerts with status "${status}" found in your MongoDB Atlas project.`,
                    },
                ],
            };
        }
        const alerts = data.results.map((alert) => ({
            id: alert.id,
            status: alert.status,
            created: alert.created ? new Date(alert.created).toISOString() : "N/A",
            updated: alert.updated ? new Date(alert.updated).toISOString() : "N/A",
            eventTypeName: alert.eventTypeName,
            acknowledgementComment: alert.acknowledgementComment ?? "N/A",
        }));
        return {
            content: (0, tool_js_1.formatUntrustedData)(`Found ${alerts.length} alerts with status "${status}" in project ${projectId} (total: ${data.totalCount ?? alerts.length})`, JSON.stringify(alerts)),
        };
    }
}
exports.ListAlertsTool = ListAlertsTool;
ListAlertsTool.toolName = "atlas-list-alerts";
ListAlertsTool.operationType = "read";
//# sourceMappingURL=listAlerts.js.map