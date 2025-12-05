const { BrowserManager } = require('./dist/index');

async function testBasic() {
  console.log('🧪 BrowserManager v2 基本動作テスト開始');

  const manager = BrowserManager.getInstance();
  
  console.log('1. クリーンなコンテキスト取得...');
  const context = await manager.acquireContext({ requireCleanContext: true });
  console.log('   ✅ コンテキスト取得成功');

  console.log('2. ページを開いて動作確認...');
  const page = await context.newPage();
  await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });
  const title = await page.title();
  console.log(`   ✅ ページ開設: "${title}"`);
  await page.close();

  console.log('3. コンテキストリリース...');
  manager.releaseContext(context);

  console.log('4. リソース統計取得...');
  const stats = manager.getResourcePoolStats();
  console.log('   統計:', JSON.stringify(stats, null, 2));

  console.log('5. クリーンアップ...');
  await manager.cleanupAll();
  console.log('   ✅ クリーンアップ完了');

  console.log('🎉 基本動作テスト完了');
  process.exit(0);
}

testBasic().catch(err => {
  console.error('❌ テスト失敗:', err);
  process.exit(1);
});
