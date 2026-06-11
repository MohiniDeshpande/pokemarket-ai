"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbStatsTool = void 0;
const mongodbTool_js_1 = require("../mongodbTool.js");
const tool_js_1 = require("../../tool.js");
const bson_1 = require("bson");
const zod_1 = require("zod");
const DbStatsOutputSchema = {
    stats: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
};
class DbStatsTool extends mongodbTool_js_1.MongoDBToolBase {
    constructor() {
        super(...arguments);
        this.description = "Returns statistics that reflect the use state of a single database";
        this.argsShape = mongodbTool_js_1.DBOperationArgs;
        this.outputSchema = DbStatsOutputSchema;
    }
    async execute({ database }, { signal }) {
        const provider = await this.ensureConnected();
        const result = await provider.runCommandWithCheck(database, {
            dbStats: 1,
            scale: 1,
            ...(this.config.maxTimeMS !== undefined && { maxTimeMS: this.config.maxTimeMS }),
        }, { signal });
        return {
            content: (0, tool_js_1.formatUntrustedData)(`Statistics for database ${database}`, bson_1.EJSON.stringify(result)),
            structuredContent: {
                stats: result,
            },
        };
    }
}
exports.DbStatsTool = DbStatsTool;
DbStatsTool.toolName = "db-stats";
DbStatsTool.operationType = "metadata";
//# sourceMappingURL=dbStats.js.map