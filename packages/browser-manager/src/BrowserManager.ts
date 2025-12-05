/**
 * packages/browser-manager/src/BrowserManager.ts
 *
 * Chromium限定の BrowserManager v2 実装（完全再実装）
 */

import { chromium, Browser, BrowserContext } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import {
  BrowserRecord,
  ContextRecord,
  PageRecord,
  RecyclingPolicy,
  DEFAULT_RECYCLING_POLICY,
  AcquireContextOptions,
  CleanupOptions,
  ResourcePoolStats,
} from './types';
import { ProcessManager } from './ProcessManager';
import { MemoryProfiler } from './MemoryProfiler';

export class BrowserManager {
  // singleton instance is optional; provide getInstance for convenience
  private static _instance: BrowserManager | null = null;

  static getInstance(policy?: Partial<RecyclingPolicy>) {
    if (!BrowserManager._instance) {
      BrowserManager._instance = new BrowserManager(policy);
    }
    return BrowserManager._instance;
  }

  private browsers: Map<string, BrowserRecord> = new Map();
  private contexts: Map<string, ContextRecord> = new Map();
  // pages are lightweight; track only if needed for observability
  private pages: Map<string, PageRecord> = new Map();

  private policy: RecyclingPolicy;
  private periodicCleanupHandle: NodeJS.Timeout | null = null;
  private isCleaning: boolean = false;
  private memoryProfiler: MemoryProfiler;

  private constructor(policyOverride?: Partial<RecyclingPolicy>) {
    this.policy = { ...DEFAULT_RECYCLING_POLICY, ...(policyOverride || {}) };
    this.memoryProfiler = new MemoryProfiler();
    this.startPeriodicCleanup();
    this.startMemoryMonitoring();
  }

  private startMemoryMonitoring(): void {
    // プロセスメモリ監視を開始
    this.memoryProfiler.startProcessMonitoring();
    
    // メモリアラートのリスナー
    this.memoryProfiler.on('alert', (alert: any) => {
      console.log(`[MemoryAlert] ${alert.severity?.toUpperCase() || 'WARNING'}: ${alert.message}`);
    });
  }

  /* ------------------------------
   *  Public API
   * ------------------------------ */

  /**
   * Acquire a BrowserContext. If requireCleanContext is true, always create a new context
   * on a (possibly new) browser. If reuseExisting is true, try to reuse a healthy existing context.
   */
  public async acquireContext(options?: AcquireContextOptions): Promise<BrowserContext> {
    const opts = {
      requireCleanContext: false,
      reuseExisting: true,
      timeoutMs: 30000,
      ...(options || {}),
    };

    // If reuseAllowed, try to find a healthy context
    if (!opts.requireCleanContext && opts.reuseExisting) {
      for (const [ctxId, rec] of this.contexts.entries()) {
        if (rec.isActive && rec.requestCount < this.policy.maxRequestsPerContext) {
          // Check idle time and lifetime
          const now = Date.now();
          const idle = now - rec.lastUsedAt;
          const age = now - rec.createdAt;
          if (idle < this.policy.maxIdleTimeMs && age < this.policy.maxContextLifetimeMs) {
            // Update counters and timestamps
            rec.lastUsedAt = Date.now();
            rec.requestCount++;
            return rec.context;
          }
        }
      }
    }

    // No suitable existing context -> create a new one (on existing browser if possible)
    return await this.createContext();
  }

  /**
   * Release context after use (updates metadata). If context is eligible for close based on policy,
   * actual closure will be handled by periodic cleanup.
   */
  public releaseContext(context: BrowserContext): void {
    const ctxId = this.findContextIdForContext(context);
    if (!ctxId) return;
    const rec = this.contexts.get(ctxId);
    if (!rec) return;
    rec.lastUsedAt = Date.now();
  }

  /**
   * Explicitly close a context (immediate).
   */
  public async closeContext(contextId: string): Promise<void> {
    const rec = this.contexts.get(contextId);
    if (!rec) return;
    // Close the actual BrowserContext
    try {
      await rec.context.close();
    } catch (e) {
      // ignore
    }
    // Remove from parent browser record
    const browserRec = this.browsers.get(rec.parentBrowserId);
    if (browserRec) {
      browserRec.contexts.delete(rec.context);
    }
    this.contexts.delete(contextId);
  }

  /**
   * Get resource pool statistics for observability.
   */
  public getResourcePoolStats(): ResourcePoolStats {
    const totalBrowsers = this.browsers.size;
    const totalContexts = this.contexts.size;
    const totalPages = this.pages.size;
    const activeContexts = Array.from(this.contexts.values()).filter((c) => c.isActive).length;
    const idleContexts = totalContexts - activeContexts;
    const totalRequests = Array.from(this.contexts.values()).reduce((s, c) => s + c.requestCount, 0);

    const memoryStats = this.memoryProfiler.getStatistics();
    const memory = {
      sampleCount: memoryStats.historySize,
      minMB: 0,
      maxMB: 0,
      avgMB: Math.round(memoryStats.averageRSS / (1024 * 1024))
    };

    return {
      totalBrowsers,
      totalContexts,
      totalPages,
      activeContexts,
      idleContexts,
      totalRequests,
      memory,
    };
  }

  /**
   * Get memory profiler instance for advanced monitoring
   */
  public getMemoryProfiler(): MemoryProfiler {
    return this.memoryProfiler;
  }

  /**
   * Clean up all resources. Optionally force kill underlying OS processes.
   */
  public async cleanupAll(options?: CleanupOptions): Promise<void> {
    const opts = {
      forceKillProcesses: false,
      timeoutMs: 10000,
      ...(options || {}),
    };

    // Stop periodic cleanup while we perform manual cleanup
    if (this.periodicCleanupHandle) {
      clearInterval(this.periodicCleanupHandle);
      this.periodicCleanupHandle = null;
    }

    // Stop memory monitoring
    this.memoryProfiler.stopAll();

    // Close all contexts
    const contextIds = Array.from(this.contexts.keys());
    for (const ctxId of contextIds) {
      const rec = this.contexts.get(ctxId);
      if (!rec) continue;
      try {
        await rec.context.close();
      } catch (e) {
        // ignore
      }
      this.contexts.delete(ctxId);
    }

    // Close all browsers
    const browserIds = Array.from(this.browsers.keys());
    for (const bId of browserIds) {
      const bRec = this.browsers.get(bId);
      if (!bRec) continue;
      try {
        await bRec.browser.close();
      } catch (e) {
        // try force kill via PID if requested
        if (opts.forceKillProcesses && bRec.pid) {
          ProcessManager.killPID(bRec.pid, true);
        }
      }
      this.browsers.delete(bId);
    }

    // pages map clear
    this.pages.clear();
  }

  /**
   * Destroy manager entirely (cleanup + nullify singleton)
   */
  public async destroy(): Promise<void> {
    await this.cleanupAll({ forceKillProcesses: true });
    BrowserManager._instance = null;
  }

  /* ------------------------------
   *  Internal helpers
   * ------------------------------ */

  private startPeriodicCleanup() {
    if (this.periodicCleanupHandle) return;
    this.periodicCleanupHandle = setInterval(async () => {
      if (this.isCleaning) return;
      this.isCleaning = true;
      try {
        await this.periodicCleanup();
      } catch (e) {
        // log if logger available
      } finally {
        this.isCleaning = false;
      }
    }, this.policy.periodicCleanupIntervalMs);
  }

  private async periodicCleanup(): Promise<void> {
    const now = Date.now();

    // 1) Close contexts exceeding idle time or max requests or lifetime
    for (const [ctxId, rec] of Array.from(this.contexts.entries())) {
      const idle = now - rec.lastUsedAt;
      const age = now - rec.createdAt;
      if (!rec.isActive) continue;

      if (idle > this.policy.maxIdleTimeMs || rec.requestCount >= this.policy.maxRequestsPerContext || age > this.policy.maxContextLifetimeMs) {
        // close context
        try {
          await rec.context.close();
        } catch (e) {
          // ignore
        }
        // remove from parent browser
        const browserRec = this.browsers.get(rec.parentBrowserId);
        if (browserRec) browserRec.contexts.delete(rec.context);
        this.contexts.delete(ctxId);
      }
    }

    // 2) Rotate browsers that outlived their keepAlive
    for (const [bId, bRec] of Array.from(this.browsers.entries())) {
      const age = now - bRec.createdAt;
      if (age > this.policy.browserKeepAliveMs) {
        // Close browser: this will close contexts too
        try {
          await bRec.browser.close();
        } catch (e) {
          // attempt force kill if PID known
          if (bRec.pid) ProcessManager.killPID(bRec.pid, true);
        }
        this.browsers.delete(bId);
        // Remove contexts pointing to it
        for (const [ctxId, rec] of Array.from(this.contexts.entries())) {
          if (rec.parentBrowserId === bId) {
            this.contexts.delete(ctxId);
          }
        }
      }
    }
  }

  /**
   * Create a new browser (Chromium) and a new context on it.
   * We capture PID when possible and register records.
   */
  private async createContext(): Promise<BrowserContext> {
    // Launch a new Chrome instance. Use a deterministic launch profile if needed.
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    // Register browser record
    const browserId = `b-${uuidv4()}`;
    const pid = ProcessManager.getBrowserPID(browser);
    const browserRecord: BrowserRecord = {
      id: browserId,
      browser,
      pid,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      contexts: new Set(),
      requestCount: 0,
      isHealthy: true,
    };
    this.browsers.set(browserId, browserRecord);

    // Create a new context
    const context = await browser.newContext();
    const contextId = `c-${uuidv4()}`;
    const contextRecord: ContextRecord = {
      id: contextId,
      context,
      parentBrowserId: browserId,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      requestCount: 0,
      isActive: true,
    };
    this.contexts.set(contextId, contextRecord);
    browserRecord.contexts.add(context);

    // Hook context close to clean up maps automatically
    context.on('close', () => {
      // remove mapping
      try {
        this.contexts.delete(contextId);
        browserRecord.contexts.delete(context);
      } catch (e) {
        // ignore
      }
    });

    return context;
  }

  /**
   * Helper to find contextId given BrowserContext reference
   */
  private findContextIdForContext(context: BrowserContext): string | undefined {
    for (const [id, rec] of this.contexts.entries()) {
      if (rec.context === context) return id;
    }
    return undefined;
  }
}
