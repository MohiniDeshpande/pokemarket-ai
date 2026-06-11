"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigResource = void 0;
const resource_js_1 = require("../resource.js");
const arg_parser_1 = require("@mongosh/arg-parser");
class ConfigResource extends resource_js_1.ReactiveResource {
    constructor(session, config, telemetry) {
        super({
            resourceConfiguration: {
                name: "config",
                uri: "config://config",
                config: {
                    description: "Server configuration, supplied by the user either as environment variables or as startup arguments",
                },
            },
            options: {
                initial: { ...config },
                events: [],
            },
            session,
            config,
            telemetry,
        });
    }
    reduce(eventName, event) {
        void eventName;
        void event;
        return this.current;
    }
    toOutput() {
        const connectionInfo = (0, arg_parser_1.generateConnectionInfoFromCliArgs)(this.current);
        const result = {
            telemetry: this.current.telemetry,
            logPath: this.current.logPath,
            connectionString: connectionInfo.connectionString
                ? "set; access to MongoDB tools are currently available to use"
                : "not set; before using any MongoDB tool, you need to configure a connection string, alternatively you can setup MongoDB Atlas access, more info at 'https://github.com/mongodb-js/mongodb-mcp-server'.",
            connectOptions: connectionInfo.driverOptions,
            atlas: this.current.apiClientId && this.current.apiClientSecret
                ? "set; MongoDB Atlas tools are currently available to use"
                : "not set; MongoDB Atlas tools are currently unavailable, to have access to MongoDB Atlas tools like creating clusters or connecting to clusters make sure to setup credentials, more info at 'https://github.com/mongodb-js/mongodb-mcp-server'.",
        };
        return JSON.stringify(result);
    }
}
exports.ConfigResource = ConfigResource;
//# sourceMappingURL=config.js.map