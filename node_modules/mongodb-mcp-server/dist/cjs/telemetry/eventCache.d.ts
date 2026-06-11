import type { BaseEvent } from "./types.js";
/**
 * Singleton class for in-memory telemetry event caching
 * Provides a central storage for telemetry events that couldn't be sent
 * Uses LRU cache to automatically drop oldest events when limit is exceeded
 */
export declare class EventCache {
    private static instance;
    private static readonly MAX_EVENTS;
    private cache;
    private nextId;
    /** Current exclusive operation, if any. The next caller awaits this before starting. */
    private currentOperation;
    constructor();
    /**
     * Gets the singleton instance of EventCache
     * @returns The EventCache instance
     */
    static getInstance(): EventCache;
    /**
     * Gets the number of currently cached events
     */
    get size(): number;
    /**
     * Runs a callback with exclusive access to the cache so operations
     * are serialized across all callers (e.g. multiple Telemetry instances / sessions).
     */
    private runExclusive;
    /**
     * Under exclusive access: takes up to `batchSize` oldest events and passes them
     * to the processor. If the processor signals `removeProcessed: true`, those events
     * are removed from the cache; otherwise they remain untouched.
     * Returns the `result` from the processor, or `undefined` if the cache was empty.
     */
    processOldestBatch<T>(batchSize: number, processor: (events: BaseEvent[]) => Promise<{
        removeProcessed: boolean;
        result: T;
    }>): Promise<T | undefined>;
    /**
     * Gets a copy of the currently cached events along with their ids
     * @returns Array of cached BaseEvent objects
     */
    getEvents(): {
        id: number;
        event: BaseEvent;
    }[];
    /**
     * Appends new events to the cache.
     * LRU cache automatically handles dropping oldest events when limit is exceeded.
     */
    appendEvents(events: BaseEvent[]): void;
    /**
     * Removes cached events by their ids
     */
    removeEvents(ids: number[]): void;
}
//# sourceMappingURL=eventCache.d.ts.map