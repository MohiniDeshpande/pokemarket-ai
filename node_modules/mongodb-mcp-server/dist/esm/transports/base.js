import { packageInfo } from "../common/packageInfo.js";
import { Server } from "../server.js";
import { Session } from "../common/session.js";
import { Telemetry } from "../telemetry/telemetry.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CompositeLogger, ConsoleLogger, DiskLogger, McpLogger } from "../common/logging/index.js";
import { ExportsManager } from "../common/exportsManager.js";
import { DeviceId } from "../helpers/deviceId.js";
import { Keychain } from "../common/keychain.js";
import { defaultCreateConnectionManager } from "../common/connectionManager.js";
import { connectionErrorHandler as defaultConnectionErrorHandler, } from "../common/connectionErrorHandler.js";
import { Elicitation } from "../elicitation.js";
import { defaultCreateAtlasLocalClient } from "../common/atlasLocal.js";
import { applyConfigOverrides } from "../common/config/configOverrides.js";
import { ApiClient } from "../common/atlas/apiClient.js";
import { defaultCreateApiClient } from "../common/atlas/apiClient.js";
import { PrometheusMetrics, createDefaultMetrics } from "@mongodb-js/mcp-metrics";
export class TransportRunnerBase {
    constructor({ userConfig, createConnectionManager = defaultCreateConnectionManager, connectionErrorHandler = defaultConnectionErrorHandler, createAtlasLocalClient = defaultCreateAtlasLocalClient, additionalLoggers = [], metrics, telemetryProperties = {}, tools, createSessionConfig, createApiClient = defaultCreateApiClient, }) {
        this.userConfig = userConfig;
        this.createConnectionManager = createConnectionManager;
        this.connectionErrorHandler = connectionErrorHandler;
        this.createAtlasLocalClient = createAtlasLocalClient;
        this.telemetryProperties = telemetryProperties;
        this.tools = tools;
        this.createSessionConfig = createSessionConfig;
        this.createApiClient = createApiClient;
        this.metrics = metrics ?? new PrometheusMetrics({ definitions: createDefaultMetrics() });
        const loggers = [...additionalLoggers];
        if (this.userConfig.loggers.includes("stderr")) {
            loggers.push(new ConsoleLogger(Keychain.root));
        }
        if (this.userConfig.loggers.includes("disk")) {
            loggers.push(new DiskLogger(this.userConfig.logPath, (err) => {
                // If the disk logger fails to initialize, we log the error to stderr and exit
                // eslint-disable-next-line no-console
                console.error("Error initializing disk logger:", err);
                process.exit(1);
            }, Keychain.root));
        }
        this.logger = new CompositeLogger(...loggers);
        this.deviceId = DeviceId.create(this.logger);
    }
    /**
     * Creates a new MCP server instance with the provided configuration.
     * This method handles server instantiation but does NOT perform session config resolution.
     *
     * @param config - Configuration object containing userConfig and optional serverOptions
     * @returns A configured Server instance
     */
    async createServer({ userConfig = this.userConfig, serverOptions, sessionOptions, logger = new CompositeLogger(this.logger), } = {}) {
        const mcpServer = new McpServer({
            name: packageInfo.mcpServerName,
            version: packageInfo.version,
        }, {
            instructions: TransportRunnerBase.getInstructions(userConfig),
        });
        const exportsManager = ExportsManager.init(userConfig, logger);
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
        const apiClient = new ApiClient(apiClientOptions, logger);
        const session = new Session({
            userConfig,
            atlasLocalClient: sessionOptions?.atlasLocalClient ?? (await this.createAtlasLocalClient({ logger: this.logger })),
            logger,
            connectionErrorHandler: sessionOptions?.connectionErrorHandler ?? this.connectionErrorHandler,
            exportsManager,
            connectionManager,
            keychain: Keychain.root,
            apiClient: sessionOptions?.apiClient ?? apiClient,
        });
        const telemetry = Telemetry.create({
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
            const uiRegistryModule = await import("../ui/registry/registry.js");
            uiRegistry = new uiRegistryModule.UIRegistry();
        }
        const result = new Server({
            mcpServer,
            session,
            telemetry,
            userConfig,
            connectionErrorHandler: sessionOptions?.connectionErrorHandler ?? this.connectionErrorHandler,
            elicitation: serverOptions?.elicitation ?? new Elicitation({ server: mcpServer.server }),
            tools: serverOptions?.tools ?? this.tools,
            uiRegistry,
            toolContext: serverOptions?.toolContext,
            metrics: this.metrics,
        });
        // We need to create the MCP logger after the server is constructed
        // because it needs the server instance
        if (userConfig.loggers.includes("mcp")) {
            logger.addLogger(new McpLogger(result, Keychain.root));
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
            userConfig = applyConfigOverrides({ baseConfig: this.userConfig, request });
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
//# sourceMappingURL=base.js.map