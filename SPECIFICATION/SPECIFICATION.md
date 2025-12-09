# GLIA-V1 — SPECIFICATION (Updated: Grand Vision first / TOON-first)
バージョン: 2025-12-09 (改訂：Grand Vision 優先)
作成者: Hiro(ユーザ) + ChatGPT

---

## 0. イントロ（方針の再確認）
GLIA の最終目的は「LLM群（スウォーム）による自律的かつ監査可能なソフトウェア開発プロセスの実現」である。  
本SPECは、**TOON（Typed Object-Oriented Notation）を第一の通信スキーマ** とし、LLM間通信、フェーズ管理、査読ループ、実行ガード（サンドボックス）、およびトレーサビリティを統合する仕様を定義する。

**重要な変更点（今回の改訂）**
- 旧：ブラウザ自動操縦に寄った記述が多い  
- 新：Grand Vision（AIオーケストレーション、自動開発） を第一に据え、ブラウザ操作は「一つの実行ターゲット」に位置づける。  
- 仕様フォーマットは **TOON/JSON 優先**。YAMLは補助的資料のみ。

---

## 1. 大目標（Grand Vision）と中核思想
### 1.1 Grand Vision
- 「AIスウォームが協調して開発タスクを遂行し、自己検証（peer-review）を経て最適解を採択する」システムの実現。

### 1.2 中核思想（要約）
- No External Judge（評価はスウォーム内部で完結）
- Dynamic Evaluation Criteria（評価基準はタスク毎に可変）
- Peer-Review Meritocracy（ピアレビューで選抜）
- Human Role = Quest Giver（人は起案者・最終受領者）

---

## 2. 現状（ファクト）とフェーズ定義
### 2.1 現状（2025-12-09）
- フェーズ1（基盤）：BrowserManager v2 等は完成済み（Chromium限定の抽象層）。  
- フェーズ2（API/構造化管理）：Antigravity によりベース機能の実装が完了（TOON Proposal の transport、SIE の MVP、AuditLogger、ResourcePool 等のモック/実装）。ただし、多くは**テスト用ハードコードやモック実装**を含む。
- **重要な制約**: DOM/CSSセレクタ解析、実ブラウザでの高度な自動検証、動的バリデータは未完。

### 2.2 フェーズ定義（高レベル）
- **Phase1**: 基盤（BrowserManager, MemoryProfiler 等）
- **Phase2**: API連携とTOONベースの構造化管理（現状）
- **Phase2.5**: 「動的バリデータ」「実ブラウザ統合」「テスト自動化ループ」実装フェーズ（優先度高）
- **Phase3**: 完全自律（LLM群エージェント群による自律開発・リファクタリング・統合）

---

## 3. プロトコル: TOON を第一にする理由と基本フォーマット
### 3.1 理由
- トークン節約、型保証、LLM間の厳密な情報受け渡しを目的とするため。

### 3.2 基本スキーマ（最小）
```json
{
  "task_id": "string",
  "current_phase": "REQUIREMENT_GATHERING|IMPLEMENTATION|DEBUGGING|REVIEW",
  "status": "PENDING|IN_PROGRESS|AWAITING_AUDIT|COMPLETED",
  "input_prompt": "string",
  "structured_instruction": {
    "action": "navigate|click|input|extract|run_test|apply_patch|noop",
    "target": "string",
    "content": "string|null",
    "meta": {}
  },
  "context_summary": "string",
  "audit_log": [],
  "next_roll": "NAVIGATOR|AUDITOR|EXECUTOR"
}

（TOONはJSON互換で表現されることを推奨）
4. 現在のギャップ（優先対応項目）

    DOM解析とセレクタ自動生成: 実ブラウザでの信頼できるセレクタ抽出ロジックが未実装。
    → 2.5で要実装（視覚的抽出 + レジリエンス判定）。

    静的バリデータの限界: スキーマ合致だけで意味的正当性を保証できない。
    → 動的バリデータ（LLMを活用した実行前後差し戻しフロー）を導入する。

    テスト自動生成と実行: LLMの出力を検証するために、該当コードに対する自動テストを生成し実行する仕組みが必要。

    実行環境のサンドボックス化: 破壊的操作を防ぐため、実行時は限定された仮想環境またはモックで検証→限定的プロダクション適用。

5. フェーズ2.5（短期集中：必須実施項目）
5.1 動的バリデータ導入

    LLMが出力したTOONを別LLM（高精度）に回して「実行可否」「改善案」を得る。

    自動差し戻しループを実装（SIE が拒否→修正命令→再実行）。

5.2 DOM解析＋セレクタ生成エンジン

    画面スナップショット or DOMツリーを解析し、堅牢なセレクタを生成（ID, data-* 優先、相対パス最小化）。

5.3 テスト自動生成 & 実行パイプライン

    LLMがテストケース（単体/統合/E2E）を生成し、CI的に実行→結果をTOONで返す。

5.4 実行サンドボックス

    コンテナ/仮想化または厳密なパーミッション制御でコード実行。

    危険度判定により人間承認を必須化。

6. 永続化・監査（トレーサビリティ）

    AuditLogger は JSONL で書き出し（timestamp, task_id, instruction, actor, result, evidence）。

    期限／容量に応じたローテーションポリシーを実装。

    監査エクスポート（ZIP/NDJSON）と法的保管用のオプションを準備。

7. LLM ロール定義（最小セット）

    NAVIGATOR: 人間に優しい説明・進捗提示

    EXECUTOR: TOONから具体的操作を生成

    AUDITOR: 出力の検証（高精度LLM 想定）

    OPTIMIZER: 複数案の評価・選別

8. 開発ワークフロー例（TOON中心・簡潔）

    人間（Quest Giver）が自然文で指示

    Swarm が高レベル Proposal（TOON）を生成

    SIE が Instruction[] を生成・静的検証

    高精度 AUDITOR に動的検証を依頼（差戻し可能）

    承認後、SIE Executor がサンドボックスで実行（テスト生成→実行）

    AuditLogger に証跡保存。最終は人間レビューまたは自律採択

9. 実装配置ポリシー（ファイル配置）

    実装コード（フェーズ2.5以降、Antigravity用）は ANTIGRAVITY_IMPL/ 下に全て格納する。

    仕様書・監査ドキュメントは SPECIFICATION/ 下に保持。

    これにより本番リポジトリの安定性を担保する。

10. 付録：短期優先タスクリスト（実行順）

    Proposal/Instruction スキーマの最終化（TOON）

    AuditLogger のフォーマット標準化（JSONL）

    SIE の動的バリデータ連携（高精度LLM）

    DOM解析/セレクタ生成エンジン設計

    テスト自動生成パイプライン（CI統合）

    安全サンドボックスと承認フロー

11. 非エンジニア向け注記（短く）

    「今すぐ動くコード」と「最終目標」は別物です。 フェーズ2で得た成果は「概念検証と基礎部品」です。

    あなたは今後、GUI（Electron）経由で「Quest（タスク）」を出し、Auditログと提案の要約を見て承認するだけでOKです。より高度な自動化は段階的に追加します。