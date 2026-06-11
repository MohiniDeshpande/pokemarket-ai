import type { BaseEvent, CommonProperties } from "./types.js";
import type { LoggerBase } from "../common/logging/index.js";
import type { ApiClient } from "../common/atlas/apiClient.js";
import { EventCache } from "./eventCache.js";
import type { DeviceId } from "../helpers/deviceId.js";
import type { Keychain } from "../common/keychain.js";
import type { Session } from "../common/session.js";
import type { UserConfig } from "../common/config/userConfig.js";
import { EventEmitter } from "events";
import type { TelemetryEvents } from "@mongodb-js/mcp-types";
export type { TelemetryEvents };
/**
 * Configuration for the {@link Telemetry} pipeline.
 */
export interface TelemetryConfig {
    /** Logger used by the telemetry pipeline for its own diagnostics. */
    logger: LoggerBase;
    /** Device id source, resolved asynchronously during setup. */
    deviceId: DeviceId;
    /**
     * API client used to send events. Always required — the pipeline would
     * otherwise buffer events in the cache forever. When no Atlas credentials
     * are configured, callers should still pass an unauthenticated
     * {@link ApiClient}; it will route telemetry through the unauth endpoint.
     */
    apiClient: ApiClient;
    /** Secrets source used when redacting events prior to sending. */
    keychain?: Keychain;
    /**
     * The user's telemetry preference. When set to `false`, no events are
     * cached or sent. The DO_NOT_TRACK environment variable is always honored
     * on top of this setting, so callers don't need to check it themselves.
     */
    enabled: boolean;
    /**
     * Returns the host-supplied common properties merged onto every event
     * (e.g. hosting mode, MCP client identity, transport). Invoked on every
     * send so values resolved after construction — like the client name/
     * version exchanged during handshake — are captured. Static properties
     * can simply be returned as constants from this callback.
     *
     * Machine metadata, device id, and container environment are provided by
     * the pipeline itself and don't need to be returned here.
     */
    getCommonProperties?: () => Partial<CommonProperties>;
    /**
     * Optional override for the underlying event cache. Defaults to the
     * process-wide singleton returned by {@link EventCache.getInstance}.
     * Mostly useful for tests or callers that need to isolate caching.
     */
    eventCache?: EventCache;
}
/** Maximum number of events sent per batch. */
export declare const BATCH_SIZE = 32;
/** Delay between send attempts under normal conditions. */
export declare const SEND_INTERVAL_MS = 30000;
/** Initial backoff delay after a 429 response. */
export declare const INITIAL_BACKOFF_MS = 60000;
/** Maximum backoff delay (1 hour). */
export declare const MAX_BACKOFF_MS = 3600000;
/**
 * Calculates the next backoff duration, doubling the current value up to MAX_BACKOFF_MS.
 */
export declare function nextBackoffMs(currentMs: number): number;
export declare class Telemetry {
    /** Resolves when the setup is complete or a timeout occurs */
    setupPromise: Promise<[string, boolean]> | undefined;
    readonly events: EventEmitter<TelemetryEvents>;
    private readonly logger;
    private readonly apiClient;
    private readonly keychain?;
    private readonly enabled;
    private readonly getHostCommonProperties;
    /**
     * Machine metadata plus device_id / is_container_env, which the pipeline
     * resolves itself during setup. Host-supplied properties are merged on
     * top of this at send time.
     */
    private readonly pipelineCommonProperties;
    private readonly eventCache;
    private readonly deviceId;
    private backoffMs;
    private readonly timer;
    private constructor();
    /**
     * @deprecated Pass a {@link TelemetryConfig} object instead. This
     * positional-argument overload is preserved for backward compatibility
     * and will be removed in the next major version.
     */
    static create(session: Session, userConfig: UserConfig, deviceId: DeviceId, options?: {
        commonProperties?: Partial<CommonProperties>;
        eventCache?: EventCache;
    }): Telemetry;
    static create(config: TelemetryConfig): Telemetry;
    private setup;
    close(): Promise<void>;
    /**
     * Caches events for sending via the background timer.
     */
    emitEvents(events: BaseEvent[]): void;
    /**
     * Gets the common properties for events
     */
    getCommonProperties(): CommonProperties;
    /**
     * Checks if telemetry is currently enabled.
     *
     * Follows the Console Do Not Track standard
     * by respecting the DO_NOT_TRACK environment variable. The env check is
     * done on every call so an operator can opt out mid-process.
     */
    isTelemetryEnabled(): boolean;
    /**
     * Schedules the next send attempt. Replaces any previously scheduled send.
     */
    private scheduleSend;
    /**
     * Sends a batch and reschedules the next attempt based on the result.
     */
    private sendBatchAndReschedule;
    /**
     * Determines the next send delay based on the result of the last batch.
     * On rate-limit: uses and advances exponential backoff.
     * On success: resets backoff and returns the normal interval.
     * On error/empty: returns the normal interval without changing backoff state.
     */
    private getNextDelay;
    /**
     * Sends up to BATCH_SIZE oldest events from the cache.
     * On success the sent events are removed; on failure they stay in the cache.
     * Does not reschedule — the caller decides what to do next.
     */
    private sendBatch;
    /**
     * Sends events through the API client after redacting sensitive data.
     */
    private sendEvents;
}
//# sourceMappingURL=telemetry.d.ts.map