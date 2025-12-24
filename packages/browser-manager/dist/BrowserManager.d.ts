/**
 * packages/browser-manager/src/BrowserManager.ts
 *
 * Chromium限定の BrowserManager v2 実装（完全再実装）
 */
import { BrowserContext } from 'playwright';
import { RecyclingPolicy, AcquireContextOptions, CleanupOptions, ResourcePoolStats } from './types';
import { MemoryProfiler } from './MemoryProfiler';
export declare class BrowserManager {
    private static _instance;
    static getInstance(policy?: Partial<RecyclingPolicy>): BrowserManager;
    private browsers;
    private contexts;
    private pages;
    private policy;
    private periodicCleanupHandle;
    private isCleaning;
    private memoryProfiler;
    private constructor();
    private startMemoryMonitoring;
    /**
     * Acquire a BrowserContext. If requireCleanContext is true, always create a new context
     * on a (possibly new) browser. If reuseExisting is true, try to reuse a healthy existing context.
     */
    acquireContext(options?: AcquireContextOptions): Promise<BrowserContext>;
    /**
     * Release context after use (updates metadata). If context is eligible for close based on policy,
     * actual closure will be handled by periodic cleanup.
     */
    releaseContext(context: BrowserContext): void;
    /**
     * Explicitly close a context (immediate).
     */
    closeContext(contextId: string): Promise<void>;
    /**
     * Get resource pool statistics for observability.
     */
    getResourcePoolStats(): ResourcePoolStats;
    /**
     * Get memory profiler instance for advanced monitoring
     */
    getMemoryProfiler(): MemoryProfiler;
    /**
     * Clean up all resources. Optionally force kill underlying OS processes.
     */
    cleanupAll(options?: CleanupOptions): Promise<void>;
    /**
     * Destroy manager entirely (cleanup + nullify singleton)
     */
    destroy(): Promise<void>;
    private startPeriodicCleanup;
    private periodicCleanup;
    /**
     * Create a new browser (Chromium) and a new context on it.
     * We capture PID when possible and register records.
     */
    private createContext;
    /**
     * Helper to find contextId given BrowserContext reference
     */
    private findContextIdForContext;
}
//# sourceMappingURL=BrowserManager.d.ts.map