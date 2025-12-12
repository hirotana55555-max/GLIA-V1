# 02 SYSTEM ARCHITECTURE — High-level Architecture

## レイヤー（3.5 層）
1. Browser (Chromium 実体)
2. BrowserContext (Playwright/Context)
3. Page (Tab/Frame 単位)
3.5. Safe Execution Sandbox (SIE Executor)

## コンポーネント配置（概要）
- Electron App (Central Orchestrator + Operator UI)
- Orchestrator / SwarmController（ミッション分割・集約）
- SIE（Instruction validation + sandboxed execution）
- BrowserManager（Playwright 統合・ResourcePool・PIDTracker）
- Cognize（静的AST解析 / 依存グラフ）
- Scanner / sync-project.sh（プロジェクトスナップショット・復元用）
- DEM（ランタイムエラー収集・フィードバックループ）
- AuditLogger（JSONL 形式の証跡保存）

## データフロー（簡潔）
User → ElectronUI → Orchestrator → Swarm → [TOON → SIE] → BrowserManager → Browser
結果は AuditLogger に集約され、DEM が失敗データを保持して改善ループに供する。

## 接続・権限方針
- LLM 接続は API 経由を標準とし、認証・レート制御を設ける。  
- 実行権限は SIE を介して最小化（ファイル書込等は許可リスト制）。
