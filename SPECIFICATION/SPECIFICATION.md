# GLIA-V1 プロジェクト仕様書（2025年12月06日 最終更新）

## 基本情報
- **プロジェクト名**: GLIA (Generative Language Integration Assistant) for AI Swarms
- **バージョン**: V1.0
- **最終更新日**: 2025年12月06日 (内容追記: プロジェクト名変更、ファイル削除経緯、プロジェクト構造の確認、統合テストの実態、今後の詳細方針)
- **プロジェクト状態**: フェーズ1「堅牢な基盤統合」完了、検証活動完了、今後の戦略方針検討中
- **GitHub**: https://github.com/hirotana55555-max/GLIA-V1
- **(最新コミット: GitHub上で確認)**

## 🎯 プロジェクト進捗概要

### ✅ 完了した実装（フェーズ1：堅牢な基盤統合）

#### 1. BrowserManager v2（完全再実装 - Chromium限定）
- **状態**: ✅ 実装完了・テスト済み
- **特徴**:
  - 階層管理（Browser → Context → Page）の明確化
  - ProcessManagerによるOSレベルプロセス追跡・強制終了
  - リサイクルポリシーによる自動リソース管理
  - 定期クリーンアップと明示的クリーンアップ
  - リソース統計取得機能
- **主要ファイル**:
  - `packages/browser-manager/src/BrowserManager.ts`（コア実装）
  - `packages/browser-manager/src/ProcessManager.ts`（プロセス管理）
  - `packages/browser-manager/src/types.ts`（型定義）

#### 2. MemoryProfiler（多層的メモリ監視）
- **状態**: ✅ 基本実装完了・動作確認済み
- **特徴**:
  - CDP（Chrome DevTools Protocol）によるJSヒープ監視（準備完了）
  - プロセスRSS（Resident Set Size）監視（動作確認済み）
  - メモリ閾値超過時のアラートシステム
  - EventEmitterベースの監視イベント
- **動作確認**:
  - プロセスRSS監視: 正常動作（64-77MB範囲で安定）
  - 閾値アラート: 基本実装完了

#### 3. BrowserAgent（GUI操作支援モード対応）
- **状態**: ✅ リファクタリング完了・テスト済み
- **特徴**:
  - **旧役割**: 外部 Web LLM サイトへのブラウザ自動操作（Qwen Chat など、利用規約違反の可能性）。
  - **新役割**: **GLIA 自身の GUI や、利用規約準拠の外部 GUI アプリケーションの操作支援・自動化**。手動ログイン後の永続セッション管理も補助的に可能。
  - **互換性**: 既存APIを維持しつつ、GUI操作支援機能を強化。

#### 4. Electron統合（確実なリソース管理）
- **状態**: ✅ 更新完了・テスト済み
- **特徴**:
  - `app.on('before-quit')`での確実なリソース解放
  - 強制プロセス終了（forceKillProcesses: true）対応
  - IPCハンドラーによる統合管理
- **安全性**: アプリケーション終了時に全ブラウザプロセスを確実に終了

#### 5. 統合テスト (状況の修正)
- **状態**: ❗ **部分的連携動作確認済み (要再検証)**
- **結果**: **`prompt-core` によるプロンプト合成** と **`browser-agent` によるブラウザ操作** の**連携フローは構築済み**。しかし、**Electron コントローラーからのプロンプト入力、およびその結果の `browser-agent` への送信**は、**メモリリソース管理導入後の検証が不十分**。**プロンプト入力ウィンドウの表示自体が確認されていない可能性がある**。**統合テスト (`integration-test`) の実行状況と結果の再確認が必要**。

### ✅ 完了した検証活動（2024年12月5日以降）

#### 1. Web LLM サービス連携検証（旧方針における実績）
- **状態**: ✅ 実施完了 (※方針転換により、今後の同様の操作は禁止)
- **目的**: フェーズ1で構築した基盤 (`BrowserManager`, `Electron`) の「動く状態」確認。API連携前の検証工程としての位置づけ。
- **対象サービス**: Hugging Face Chat (`https://huggingface.co/chat  `), Qwen Chat (`https://chat.qwen.ai/  `)
- **方法**: `browser-agent` を使用した永続セッション (`userDataDir`) の確立と**手動ログイン確認**。
- **結果**:
  - `packages/browser-agent/test-qwen-chat-persistent.js` により、Qwen Chat への**手動ログイン**と永続セッションの維持が確認されました。
  - `packages/browser-agent/test-hf-manual-login.js` は、以前に Hugging Face Chat への**手動ログイン**と永続セッションの維持を**検証成功**したスクリプトであったが、**現在はローカルから削除済み** (経緯: `rm` コマンドによる誤削除の可能性)。
  - GLIA の基盤が外部 Web サービスとの連携において一定の「動く状態」を実現していることが確認されました。
- **影響**:
  - 以下のファイルがプロジェクトに追加・変更されました。
    - **追加ファイル**:
      - `packages/browser-agent/test-qwen-chat-persistent.js` (検証成功した Qwen 接続スクリプト)
      - `scripts/` フォルダ (監視スクリプトを格納)
    - **変更ファイル**:
      - `apps/electron-app/src/main.ts` (型エラー修正)
      - `packages/browser-agent/src/index.ts` (検証に伴う変更)
      - `integration-test/simple-integration.js` (連携テスト内容の更新)
    - **削除ファイル (経緯)**:
      - `packages/browser-agent/test-hf-manual-login.js` は、以前の `rm` コマンド (`rm -f packages/browser-agent/test-*.js`) により**誤って削除された可能性が高い**。このファイルは、Hugging Face Chat への手動ログイン検証を成功させたスクリプトであった。

### 🔧 技術スタック（確定版 / 更新）
- **Node.js**: 20.x
- **TypeScript**: 5.x
- **Electron**: 28.x（メインアプリ）
- **Playwright**: 1.40.x（**GUI操作支援**（GLIA & 利用規約準拠外部GUI）に限定）
- **LLM API クライアント**: (例: `openrouter`, `axios`) （新規導入予定）
- **モノレポ構成**: workspacesによるパッケージ管理

## 📁 プロジェクト構造（現在の状態）

GLIA-V1/
├── SPECIFICATION/ # 仕様書（このファイル含む）
├── apps/
│ └── electron-app/ # Electronメインアプリ
│ ├── src/
│ │ ├── main.ts # 更新済み（終了ハンドラー実装）
│ │ ├── integration.ts # 更新済み（BrowserManager v2対応）
│ │ └── preload.js # IPCブリッジ
│ └── dist/ # ビルド成果物
├── integration-test/ # 統合テスト
│ └── simple-integration.js # 3モジュール連携テスト
├── packages/
│ ├── browser-manager/ # ✅ 完全再実装完了
│ │ ├── src/
│ │ │ ├── BrowserManager.ts # v2実装
│ │ │ ├── ProcessManager.ts # OSプロセス管理
│ │ │ ├── MemoryProfiler.ts # メモリ監視
│ │ │ ├── types.ts # 型定義
│ │ │ └── index.ts # エントリーポイント
│ │ └── dist/ # ビルド成果物
│ ├── browser-agent/ # ✅ リファクタリング完了 / GUI操作支援に特化
│ │ ├── src/index.ts # GUI操作支援モード対応版
│ │ ├── test-qwen-chat-persistent.js # 検証成功スクリプト (Qwen Chat 手動ログイン)
│ │ └── dist/ # ビルド成果物
│ └── prompt-core/ # ✅ 既存実装安定
│ ├── src/index.ts # プロンプト合成エンジン
│ └── dist/ # ビルド成果物
├── scripts/ # 監視スクリプト
│ └── (monitor-*.sh など)
├── shared/ # 共通リソース (例: 設定ファイル、共通スキーマ)
│ └── (README.md など)
├── package.json # ワークスペース設定
└── package-lock.json # 依存関係のロックファイル


## 🚀 次の実装フェーズ（選択可能）

### オプションA: フェーズ2「API連携と構造化管理の強化」
1. **LLM API 連携モジュール**（優先度: 非常に高）
   - **目的**: OpenRouter, 各LLMプロバイダーAPIとの連携を確立し、Qwen Chat 利用規約を遵守する。
   - **実装内容**:
     - 新しいカプセル化パッケージ (`@glia/api-client` 的な名前を想定) として実装。
     - APIキー管理、リクエスト/レスポンス処理、エラーハンドリングを担当。
     - 構造化 JSON (TOON) によるリクエスト/レスポンスの管理・検証。
     - **役割**: `browser-agent` が担っていた GUI 自動操作の代わりとして、LLM との純粋な API 通信を行う。
   - **依存関係**: `prompt-core` が生成した構造化プロンプトを `@glia/api-client` が受け取って送信。

2. **構造化 JSON (TOON) 管理**（優先度: 高）
   - **目的**: LLM が ReAct 思考 (分析→確認→改修→確認→動作確認) を自律的かつ安全に実行できるようにする。
   - **実装内容**:
     - TOON スキーマの定義とバリデーションロジック。
     - TOON を通じた LLM 間のコミュニケーション（指示、状態、結果の共有）。
     - TOON を用いたタスクのフェーズ管理（要件定義、実装、テストなど）。
     - **役割**: LLM が処理するべき「タスクの内容」「現在の状態」「次の指示」を明確にし、誤った推論や逸脱を防ぐ。

3. **LLM エージェントフレームワークの導入**（優先度: 中）
   - **目的**: ReAct 思考やタスクの自律実行を実現する。
   - **実装内容**:
     - LangChain, AutoGen, Qwen-Agent 的なフレームワークの導入検討。
     - 各 LLM を「Critic (批評家)」「Optimizer (最適化者)」「Executor (実行者)」などの**ロール**で配置し、相互監査・補完させる。
     - エージェントが TOON を受け取り、処理し、結果を TOON として出力する流れを構築。
     - **役割**: LLM 群による自律的な開発プロセスの基盤。

4. **JSONスキーマ管理UI**（優先度: 高）
   - **目的**: TOON やその他のスキーマを GUI で編集・管理・バージョン管理。
   - **実装内容**:
     - Electron アプリ内に、スキーマの作成・編集・検証画面を構築。
     - インポート/エクスポート機能。
     - **役割**: Hiro さんや他の開発者が、構造化 JSON を視覚的に管理しやすくする。

5. **リアルタイム監視ダッシュボード**（優先度: 高）
   - **目的**: LLM エージェントの状態、API使用量、TOONの処理状況を可視化。
   - **実装内容**:
     - ブラウザ/コンテキスト/ページの稼働状況表示 (BrowserManager連携)
     - メモリ使用量グラフ (MemoryProfiler連携)
     - リソースアラート表示
     - TOON メッセージフローの表示
     - **役割**: 開発状況の把握と、問題発生時の原因追跡。

6. **統合テストの再構築**（優先度: 高）
   - **目的**: API 連携、TOON、LLM エージェントの連携を検証。
   - **実装内容**:
     - `integration-test/` 配下に、API 経由のプロンプト送信と結果受信を検証するスクリプトを新規作成。
     - TOON を介した LLM 間のやりとりを検証。
     - **役割**: GLIA の API 中心アーキテクチャの安定性と信頼性を確保。

---

### オプションB: フェーズ3「高度化」
1. **Obsidian連携モジュール**
2. **自律開発支援機能**

### オプションC: テストと最適化強化
1. **詳細パフォーマンステストスイート**
2. **エラーハンドリングの洗練**
3. **非エンジニア向け運用手順書作成**

## 🔍 直近のテスト結果（2024年12月5日）

### BrowserManager v2 基本テスト

✅ コンテキスト取得成功
✅ ページ操作成功（example.com表示）
✅ リソース統計取得成功
✅ クリーンアップ成功


### リサイクルポリシーテスト

✅ 3コンテキスト生成成功
✅ 10秒後の自動クリーンアップ確認（3→0コンテキスト）
✅ リサイクルポリシー正常動作


### MemoryProfilerテスト

✅ プロセスRSS監視正常（64-77MB範囲）
✅ イベント発行正常
✅ 統計収集正常


### 統合テスト (備考)

✅ 3モジュール連携**フロー**は構築（2024年12月5日時点記載）
❗ **現在の連携**（Electron → prompt-core → browser-agent → API）**は検証未実施**


## 🛠 開発者向け情報

### ビルドコマンド
# 全モジュール一括ビルド
cd ~/GLIA/GLIA-V1
npm run build:all

# 個別ビルド
cd packages/browser-manager && npm run build
cd packages/browser-agent && npm run build
cd packages/prompt-core && npm run build
cd apps/electron-app && npm run build

テスト実行
# 基本動作テスト
cd packages/browser-manager && node test-basic.js

# リサイクルポリシーテスト
cd packages/browser-manager && node test-recycling.js

# メモリ監視テスト
cd packages/browser-manager && node test-memory-profiler.js

# 統合テスト (要再検証)
cd integration-test && node simple-integration.js

アプリ起動
cd apps/electron-app && npm start

📝 注意事項

    Chromium限定: 現在の実装はPlaywright Chromiumのみをサポート

    メモリ監視: CDP監視はページ操作時に有効（現在は基本実装のみ）

    Electron統合: 実際のUI画面はまだ基本構成

    非エンジニア運用: 監視機能はあるが、アラート通知UIは未実装

    GUI操作: Playwright による GUI 操作は、GLIA 自身または利用規約準拠の外部 GUI 操作支援に限定する。外部 Web LLM サイトへの自動操作は禁止。

🔄 更新履歴

    2025年12月06日: プロジェクト名変更, ファイル削除経緯追記, プロジェクト構造確認, 統合テスト状況修正, API連携方針の詳細追記
    2025年12月05日: 検証活動の実績と今後の戦略方針を追記
    2024年12月5日: フェーズ1完了、BrowserManager v2実装、MemoryProfiler追加
    2024年12月4日: ChatGPT監査結果反映、アーキテクチャ改訂
    2024年12月3日: プロジェクト初期構築、基本モジュール作成

この文書はLLM依存開発における継続的開発のための唯一の情報源として維持されます。
主要な変更は必ずこの文書を更新し、GitHubにコミットしてください。

---

## 付記: 戦略方針の転換 (2025年12月05日 / 2025年12月06日 更新)

*   **経緯**: フェーズ1完了後、Qwen Chat, Hugging Face へのブラウザ自動操作によるアクセス検証を実施。
*   **問題発見**: Qwen Chat の利用規約により、ブラウザ自動操作 (`browser-agent` 経由) が禁止されていることが判明。
*   **方針転換**: 「API対応前の中間検証（外部 Web LLM ブラウザ自動操作）」の工程を**スキップ**。
*   **今後**: OpenRouter や各LLMプロバイダーの **API連携** に注力し、利用規約遵守の下での開発を推進。
*   **影響**:
    *   `packages/browser-agent` の役割が「外部 Web LLM サイト操作」から「**GLIA 内部 GUI および利用規約準拠外部 GUI の操作支援**」に変更。
    *   `Playwright` の使用目的も、GUI テストから「**GUI 操作支援**（Automation for Assistance）」に変更。
    *   全体アーキテクチャの再検討が必要。特に、API 連携のための構造化 JSON や LLM ロール管理の導入が重要になる。
*   **補足**:
    *   **Hiro さんの意図**: Hiro さんは、GUI 操作の自動化により人間の LLM 操作負荷を軽減することを目的としており、Qwen の利用規約遵守を前提としていた。GLIA が不正利用を行う意図は一切ない。
    *   **検証工程の位置づけ**: 以前の Web LLM 操作検証は、API 連携の**前段階としての検証工程**（仕様策定、人による目視確認、ログ記録）としての位置づけであった。その工程が利用規約により**スキップ**された。
    *   **検証成功ファイルの削除**: `test-hf-manual-login.js` は検証成功後、誤って削除された可能性が高い。今後の再作成を検討。