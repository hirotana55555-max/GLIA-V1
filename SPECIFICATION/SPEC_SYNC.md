# SPEC_SYNC.md  
GLIA-V1 Project Sync Specification  
Version: 1.0  
Last Updated: 2025-12-09

---

## 1. Purpose
本ドキュメントは **GLIA-V1 プロジェクトにおける構成同期（Project Synchronization）ルール**を定義する。  
`sync-project.sh` と対になる設計書であり：

- ディレクトリ構造の標準化
- 各ワークスペースの同期手順
- VSCode 設定の自動配備
- `ANTIGRAVITY_IMPL` の差分同期
- 一時ファイルの扱い

を明確化する。

---

## 2. スコープ  
同期対象は以下の 5 レイヤーに限定する：

1. **SPECIFICATION Layer**  
   - 仕様書、セットアップスクリプト、設計補助資料
2. **Workspace Config Layer**  
   - `.vscode/`  
   - `GLIA.code-workspace`
3. **Implementation Layer**  
   - `ANTIGRAVITY_IMPL/`  
   - TypeScript ソース（`ts-src/*`）
4. **Apps & Packages Layer**  
   - `apps/*`  
   - `packages/*`  
   - （存在する場合のみ同期）
5. **Temp / Generated Layer**  
   - `TEMP/`  
   - build 出力  
   - `.backup` / `.bak`

---

## 3. Directory Rules（標準ディレクトリ規則）

### 3.1 必須フォルダ
| Path | Purpose |
|------|---------|
| `SPECIFICATION/` | 仕様書・同期スクリプト・資料管理 |
| `ANTIGRAVITY_IMPL/` | GLIA-V1 実装の中核（TS/ECS） |
| `.vscode/` | VSCode 設定一式 |
| `apps/` | 必要に応じてアプリ群 |
| `packages/` | 共通モジュール群 |

### 3.2 任意フォルダ（削除可能）
| Path | Purpose |
|------|---------|
| `TEMP/` | 一時作業領域（同期対象外） |
| `dist/` `build/` `out/` | ビルド成果物（削除可） |

---

## 4. Sync Command Specification（sync-project.sh 仕様）

### 4.1 基本動作
1. **SPECIFICATION → プロジェクトルートへの同期**  
   - `.vscode/*`  
   - `GLIA.code-workspace`  
   - `*.md`（設計関連のみ）

2. **不整合の検出**  
   - 空フォルダ  
   - 不正な build artifacts  
   - `node_modules` の誤配置

3. **権限の修正**  
   - `.sh` の実行権付与  
   - 不要なパーミッションを排除

---

## 5. Workspace Rules（ワークスペース同期規約）

### 5.1 VSCode
以下の 3 ファイルは必ず最新に維持する：

- `.vscode/settings.json`
- `.vscode/launch.json`
- `.vscode/tasks.json`

更新内容は `sync-project.sh` が自動で反映する。

### 5.2 GLIA.code-workspace
プロジェクト全体を包括する **単一の workspace** として動作。  
特に以下のパスは必須：

- `ANTIGRAVITY_IMPL/ts-src`
- `SPECIFICATION/`
- `apps/*`（存在する場合）
- `packages/*`（存在する場合）

---

## 6. Implementation Sync Rules  
（ANTIGRAVITY_IMPL の扱い）

### 6.1 差分同期  
sync-project.sh が行う処理：

| 動作 | 説明 |
|------|------|
| **A: 新規ファイルの取り込み** | SPECIFICATION 配下から関連ファイルをコピー |
| **B: 古い generated ファイルの削除** | `.backup`, `.bak` 等 |
| **C: TypeScript ソースの構造整合チェック** | `/ts-src` 内の構造破損の検出 |

---

## 7. Git Ignore Rules  
同期対象外の一覧。  
（`.gitignore` と 100%一致するようメンテする）

node_modules/
/node_modules/
npm-debug.log
yarn-error.log
dist/
build/
out/
TEMP/
*.backup
*.bak
*.log
apps/electron-app/dist/
SPECIFICATION/Backup/

---

## 8. 最後に（運用方針）

- sync-project.sh は **常に上書き前に dry-run を提供**  
- 仕様の更新はこの SPEC_SYNC.md を最優先  
- **GLIA-V1 では sync が第1級市民（first-class）機能である**

以上。