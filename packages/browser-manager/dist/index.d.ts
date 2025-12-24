/**
 * packages/browser-manager/src/index.ts
 *
 * エントリポイント：ビルド後に dist/index.js に出力されます。
 */
export * from './types';
export * from './BrowserManager';
export * from './ProcessManager';
export * from './MemoryProfiler';
export * from './resource-pool';
export * from './manager';
export type { BrowserRecord, ContextRecord, PageRecord, RecyclingPolicy, AcquireContextOptions, CleanupOptions, ResourcePoolStats, } from './types';
export { BrowserManager as default } from './BrowserManager';
//# sourceMappingURL=index.d.ts.map