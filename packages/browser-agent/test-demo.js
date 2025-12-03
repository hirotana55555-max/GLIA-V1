// 注意: このデモを実行すると、実際のブラウザが開きます。
// まずは小さなウィンドウで動作確認することをお勧めします。

const { demo } = require('./dist/index.js');

console.log('ブラウザ自動化エージェント デモを開始します...');
console.log('※ このデモは example.com を開きます。中断するにはCtrl+Cを押してください。\n');

demo().catch(console.error);
