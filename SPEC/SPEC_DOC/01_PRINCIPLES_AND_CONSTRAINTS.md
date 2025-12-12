# 01 PRINCIPLES & CONSTRAINTS — Core Principles and Operational Rules

## Core Principles
1. No External Judge — 評価はスウォーム内部で完結する。  
2. Dynamic Evaluation Criteria — タスク毎に評価基準を可変化する。  
3. Peer-Review Meritocracy — ピアレビューのスコアで最良案を選出する。  
4. Human = Quest Giver — 人は起案と最終承認に限定。

## Operational Constraints (破壊防止ルール)
- SPEC の公式ソースは SPEC/SPEC_DOC/ 以下のファイルのみを編集対象とする（評価・DraftはTEMP内で完結）。  
- sync-project.sh が生成する SPEC_SYNC.md は参照専用。変更は新_spec 側で行い、レビュー合格後に移植コマンドで本SPECへ反映する。  
- ANTIGRAVITY_IMPL 配下の実装は必ず「カプセル化」して行い、外部の既存ファイルを直接上書きしない。  
- TEMP外の自動改変は禁止（手作業での移植のみ許可）。
