/**
 * packages/browser-manager/src/index.ts
 *
 * エントリポイント：ビルド後に dist/index.js に出力されます。
 */

// 名前付きエクスポート - 正しい再エクスポート構文
export { BrowserManager } from './BrowserManager';
export { ProcessManager } from './ProcessManager';
export { MemoryProfiler } from './MemoryProfiler';

// 型の再エクスポート
export type {
  BrowserRecord,
  ContextRecord,
  PageRecord,
  RecyclingPolicy,
  AcquireContextOptions,
  CleanupOptions,
  ResourcePoolStats,
} from './types';

// デフォルトエクスポートとして再エクスポート
export { BrowserManager as default } from './BrowserManager';
