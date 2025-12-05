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
  pid?: PID; // 子プロセス PID（取得できれば）
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
  maxIdleTimeMs: number;        // アイドルで再利用不可となる閾値
  maxRequestsPerContext: number; // コンテキスト毎のリクエスト上限
  maxContextLifetimeMs: number; // コンテキストの最大寿命（経過で強制再生成）
  periodicCleanupIntervalMs: number; // 定期クリーンアップ間隔
  browserKeepAliveMs: number;   // ブラウザを保持する最大時間（ブラウザ単位の回転）
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

export const DEFAULT_RECYCLING_POLICY: RecyclingPolicy = {
  maxIdleTimeMs: 5 * 60 * 1000, // 5 min
  maxRequestsPerContext: 200,
  maxContextLifetimeMs: 30 * 60 * 1000, // 30 min
  periodicCleanupIntervalMs: 60 * 1000, // 1 min
  browserKeepAliveMs: 60 * 60 * 1000, // 1 hour
};
