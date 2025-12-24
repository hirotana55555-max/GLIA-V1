"use strict";
/**
 * packages/browser-manager/src/BrowserManagerWithMemory.ts
 *
 * MemoryProfilerと統合したBrowserManager拡張版
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserManagerWithMemory = void 0;
const BrowserManager_1 = require("./BrowserManager");
const MemoryProfiler_1 = require("./MemoryProfiler");
class BrowserManagerWithMemory extends BrowserManager_1.BrowserManager {
    static getInstanceWithMemory() {
        if (!this._instance) {
            this._instance = new BrowserManagerWithMemory();
        }
        return this._instance;
    }
    constructor() {
        super();
        this.memoryAlerts = [];
        this.memoryProfiler = new MemoryProfiler_1.MemoryProfiler();
        this.setupMemoryMonitoring();
    }
    setupMemoryMonitoring() {
        // メモリアラートのリスナー
        this.memoryProfiler.on('alert', (alert) => {
            console.log(`[MemoryAlert] ${alert.severity.toUpperCase()}: ${alert.message}`);
            this.memoryAlerts.push(alert);
            // クリティカルなアラートの場合は自動クリーンアップを検討
            if (alert.severity === 'critical') {
                console.log('[MemoryAlert] クリティカルアラート: 自動クリーンアップを検討します');
                // ここで自動クリーンアップロジックを追加可能
            }
        });
        // プロセスメモリ監視を開始
        this.memoryProfiler.startProcessMonitoring();
    }
    /**
     * 拡張版のリソース統計を取得
     */
    getResourcePoolStats() {
        const baseStats = super.getResourcePoolStats();
        const memoryStats = this.memoryProfiler.getStatistics();
        return {
            ...baseStats,
            memory: {
                sampleCount: memoryStats.historySize,
                minMB: 0, // 計算が必要
                maxMB: 0, // 計算が必要
                avgMB: Math.round(memoryStats.averageRSS / (1024 * 1024))
            },
            memoryAlerts: this.memoryAlerts.length,
            recentMemoryStats: {
                averageJSHeapMB: Math.round(memoryStats.averageJSHeap / (1024 * 1024)),
                averageRSSMB: Math.round(memoryStats.averageRSS / (1024 * 1024)),
                pagesMonitored: memoryStats.totalPagesMonitored
            }
        };
    }
    /**
     * メモリ監視を停止
     */
    stopMemoryMonitoring() {
        this.memoryProfiler.stopAll();
    }
    /**
     * メモリアラート履歴を取得
     */
    getMemoryAlerts() {
        return [...this.memoryAlerts];
    }
    /**
     * クリーンアップ時にメモリ監視も停止
     */
    async cleanupAll(options) {
        this.stopMemoryMonitoring();
        await super.cleanupAll(options);
    }
}
exports.BrowserManagerWithMemory = BrowserManagerWithMemory;
//# sourceMappingURL=BrowserManagerWithMemory.js.map