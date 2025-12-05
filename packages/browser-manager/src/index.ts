/**
 * packages/browser-manager/src/index.ts
 *
 * エントリポイント：ビルド後に dist/index.js に出力されます。
 */

import { BrowserManager } from './BrowserManager';
import { ProcessManager } from './ProcessManager';
import type {
  BrowserRecord,
  ContextRecord,
  PageRecord,
  RecyclingPolicy,
  AcquireContextOptions,
  CleanupOptions,
  ResourcePoolStats,
} from './types';

export { BrowserManager, ProcessManager };
export type {
  BrowserRecord,
  ContextRecord,
  PageRecord,
  RecyclingPolicy,
  AcquireContextOptions,
  CleanupOptions,
  ResourcePoolStats,
};

export default BrowserManager;

// MemoryProfiler関連のエクスポート
export { MemoryProfiler } from './MemoryProfiler';
export type { MemoryMetrics, MemoryAlert, MemoryThresholds } from './MemoryProfiler';
export { BrowserManagerWithMemory } from './BrowserManagerWithMemory';
