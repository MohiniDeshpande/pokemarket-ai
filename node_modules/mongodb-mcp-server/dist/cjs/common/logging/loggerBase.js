"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerBase = void 0;
const events_1 = require("events");
const mongodb_redact_1 = require("mongodb-redact");
class LoggerBase extends events_1.EventEmitter {
    constructor(keychain) {
        super();
        this.keychain = keychain;
        this.defaultUnredactedLogger = "mcp";
    }
    log(level, payload) {
        // If no explicit value is supplied for unredacted loggers, default to "mcp"
        const noRedaction = payload.noRedaction !== undefined ? payload.noRedaction : this.defaultUnredactedLogger;
        this.logCore(level, {
            ...payload,
            message: this.redactIfNecessary(payload.message, noRedaction),
            attributes: this.redactAttributes(payload.attributes, noRedaction),
        });
    }
    redactAttributes(attributes, noRedaction) {
        if (!attributes) {
            return undefined;
        }
        const redacted = {};
        for (const [key, value] of Object.entries(attributes)) {
            redacted[key] = this.redactIfNecessary(value, noRedaction);
        }
        return redacted;
    }
    redactIfNecessary(message, noRedaction) {
        if (typeof noRedaction === "boolean" && noRedaction) {
            // If the consumer has supplied noRedaction: true, we don't redact the log message
            // regardless of the logger type
            return message;
        }
        if (typeof noRedaction === "string" && noRedaction === this.type) {
            // If the consumer has supplied noRedaction: logger-type, we skip redacting if
            // our logger type is the same as what the consumer requested
            return message;
        }
        if (typeof noRedaction === "object" &&
            Array.isArray(noRedaction) &&
            this.type &&
            noRedaction.indexOf(this.type) !== -1) {
            // If the consumer has supplied noRedaction: array, we skip redacting if our logger
            // type is included in that array
            return message;
        }
        return (0, mongodb_redact_1.redact)(message, this.keychain?.allSecrets ?? []);
    }
    info(payload) {
        this.log("info", payload);
    }
    error(payload) {
        this.log("error", payload);
    }
    debug(payload) {
        this.log("debug", payload);
    }
    notice(payload) {
        this.log("notice", payload);
    }
    warning(payload) {
        this.log("warning", payload);
    }
    critical(payload) {
        this.log("critical", payload);
    }
    alert(payload) {
        this.log("alert", payload);
    }
    emergency(payload) {
        this.log("emergency", payload);
    }
    mapToMongoDBLogLevel(level) {
        switch (level) {
            case "info":
                return "info";
            case "warning":
                return "warn";
            case "error":
                return "error";
            case "notice":
            case "debug":
                return "debug";
            case "critical":
            case "alert":
            case "emergency":
                return "fatal";
            default:
                return "info";
        }
    }
}
exports.LoggerBase = LoggerBase;
//# sourceMappingURL=loggerBase.js.map