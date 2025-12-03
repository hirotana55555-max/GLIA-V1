// ビルド後にこのスクリプトを実行して、モジュールが機能するか確認できます。
// 実行: node test-basic.js

const { synthesizePrompt, createSampleSchema } = require('./dist/index.js');

const sampleInput = {
  naturalLanguage: 'このプロジェクトの命名規則に従って、新しいユーザー管理ファイルを作成するコードを書いてください。',
  selectedSchemas: [createSampleSchema()]
};

const result = synthesizePrompt(sampleInput);
console.log('✅ プロンプト合成エンジン 動作テスト\n');
console.log(result);
