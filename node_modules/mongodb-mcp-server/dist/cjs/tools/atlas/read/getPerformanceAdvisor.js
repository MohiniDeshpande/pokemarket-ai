"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPerformanceAdvisorTool = void 0;
const zod_1 = require("zod");
const atlasTool_js_1 = require("../atlasTool.js");
const tool_js_1 = require("../../tool.js");
const performanceAdvisorUtils_js_1 = require("../../../common/atlas/performanceAdvisorUtils.js");
const args_js_1 = require("../../args.js");
const PerformanceAdvisorOperationType = zod_1.z.enum([
    "suggestedIndexes",
    "dropIndexSuggestions",
    "slowQueryLogs",
    "schemaSuggestions",
]);
class GetPerformanceAdvisorTool extends atlasTool_js_1.AtlasToolBase {
    constructor() {
        super(...arguments);
        this.description = `Get MongoDB Atlas performance advisor recommendations and suggestions, which includes the operations: suggested indexes, drop index suggestions, schema suggestions, and a sample of the most recent (max ${performanceAdvisorUtils_js_1.DEFAULT_SLOW_QUERY_LOGS_LIMIT}) slow query logs`;
        this.argsShape = {
            projectId: args_js_1.AtlasArgs.projectId().describe("Atlas project ID to get performance advisor recommendations. The project ID is a hexadecimal identifier of 24 characters. If the user has only specified the name, use the `atlas-list-projects` tool to retrieve the user's projects with their ids."),
            clusterName: args_js_1.AtlasArgs.clusterName().describe("Atlas cluster name to get performance advisor recommendations"),
            operations: zod_1.z
                .array(PerformanceAdvisorOperationType)
                .default(PerformanceAdvisorOperationType.options)
                .describe("Operations to get performance advisor recommendations"),
            since: zod_1.z
                .string()
                .datetime()
                .describe("Date to get slow query logs since. Must be a string in ISO 8601 format. Only relevant for the slowQueryLogs operation.")
                .optional(),
            namespaces: zod_1.z
                .array(zod_1.z.string())
                .describe("Namespaces to get slow query logs. Only relevant for the slowQueryLogs operation.")
                .optional(),
        };
    }
    async execute({ projectId, clusterName, operations, since, namespaces, }) {
        try {
            const [suggestedIndexesResult, dropIndexSuggestionsResult, slowQueryLogsResult, schemaSuggestionsResult] = await Promise.allSettled([
                operations.includes("suggestedIndexes")
                    ? (0, performanceAdvisorUtils_js_1.getSuggestedIndexes)(this.apiClient, projectId, clusterName)
                    : Promise.resolve(undefined),
                operations.includes("dropIndexSuggestions")
                    ? (0, performanceAdvisorUtils_js_1.getDropIndexSuggestions)(this.apiClient, projectId, clusterName)
                    : Promise.resolve(undefined),
                operations.includes("slowQueryLogs")
                    ? (0, performanceAdvisorUtils_js_1.getSlowQueries)(this.apiClient, projectId, clusterName, since ? new Date(since) : undefined, namespaces)
                    : Promise.resolve(undefined),
                operations.includes("schemaSuggestions")
                    ? (0, performanceAdvisorUtils_js_1.getSchemaAdvice)(this.apiClient, projectId, clusterName)
                    : Promise.resolve(undefined),
            ]);
            const hasSuggestedIndexes = suggestedIndexesResult.status === "fulfilled" &&
                suggestedIndexesResult.value?.suggestedIndexes &&
                suggestedIndexesResult.value.suggestedIndexes.length > 0;
            const hasDropIndexSuggestions = dropIndexSuggestionsResult.status === "fulfilled" &&
                dropIndexSuggestionsResult.value?.hiddenIndexes &&
                dropIndexSuggestionsResult.value?.redundantIndexes &&
                dropIndexSuggestionsResult.value?.unusedIndexes &&
                (dropIndexSuggestionsResult.value.hiddenIndexes.length > 0 ||
                    dropIndexSuggestionsResult.value.redundantIndexes.length > 0 ||
                    dropIndexSuggestionsResult.value.unusedIndexes.length > 0);
            const hasSlowQueryLogs = slowQueryLogsResult.status === "fulfilled" &&
                slowQueryLogsResult.value?.slowQueryLogs &&
                slowQueryLogsResult.value.slowQueryLogs.length > 0;
            const hasSchemaSuggestions = schemaSuggestionsResult.status === "fulfilled" &&
                schemaSuggestionsResult.value?.recommendations &&
                schemaSuggestionsResult.value.recommendations.length > 0;
            // Inserts the performance advisor data with the relevant section header if it exists
            const performanceAdvisorData = [
                `## Suggested Indexes\n${hasSuggestedIndexes
                    ? `${performanceAdvisorUtils_js_1.SUGGESTED_INDEXES_COPY}\n${JSON.stringify(suggestedIndexesResult.value?.suggestedIndexes)}`
                    : "No suggested indexes found."}`,
                `## Drop Index Suggestions\n${hasDropIndexSuggestions ? JSON.stringify(dropIndexSuggestionsResult.value) : "No drop index suggestions found."}`,
                `## Slow Query Logs\n${hasSlowQueryLogs ? `${performanceAdvisorUtils_js_1.SLOW_QUERY_LOGS_COPY}\n${JSON.stringify(slowQueryLogsResult.value?.slowQueryLogs)}` : "No slow query logs found."}`,
                `## Schema Suggestions\n${hasSchemaSuggestions ? JSON.stringify(schemaSuggestionsResult.value?.recommendations) : "No schema suggestions found."}`,
            ];
            if (performanceAdvisorData.length === 0) {
                return {
                    content: [{ type: "text", text: "No performance advisor recommendations found." }],
                };
            }
            return {
                content: (0, tool_js_1.formatUntrustedData)("Performance advisor data", performanceAdvisorData.join("\n\n")),
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error retrieving performance advisor data: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    }
    resolveTelemetryMetadata(args, { result }) {
        return {
            ...super.resolveTelemetryMetadata(args, { result }),
            operations: args.operations,
        };
    }
}
exports.GetPerformanceAdvisorTool = GetPerformanceAdvisorTool;
GetPerformanceAdvisorTool.toolName = "atlas-get-performance-advisor";
GetPerformanceAdvisorTool.operationType = "read";
//# sourceMappingURL=getPerformanceAdvisor.js.map