/**
 * packages/browser-manager/src/BrowserManagerWithMemory.ts
 *
 * MemoryProfilerと統合したBrowserManager拡張版
 */
import { BrowserManager } from './BrowserManager';
import { MemoryAlert } from './MemoryProfiler';
import { ResourcePoolStats } from './types';
export declare class BrowserManagerWithMemory extends BrowserManager {
    private memoryProfiler;
    private memoryAlerts;
    static getInstanceWithMemory(): BrowserManagerWithMemory;
    constructor();
    private setupMemoryMonitoring;
    /**
     * 拡張版のリソース統計を取得
     */
    getResourcePoolStats(): ResourcePoolStats & {
        memoryAlerts: number;
        recentMemoryStats: any;
    };
    /**
     * メモリ監視を停止
     */
    stopMemoryMonitoring(): void;
    /**
     * メモリアラート履歴を取得
     */
    getMemoryAlerts(): MemoryAlert[];
    /**
     * クリーンアップ時にメモリ監視も停止
     */
    cleanupAll(options?: any): Promise<void>;
}
//# sourceMappingURL=BrowserManagerWithMemory.d.ts.map