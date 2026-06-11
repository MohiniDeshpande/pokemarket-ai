"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStore = void 0;
exports.createDefaultSessionStore = createDefaultSessionStore;
const index_js_1 = require("./logging/index.js");
const managedTimeout_js_1 = require("./managedTimeout.js");
class SessionStore {
    constructor(params) {
        this.sessions = {};
        const { options, logger, metrics } = params;
        this.idleTimeoutMS = options.idleTimeoutMS;
        this.notificationTimeoutMS = options.notificationTimeoutMS;
        this.logger = logger;
        this.metrics = metrics;
        if (this.idleTimeoutMS <= 0) {
            throw new Error("idleTimeoutMS must be greater than 0");
        }
        if (this.notificationTimeoutMS <= 0) {
            throw new Error("notificationTimeoutMS must be greater than 0");
        }
        if (this.idleTimeoutMS <= this.notificationTimeoutMS) {
            throw new Error("idleTimeoutMS must be greater than notificationTimeoutMS");
        }
    }
    async getSession(sessionId) {
        this.resetTimeout(sessionId);
        return Promise.resolve(this.sessions[sessionId]?.transport);
    }
    resetTimeout(sessionId) {
        const session = this.sessions[sessionId];
        if (!session) {
            return;
        }
        session.abortTimeout.restart();
        session.notificationTimeout.restart();
    }
    sendNotification(sessionId) {
        const session = this.sessions[sessionId];
        if (!session) {
            this.logger.warning({
                id: index_js_1.LogId.streamableHttpTransportSessionCloseNotificationFailure,
                context: "sessionStore",
                message: `session ${sessionId} not found, no notification delivered`,
            });
            return;
        }
        session.logger.info({
            id: index_js_1.LogId.streamableHttpTransportSessionCloseNotification,
            context: "sessionStore",
            message: "Session is about to be closed due to inactivity",
        });
    }
    async addSession(params) {
        const { sessionId, transport, logger } = params;
        const session = this.sessions[sessionId];
        if (session) {
            throw new Error(`Session ${sessionId} already exists`);
        }
        const abortTimeout = (0, managedTimeout_js_1.setManagedTimeout)(async () => {
            if (this.sessions[sessionId]) {
                this.sessions[sessionId].logger.info({
                    id: index_js_1.LogId.streamableHttpTransportSessionCloseNotification,
                    context: "sessionStore",
                    message: "Session closed due to inactivity",
                });
                await this.closeSession({ sessionId, reason: "idle_timeout" });
            }
        }, this.idleTimeoutMS);
        const notificationTimeout = (0, managedTimeout_js_1.setManagedTimeout)(() => this.sendNotification(sessionId), this.notificationTimeoutMS);
        this.sessions[sessionId] = {
            transport,
            abortTimeout,
            notificationTimeout,
            logger,
        };
        this.metrics.get("sessionCreated").inc();
        return Promise.resolve();
    }
    async closeSession({ sessionId, reason = "unknown", }) {
        const session = this.sessions[sessionId];
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        // Remove from map before closing transport so that a re-entrant
        // onsessionclosed callback (fired by transport.close()) sees the
        // session as already gone and doesn't double-count metrics.
        delete this.sessions[sessionId];
        session.abortTimeout.cancel();
        session.notificationTimeout.cancel();
        if (reason !== "transport_closed") {
            // Only close the transport when the server initiates the close.
            try {
                await session.transport.close();
            }
            catch (error) {
                this.logger.error({
                    id: index_js_1.LogId.streamableHttpTransportSessionCloseFailure,
                    context: "streamableHttpTransport",
                    message: `Error closing transport ${sessionId}: ${error instanceof Error ? error.message : String(error)}`,
                });
            }
        }
        this.metrics.get("sessionClosed").inc({ reason: reason });
    }
    async closeAllSessions() {
        await Promise.all(Object.keys(this.sessions).map((sessionId) => this.closeSession({ sessionId, reason: "server_stop" })));
    }
}
exports.SessionStore = SessionStore;
/**
 * Creates a default SessionStore instance from the provided constructor arguments.
 */
function createDefaultSessionStore(params) {
    return new SessionStore(params);
}
//# sourceMappingURL=sessionStore.js.map