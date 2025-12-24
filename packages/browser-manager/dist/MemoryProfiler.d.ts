/**
 * packages/browser-manager/src/MemoryProfiler.ts
 *
 * 多層的メモリ監視モジュール：
 * 1. CDP（Chrome DevTools Protocol）によるJSヒープ監視
 * 2. プロセスRSS（Resident Set Size）監視
 * 3. メモリ閾値超過時のアラートと自動リカバリー
 *
 * 注意: CDP監視は安定版のPlaywright APIを使用します。
 */
import { Page } from 'playwright';
import { EventEmitter } from 'events';
export interface MemoryMetrics {
    timestamp: number;
    jsHeapUsedSize: number;
    jsHeapTotalSize: number;
    rss?: number;
}
export interface MemoryThresholds {
    jsHeapUsedSize: number;
    rss: number;
}
export interface MemoryAlert {
    type: 'js_heap' | 'rss' | 'combined';
    message: string;
    metrics: MemoryMetrics;
    timestamp: number;
    severity: 'warning' | 'critical';
}
export declare class MemoryProfiler extends EventEmitter {
    private static readonly DEFAULT_THRESHOLDS;
    private thresholds;
    private monitoringPages;
    private processMemoryInterval;
    private history;
    private maxHistorySize;
    constructor(thresholds?: Partial<MemoryThresholds>);
    /**
     * ページのメモリ監視を開始
     */
    startMonitoringPage(pageId: string, page: Page): Promise<void>;
    /**
     * ページのメモリ監視を停止
     */
    stopMonitoringPage(pageId: string): void;
    /**
     * プロセスメモリ監視を開始
     */
    startProcessMonitoring(intervalMs?: number): void;
    /**
     * プロセスメモリ監視を停止
     */
    stopProcessMonitoring(): void;
    /**
     * 全監視を停止
     */
    stopAll(): void;
    /**
     * メモリメトリクス履歴を取得
     */
    getHistory(): MemoryMetrics[];
    /**
     * 統計情報を取得
     */
    getStatistics(): {
        totalPagesMonitored: number;
        historySize: number;
        alerts: number;
        averageJSHeap: number;
        averageRSS: number;
    };
    private collectPageMetrics;
    private checkThresholds;
    private formatBytes;
}
export default MemoryProfiler;
//# sourceMappingURL=MemoryProfiler.d.ts.map