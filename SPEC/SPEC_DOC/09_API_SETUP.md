# API Setup Guide

このガイドでは、GLIA Swarmを実行するために必要なAPIキーの設定方法と、推奨される環境設定について説明します。

## 1. 必要なAPIキー

GLIA Swarmは、LLM (Large Language Model) へのアクセスに **OpenRouter** を使用することを推奨しています。
OpenRouterを使用することで、単一のAPI標準（OpenAI互換）でGPT-4, Claude 3, Llama 3など多様なモデルにアクセス可能になります。

- **必須**: `OPENROUTER_API_KEY`
    - 取得先: [OpenRouter Keys](https://openrouter.ai/keys)

## 2. 環境変数の設定 (.env)

プロジェクトルート (`/home/els/Antigravity/GLIA-V1`) に `.env` ファイルを作成し、以下の形式でキーを設定してください。

**注意**: `.env` ファイルは git にコミットしないでください（`.gitignore` で除外されています）。

```bash
# .env file

# OpenRouter API Key for Swarm Intelligence
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# (Optional) Specific Model Overrides
# Default is usually openai/gpt-3.5-turbo or openai/gpt-4
SWARM_MODEL_PLANNER=openai/gpt-3.5-turbo
SWARM_MODEL_REVIEWER=openai/gpt-4
```

## 3. 接続テスト

正しく設定されているか確認するには、以下の手順を実行してください。

1. **Mockモードの無効化**:
   `integration-test/antigravity-harness.ts` または実行スクリプトで、`useMock: false` が設定されていることを確認します（APIキーが存在すれば自動的にfalseになる場合もありますが、明示的な設定を推奨します）。

2. **テスト実行**:
   ```bash
   # TS実行環境が整っている場合
   npx ts-node integration-test/antigravity-harness.ts
   
   # またはビルド後のJS実行
   node integration-test/antigravity-harness.js
   ```

3. **ログ確認**:
   コンソールログおよび `logs/swarm-audit.jsonl` を確認し、`API_ERROR` ではなく `PROPOSAL_RECEIVED` 等のイベントが記録されていれば成功です。

## 4. トラブルシューティング

- **Error: 401 Unauthorized**: APIキーが間違っています。`.env` の内容とOpenRouterのダッシュボードを確認してください。
- **Error: 402 Payment Required**: クレジット（Credits）不足です。OpenRouterにチャージしてください。
- **Error: Context Window Exceeded**: ミッション記述が長すぎるか、履歴が肥大化しています。要約ロジックが機能しているか確認してください。
