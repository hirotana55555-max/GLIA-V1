/**
 * packages/browser-manager/src/BrowserManagerWithMemory.ts
 *
 * MemoryProfilerと統合したBrowserManager拡張版
 */

import { BrowserManager } from './BrowserManager';
import { MemoryProfiler, MemoryAlert } from './MemoryProfiler';
import { ResourcePoolStats } from './types';

export class BrowserManagerWithMemory extends BrowserManager {
  private memoryProfiler: MemoryProfiler;
  private memoryAlerts: MemoryAlert[] = [];

  static getInstanceWithMemory() {
    if (!(this as any)._instance) {
      (this as any)._instance = new BrowserManagerWithMemory();
    }
    return (this as any)._instance as BrowserManagerWithMemory;
  }

  constructor() {
    super();
    this.memoryProfiler = new MemoryProfiler();
    this.setupMemoryMonitoring();
  }

  private setupMemoryMonitoring(): void {
    // メモリアラートのリスナー
    this.memoryProfiler.on('alert', (alert: MemoryAlert) => {
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
  public getResourcePoolStats(): ResourcePoolStats & {
    memoryAlerts: number;
    recentMemoryStats: any;
  } {
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
  public stopMemoryMonitoring(): void {
    this.memoryProfiler.stopAll();
  }

  /**
   * メモリアラート履歴を取得
   */
  public getMemoryAlerts(): MemoryAlert[] {
    return [...this.memoryAlerts];
  }

  /**
   * クリーンアップ時にメモリ監視も停止
   */
  public async cleanupAll(options?: any): Promise<void> {
    this.stopMemoryMonitoring();
    await super.cleanupAll(options);
  }
}
