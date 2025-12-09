#!/usr/bin/env bash
set -e

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
UML_DIR="$ROOT/SPECIFICATION/UML"

echo "📐 GLIA UML Generation Started"

mkdir -p "$UML_DIR"

# 生成する PU ファイル名一覧（必要最低限）
PU_LIST=(
  "$ROOT/SPECIFICATION/UML/Harness_Logflow.pu"
)

# PlantUML が利用可能かチェック
if ! command -v plantuml >/dev/null 2>&1; then
  echo "⚠ PlantUML not installed. UML generation skipped."
  exit 0
fi

# 変換（壊れた出力が残らないよう、上書きで出力）
for PU in "${PU_LIST[@]}"; do
  if [[ -f "$PU" ]]; then
    echo "🖼 Generating PNG from: $(basename "$PU")"
    # plantuml の -o は出力先ディレクトリ（相対パス扱い）
    plantuml -tpng -o "$UML_DIR" "$PU" || echo "⚠ plantuml failed for $PU"
  else
    echo "⚠ PU file not found: $PU"
  fi
done

echo "✨ UML generation complete. Output → $UML_DIR"
