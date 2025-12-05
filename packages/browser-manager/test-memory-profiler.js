const { MemoryProfiler } = require('./dist/index');

async function testMemoryProfiler() {
  console.log('🧪 MemoryProfiler 基本動作テスト');
  
  const profiler = new MemoryProfiler({
    jsHeapUsedSize: 100 * 1024 * 1024, // 100MB
    rss: 500 * 1024 * 1024 // 500MB
  });

  // イベントリスナーの設定
  profiler.on('alert', (alert) => {
    console.log(`🚨 アラート受信: ${alert.type} - ${alert.message}`);
  });

  profiler.on('metrics', (data) => {
    console.log(`📊 メトリクス更新: ${data.pageId} - JS Heap: ${Math.round(data.metrics.jsHeapUsedSize / 1024 / 1024)}MB`);
  });

  profiler.on('processMetrics', (metrics) => {
    console.log(`💾 プロセスメモリ: RSS: ${Math.round(metrics.rss / 1024 / 1024)}MB`);
  });

  // プロセス監視開始
  profiler.startProcessMonitoring(3000); // 3秒間隔

  console.log('⏳ 10秒間監視実行中...');
  
  await new Promise(resolve => setTimeout(resolve, 10000));

  // 統計情報の取得
  const stats = profiler.getStatistics();
  console.log('\n📈 最終統計:');
  console.log('- 監視ページ数:', stats.totalPagesMonitored);
  console.log('- 履歴サイズ:', stats.historySize);
  console.log('- 平均JSヒープ:', Math.round(stats.averageJSHeap / 1024 / 1024), 'MB');
  console.log('- 平均RSS:', Math.round(stats.averageRSS / 1024 / 1024), 'MB');

  // 停止
  profiler.stopAll();

  console.log('🎉 MemoryProfilerテスト完了');
  process.exit(0);
}

testMemoryProfiler().catch(err => {
  console.error('❌ テスト失敗:', err);
  process.exit(1);
});
