import { DBOperationArgs, MongoDBToolBase } from "../mongodbTool.js";
import { formatUntrustedData } from "../../tool.js";
import { EJSON } from "bson";
import { z } from "zod";
const DbStatsOutputSchema = {
    stats: z.record(z.string(), z.unknown()),
};
export class DbStatsTool extends MongoDBToolBase {
    constructor() {
        super(...arguments);
        this.description = "Returns statistics that reflect the use state of a single database";
        this.argsShape = DBOperationArgs;
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
            content: formatUntrustedData(`Statistics for database ${database}`, EJSON.stringify(result)),
            structuredContent: {
                stats: result,
            },
        };
    }
}
DbStatsTool.toolName = "db-stats";
DbStatsTool.operationType = "metadata";
//# sourceMappingURL=dbStats.js.map