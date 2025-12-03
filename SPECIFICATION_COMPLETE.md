# GLIA-V1 プロジェクト仕様書（完成版）

## 基本情報
- プロジェクト名: GLIA (Generative Language Integration Assistant)
- バージョン: V1.0
- 目的: AI依存開発におけるプロンプト最適化とLLM出力制御

## コア機能
1. 構造化JSON管理: プロジェクトルール、命名規則、ガードレールなどをJSON形式で保存
2. プロンプト合成: 自然言語と構造化JSONを最適な形式で合成
3. 自動投入: 合成プロンプトを複数LLMサービスに自動投入
4. 出力取得: LLM出力をクリップボードにコピー

## 技術アーキテクチャ
### 完全分離3層構造

- 第一層: Electronメインアプリ (apps/electron-app)
  - ユーザーインターフェース
  - フローティングウィンドウ管理
  - モジュール統合制御

- 第二層: プロンプト合成エンジン (packages/prompt-core)
  - 構造化JSON管理
  - プロンプトテンプレート処理
  - 合成ロジック（UI非依存）

- 第三層: ブラウザ自動化エージェント (packages/browser-agent)
  - Playwrightブラウザ制御
  - マルチLLM対応
  - 自動投入機能

## 動作確認済み項目
- GitHubリポジトリ作成とプロジェクト構造構築
- Electronアプリ最小構成の起動確認
- プロンプト合成エンジンの基本動作
- ブラウザ自動化エージェントの基本動作
- 3モジュールの独立動作確認
- 統合テスト成功（3モジュール連携可能）

## 次の実装フェーズ
### フェーズ1: 基本統合（優先度: 高）
1. Electronフローティングウィンドウの作成
2. プロンプト合成UI（自然言語入力 + JSONスキーマ選択）
3. IPC通信によるモジュール連携

### フェーズ2: 拡張機能（優先度: 中）
1. JSONスキーマ管理UI
2. マルチLLM同時投入
3. プロンプト履歴保存

### フェーズ3: 高度化（優先度: 低）
1. Obsidian連携
2. API連携モジュール
3. 自律開発支援

## 開発環境
- Node.js: 20.x
- TypeScript: 5.x
- Electron: 28.x
- Playwright: 1.40.x

## ビルドとテスト方法
各モジュール個別ビルド:
cd apps/electron-app && npm run build
cd packages/prompt-core && npm run build
cd packages/browser-agent && npm run build

個別テスト:
cd apps/electron-app && npm start
cd packages/prompt-core && npm run test:basic
cd packages/browser-agent && npm run test:safe

統合テスト:
cd integration-test && node simple-integration.js

## プロジェクトロードマップ
1. 基本統合実装（2週間）: フローティングウィンドウとUI
2. コア機能拡張（2週間）: スキーマ管理、履歴保存
3. 最適化と安定化（1週間）: テスト、バグ修正
4. 拡張機能開発（随時）: Obsidian連携、API連携

## 非エンジニア向け開発アプローチ
- AI依存開発: 各機能をカプセル化し、LLMによる段階的開発を可能に
- 完全分離設計: モジュール間の依存関係を排除し、変更影響を最小化
- 仕様書駆動: 明確な仕様書をもとに、異なるLLMセッションで継続開発

作成日: 2024年12月4日
最終更新: 2024年12月4日
プロジェクト状態: 基盤構築完了、統合実装待機
