#!/bin/bash
# make_spec_package.sh — LLM用仕様書のみ生成
set -e

# スクリプトのディレクトリを基準にする
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE="$(dirname "$SCRIPT_DIR")"  # SPEC ディレクトリ
SRC="$BASE/SPEC_DOC"
OUT="$BASE/ForLLM"

echo "仕様書ソース: $SRC"
echo "出力先: $OUT"

echo "[1] 構造チェック..."
if [ ! -d "$SRC" ]; then
  echo "ERROR: $SRC が見つかりません"
  exit 1
fi

cd "$SRC"

REQUIRED=(
  "00_OVERVIEW.md"
  "01_PRINCIPLES_AND_CONSTRAINTS.md"
  "02_SYSTEM_ARCHITECTURE.md"
  "03_RUNTIME_COMPONENTS.md"
  "04_SPEC_MAINTENANCE_MODEL.md"
  "05_PHASES_AND_ROADMAP.md"
  "06_MODULE_SPECIFICATIONS.md"
  "07_SYSTEM_RELATIONS.md"
  "08_APPENDICES.md"
)

echo "[2] 必須章の検証..."
for f in "${REQUIRED[@]}"; do
  if [ ! -f "$f" ]; then
    echo "ERROR: 不足: $f"
    exit 1
  fi
done

echo "[3] 見出し形式の検証..."
for f in "${REQUIRED[@]}"; do
  if ! head -n 1 "$f" | grep -q "^# "; then
    echo "ERROR: $f は '# ' で始まっていません"
    exit 1
  fi
done

echo "[4] 出力ディレクトリの準備..."
mkdir -p "$OUT"
# SPEC_PACKAGE.txtのみ削除（他のファイルは保持）
rm -f "$OUT/SPEC_PACKAGE.txt"

echo "[5] LLM用仕様書の生成..."
{
  echo "===== GLIA SPEC PACKAGE ====="
  echo "生成日時: $(date)"
  echo "用途: LLMへの仕様提供専用"
  echo ""
  for f in "${REQUIRED[@]}"; do
    echo "----- BEGIN $f -----"
    cat "$f"
    echo "----- END $f -----"
    echo
  done
  echo "===== END OF SPEC ====="
} > "$OUT/SPEC_PACKAGE.txt"

echo "✅ 完了: LLM用仕様書が $OUT/SPEC_PACKAGE.txt に生成されました"
echo "📄 ファイルサイズ: $(wc -c < "$OUT/SPEC_PACKAGE.txt") バイト"