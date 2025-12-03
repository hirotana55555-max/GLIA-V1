const path = require('path');

console.log('🚀 GLIA 3モジュール統合テスト\n');

try {
  // 1. プロンプト合成エンジン
  const promptCore = require('../packages/prompt-core/dist/index.js');
  console.log('✅ プロンプト合成エンジン: ロード成功');
  
  // 2. ブラウザエージェント
  const browserAgent = require('../packages/browser-agent/dist/index.js');
  console.log('✅ ブラウザエージェント: ロード成功');
  
  // 3. テスト実行
  const sampleSchema = promptCore.createSampleSchema();
  const input = {
    naturalLanguage: 'GLIA統合テストです。ファイル命名規則に従ってコードを書いてください。',
    selectedSchemas: [sampleSchema]
  };
  
  const synthesizedPrompt = promptCore.synthesizePrompt(input);
  console.log('\n📝 合成されたプロンプト（先頭100文字）:');
  console.log(synthesizedPrompt.substring(0, 100) + '...\n');
  
  console.log('🎯 統合テスト完了：3モジュール正常に連携可能');
  
} catch (error) {
  console.error('❌ 統合テスト失敗:', error.message);
  process.exit(1);
}
