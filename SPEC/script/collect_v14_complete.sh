#!/bin/bash
# GLIA v1.4 完全情報収集スクリプト（ノイズ除去版）
# 使用法: プロジェクトルートで実行 ./SPEC/script/collect_v14_complete.sh

# プロジェクトルートに移動
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

echo "📂 作業ディレクトリ: $PROJECT_ROOT"

set -e
OUTPUT_DIR="$PROJECT_ROOT/SPEC/Reverse_spec/v1.4_data"
mkdir -p "$OUTPUT_DIR"

echo "🚀 GLIA v1.4 完全情報収集を開始（自作コードのみ）..."

# ============================================
# ヘルパー関数: クリーンなfind
# ============================================
find_clean_ts() {
  # 引数: 検索ディレクトリ
  # 戻り値: .d.ts, node_modules, dist, build を除外したファイルリスト
  find "$1" \
    \( -name "*.ts" ! -name "*.d.ts" \) \
    -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/dist/*" \
    ! -path "*/build/*" \
    2>/dev/null
}

find_clean_js() {
  find "$1" \
    -name "*.js" \
    -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/dist/*" \
    ! -path "*/build/*" \
    2>/dev/null
}

# ============================================
# Section 1: type_system
# ============================================
echo ""
echo "📊 [1/7] 型システムを収集中（自作コードのみ）..."

# 1-1: TOON型定義の完全版
if [ -f "packages/toon/src/index.ts" ]; then
  echo "=== TOON Type Definitions ===" > "$OUTPUT_DIR/type_system_complete.txt"
  cat packages/toon/src/index.ts >> "$OUTPUT_DIR/type_system_complete.txt"
  echo -e "\n\n" >> "$OUTPUT_DIR/type_system_complete.txt"
  echo "✓ TOON型定義を抽出"
else
  echo "⚠️ packages/toon/src/index.ts が見つかりません"
fi

# 1-2: SIE型定義（全ファイル、.d.ts除外）
if [ -d "packages/sie/src" ]; then
  echo "=== SIE Type Definitions ===" >> "$OUTPUT_DIR/type_system_complete.txt"
  find_clean_ts "packages/sie/src" | while read -r file; do
    echo "// File: $file" >> "$OUTPUT_DIR/type_system_complete.txt"
    cat "$file" >> "$OUTPUT_DIR/type_system_complete.txt"
    echo -e "\n" >> "$OUTPUT_DIR/type_system_complete.txt"
  done
  echo "✓ SIE型定義を抽出"
else
  echo "⚠️ packages/sie/src が見つかりません"
fi

# 1-3: Swarmオーケストレーターの型
if [ -f "packages/swarm/src/orchestrator.ts" ]; then
  echo "=== Swarm Orchestrator Types ===" >> "$OUTPUT_DIR/type_system_complete.txt"
  cat packages/swarm/src/orchestrator.ts >> "$OUTPUT_DIR/type_system_complete.txt"
  echo -e "\n\n" >> "$OUTPUT_DIR/type_system_complete.txt"
  echo "✓ Swarm型定義を抽出"
fi

# 1-4: BrowserManagerの型
if [ -f "packages/browser-manager/src/ResourceLifecycle.ts" ]; then
  echo "=== BrowserManager Types ===" >> "$OUTPUT_DIR/type_system_complete.txt"
  cat packages/browser-manager/src/ResourceLifecycle.ts >> "$OUTPUT_DIR/type_system_complete.txt"
  echo -e "\n\n" >> "$OUTPUT_DIR/type_system_complete.txt"
  echo "✓ BrowserManager型定義を抽出"
fi

# 1-5: API Clientの型
if [ -f "packages/api-client/src/index.ts" ]; then
  echo "=== API Client Types ===" >> "$OUTPUT_DIR/type_system_complete.txt"
  cat packages/api-client/src/index.ts >> "$OUTPUT_DIR/type_system_complete.txt"
  echo -e "\n\n" >> "$OUTPUT_DIR/type_system_complete.txt"
  echo "✓ API Client型定義を抽出"
fi

# 1-6: 全パッケージのindex.tsからエクスポート定義を抽出（.d.ts除外）
echo "=== All Exported Interfaces ===" >> "$OUTPUT_DIR/type_system_complete.txt"
find packages \
  -name "index.ts" ! -name "*.d.ts" \
  -type f \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  -exec grep -H "export" {} \; >> "$OUTPUT_DIR/type_system_complete.txt" 2>/dev/null || true

echo "✓ 型システム収集完了"

# ============================================
# Section 2: data_contracts
# ============================================
echo ""
echo "📦 [2/7] データ契約を収集中..."

echo "=== Test Data Samples ===" > "$OUTPUT_DIR/data_contracts_complete.txt"

# 2-1: integration-testからサンプル抽出
if [ -d "integration-test" ]; then
  echo "--- Integration Test Samples ---" >> "$OUTPUT_DIR/data_contracts_complete.txt"
  find_clean_js "integration-test" | while read -r file; do
    echo "// From: $file" >> "$OUTPUT_DIR/data_contracts_complete.txt"
    cat "$file" >> "$OUTPUT_DIR/data_contracts_complete.txt"
    echo -e "\n" >> "$OUTPUT_DIR/data_contracts_complete.txt"
  done
  echo "✓ 統合テストサンプルを抽出"
fi

# 2-2: package内のテストファイル（.d.ts除外）
find packages \
  \( -name "*.test.ts" ! -name "*.d.ts" -o -name "*.test.js" -o -name "test*.js" \) \
  -type f \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  2>/dev/null | while read -r file; do
  if [ -f "$file" ]; then
    echo "--- From: $file ---" >> "$OUTPUT_DIR/data_contracts_complete.txt"
    cat "$file" >> "$OUTPUT_DIR/data_contracts_complete.txt"
    echo -e "\n" >> "$OUTPUT_DIR/data_contracts_complete.txt"
  fi
done

# 2-3: SPEC内のJSONサンプル
if [ -d "SPEC" ]; then
  echo -e "\n=== JSON Samples from SPEC ===" >> "$OUTPUT_DIR/data_contracts_complete.txt"
  find SPEC -name "*.md" -type f 2>/dev/null | while read -r file; do
    echo "// From: $file" >> "$OUTPUT_DIR/data_contracts_complete.txt"
    sed -n '/```json/,/```/p' "$file" >> "$OUTPUT_DIR/data_contracts_complete.txt" 2>/dev/null || true
  done
  echo "✓ SPEC内のサンプルを抽出"
fi

# 2-4: Zodスキーマの抽出（.d.ts除外）
echo -e "\n=== Zod Validation Schemas ===" >> "$OUTPUT_DIR/data_contracts_complete.txt"
find_clean_ts "packages" | while read -r file; do
  if grep -q "zod\|z\.object" "$file" 2>/dev/null; then
    echo "// From: $file" >> "$OUTPUT_DIR/data_contracts_complete.txt"
    grep -A 30 "z\.object\|z\.string\|z\.number\|z\.array" "$file" >> "$OUTPUT_DIR/data_contracts_complete.txt" 2>/dev/null || true
    echo -e "\n" >> "$OUTPUT_DIR/data_contracts_complete.txt"
  fi
done

echo "✓ データ契約収集完了"

# ============================================
# Section 3: execution_semantics
# ============================================
echo ""
echo "🚨 [3/7] 実行セマンティクスを収集中..."

echo "=== Error Definitions ===" > "$OUTPUT_DIR/execution_semantics_complete.txt"

# 3-1: エラークラス定義（完全版）
find_clean_ts "packages" | while read -r file; do
  if grep -q "Error extends" "$file" 2>/dev/null; then
    echo "// From: $file" >> "$OUTPUT_DIR/execution_semantics_complete.txt"
    grep -B 5 -A 15 "class.*Error extends" "$file" >> "$OUTPUT_DIR/execution_semantics_complete.txt" 2>/dev/null || true
    echo -e "\n" >> "$OUTPUT_DIR/execution_semantics_complete.txt"
  fi
done

# 3-2: エラーのthrow箇所（詳細版）
echo -e "\n=== Error Throw Locations ===" >> "$OUTPUT_DIR/execution_semantics_complete.txt"
find_clean_ts "packages" | while read -r file; do
  grep -n "throw new" "$file" 2>/dev/null | while IFS=: read -r line_num content; do
    echo "$file:$line_num: $content" >> "$OUTPUT_DIR/execution_semantics_complete.txt"
  done
done

# 3-3: try-catchパターン（コンテキスト付き）
echo -e "\n=== Error Handling Patterns ===" >> "$OUTPUT_DIR/execution_semantics_complete.txt"
find_clean_ts "packages" | while read -r file; do
  grep -n "try {" "$file" 2>/dev/null | while IFS=: read -r line_num _; do
    echo "// $file:$line_num" >> "$OUTPUT_DIR/execution_semantics_complete.txt"
    sed -n "${line_num},$((line_num+20))p" "$file" >> "$OUTPUT_DIR/execution_semantics_complete.txt" 2>/dev/null || true
    echo -e "\n" >> "$OUTPUT_DIR/execution_semantics_complete.txt"
  done
done | head -1000 >> "$OUTPUT_DIR/execution_semantics_complete.txt"

# 3-4: async/await使用パターン
echo -e "\n=== Async Patterns ===" >> "$OUTPUT_DIR/execution_semantics_complete.txt"
find_clean_ts "packages" | head -50 | xargs grep -n "async " 2>/dev/null | head -200 >> "$OUTPUT_DIR/execution_semantics_complete.txt" || true

echo "✓ 実行セマンティクス収集完了"

# ============================================
# Section 4: design_rationale
# ============================================
echo ""
echo "🧠 [4/7] 設計根拠を収集中..."

echo "=== Design Decisions (from comments) ===" > "$OUTPUT_DIR/design_rationale_complete.txt"

# 4-1: 設計コメントの抽出
find_clean_ts "packages" | while read -r file; do
  grep -B 3 -A 3 "// Why:\|// Rationale:\|// NOTE:\|// IMPORTANT:\|/\*\*" "$file" 2>/dev/null | while read -r line; do
    if [ -n "$line" ]; then
      echo "$file: $line" >> "$OUTPUT_DIR/design_rationale_complete.txt"
    fi
  done
done

# 4-2: SPEC内の設計判断（完全版）
if [ -d "SPEC/SPEC_DOC" ]; then
  echo -e "\n=== Architectural Decisions (from SPEC) ===" >> "$OUTPUT_DIR/design_rationale_complete.txt"
  find SPEC/SPEC_DOC -name "*.md" -type f | while read -r file; do
    echo "// From: $file" >> "$OUTPUT_DIR/design_rationale_complete.txt"
    cat "$file" >> "$OUTPUT_DIR/design_rationale_complete.txt"
    echo -e "\n\n" >> "$OUTPUT_DIR/design_rationale_complete.txt"
  done
  echo "✓ SPEC設計文書を抽出"
fi

# 4-3: package.jsonの設定理由
echo -e "\n=== Package Configuration ===" >> "$OUTPUT_DIR/design_rationale_complete.txt"
if [ -f "package.json" ]; then
  cat package.json >> "$OUTPUT_DIR/design_rationale_complete.txt"
fi

# 4-4: 各パッケージのpackage.json
find packages -name "package.json" -type f ! -path "*/node_modules/*" | while read -r file; do
  echo -e "\n// From: $file" >> "$OUTPUT_DIR/design_rationale_complete.txt"
  cat "$file" >> "$OUTPUT_DIR/design_rationale_complete.txt"
done

echo "✓ 設計根拠収集完了"

# ============================================
# Section 5: evolution_roadmap （最重要：ノイズ除去）
# ============================================
echo ""
echo "🗺️ [5/7] 進化ロードマップを収集中（ライブラリTODO除外）..."

echo "=== TODOs and FIXMEs ===" > "$OUTPUT_DIR/evolution_roadmap_complete.txt"

# 5-1: TODO/FIXMEコメント（.d.ts、node_modules除外）
find packages apps \
  \( -name "*.ts" ! -name "*.d.ts" -o -name "*.js" \) \
  -type f \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*" \
  2>/dev/null | while read -r file; do
  grep -n "TODO:\|FIXME:\|HACK:\|XXX:\|BUG:" "$file" 2>/dev/null | while IFS=: read -r line_num content; do
    echo "$file:$line_num: $content" >> "$OUTPUT_DIR/evolution_roadmap_complete.txt"
  done
done

echo "✓ 自作コードのTODO/FIXMEを抽出"

# 5-2: 未実装機能（SPEC内）
if [ -d "SPEC/SPEC_DOC" ]; then
  echo -e "\n=== Unimplemented Features (from SPEC) ===" >> "$OUTPUT_DIR/evolution_roadmap_complete.txt"
  find SPEC/SPEC_DOC -name "*.md" -type f -exec grep -Hn "未実装\|TODO\|Phase\|ロードマップ" {} \; >> "$OUTPUT_DIR/evolution_roadmap_complete.txt" 2>/dev/null || true
fi

# 5-3: テスト内のskip/pending
echo -e "\n=== Skipped Tests ===" >> "$OUTPUT_DIR/evolution_roadmap_complete.txt"
find packages \
  \( -name "*.test.ts" ! -name "*.d.ts" -o -name "*.test.js" \) \
  -type f \
  ! -path "*/node_modules/*" \
  2>/dev/null | while read -r file; do
  grep -n "skip\|pending\|xit\|xdescribe" "$file" 2>/dev/null | while IFS=: read -r line_num content; do
    echo "$file:$line_num: $content" >> "$OUTPUT_DIR/evolution_roadmap_complete.txt"
  done
done

echo "✓ 進化ロードマップ収集完了"

# ============================================
# Section 6: internal_dependencies
# ============================================
echo ""
echo "🔗 [6/7] 内部依存関係を解析中..."

echo "=== Internal Package Dependencies ===" > "$OUTPUT_DIR/internal_dependencies_complete.txt"

# 6-1: パッケージ間のimport関係（詳細版）
for pkg_dir in packages/*; do
  if [ -d "$pkg_dir/src" ]; then
    pkg_name=$(basename "$pkg_dir")
    echo -e "\n--- Package: @glia/$pkg_name ---" >> "$OUTPUT_DIR/internal_dependencies_complete.txt"
    find_clean_ts "$pkg_dir/src" | while read -r file; do
      grep "from ['\"]@glia/" "$file" 2>/dev/null | while read -r import_line; do
        echo "$file: $import_line" >> "$OUTPUT_DIR/internal_dependencies_complete.txt"
      done
    done
  fi
done

# 6-2: importの統計
echo -e "\n=== Import Statistics ===" >> "$OUTPUT_DIR/internal_dependencies_complete.txt"
find_clean_ts "packages" | xargs grep -h "from ['\"]@glia/" 2>/dev/null | \
  sed 's/.*from ["'"'"']\(@glia\/[^"'"'"']*\).*/\1/' | \
  sort | uniq -c | sort -rn >> "$OUTPUT_DIR/internal_dependencies_complete.txt" || true

# 6-3: 依存グラフ（JSON形式）
echo -e "\n=== Dependency Graph (JSON) ===" >> "$OUTPUT_DIR/internal_dependencies_complete.txt"
echo "{" >> "$OUTPUT_DIR/internal_dependencies_complete.txt"
first=true
for pkg_dir in packages/*; do
  if [ -d "$pkg_dir" ]; then
    pkg_name=$(basename "$pkg_dir")
    if [ "$first" = false ]; then
      echo "," >> "$OUTPUT_DIR/internal_dependencies_complete.txt"
    fi
    first=false
    echo "  \"@glia/$pkg_name\": {" >> "$OUTPUT_DIR/internal_dependencies_complete.txt"
    
    if [ -f "$pkg_dir/package.json" ]; then
      echo "    \"dependencies\": [" >> "$OUTPUT_DIR/internal_dependencies_complete.txt"
      jq -r '.dependencies // {} | keys[]' "$pkg_dir/package.json" 2>/dev/null | \
        grep "@glia/" | sed 's/^/      "/' | sed 's/$/",/' >> "$OUTPUT_DIR/internal_dependencies_complete.txt" || true
      echo "    ]" >> "$OUTPUT_DIR/internal_dependencies_complete.txt"
    fi
    
    echo "  }" >> "$OUTPUT_DIR/internal_dependencies_complete.txt"
  fi
done
echo "}" >> "$OUTPUT_DIR/internal_dependencies_complete.txt"

echo "✓ 内部依存関係解析完了"

# ============================================
# Section 7: llm_guidance
# ============================================
echo ""
echo "🤖 [7/7] LLM向けガイダンスを収集中..."

echo "=== Project Overview ===" > "$OUTPUT_DIR/llm_guidance_complete.txt"

# 7-1: README全体
if [ -f "README.md" ]; then
  cat README.md >> "$OUTPUT_DIR/llm_guidance_complete.txt"
  echo -e "\n\n" >> "$OUTPUT_DIR/llm_guidance_complete.txt"
fi

# 7-2: SPEC全体の目次
if [ -d "SPEC/SPEC_DOC" ]; then
  echo "=== SPEC Documentation Index ===" >> "$OUTPUT_DIR/llm_guidance_complete.txt"
  find SPEC/SPEC_DOC -name "*.md" -type f | sort | while read -r file; do
    echo "## $file" >> "$OUTPUT_DIR/llm_guidance_complete.txt"
    head -20 "$file" >> "$OUTPUT_DIR/llm_guidance_complete.txt"
    echo -e "\n" >> "$OUTPUT_DIR/llm_guidance_complete.txt"
  done
fi

# 7-3: 変更頻度の分析（Gitログから）
echo -e "\n=== File Change Frequency (Last 3 months) ===" >> "$OUTPUT_DIR/llm_guidance_complete.txt"
if [ -d ".git" ]; then
  git log --name-only --oneline --since="3 months ago" 2>/dev/null | \
    grep -E "^(packages|apps)/" | sort | uniq -c | sort -rn | head -30 >> "$OUTPUT_DIR/llm_guidance_complete.txt" || true
fi

# 7-4: 最近のコミットメッセージ
echo -e "\n=== Recent Commit Messages ===" >> "$OUTPUT_DIR/llm_guidance_complete.txt"
if [ -d ".git" ]; then
  git log --oneline --since="1 month ago" -30 >> "$OUTPUT_DIR/llm_guidance_complete.txt" 2>/dev/null || true
fi

echo "✓ LLMガイダンス収集完了"

# ============================================
# 完了レポート
# ============================================
echo ""
echo "✅ 全ての情報収集が完了しました！"
echo ""
echo "📁 収集データ（新しいファイル）:"
ls -lh "$OUTPUT_DIR"/*_complete.txt 2>/dev/null | awk '{print $9, $5}'
echo ""
echo "📊 次のステップ:"
echo "  1. 収集したデータを確認"
echo "  2. v1.4仕様書を生成:"
echo "     python3 SPEC/script/extract_v14.py"
echo ""
echo "💡 ファイルサイズチェック:"
du -h "$OUTPUT_DIR"/*_complete.txt 2>/dev/null | sort -h