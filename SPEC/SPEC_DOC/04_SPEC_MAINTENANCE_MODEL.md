# 04 SPEC MAINTENANCE MODEL — How SPEC is maintained & operated

## 目的
- 仕様の一貫性を保ち、LLM の「幻覚」「破壊的改変」を運用上から遮断する。

## ワークフロー（正しい手順）
1. すべての編集は `TEMP/spec_drafts/*` 内で行う（Draft）。  
2. 編集が完了したら `make_spec_package.sh`（TEMP 内）で検証を行う。  
3. 自動チェック通過後、`promote_spec_to_main.sh` を手動実行して本SPECへ移植する（移植は人間オペレータが実行）。  
4. 本SPECへの反映後、`sync-project.sh` を実行して snap を生成・LLM に提供。

## 重要ルール
- 本SPEC（リポジトリ直下の SPECIFICATION/*）は `promote_spec_to_main.sh` のみが変更して良い（手動編集禁止）。  
- TEMP 内のファイルは自由に実験可。破棄は権限がある人が手動で行うこと。

## LLM向けガイド（最小命令）
- 「このファイルだけ読め」: SPEC_SYNC.md（自動生成）  
- 「次に読め」: GLIA.code-workspace（必要時）
