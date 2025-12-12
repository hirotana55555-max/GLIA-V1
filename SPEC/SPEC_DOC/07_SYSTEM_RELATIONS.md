# 07 SYSTEM RELATIONS — LLM向け構造化関係定義

## コンポーネント関係（簡潔版）
- **Orchestrator** → 指揮者：Swarmを制御、SIEに検証依頼
- **Swarm** → 作業者群：並列提案生成、ピアレビュー
- **SIE** → 検証官：TOON検証、実行監視
- **BrowserManager** → 実行エンジン：Playwright操作
- **Cognize** → 静的分析者：AST解析、依存グラフ作成
- **DEM** → エラー収集者：失敗パターン記録
- **AuditLogger** → 記録係：全アクション証跡

## データ流れ（トークン最小化版）
1. 入力 → UI
2. UI → Orchestrator（ミッション分解）
3. Orchestrator → Swarm（並列提案）
4. Swarm提案 → SIE（検証）
5. SIE → BrowserManager（実行）
6. 結果 → AuditLogger（記録）
7. 失敗 → DEM（分析）
8. DEM → Swarm（改善ループ）

## 依存関係グラフ（テキスト表現）
Orchestrator
├─ Swarm (1:N関係)
├─ SIE (1:1関係)
└─ BrowserManager (1:1関係)

SIE
├─ Validator (静的検証)
└─ Auditor (動的検証)

BrowserManager
└─ Playwright (1:1 ラッパー)