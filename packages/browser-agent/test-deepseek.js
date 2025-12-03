// DeepSeekテスト（ログインが必要）
const { deepseekDemo } = require('./dist/index.js');
console.log('DeepSeekデモを開始します...\n');
console.log('注意: このデモは実際のDeepSeekにアクセスします');
console.log('事前にブラウザでログインしている必要があります\n');
deepseekDemo().catch(console.error);
