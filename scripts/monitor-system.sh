#!/bin/bash
echo "🖥️  GLIAシステム監視スクリプト"
echo "監視間隔: 5秒 | 終了: Ctrl+C"
echo "----------------------------------------"

while true; do
  clear
  echo "=== GLIA システム監視 - $(date '+%Y-%m-%d %H:%M:%S') ==="
  echo ""
  
  # 1. BrowserManagerの状態
  echo "📊 BrowserManager 状態:"
  if [ -f "packages/browser-manager/dist/index.js" ]; then
    node -e "
      try {
        const { BrowserManager } = require('./packages/browser-manager/dist/index.js');
        const mgr = BrowserManager.getInstance();
        const stats = mgr.getResourcePoolStats();
        console.log('   ブラウザ数: ' + stats.totalBrowsers);
        console.log('   コンテキスト数: ' + stats.totalContexts);
        console.log('   アクティブコンテキスト: ' + stats.activeContexts);
        console.log('   アイドルコンテキスト: ' + stats.idleContexts);
        console.log('   総リクエスト数: ' + stats.totalRequests);
        console.log('   メモリ監視サンプル数: ' + stats.memory.sampleCount);
      } catch(e) {
        console.log('   BrowserManager未起動');
      }
    "
  else
    echo "   BrowserManagerビルドファイルなし"
  fi
  
  echo ""
  echo "💾 システムメモリ:"
  free -h | awk 'NR==2{printf "   使用中: %s / %s (%.1f%%)\\n", $3, $2, $3/$2*100}'
  
  echo ""
  echo "🖥️  プロセス監視:"
  # Chromiumプロセス
  CHROME_COUNT=$(ps aux | grep -i chrome | grep -v grep | grep -v "chromium" | wc -l)
  echo "   Chromiumプロセス数: $CHROME_COUNT"
  
  # Nodeプロセス
  NODE_COUNT=$(ps aux | grep -i "node" | grep -v grep | grep -v "monitor-system" | wc -l)
  echo "   Node.jsプロセス数: $NODE_COUNT"
  
  echo ""
  echo "📁 ディスク使用量:"
  du -sh packages/browser-manager/dist 2>/dev/null || echo "   ディレクトリなし"
  
  echo ""
  echo "----------------------------------------"
  echo "次回更新: 5秒後..."
  
  sleep 5
done
