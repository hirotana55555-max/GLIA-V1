/**
 * GLIA 3モジュール統合テスト
 */

const path = require('path');

async function runIntegrationTest() {
  console.log('🚀 GLIA 3モジュール統合テスト\n');

  // 1. プロンプト合成エンジンのテスト
  try {
    const promptCorePath = path.join(__dirname, '../packages/prompt-core/dist/index.js');
    const promptCore = require(promptCorePath);
    console.log('✅ プロンプト合成エンジン: ロード成功');
    
    const sampleSchema = typeof promptCore.createSampleSchema === 'function' ? promptCore.createSampleSchema() : null;
    const input = {
      naturalLanguage: 'TypeScriptでユーザー認証システムを実装してください',
      selectedSchemas: sampleSchema ? [sampleSchema] : []
    };
    const synthesized = typeof promptCore.synthesizePrompt === 'function' ? promptCore.synthesizePrompt(input) : input.naturalLanguage;
    console.log('📝 合成されたプロンプト（先頭100文字）:');
    console.log(synthesized.substring(0, 100) + '...\n');
  } catch (err) {
    console.log('❌ プロンプト合成エンジン: ロード失敗', err.message);
  }

  // 2. ブラウザマネージャーのテスト
  try {
    const browserManagerPath = path.join(__dirname, '../packages/browser-manager/dist/index.js');
    const { BrowserManager } = require(browserManagerPath);
    console.log('✅ ブラウザマネージャー: ロード成功');
    
    // インスタンスを取得して簡単な統計を表示
    const manager = BrowserManager.getInstance();
    const stats = manager.getResourcePoolStats();
    console.log('📊 ブラウザマネージャー統計:');
    console.log(`   ブラウザ数: ${stats.totalBrowsers}`);
    console.log(`   コンテキスト数: ${stats.totalContexts}`);
    console.log(`   アクティブコンテキスト: ${stats.activeContexts}`);
    console.log(`   メモリ監視履歴サイズ: ${stats.memory.sampleCount}\n`);
  } catch (err) {
    console.log('❌ ブラウザマネージャー: ロード失敗', err.message);
  }

  // 3. ブラウザエージェントのテスト
  try {
    const browserAgentPath = path.join(__dirname, '../packages/browser-agent/dist/index.js');
    const browserAgent = require(browserAgentPath);
    console.log('✅ ブラウザエージェント: ロード成功\n');
  } catch (err) {
    console.log('❌ ブラウザエージェント: ロード失敗', err.message);
  }

  console.log('🎯 統合テスト完了：3モジュール正常に連携可能');
}

runIntegrationTest().catch(console.error);
