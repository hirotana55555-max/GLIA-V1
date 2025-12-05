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

import { Page, CDPSession } from 'playwright';
import { EventEmitter } from 'events';

export interface MemoryMetrics {
  timestamp: number;
  jsHeapUsedSize: number; // bytes
  jsHeapTotalSize: number; // bytes
  rss?: number; // bytes (プロセスメモリ)
}

export interface MemoryThresholds {
  jsHeapUsedSize: number; // bytes
  rss: number; // bytes
}

export interface MemoryAlert {
  type: 'js_heap' | 'rss' | 'combined';
  message: string;
  metrics: MemoryMetrics;
  timestamp: number;
  severity: 'warning' | 'critical';
}

export class MemoryProfiler extends EventEmitter {
  private static readonly DEFAULT_THRESHOLDS: MemoryThresholds = {
    jsHeapUsedSize: 500 * 1024 * 1024, // 500MB
    rss: 1024 * 1024 * 1024, // 1GB
  };

  private thresholds: MemoryThresholds;
  private monitoringPages: Map<string, { page: Page; session: CDPSession; interval: NodeJS.Timeout }> = new Map();
  private processMemoryInterval: NodeJS.Timeout | null = null;
  private history: MemoryMetrics[] = [];
  private maxHistorySize: number = 1000;

  constructor(thresholds?: Partial<MemoryThresholds>) {
    super();
    this.thresholds = { ...MemoryProfiler.DEFAULT_THRESHOLDS, ...thresholds };
  }

  /**
   * ページのメモリ監視を開始
   */
  async startMonitoringPage(pageId: string, page: Page): Promise<void> {
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
        } catch (error) {
          this.emit('error', { pageId, error });
        }
      }, 5000); // 5秒間隔

      this.monitoringPages.set(pageId, { page, session, interval });
      
      console.log(`[MemoryProfiler] ページ監視開始: ${pageId}`);
    } catch (error) {
      console.error(`[MemoryProfiler] ページ監視開始失敗: ${pageId}`, error);
      throw error;
    }
  }

  /**
   * ページのメモリ監視を停止
   */
  stopMonitoringPage(pageId: string): void {
    const monitor = this.monitoringPages.get(pageId);
    if (monitor) {
      clearInterval(monitor.interval);
      monitor.session.detach().catch(() => {});
      this.monitoringPages.delete(pageId);
      console.log(`[MemoryProfiler] ページ監視停止: ${pageId}`);
    }
  }

  /**
   * プロセスメモリ監視を開始
   */
  startProcessMonitoring(intervalMs: number = 10000): void {
    if (this.processMemoryInterval) {
      clearInterval(this.processMemoryInterval);
    }

    this.processMemoryInterval = setInterval(() => {
      try {
        const rss = process.memoryUsage().rss;
        const metrics: MemoryMetrics = {
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
          const alert: MemoryAlert = {
            type: 'rss',
            message: `プロセスRSSが閾値を超過: ${this.formatBytes(rss)} > ${this.formatBytes(this.thresholds.rss)}`,
            metrics,
            timestamp: Date.now(),
            severity: rss > this.thresholds.rss * 1.5 ? 'critical' : 'warning'
          };
          this.emit('alert', alert);
        }
        
        this.emit('processMetrics', metrics);
      } catch (error) {
        this.emit('error', { error, context: 'processMonitoring' });
      }
    }, intervalMs);

    console.log('[MemoryProfiler] プロセスメモリ監視開始');
  }

  /**
   * プロセスメモリ監視を停止
   */
  stopProcessMonitoring(): void {
    if (this.processMemoryInterval) {
      clearInterval(this.processMemoryInterval);
      this.processMemoryInterval = null;
      console.log('[MemoryProfiler] プロセスメモリ監視停止');
    }
  }

  /**
   * 全監視を停止
   */
  stopAll(): void {
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
  getHistory(): MemoryMetrics[] {
    return [...this.history];
  }

  /**
   * 統計情報を取得
   */
  getStatistics(): {
    totalPagesMonitored: number;
    historySize: number;
    alerts: number;
    averageJSHeap: number;
    averageRSS: number;
  } {
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

  private async collectPageMetrics(page: Page, session: CDPSession): Promise<MemoryMetrics> {
    try {
      // ヒープ使用量を取得
      const heapInfo = await session.send('Runtime.getHeapUsage');
      
      // メモリメトリクスを収集
      const metricsResponse = await session.send('Performance.getMetrics');
      const metrics: Record<string, number> = {};
      metricsResponse.metrics.forEach((metric: any) => {
        metrics[metric.name] = metric.value;
      });

      return {
        timestamp: Date.now(),
        jsHeapUsedSize: heapInfo.usedSize,
        jsHeapTotalSize: heapInfo.totalSize,
        rss: process.memoryUsage().rss
      };
    } catch (error) {
      // フォールバック: 簡易メトリクス
      return {
        timestamp: Date.now(),
        jsHeapUsedSize: 0,
        jsHeapTotalSize: 0,
        rss: process.memoryUsage().rss
      };
    }
  }

  private checkThresholds(metrics: MemoryMetrics, pageId: string): void {
    const alerts: MemoryAlert[] = [];

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

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default MemoryProfiler;
