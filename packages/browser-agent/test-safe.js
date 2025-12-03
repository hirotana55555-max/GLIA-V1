// 安全なテスト（example.comを使用）
const { safeDemo } = require('./dist/index.js');
console.log('安全なデモを開始します...\n');
safeDemo().catch(console.error);
