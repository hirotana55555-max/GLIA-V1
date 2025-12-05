const { BrowserManager } = require('./dist/index');

async function testRecycling() {
  console.log('🧪 リサイクルポリシーテスト（短縮バージョン）');

  // 短い時間設定でテスト
  const manager = BrowserManager.getInstance({
    maxIdleTimeMs: 5000,        // 5秒
    maxRequestsPerContext: 3,   // 3リクエストまで
    maxContextLifetimeMs: 10000, // 10秒
    periodicCleanupIntervalMs: 2000, // 2秒ごとにチェック
    browserKeepAliveMs: 15000   // 15秒
  });

  console.log('1. 複数コンテキスト作成...');
  const contexts = [];
  for (let i = 0; i < 3; i++) {
    const ctx = await manager.acquireContext({ requireCleanContext: true });
    contexts.push(ctx);
    const page = await ctx.newPage();
    await page.goto('about:blank');
    await page.close();
    console.log(`   コンテキスト ${i+1} 作成`);
  }

  console.log('2. 初期統計:');
  console.log(JSON.stringify(manager.getResourcePoolStats(), null, 2));

  console.log('3. リリースしてアイドル状態に...');
  contexts.forEach(ctx => manager.releaseContext(ctx));

  console.log('4. 10秒待機（定期クリーンアップ実行）...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('5. 最終統計:');
  console.log(JSON.stringify(manager.getResourcePoolStats(), null, 2));

  console.log('6. 最終クリーンアップ...');
  await manager.cleanupAll();

  console.log('🎉 リサイクルポリシーテスト完了');
  process.exit(0);
}

testRecycling().catch(err => {
  console.error('❌ テスト失敗:', err);
  process.exit(1);
});
