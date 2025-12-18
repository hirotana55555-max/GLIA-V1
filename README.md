# GLIAプロジェクト - 人間用クイックリファレンス

## 絶対に覚えるべき3つのコマンド

### 1. バックアップ（編集前・後に必ず）
cd /home/els/Antigravity/GLIA-V1/SPEC/script
./backup_spec.sh
*いつ使う？*: 仕様書やコードを変更する前。忘れたらまずこれ。

### 2. プロジェクト状況の把握（記憶喪失時・LLMに依頼前）
cd /home/els/Antigravity/GLIA-V1/SPEC/script
./sync-project.sh
cat ../ForLLM/SPEC_SYNC.md | head -30
*いつ使う？*: プロジェクトがどうなっているかわからなくなった時。LLMに作業を依頼する前。

### 3. 仕様書の更新（SPEC_DOC編集後）
cd /home/els/Antigravity/GLIA-V1/SPEC/script
./make_spec_package.sh
*いつ使う？*: SPEC/SPEC_DOC/内の.mdファイルを編集した後。

## LLMとの作業手順（定型）

1. *常に最初にLLMに渡すファイル*:
   SPEC/ForLLM/CONSTITUTION.json  <- これが絶対契約書

2. *次に渡すもの*:
   SPEC/ForLLM/SPEC_SYNC.md      <- 現在のプロジェクト状況
   SPEC/ForLLM/SPEC_PACKAGE.txt  <- 詳細仕様書

3. *依頼の定型文例*:
   GLIAプロジェクトの[具体的なタスク]を手伝ってください。

   【作業内容】
   - [具体的な変更・実装内容]
   - [期待する成果]

   CONSTITUTION.jsonの指示に従い、まずsync-project.shを実行して現在のプロジェクト状況を把握し、
   SPEC_PACKAGE.txtを参照した上で、TEMP領域での実装計画を提案してください。

## 主要ディレクトリ構造
GLIA-V1/
├── SPEC/                            # 仕様管理システム（最重要）
│   ├── SPEC_DOC/                    # 唯一の真実の源（8つの.mdファイル）
│   ├── ForLLM/                      # LLM向け生成ファイル
│   └── script/                      # 生命維持スクリプト
├── TEMP/                           # すべての実験・テスト用隔離領域
└── （その他実装コード）

## トラブルシューティング

### LLMが破壊的提案をした場合
# バックアップから復元
cd /home/els/Antigravity/GLIA-V1/SPEC/backups/
ls -lt | head -5  # 最新のバックアップを確認

### 仕様が古いと感じる場合
cd /home/els/Antigravity/GLIA-V1/SPEC/script
./make_spec_package.sh  # SPEC_PACKAGE.txtを最新化

### プロジェクトの方向性を見失った場合
1. sync-project.sh を実行
2. SPEC_SYNC.mdの「Current Phase」を確認（Phase 2.5 Hardening中）

## 覚えておくこと

- 全ての実装はまず TEMP/ で試す
- LLMには必ず根拠（仕様書の該当箇所）を要求する
- SPEC/SPEC_DOC/ は直接編集しない（草案はTEMPで）
- 現在のフェーズ: 2.5 Hardening - 実Playwright統合とSPEC維持モデル確立が最優先

## LLMへのプロンプト例示

### 例1: 仕様書更新の依頼
非エンジニアの私に寄り添い事実に基づきサポートして欲しい。
CONSTITUTION.jsonを最初に読んで、その指示に従って作業を開始してください。

【依頼内容】
SPEC/SPEC_DOC/04_SPEC_MAINTENANCE_MODEL.mdのワークフローを改善したい。
具体的には、TEMP/spec_drafts/内での草案作成手順をより明確にしたいです。

CONSTITUTION.jsonに従い、必要なスクリプトを実行してから提案してください。

### 例2: 実装依頼
GLIAプロジェクトの実装を手伝ってください。

CONSTITUTION.jsonを最初に読んでください。

【依頼内容】
BrowserManagerのrunActionメソッドにエラーハンドリングを追加したいです。
SPEC_PACKAGE.txtの06_MODULE_SPECIFICATIONS.mdを参照し、
まずTEMP領域で実装計画を提案してください。

### 例3: コード解析依頼（別セッション用）
このTEMP/20251212_playwright_test/内の実装コードを分析し、
1. 何をしているか
2. SPEC_PACKAGE.txtのどの部分を実装しているか
3. 改善点はあるか
を解説してください。

### ウェブLLMのコピペ枠外に文字が分断される問題対策
【重要】コピペ用コマンドを書く時は、バックティック（```）で囲まないでください。
そのままのテキストで書いてください。全文のはずが分断され表示されるため、選択コピーが失敗するので。*/

---
最終更新: 2025-12-12
憲法ファイル: SPEC/ForLLM/CONSTITUTION.json
仕様書: SPEC/ForLLM/SPEC_PACKAGE.txt
