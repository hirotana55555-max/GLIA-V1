/**
 * test-qwen-chat-persistent.js
 *
 * Qwen Chat (https://chat.qwen.ai/) 永続セッションデバッグ用スクリプト
 * 手動ログイン用
 */

const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
const readline = require('readline');

// 対話型コンソール
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testQwenChatPersistent() {
  console.log('🚀 Qwen Chat 永続セッションデバッグ (手動ログイン用)');
  console.log('========================================\n');
  
  const sessionDir = path.join(os.homedir(), '.glia-qwen-chat-session');
  console.log(`📁 セッションディレクトリ: ${sessionDir}`);
  
  if (!require('fs').existsSync(sessionDir)) {
    require('fs').mkdirSync(sessionDir, { recursive: true });
    console.log('✅ 新しいセッションを作成');
  } else {
    console.log('✅ 既存セッションを読み込み');
  }
  
  console.log('\n🔧 設定:');
  console.log('   ブラウザ: Chromium (永続コンテキスト)');
  console.log('   セッション保存: 有効');
  console.log('   自動終了: 無効 (手動で閉じてください)\n');
  
  let browser = null;
  let page = null;

  try {
    console.log('1. Playwright で Chromium を永続コンテキスト付きで起動しています...');
    browser = await chromium.launchPersistentContext(sessionDir, {
      headless: false,  // 常に表示
      slowMo: 100,      // 操作を見やすく
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled', // 検知回避の第一歩
      ],
    });
    console.log('✅ ブラウザ起動成功\n');

    console.log('2. 新しいページを作成し、Qwen Chat にアクセスします...');
    console.log('   URL: https://chat.qwen.ai/');
    console.log('   注意: injectPrompt は使用せず、タブを閉じません。');
    console.log('   手動でログイン操作を行ってください。\n');
    
    // 新しいページを作成
    page = await browser.newPage();
    console.log('   ✅ ページ作成成功\n');

    console.log('   🌐 https://chat.qwen.ai/ へ移動中...');
    // waitUntil: 'load' でアクセス
    await page.goto('https://chat.qwen.ai/', {
      waitUntil: 'load', // v2 で成功した方法
      timeout: 120000 // 120秒
    });
    console.log('   ✅ ページに移動しました。ブラウザでログイン操作を行ってください。\n');

    console.log('📋 操作ガイド:');
    console.log('   1. ブラウザ上で Qwen Chat (chat.qwen.ai) にログインしてください。');
    console.log('   2. ログイン後、チャット画面が表示されていることを確認してください。');
    console.log('   3. 準備ができたら、このコンソールで "c" を入力してブラウザを閉じます。\n');

    // ユーザー入力を待つループ
    let running = true;
    while (running) {
      const command = await new Promise(resolve => rl.question('ログイン完了後、"c" を入力してブラウザを閉じてください: ', resolve));
      
      if (command.toLowerCase().trim() === 'c') {
        console.log('\n🔒 ブラウザを閉じます...');
        // launchPersistentContext の場合は、browser.close() でコンテキストとセッションを終了
        await browser.close();
        running = false;
        console.log('✅ スクリプト終了。');
        console.log('✅ 次回起動時、セッションディレクトリからログイン状態が復元されます。');
      } else {
        console.log('❓ "c" を入力してブラウザを閉じてください。');
      }
    }

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    if (error.stack) {
      console.error('   スタック:', error.stack.split('\n').slice(0, 3).join('\n'));
    }
    
    try {
      if (page) {
        await page.close(); // エラー時にも page を閉じる (launchPersistentContext では不要かも)
      }
      if (browser) {
        await browser.close(); // エラー時にも browser (context) を閉じる
      }
    } catch (closeError) {
      // 無視
    }
  } finally {
    rl.close();
    console.log('\n🎯 テスト終了');
    console.log(`📁 セッション: ${sessionDir}`);
  }
}

testQwenChatPersistent();
