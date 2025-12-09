#!/usr/bin/env bash
set -e

echo "GLIA Project Sync Started..."

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

OUT_TREE="$ROOT/SPECIFICATION/GLIA_PROJECT_TREE.md"
OUT_GIT="$ROOT/SPECIFICATION/GIT_STATUS.md"
OUT_PKG="$ROOT/SPECIFICATION/PACKAGE_LIST.md"

echo "Exporting directory tree (safe mode)..."

{
  echo "# GLIA Project Tree (Safe Mode)"
  echo ""

  find "$ROOT" \
    -path "$ROOT/node_modules" -prune -o \
    -path "$ROOT/**/node_modules" -prune -o \
    -path "$ROOT/**/dist" -prune -o \
    -path "$ROOT/**/.git" -prune -o \
    -path "$ROOT/**/TEMP" -prune -o \
    -path "$ROOT/**/logs" -prune -o \
    -print \
    | sed "s|$ROOT||"
} > "$OUT_TREE"

echo "Exporting git status..."
git -C "$ROOT" status --untracked-files=all > "$OUT_GIT"

echo "Exporting workspace package list..."
if command -v jq >/dev/null 2>&1; then
  jq -r '
    if has("workspaces") and .workspaces != null
    then .workspaces[]
    else empty
    end
  ' "$ROOT/package.json" > "$OUT_PKG"
else
  echo "jq not installed; skipping workspace list" > "$OUT_PKG"
fi

echo "Sync Complete. SPECIFICATION updated."
