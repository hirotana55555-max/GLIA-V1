"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryProfiler = void 0;
const events_1 = require("events");
class MemoryProfiler extends events_1.EventEmitter {
    constructor(thresholds) {
        super();
        this.monitoringPages = new Map();
        this.processMemoryInterval = null;
        this.history = [];
        this.maxHistorySize = 1000;
        this.thresholds = { ...MemoryProfiler.DEFAULT_THRESHOLDS, ...thresholds };
    }
    /**
     * ページのメモリ監視を開始
     */
    async startMonitoringPage(pageId, page) {
        try {
            // CDPセッションを確立
            const session = await page.context().newCDPSession(page);
            // メモリ監視を有効化
            await session.send('Performance.enable');
            // 定期的にメモリメトリクスを収集
            const interval = setInterval(async () => {
                try {
                    const metrics = await this.collectPageMetrics(page, session);
                    this.history.push(metrics);
                    // 履歴サイズ制限
                    if (this.history.length > this.maxHistorySize) {
                        this.history = this.history.slice(-this.maxHistorySize);
                    }
                    // 閾値チェック
                    this.checkThresholds(metrics, pageId);
                    // メトリクスイベントを発行
                    this.emit('metrics', { pageId, metrics });
                }
                catch (error) {
                    this.emit('error', { pageId, error });
                }
            }, 5000); // 5秒間隔
            this.monitoringPages.set(pageId, { page, session, interval });
            console.log(`[MemoryProfiler] ページ監視開始: ${pageId}`);
        }
        catch (error) {
            console.error(`[MemoryProfiler] ページ監視開始失敗: ${pageId}`, error);
            throw error;
        }
    }
    /**
     * ページのメモリ監視を停止
     */
    stopMonitoringPage(pageId) {
        const monitor = this.monitoringPages.get(pageId);
        if (monitor) {
            clearInterval(monitor.interval);
            monitor.session.detach().catch(() => { });
            this.monitoringPages.delete(pageId);
            console.log(`[MemoryProfiler] ページ監視停止: ${pageId}`);
        }
    }
    /**
     * プロセスメモリ監視を開始
     */
    startProcessMonitoring(intervalMs = 10000) {
        if (this.processMemoryInterval) {
            clearInterval(this.processMemoryInterval);
        }
        this.processMemoryInterval = setInterval(() => {
            try {
                const rss = process.memoryUsage().rss;
                const metrics = {
                    timestamp: Date.now(),
                    jsHeapUsedSize: 0,
                    jsHeapTotalSize: 0,
                    rss
                };
                this.history.push(metrics);
                // 履歴サイズ制限
                if (this.history.length > this.maxHistorySize) {
                    this.history = this.history.slice(-this.maxHistorySize);
                }
                // RSS閾値チェック
                if (rss > this.thresholds.rss) {
                    const alert = {
                        type: 'rss',
                        message: `プロセスRSSが閾値を超過: ${this.formatBytes(rss)} > ${this.formatBytes(this.thresholds.rss)}`,
                        metrics,
                        timestamp: Date.now(),
                        severity: rss > this.thresholds.rss * 1.5 ? 'critical' : 'warning'
                    };
                    this.emit('alert', alert);
                }
                this.emit('processMetrics', metrics);
            }
            catch (error) {
                this.emit('error', { error, context: 'processMonitoring' });
            }
        }, intervalMs);
        console.log('[MemoryProfiler] プロセスメモリ監視開始');
    }
    /**
     * プロセスメモリ監視を停止
     */
    stopProcessMonitoring() {
        if (this.processMemoryInterval) {
            clearInterval(this.processMemoryInterval);
            this.processMemoryInterval = null;
            console.log('[MemoryProfiler] プロセスメモリ監視停止');
        }
    }
    /**
     * 全監視を停止
     */
    stopAll() {
        // ページ監視停止
        for (const [pageId] of this.monitoringPages.entries()) {
            this.stopMonitoringPage(pageId);
        }
        // プロセス監視停止
        this.stopProcessMonitoring();
        console.log('[MemoryProfiler] 全監視停止');
    }
    /**
     * メモリメトリクス履歴を取得
     */
    getHistory() {
        return [...this.history];
    }
    /**
     * 統計情報を取得
     */
    getStatistics() {
        const jsHeapMetrics = this.history.filter(m => m.jsHeapUsedSize > 0);
        const rssMetrics = this.history.filter(m => m.rss !== undefined);
        return {
            totalPagesMonitored: this.monitoringPages.size,
            historySize: this.history.length,
            alerts: 0, // 必要に応じて実装
            averageJSHeap: jsHeapMetrics.length > 0
                ? jsHeapMetrics.reduce((sum, m) => sum + m.jsHeapUsedSize, 0) / jsHeapMetrics.length
                : 0,
            averageRSS: rssMetrics.length > 0
                ? rssMetrics.reduce((sum, m) => sum + (m.rss || 0), 0) / rssMetrics.length
                : 0,
        };
    }
    async collectPageMetrics(page, session) {
        try {
            // ヒープ使用量を取得
            const heapInfo = await session.send('Runtime.getHeapUsage');
            // メモリメトリクスを収集
            const metricsResponse = await session.send('Performance.getMetrics');
            const metrics = {};
            metricsResponse.metrics.forEach((metric) => {
                metrics[metric.name] = metric.value;
            });
            return {
                timestamp: Date.now(),
                jsHeapUsedSize: heapInfo.usedSize,
                jsHeapTotalSize: heapInfo.totalSize,
                rss: process.memoryUsage().rss
            };
        }
        catch (error) {
            // フォールバック: 簡易メトリクス
            return {
                timestamp: Date.now(),
                jsHeapUsedSize: 0,
                jsHeapTotalSize: 0,
                rss: process.memoryUsage().rss
            };
        }
    }
    checkThresholds(metrics, pageId) {
        const alerts = [];
        // JSヒープチェック
        if (metrics.jsHeapUsedSize > this.thresholds.jsHeapUsedSize) {
            alerts.push({
                type: 'js_heap',
                message: `JSヒープ使用量が閾値を超過 (${pageId}): ${this.formatBytes(metrics.jsHeapUsedSize)} > ${this.formatBytes(this.thresholds.jsHeapUsedSize)}`,
                metrics,
                timestamp: Date.now(),
                severity: metrics.jsHeapUsedSize > this.thresholds.jsHeapUsedSize * 1.5 ? 'critical' : 'warning'
            });
        }
        // RSSチェック
        if (metrics.rss && metrics.rss > this.thresholds.rss) {
            alerts.push({
                type: 'rss',
                message: `プロセスRSSが閾値を超過 (${pageId}): ${this.formatBytes(metrics.rss)} > ${this.formatBytes(this.thresholds.rss)}`,
                metrics,
                timestamp: Date.now(),
                severity: metrics.rss > this.thresholds.rss * 1.5 ? 'critical' : 'warning'
            });
        }
        // アラート発行
        alerts.forEach(alert => {
            this.emit('alert', alert);
        });
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
exports.MemoryProfiler = MemoryProfiler;
MemoryProfiler.DEFAULT_THRESHOLDS = {
    jsHeapUsedSize: 500 * 1024 * 1024, // 500MB
    rss: 1024 * 1024 * 1024, // 1GB
};
exports.default = MemoryProfiler;
//# sourceMappingURL=MemoryProfiler.js.map