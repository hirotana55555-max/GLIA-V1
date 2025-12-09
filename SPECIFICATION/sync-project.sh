#!/bin/bash
set -e

ROOT="/home/els/Antigravity/GLIA-V1"
SPEC="$ROOT/SPECIFICATION"

echo "�� GLIA Project Sync Started..."

# 1. ディレクトリツリー生成
echo "📁 Exporting directory tree..."
ls -R "$ROOT" > "$SPEC/GLIA_PROJECT_TREE.md"

# 2. git 変更状況
echo "📄 Exporting git status..."
git -C "$ROOT" status > "$SPEC/GIT_STATUS.txt"

# 3. Git diff --name-status
git -C "$ROOT" diff --name-status > "$SPEC/GIT_DIFF.txt"

# 4. package.json list
echo "📦 Exporting workspace package list..."
jq '.workspaces' "$ROOT/package.json" > "$SPEC/NPM_WORKSPACES.json" 2> /dev/null || echo "{}" > "$SPEC/NPM_WORKSPACES.json"

# 5. SPEC_SYNC.md 生成
echo "📝 Building SPEC_SYNC.md..."

cat << 'EOH' > "$SPEC/SPEC_SYNC.md"
# GLIA PROJECT SYNC PACKET
LLM はこの 1 ファイルだけ読めば、プロジェクト全体を最新状態で理解できます。

---

## 📌 1. ディレクトリツリー
以下の内容は ls -R の自動抽出です：

\`\`\`
EOH

# 挿入：ディレクトリツリー
cat "$SPEC/GLIA_PROJECT_TREE.md" >> "$SPEC/SPEC_SYNC.md"

cat << 'EOH' >> "$SPEC/SPEC_SYNC.md"
\`\`\`

---

## 📌 2. Git 状況

### 🔹 git status
\`\`\`
EOH

cat "$SPEC/GIT_STATUS.txt" >> "$SPEC/SPEC_SYNC.md"

cat << 'EOH' >> "$SPEC/SPEC_SYNC.md"
\`\`\`

### 🔹 git diff --name-status
\`\`\`
EOH

cat "$SPEC/GIT_DIFF.txt" >> "$SPEC/SPEC_SYNC.md"

cat << 'EOH' >> "$SPEC/SPEC_SYNC.md"
\`\`\`

---

## 📌 3. NPM Workspaces（package.json より抽出）
\`\`\`
EOH

cat "$SPEC/NPM_WORKSPACES.json" >> "$SPEC/SPEC_SYNC.md"

cat << 'EOH' >> "$SPEC/SPEC_SYNC.md"
\`\`\`

---

## 📌 4. 説明
- GLIA 全体構造
- BrowserManager
- SIE Executor
- Swarm (TOON Mission)
- Antigravity harness

は LLM から必要に応じて生成できます。

---

## 📌 5. あなたが LLM に送るべき内容

**LLM に送るべきファイルは以下の1つだけです：**

➡ **SPECIFICATION/SPEC_SYNC.md**

他は LLM が要求したときだけ追加で渡せば良い。

EOH

echo "✨ Sync Complete. SPEC_SYNC.md updated."
