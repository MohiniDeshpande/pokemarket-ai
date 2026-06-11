import type { LoggerBase } from "./logging/index.js";
import type { Metrics, DefaultMetrics } from "@mongodb-js/mcp-metrics";
import type { CloseableTransport, SessionCloseReason } from "@mongodb-js/mcp-types";
export type { CloseableTransport, SessionCloseReason };
/**
 * Interface for managing MCP transport sessions.
 *
 * Implement this interface to provide custom session storage and lifecycle
 * management (e.g. database-based session storage).
 */
export interface ISessionStore<T extends CloseableTransport = CloseableTransport> {
    getSession(sessionId: string): Promise<T | undefined>;
    addSession(params: {
        sessionId: string;
        transport: T;
        logger: LoggerBase;
    }): Promise<void>;
    closeSession(params: {
        sessionId: string;
        reason?: SessionCloseReason;
    }): Promise<void>;
    closeAllSessions(): Promise<void>;
}
export declare class SessionStore<T extends CloseableTransport = CloseableTransport> implements ISessionStore<T> {
    private sessions;
    private readonly idleTimeoutMS;
    private readonly notificationTimeoutMS;
    private readonly logger;
    private readonly metrics;
    constructor(params: {
        options: {
            idleTimeoutMS: number;
            notificationTimeoutMS: number;
        };
        logger: LoggerBase;
        metrics: Metrics<DefaultMetrics>;
    });
    getSession(sessionId: string): Promise<T | undefined>;
    private resetTimeout;
    private sendNotification;
    addSession(params: {
        sessionId: string;
        transport: T;
        logger: LoggerBase;
    }): Promise<void>;
    closeSession({ sessionId, reason, }: {
        sessionId: string;
        reason?: SessionCloseReason;
    }): Promise<void>;
    closeAllSessions(): Promise<void>;
}
/**
 * Constructor arguments for creating a SessionStore instance.
 */
export type SessionStoreConstructorArgs<TMetrics extends DefaultMetrics = DefaultMetrics> = {
    options: {
        idleTimeoutMS: number;
        notificationTimeoutMS: number;
    };
    logger: LoggerBase;
    metrics: Metrics<TMetrics>;
};
/**
 * A function to create a custom SessionStore instance.
 * When provided, the runner will use this function instead of the default SessionStore constructor.
 */
export type CreateSessionStoreFn<TTransport extends CloseableTransport = CloseableTransport, TMetrics extends DefaultMetrics = DefaultMetrics> = (args: SessionStoreConstructorArgs<TMetrics>) => ISessionStore<TTransport>;
/**
 * Creates a default SessionStore instance from the provided constructor arguments.
 */
export declare function createDefaultSessionStore<TTransport extends CloseableTransport = CloseableTransport, TMetrics extends DefaultMetrics = DefaultMetrics>(params: SessionStoreConstructorArgs<TMetrics>): SessionStore<TTransport>;
//# sourceMappingURL=sessionStore.d.ts.map