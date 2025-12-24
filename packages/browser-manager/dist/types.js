"use strict";
/**
 * packages/browser-manager/src/types.ts
 *
 * コア型定義。BrowserManager v2（Chromium限定）で使用する型を定義します。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_RECYCLING_POLICY = void 0;
exports.DEFAULT_RECYCLING_POLICY = {
    maxIdleTimeMs: 5 * 60 * 1000, // 5 min
    maxRequestsPerContext: 200,
    maxContextLifetimeMs: 30 * 60 * 1000, // 30 min
    periodicCleanupIntervalMs: 60 * 1000, // 1 min
    browserKeepAliveMs: 60 * 60 * 1000, // 1 hour
};
//# sourceMappingURL=types.js.map