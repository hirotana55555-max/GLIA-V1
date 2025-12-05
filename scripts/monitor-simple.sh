#!/bin/bash
echo "🖥️  GLIA簡易システムモニター"
echo "監視間隔: 3秒 | 終了: Ctrl+C"
echo "----------------------------------------"

while true; do
  echo "=== $(date '+%H:%M:%S') ==="
  
  # 1. ディスク使用量
  echo "📁 ビルド成果物:"
  for dir in packages/*/dist apps/*/dist; do
    if [ -d "$dir" ]; then
      size=$(du -sh "$dir" 2>/dev/null | cut -f1)
      echo "  $dir: $size"
    fi
  done
  
  # 2. プロセス数
  echo "🖥️  プロセス:"
  echo "  Nodeプロセス: $(ps aux | grep -i node | grep -v grep | grep -v "monitor-simple" | wc -l)"
  echo "  Chromiumプロセス: $(ps aux | grep -i chrome | grep -v grep | wc -l)"
  
  # 3. メモリ使用量
  echo "💾 メモリ:"
  free -h | awk 'NR==2{printf "  使用中: %s / %s (%.1f%%)\n", $3, $2, $3/$2*100}'
  
  echo "----------------------------------------"
  sleep 3
done
