"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportRunnerBase = void 0;
const packageInfo_js_1 = require("../common/packageInfo.js");
const server_js_1 = require("../server.js");
const session_js_1 = require("../common/session.js");
const telemetry_js_1 = require("../telemetry/telemetry.js");
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const index_js_1 = require("../common/logging/index.js");
const exportsManager_js_1 = require("../common/exportsManager.js");
const deviceId_js_1 = require("../helpers/deviceId.js");
const keychain_js_1 = require("../common/keychain.js");
const connectionManager_js_1 = require("../common/connectionManager.js");
const connectionErrorHandler_js_1 = require("../common/connectionErrorHandler.js");
const elicitation_js_1 = require("../elicitation.js");
const atlasLocal_js_1 = require("../common/atlasLocal.js");
const configOverrides_js_1 = require("../common/config/configOverrides.js");
const apiClient_js_1 = require("../common/atlas/apiClient.js");
const apiClient_js_2 = require("../common/atlas/apiClient.js");
const mcp_metrics_1 = require("@mongodb-js/mcp-metrics");
class TransportRunnerBase {
    constructor({ userConfig, createConnectionManager = connectionManager_js_1.defaultCreateConnectionManager, connectionErrorHandler = connectionErrorHandler_js_1.connectionErrorHandler, createAtlasLocalClient = atlasLocal_js_1.defaultCreateAtlasLocalClient, additionalLoggers = [], metrics, telemetryProperties = {}, tools, createSessionConfig, createApiClient = apiClient_js_2.defaultCreateApiClient, }) {
        this.userConfig = userConfig;
        this.createConnectionManager = createConnectionManager;
        this.connectionErrorHandler = connectionErrorHandler;
        this.createAtlasLocalClient = createAtlasLocalClient;
        this.telemetryProperties = telemetryProperties;
        this.tools = tools;
        this.createSessionConfig = createSessionConfig;
        this.createApiClient = createApiClient;
        this.metrics = metrics ?? new mcp_metrics_1.PrometheusMetrics({ definitions: (0, mcp_metrics_1.createDefaultMetrics)() });
        const loggers = [...additionalLoggers];
        if (this.userConfig.loggers.includes("stderr")) {
            loggers.push(new index_js_1.ConsoleLogger(keychain_js_1.Keychain.root));
        }
        if (this.userConfig.loggers.includes("disk")) {
            loggers.push(new index_js_1.DiskLogger(this.userConfig.logPath, (err) => {
                // If the disk logger fails to initialize, we log the error to stderr and exit
                // eslint-disable-next-line no-console
                console.error("Error initializing disk logger:", err);
                process.exit(1);
            }, keychain_js_1.Keychain.root));
        }
        this.logger = new index_js_1.CompositeLogger(...loggers);
        this.deviceId = deviceId_js_1.DeviceId.create(this.logger);
    }
    /**
     * Creates a new MCP server instance with the provided configuration.
     * This method handles server instantiation but does NOT perform session config resolution.
     *
     * @param config - Configuration object containing userConfig and optional serverOptions
     * @returns A configured Server instance
     */
    async createServer({ userConfig = this.userConfig, serverOptions, sessionOptions, logger = new index_js_1.CompositeLogger(this.logger), } = {}) {
        const mcpServer = new mcp_js_1.McpServer({
            name: packageInfo_js_1.packageInfo.mcpServerName,
            version: packageInfo_js_1.packageInfo.version,
        }, {
            instructions: TransportRunnerBase.getInstructions(userConfig),
        });
        const exportsManager = exportsManager_js_1.ExportsManager.init(userConfig, logger);
        const connectionManager = sessionOptions?.connectionManager ??
            (await this.createConnectionManager({ logger: logger, deviceId: this.deviceId, userConfig }));
        const { apiClientId, apiClientSecret } = userConfig;
        const apiClientOptions = {
            baseUrl: userConfig.apiBaseUrl,
            credentials: apiClientId && apiClientSecret
                ? {
                    clientId: apiClientId,
                    clientSecret: apiClientSecret,
                }
                : undefined,
        };
        const apiClient = new apiClient_js_1.ApiClient(apiClientOptions, logger);
        const session = new session_js_1.Session({
            userConfig,
            atlasLocalClient: sessionOptions?.atlasLocalClient ?? (await this.createAtlasLocalClient({ logger: this.logger })),
            logger,
            connectionErrorHandler: sessionOptions?.connectionErrorHandler ?? this.connectionErrorHandler,
            exportsManager,
            connectionManager,
            keychain: keychain_js_1.Keychain.root,
            apiClient: sessionOptions?.apiClient ?? apiClient,
        });
        const telemetry = telemetry_js_1.Telemetry.create({
            logger,
            deviceId: this.deviceId,
            apiClient: session.apiClient,
            keychain: session.keychain,
            enabled: userConfig.telemetry === "enabled",
            getCommonProperties: () => ({
                ...(serverOptions?.telemetryProperties ?? this.telemetryProperties),
                transport: userConfig.transport,
                mcp_client_version: session.mcpClient?.version,
                mcp_client_name: session.mcpClient?.name,
                session_id: session.sessionId,
                config_atlas_auth: session.apiClient?.isAuthConfigured() ? "true" : "false",
                config_connection_string: userConfig.connectionString ? "true" : "false",
                has_docker: session.atlasLocalClient ? "true" : "false",
            }),
        });
        let uiRegistry = serverOptions?.uiRegistry;
        if (!uiRegistry && userConfig.previewFeatures.includes("mcpUI")) {
            const uiRegistryModule = await Promise.resolve().then(() => __importStar(require("../ui/registry/registry.js")));
            uiRegistry = new uiRegistryModule.UIRegistry();
        }
        const result = new server_js_1.Server({
            mcpServer,
            session,
            telemetry,
            userConfig,
            connectionErrorHandler: sessionOptions?.connectionErrorHandler ?? this.connectionErrorHandler,
            elicitation: serverOptions?.elicitation ?? new elicitation_js_1.Elicitation({ server: mcpServer.server }),
            tools: serverOptions?.tools ?? this.tools,
            uiRegistry,
            toolContext: serverOptions?.toolContext,
            metrics: this.metrics,
        });
        // We need to create the MCP logger after the server is constructed
        // because it needs the server instance
        if (userConfig.loggers.includes("mcp")) {
            logger.addLogger(new index_js_1.McpLogger(result, keychain_js_1.Keychain.root));
        }
        return result;
    }
    /**
     * @deprecated Remove all session hooks and use `start({serverOptions, sessionOptions})` or override `StreamableHttpRunner.createServerForRequest` instead. This method will be removed in a future version.
     *
     * Creates a new MCP server instance and handles session config resolution.
     * For new code, prefer using `createServer` with pre-resolved configuration.
     */
    async setupServer(request, { serverOptions, } = {}) {
        let userConfig = this.userConfig;
        if (this.createSessionConfig) {
            userConfig = await this.createSessionConfig({ userConfig, request });
        }
        else {
            userConfig = (0, configOverrides_js_1.applyConfigOverrides)({ baseConfig: this.userConfig, request });
        }
        return this.createServer({
            userConfig,
            serverOptions,
            sessionOptions: {
                connectionManager: await this.createConnectionManager({
                    logger: this.logger,
                    deviceId: this.deviceId,
                    userConfig,
                }),
                atlasLocalClient: await this.createAtlasLocalClient({ logger: this.logger }),
                apiClient: userConfig.apiClientId && userConfig.apiClientSecret
                    ? this.createApiClient({
                        baseUrl: userConfig.apiBaseUrl,
                        credentials: {
                            clientId: userConfig.apiClientId,
                            clientSecret: userConfig.apiClientSecret,
                        },
                        requestContext: request,
                    }, this.logger)
                    : undefined,
            },
        });
    }
    async close() {
        try {
            await this.closeTransport();
        }
        finally {
            this.deviceId.close();
        }
    }
    static getInstructions(config) {
        let instructions = `
            This is the MongoDB MCP server.
        `;
        if (config.connectionString) {
            instructions += `
            This MCP server was configured with a MongoDB connection string, and you can assume that you are connected to a MongoDB cluster.
            `;
        }
        if (config.apiClientId && config.apiClientSecret) {
            instructions += `
            This MCP server was configured with MongoDB Atlas API credentials.`;
        }
        return instructions;
    }
}
exports.TransportRunnerBase = TransportRunnerBase;
//# sourceMappingURL=base.js.map