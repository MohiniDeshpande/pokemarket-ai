"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURSOR_LIMITS_TO_LLM_TEXT = exports.ONE_MB = exports.AGG_COUNT_MAX_TIME_MS_CAP = exports.QUERY_COUNT_MAX_TIME_MS_CAP = void 0;
/**
 * A cap for the maxTimeMS used for FindCursor.countDocuments.
 *
 * The number is relatively smaller because we expect the count documents query
 * to be finished sooner if not by the time the batch of documents is retrieved
 * so that count documents query don't hold the final response back.
 */
exports.QUERY_COUNT_MAX_TIME_MS_CAP = 10000;
/**
 * A cap for the maxTimeMS used for counting resulting documents of an
 * aggregation.
 */
exports.AGG_COUNT_MAX_TIME_MS_CAP = 60000;
exports.ONE_MB = 1 * 1024 * 1024;
/**
 * A map of applied limit on cursors to a text that is supposed to be sent as
 * response to LLM
 */
exports.CURSOR_LIMITS_TO_LLM_TEXT = {
    "config.maxDocumentsPerQuery": "server's configured - maxDocumentsPerQuery",
    "config.maxBytesPerQuery": "server's configured - maxBytesPerQuery",
    "tool.responseBytesLimit": "tool's parameter - responseBytesLimit",
};
//# sourceMappingURL=constants.js.map