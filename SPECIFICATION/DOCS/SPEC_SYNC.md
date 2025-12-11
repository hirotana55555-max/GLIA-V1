# GLIA PROJECT SYNC PACKET
LLM はこの 1 ファイルだけ読めば、プロジェクト全体を最新状態で理解できます。

## 📌 1. ディレクトリツリー（主要ファイル）
```
### Configuration Files
ANTIGRAVITY_IMPL/package.json
ANTIGRAVITY_IMPL/tsconfig.json
apps/electron-app/package.json
apps/electron-app/tsconfig.json
package.json
packages/api-client/package.json
packages/api-client/tsconfig.json
packages/audit/package.json
packages/audit/tsconfig.json
packages/browser-agent/package.json
packages/browser-agent/tsconfig.json
packages/browser-manager/package.json
packages/browser-manager/tsconfig.json
packages/prompt-core/package.json
packages/prompt-core/tsconfig.json
packages/sie/package.json
packages/sie/tsconfig.json
packages/swarm/package.json
packages/swarm/tsconfig.json
packages/toon/package.json
packages/toon/tsconfig.json

### packages/
packages/browser-agent/test-qwen-chat-persistent.js
packages/browser-manager/ResourceLifecycle.ts
packages/browser-manager/test-memory-profiler.js
packages/browser-manager/test-recycling.js
packages/browser-manager/test-basic.js
packages/prompt-core/test-basic.js

### apps/

### Specification Files
SPECIFICATION/API_REFERENCE.md
SPECIFICATION/DOCS/GLIA_PROJECT_TREE.md
SPECIFICATION/DOCS/SPEC_SYNC.md
SPECIFICATION/DOCS/glia_antigravity_harness.md
SPECIFICATION/DOCS/glia_browser_manager.md
SPECIFICATION/DOCS/glia_integrated_architecture.md
SPECIFICATION/DOCS/glia_sie_executor.md
SPECIFICATION/DOCS/glia_swarm_toon.md
SPECIFICATION/GIT_STATUS.md
SPECIFICATION/GLIA_DEVELOPMENT_PHASE.md
SPECIFICATION/GLIA_PROJECT_OVERVIEW.md
SPECIFICATION/GLIA_PROJECT_TREE.md
SPECIFICATION/GLIA_ROADMAP.md
SPECIFICATION/GLIA_SYSTEM_ARCHITECTURE.md
SPECIFICATION/META/GIT_DIFF.txt
SPECIFICATION/META/GIT_STATUS.txt
SPECIFICATION/META/PACKAGE_LIST.md
SPECIFICATION/PACKAGE_LIST.md
SPECIFICATION/PROJECT_SYNC_PACKET.md
SPECIFICATION/Review_Phase_2_5/DeepSeek_review_Phase_2_5.md
SPECIFICATION/Review_Phase_2_5/Grok_review_Phase_2_5.md
SPECIFICATION/Review_Phase_2_5/Manus_review_Phase_2_5.md
SPECIFICATION/Review_Phase_2_5/Phase_2_5_Specification.md
SPECIFICATION/Review_Phase_2_5/Qwen3Next_review_Phase_2_5.md
SPECIFICATION/SCRIPTS/check-spec.sh
SPECIFICATION/SCRIPTS/gen-uml.sh
SPECIFICATION/SCRIPTS/sync-project.sh
SPECIFICATION/SPECIFICATION.md
SPECIFICATION/TOON_SCHEMA.md
SPECIFICATION/UML_FULL.md

### Directory Tree
/.vscode
/ANTIGRAVITY_IMPL
/ANTIGRAVITY_IMPL/.vscode
/ANTIGRAVITY_IMPL/audit
/ANTIGRAVITY_IMPL/browser-manager
/ANTIGRAVITY_IMPL/integration-test
/ANTIGRAVITY_IMPL/selftest
/ANTIGRAVITY_IMPL/shared
/ANTIGRAVITY_IMPL/sie
/ANTIGRAVITY_IMPL/swarm
/ANTIGRAVITY_IMPL/toon-schema
/ANTIGRAVITY_IMPL/ts-src
/ANTIGRAVITY_IMPL/ts-src/audit
/ANTIGRAVITY_IMPL/ts-src/browser-manager
/ANTIGRAVITY_IMPL/ts-src/integration-test
/ANTIGRAVITY_IMPL/ts-src/shared
/ANTIGRAVITY_IMPL/ts-src/sie
/ANTIGRAVITY_IMPL/ts-src/swarm
/SPECIFICATION
/SPECIFICATION/Backup
/SPECIFICATION/DOCS
/SPECIFICATION/META
/SPECIFICATION/Review_Phase_2_5
/SPECIFICATION/SCRIPTS
/SPECIFICATION/TEMP_workspace
/SPECIFICATION/UML
/apps
/apps/electron-app
/apps/electron-app/src
/docs
```

## 📌 2. Git 状況
```
ブランチ docs/phase2.5-spec-update
Your branch is up to date with 'origin/docs/phase2.5-spec-update'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   SPECIFICATION/DOCS/SPEC_SYNC.md
	modified:   SPECIFICATION/GIT_STATUS.md
	modified:   SPECIFICATION/GLIA_PROJECT_TREE.md
	modified:   SPECIFICATION/PACKAGE_LIST.md

追跡されていないファイル:
  (use "git add <file>..." to include in what will be committed)
	SPECIFICATION/Review_Phase_2_5/Qwen3Next_review_Phase_2_5.md

no changes added to commit (use "git add" and/or "git commit -a")
```

## 📌 3. Git 差分（変更ファイル）
```
M	SPECIFICATION/DOCS/SPEC_SYNC.md
M	SPECIFICATION/GIT_STATUS.md
M	SPECIFICATION/GLIA_PROJECT_TREE.md
M	SPECIFICATION/PACKAGE_LIST.md
```

## 📌 4. パッケージ情報（ルート package.json）
```json
{
  "name": "glia-v1-monorepo",
  "version": "1.0.0",
  "description": "GLIA V1 - Generative Language Integration Assistant",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build:all": "npm run build --workspaces",
    "build": "npm run build --workspaces",
    "start": "npm run build && cd apps/electron-app && npm start",
    "test": "cd integration-test && node simple-integration.js",
    "clean": "rm -rf node_modules packages/*/node_modules packages/*/dist apps/*/node_modules apps/*/dist",
    "install:all": "npm install && cd packages/prompt-core && npm install && cd ../browser-manager && npm install && cd ../browser-agent && npm install && cd ../../apps/electron-app && npm install"
  },
  "devDependencies": {
    "@types/node": "^24.10.2",
    "ts-node": "^10.9.2",
    "typedoc": "^0.28.15",
    "typescript": "^5.9.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## 📌 5. メタ情報
- 生成日時: 2025年 12月 12日 金曜日 00:01:04 JST
- プロジェクトルート: /home/els/Antigravity/GLIA-V1
- このファイルだけを読めば LLM が全体を理解可能

## 📌 6. 推奨運用フロー（LLM投入時）
必須：最初に読ませる -> SPECIFICATION/DOCS/SPEC_SYNC.md
補助資料は必要に応じて読ませる（設計・ロードマップ・進捗ファイルなど）
TEMP / shared は原則無視
