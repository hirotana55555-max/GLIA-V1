# 03 RUNTIME COMPONENTS — Tool Roles & Runtime Loop

## Cognize（静的解析）
- AST 抽出、import グラフ、関数呼出グラフ、潜在的コピペ／重複検出。
- 出力: dependency graph, file fingerprints, semantic-chunks。

## Scanner / sync-project.sh（プロジェクト概観）
- フォルダ・ファイル一覧、git status、diff、root package.json をまとめる。
- 現状 Scanner の代替を sync-project.sh が担うため、sync-project.sh を Scanner CLI として安定化予定。

## DEM（Dynamic Error Monitor）
- 実行中のエラーを JSONL で記録（timestamp, task_id, instruction, evidence）。
- 再現手順・最頻エラー一覧を生成し、Swarm が改善タスクを生成する。

## Swarm Runtime Loop（ミニ・シーケンス）
1. Orchestrator が mission を分解 → TOON を生成。  
2. Swarm ノードが提案（Proposal）を生成。  
3. SIE が静的/動的検証（Validator, Auditor）を実行。  
4. 承認されれば BrowserManager 経由で実行。  
5. AuditLogger と DEM に結果を渡す。  
6. Peer-Review により選定し、最終結果を人間に提示。

## Semantic Chunking（実装方針）
- 大きいタスクは依存ベースで分割（Cognize による）。
- 各チャンクはローカルの改善ループで品質を上げてから統合する。
