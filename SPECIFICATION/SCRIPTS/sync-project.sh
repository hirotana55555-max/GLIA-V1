#!/usr/bin/env bash
set -e

echo "🔧 GLIA Project Sync Started..."

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
SPEC_DIR="$ROOT/SPECIFICATION"
DOCS_DIR="$SPEC_DIR/DOCS"
mkdir -p "$DOCS_DIR"

# 出力ファイル
OUT_SYNC="$DOCS_DIR/SPEC_SYNC.md"
OUT_TREE="$SPEC_DIR/GLIA_PROJECT_TREE.md"
OUT_GIT="$SPEC_DIR/GIT_STATUS.md"
OUT_PKG="$SPEC_DIR/PACKAGE_LIST.md"

# Git情報
GIT_STATUS=$(git -C "$ROOT" status --untracked-files=all 2>/dev/null || echo "Git status not available")
GIT_DIFF=$(git -C "$ROOT" diff --name-status 2>/dev/null || echo "Git diff not available")

# package.json
if [ -f "$ROOT/package.json" ]; then
    PACKAGE_INFO=$(cat "$ROOT/package.json")
else
    PACKAGE_INFO="package.json not found"
fi

# ==========================================
# SPEC_SYNC.md 生成
# ==========================================
echo "📄 Generating SPEC_SYNC.md..."

{
echo "# GLIA PROJECT SYNC PACKET"
echo "LLM はこの 1 ファイルだけ読めば、プロジェクト全体を最新状態で理解できます。"
echo
echo "## 📌 1. ディレクトリツリー（主要ファイル）"
echo '```'
# Configuration Files
echo "### Configuration Files"
find "$ROOT" -maxdepth 3 -type f \( \
    -name "package.json" \
    -o -name "tsconfig.json" \
    -o -name "*.config.js" \
    -o -name "*.config.ts" \
    -o -name "*.config.json" \
\) ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/TEMP/*" 2>/dev/null | sed "s|$ROOT/||" | sort
echo
# Source Directories
for dir in packages apps; do
    if [ -d "$ROOT/$dir" ]; then
        echo "### ${dir}/"
        find "$ROOT/$dir" -maxdepth 2 -type f \( -name "*.ts" -o -name "*.js" \) \
            ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/TEMP/*" 2>/dev/null \
            | sed "s|$ROOT/||" | head -15
        echo
    fi
done
# SPECIFICATION files
echo "### Specification Files"
find "$SPEC_DIR" -type f \( -name "*.md" -o -name "*.txt" -o -name "*.sh" \) \
    ! -path "*/Backup/*" ! -path "*/TEMP/*" 2>/dev/null | sed "s|$ROOT/||" | sort
echo
# Directory Tree (簡易版)
echo "### Directory Tree"
find "$ROOT" -type d \( -name "node_modules" -o -name ".git" -o -name "dist" -o -name "TEMP" -o -name "logs" \) -prune -o -type d -print 2>/dev/null \
    | sed "s|$ROOT||" | grep -v "^/\?$" | sort | head -30
echo '```'
echo
echo "## 📌 2. Git 状況"
echo '```'
echo "$GIT_STATUS"
echo '```'
echo
echo "## 📌 3. Git 差分（変更ファイル）"
echo '```'
echo "$GIT_DIFF"
echo '```'
echo
echo "## 📌 4. パッケージ情報（ルート package.json）"
echo '```json'
echo "$PACKAGE_INFO"
echo '```'
echo
echo "## 📌 5. メタ情報"
echo "- 生成日時: $(date)"
echo "- プロジェクトルート: $ROOT"
echo "- このファイルだけを読めば LLM が全体を理解可能"
echo
echo "## 📌 6. 推奨運用フロー（LLM投入時）"
echo "必須：最初に読ませる -> SPECIFICATION/DOCS/SPEC_SYNC.md"
echo "補助資料は必要に応じて読ませる（設計・ロードマップ・進捗ファイルなど）"
echo "TEMP / shared は原則無視"
} > "$OUT_SYNC"

# ==========================================
# 従来互換ファイル生成
# ==========================================
echo "📄 Generating legacy files..."

# GLIA_PROJECT_TREE.md
{
echo "# GLIA Project Tree"
echo "Generated: $(date)"
echo "Root: $(basename "$ROOT")"
echo ""
echo "## Project Structure"
echo ""
find "$ROOT" -type f \( -name "*.json" -o -name "*.ts" -o -name "*.js" -o -name "*.md" \) \
    ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/TEMP/*" 2>/dev/null | sed "s|$ROOT/||" | head -50
} > "$OUT_TREE"

# GIT_STATUS.md
{
echo "# Git Status"
echo "Generated: $(date)"
echo '```'
echo "$GIT_STATUS"
echo '```'
} > "$OUT_GIT"

# PACKAGE_LIST.md
{
echo "# Package Information"
echo "Generated: $(date)"
echo "## Root package.json"
echo '```json'
echo "$PACKAGE_INFO"
echo '```'
} > "$OUT_PKG"

echo "✨ Sync complete. Output files:"
echo "- $OUT_SYNC"
echo "- $OUT_TREE"
echo "- $OUT_GIT"
echo "- $OUT_PKG"
