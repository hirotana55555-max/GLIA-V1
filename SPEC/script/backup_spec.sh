#!/bin/bash
# backup_spec.sh — 仕様書バックアップとLLM用ファイル更新
set -e

echo "💾 仕様書バックアップを開始..."

# 基本パス
SPEC_DIR="$HOME/Antigravity/GLIA-V1/SPEC"
SRC="$SPEC_DIR/SPEC_DOC"
BACKUP_DIR="$SPEC_DIR/backups"
FOR_LLM_DIR="$SPEC_DIR/ForLLM"
SCRIPT_DIR="$SPEC_DIR/script"

# バックアップ用日時
TS=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/SPEC_DOC_$TS"

echo "[1] バックアップ作成: $BACKUP_PATH"
mkdir -p "$BACKUP_DIR"
cp -r "$SRC" "$BACKUP_PATH"

echo "[2] バックアップ情報を作成..."
{
    echo "# 仕様書バックアップ情報"
    echo "バックアップ日時: $(date)"
    echo "バックアップID: SPEC_DOC_$TS"
    echo ""
    echo "## 仕様書構成"
    echo "バックアップされたファイル:"
    for f in "$SRC"/*.md; do
        echo "- $(basename "$f")"
    done
    echo ""
    echo "## 復元方法"
    echo "このバックアップから復元するには:"
    echo "cp -r \"$BACKUP_PATH/*\" \"$SRC/\""
    echo ""
    echo "## 注意"
    echo "このファイルはバックアップフォルダ内にのみ存在し、LLMには提供されません。"
} > "$BACKUP_PATH/BACKUP_INFO.md"

echo "[3] 仕様書パッケージを生成..."
cd "$SCRIPT_DIR"
bash make_spec_package.sh

echo "[4] プロジェクト同期ファイルを生成..."
cd "$SCRIPT_DIR"
bash sync-project.sh

echo "✅ 完了！"
echo "📁 バックアップ: $BACKUP_PATH"
echo "📄 バックアップ情報: $BACKUP_PATH/BACKUP_INFO.md"
echo "📁 LLM用ファイル: $FOR_LLM_DIR/SPEC_PACKAGE.txt, $FOR_LLM_DIR/SPEC_SYNC.md"