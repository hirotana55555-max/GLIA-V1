/**
 * packages/browser-manager/src/types.ts
 *
 * コア型定義。BrowserManager v2（Chromium限定）で使用する型を定義します。
 */
import type { Browser, BrowserContext, Page } from 'playwright';
export type PID = number;
export interface BrowserRecord {
    id: string;
    browser: Browser;
    pid?: PID;
    createdAt: number;
    lastUsedAt: number;
    contexts: Set<BrowserContext>;
    requestCount: number;
    isHealthy: boolean;
}
export interface ContextRecord {
    id: string;
    context: BrowserContext;
    parentBrowserId: string;
    createdAt: number;
    lastUsedAt: number;
    requestCount: number;
    isActive: boolean;
}
export interface PageRecord {
    id: string;
    page: Page;
    contextId: string;
    createdAt: number;
    lastUsedAt: number;
}
export interface RecyclingPolicy {
    maxIdleTimeMs: number;
    maxRequestsPerContext: number;
    maxContextLifetimeMs: number;
    periodicCleanupIntervalMs: number;
    browserKeepAliveMs: number;
}
export interface ResourcePoolStats {
    totalBrowsers: number;
    totalContexts: number;
    totalPages: number;
    activeContexts: number;
    idleContexts: number;
    totalRequests: number;
    memory: {
        sampleCount: number;
        minMB: number;
        maxMB: number;
        avgMB: number;
    };
}
export interface AcquireContextOptions {
    requireCleanContext?: boolean;
    reuseExisting?: boolean;
    timeoutMs?: number;
}
export interface CleanupOptions {
    forceKillProcesses?: boolean;
    timeoutMs?: number;
}
export declare const DEFAULT_RECYCLING_POLICY: RecyclingPolicy;
export interface BrowserProcess {
    pid: string;
    model: string;
}
export type ManagedBrowserContextState = "CREATED" | "ACTIVE" | "CLOSED";
export interface ManagedBrowserContext {
    id: string;
    browserPid: string;
    state: ManagedBrowserContextState;
    createdAt: number;
    lastActivityAt: number;
    pages: Map<string, ManagedBrowserPage>;
    metadata: Record<string, any>;
}
export interface ManagedBrowserPage {
    id: string;
    contextId: string;
    state: string;
    url?: string;
    title?: string;
    createdAt: number;
    result?: any;
    prompt?: string;
}
//# sourceMappingURL=types.d.ts.map