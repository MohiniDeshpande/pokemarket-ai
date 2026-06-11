"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBToolBase = exports.CollOperationArgs = exports.DBOperationArgs = void 0;
const zod_1 = require("zod");
const tool_js_1 = require("../tool.js");
const errors_js_1 = require("../../common/errors.js");
const index_js_1 = require("../../common/logging/index.js");
exports.DBOperationArgs = {
    database: zod_1.z.string().describe("Database name"),
};
exports.CollOperationArgs = {
    ...exports.DBOperationArgs,
    collection: zod_1.z.string().describe("Collection name"),
};
class MongoDBToolBase extends tool_js_1.ToolBase {
    async ensureConnected() {
        if (!this.session.isConnectedToMongoDB) {
            if (this.session.connectedAtlasCluster) {
                throw new errors_js_1.MongoDBError(errors_js_1.ErrorCodes.NotConnectedToMongoDB, `Attempting to connect to Atlas cluster "${this.session.connectedAtlasCluster.clusterName}", try again in a few seconds.`);
            }
            if (this.config.connectionString) {
                try {
                    await this.session.connectToConfiguredConnection();
                }
                catch (error) {
                    this.session.logger.error({
                        id: index_js_1.LogId.mongodbConnectFailure,
                        context: "mongodbTool",
                        message: `Failed to connect to MongoDB instance using the connection string from the config: ${error}`,
                    });
                    throw new errors_js_1.MongoDBError(errors_js_1.ErrorCodes.MisconfiguredConnectionString, "Not connected to MongoDB.");
                }
            }
        }
        if (!this.session.isConnectedToMongoDB) {
            throw new errors_js_1.MongoDBError(errors_js_1.ErrorCodes.NotConnectedToMongoDB, "Not connected to MongoDB");
        }
        return this.session.serviceProvider;
    }
    /**
     * Returns common operation options (signal, maxTimeMS) to pass to service provider methods.
     * If `maxTimeMS` is configured, it will be included in the returned options.
     */
    getOperationOptions(signal) {
        return {
            ...(signal && { signal }),
            ...(this.config.maxTimeMS !== undefined && { maxTimeMS: this.config.maxTimeMS }),
        };
    }
    register(server) {
        this.server = server;
        return super.register(server);
    }
    async handleError(error, args) {
        if (error instanceof errors_js_1.MongoDBError) {
            switch (error.code) {
                case errors_js_1.ErrorCodes.NotConnectedToMongoDB:
                case errors_js_1.ErrorCodes.MisconfiguredConnectionString: {
                    const connectionError = error;
                    const outcome = await this.session.connectionErrorHandler(connectionError, {
                        availableTools: this.server?.tools ?? [],
                        connectionState: this.session.connectionManager.currentConnectionState,
                    });
                    if (outcome.errorHandled) {
                        return outcome.result;
                    }
                    return super.handleError(error, args);
                }
                case errors_js_1.ErrorCodes.ForbiddenCollscan:
                    return {
                        content: [
                            {
                                type: "text",
                                text: error.message,
                            },
                        ],
                        isError: true,
                    };
                case errors_js_1.ErrorCodes.AtlasSearchNotSupported: {
                    const CTA = this.server?.isToolCategoryAvailable("atlas-local")
                        ? "`atlas-local` tools"
                        : "Atlas CLI";
                    return {
                        content: [
                            {
                                text: `The connected MongoDB deployment does not support vector search indexes. Either connect to a MongoDB Atlas cluster or use the ${CTA} to create and manage a local Atlas deployment.`,
                                type: "text",
                            },
                        ],
                        isError: true,
                    };
                }
            }
        }
        return super.handleError(error, args);
    }
    /**
     * Resolves the tool metadata from the arguments passed to the mongoDB tools.
     *
     * Since MongoDB tools are executed against a MongoDB instance, the tool calls will always have the connection information.
     *
     * @param result - The result of the tool call.
     * @param args - The arguments passed to the tool
     * @returns The tool metadata
     */
    resolveTelemetryMetadata(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _args, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { result }) {
        return this.getConnectionInfoMetadata();
    }
}
exports.MongoDBToolBase = MongoDBToolBase;
MongoDBToolBase.category = "mongodb";
//# sourceMappingURL=mongodbTool.js.map