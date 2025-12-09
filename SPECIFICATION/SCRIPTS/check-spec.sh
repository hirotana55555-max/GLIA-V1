#!/usr/bin/env bash
set -e

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
SPEC_DIR="$ROOT/SPECIFICATION"

echo "📊 GLIA SPECIFICATION Quick Report"
echo "Generated: $(date)"
echo ""

# ----------------------------
# 出力ファイル一覧
# ----------------------------
echo "=== Output Files ==="
for file in "GLIA_PROJECT_TREE.md" "GIT_STATUS.md" "PACKAGE_LIST.md"; do
    if [ -f "$SPEC_DIR/$file" ]; then
        ls -lh "$SPEC_DIR/$file"
    else
        echo "⚠ $file not found!"
    fi
done

# SPEC_SYNC.md の行数も報告（内容は変更しない）
SPEC_SYNC="$SPEC_DIR/DOCS/SPEC_SYNC.md"
if [ -f "$SPEC_SYNC" ]; then
    LINES=$(wc -l < "$SPEC_SYNC")
    echo ""
    echo "=== SPEC_SYNC.md ==="
    echo "Lines: $LINES"
else
    echo ""
    echo "⚠ SPEC_SYNC.md not found!"
fi

# ----------------------------
# 各ファイル冒頭10行確認
# ----------------------------
echo ""
echo "=== File Head Preview ==="
for file in "GLIA_PROJECT_TREE.md" "GIT_STATUS.md" "PACKAGE_LIST.md"; do
    if [ -f "$SPEC_DIR/$file" ]; then
        echo ""
        echo ">>> $file (head 10 lines) <<<"
        head -10 "$SPEC_DIR/$file"
    fi
done

# ----------------------------
# 簡易完了メッセージ
# ----------------------------
echo ""
echo "✅ Quick report complete."
