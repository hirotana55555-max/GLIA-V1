# GLIA-V1 プロジェクト 実装フェーズ引き継ぎ書類

## 1. プロジェクトの目的と文脈
- **GLIA (Generative Language Integration Assistant)** は、非エンジニアがAI(LLM)依存開発を行うための支援ツール。
- **現在の目標**: 既存の3層（Electron, prompt-core, browser-agent）の基盤を、**ChatGPTの監査結果を反映した「完全分離3.5層構造」へと進化させる**。
- **最重要課題**: 新しい `packages/browser-manager` を作成し、Playwrightのリソース（ブラウザ、コンテキスト、ページ）を、**リサイクルポリシーに基づき確実に管理・監視する**。これにより、長時間運用でのメモリリークと状態汚染を防止する。

## 2. 依頼する具体的な実装タスク (優先順位 High)
**タスク1.1: `@glia/browser-manager` パッケージの新設**
- **場所**: `/home/els/GLIA/GLIA-V1/packages/browser-manager/`
- **要求仕様**: `SPECIFICATION_COMPLETE.md` の「**第三層：ブラウザリソースマネージャー**」セクションに完全準拠。
- **必須コア機能**:
    1.  `BrowserManager` シングルトンクラス（リソースプール管理 & リサイクルポリシー実装）。
    2.  `ResourceLifecycle` ヘルパークラス（構造化された `try...finally` 解放パターン）。
    3.  `MemoryProfiler` クラス（CDPを用いたJSヒープ使用量の基本監視）。

**タスク1.2: Electronアプリ (`apps/electron-app`) の統合改修**
- **要求仕様**: `SPECIFICATION_COMPLETE.md` の「**次の実装フェーズ - フェーズ1**」に準拠。
- **具体的変更**:
    1.  `src/main.ts`: アプリ終了ハンドラー (`app.on('before-quit')`) から `BrowserManager.getInstance().cleanupAll('critical')` を呼び出す。
    2.  `src/browser-integration.ts` (または同等のIPCファイル) を新規作成または改修し、`@glia/browser-manager` のAPIを呼び出す。

**タスク1.3: `@glia/browser-agent` のリファクタリング準備**
- **要求仕様**: `SPECIFICATION_COMPLETE.md` の「**第四層：ブラウザ自動化エージェント**」セクションに基づく。
- **具体的変更**: `src/engines/BaseEngine.ts` など、健全性チェックとエラー回復のインターフェースを定義するファイルを作成。

## 3. 絶対的な技術制約と前提
1.  **非エンジニア管理**: 生成するコードは、将来、別のLLMがメンテナンスしやすいように、**モジュール化が明確で、依存関係がシンプル**でなければならない。
2.  **既存構造の尊重**: 以下に示す既存のプロジェクト構造と依存関係を**変更してはならない**（新設を除く）。
3.  **Playwright依存**: 自動化の中核は `playwright: "^1.40.0"`。このバージョンと互換性のあるAPIを使用する。
4.  **TypeScript**: 全ての新規・改修コードはTypeScriptで記述する。

## 4. 現行プロジェクトの完全なスナップショット

### 4.1 仕様書
**以下の仕様書が唯一の情報源であり、これに全てが集約されている。**
/home/els/GLIA/GLIA-V1/SPECIFICATION/SPECIFICATION_COMPLETE.md

### 4.2 プロジェクト構造と主要ファイルの内容 (実行結果)
els@GMC:~/GLIA$ cd /home/els/GLIA/GLIA-V1 && echo "=== 1. プ ロジェクトルート構造 ===" && ls -la && echo "" && echo "=== 2. 主要パッケージ構造 ===" && (ls -la apps/electron-app/src/ 2>/dev/null | head -20 && echo "---" && ls -la packages/prompt-core/src/ 2>/dev/null && echo "---" && ls -la packages/browser-agent/src/ 2>/dev/null) && echo "" && echo "=== 3. 依存関 係の要: package.json ファイル ===" && (echo "--- apps/electron-app/package.json ---" && cat apps/electron-app/package.json && echo "" && echo "--- packages/prompt-core/package.json ---" && cat packages/prompt-core/package.json && echo "" && echo "--- packages/browser-agent/package.json ---" && cat packages/browser-agent/package.json) && echo "" && echo "=== 4. 統 合の要: 既存の主要統合ファイル ===" && (echo "--- apps/electron-app/src/integration.ts (存在すれば) ---" && cat apps/electron-app/src/integration.ts 2>/dev/null || echo "ファイルが存 在しません。") && echo "" && echo "--- integration-test/simple-integration.js ---" && cat integration-test/simple-integration.js 2>/dev/null || echo "ファイルが存在しません。"
=== 1. プロジェクトルート構造 ===
合計 72
drwxrwxr-x 7 els els  4096 12月  4 15:55 .
drwxrwxr-x 6 els els  4096 12月  4 05:04 ..
drwxrwxr-x 8 els els  4096 12月  4 04:47 .git
-rw-rw-r-- 1 els els   138 12月  4 04:47 .gitignore
-rw-rw-r-- 1 els els  4974 12月  4 05:17 SPECIFICATION.md
-rw-rw-r-- 1 els els  3303 12月  4 15:24 SPECIFICATION_251204.bak
-rw-rw-r-- 1 els els  8743 12月  4 15:52 SPECIFICATION_251204_2.bak
-rw-rw-r-- 1 els els 12658 12月  4 15:55 SPECIFICATION_COMPLETE.md
drwxrwxr-x 3 els els  4096 12月  4 04:15 apps
drwxrwxr-x 2 els els  4096 12月  4 04:42 integration-test
drwxrwxr-x 4 els els  4096 12月  4 04:08 packages
drwxrwxr-x 2 els els  4096 12月  4 04:10 shared

=== 2. 主要パッケージ構造 ===
合計 36
drwxrwxr-x 2 els els 4096 12月  4 06:19 .
drwxrwxr-x 5 els els 4096 12月  4 05:41 ..
-rw-rw-r-- 1 els els 1439 12月  4 05:03 floating-window.ts
-rw-rw-r-- 1 els els 2847 12月  4 06:19 integration.ts
-rw-rw-r-- 1 els els 2844 12月  4 06:19 integration.ts.backup
-rw-rw-r-- 1 els els 1855 12月  4 05:41 main.ts
-rw-rw-r-- 1 els els  803 12月  4 05:01 main.ts.backup
-rw-rw-r-- 1 els els 3766 12月  4 05:14 main.ts.backup2
-rw-rw-r-- 1 els els  500 12月  4 05:38 preload.js
---
合計 12
drwxrwxr-x 2 els els 4096 12月  4 04:21 .
drwxrwxr-x 5 els els 4096 12月  4 04:21 ..
-rw-rw-r-- 1 els els 1543 12月  4 04:21 index.ts
---
合計 16
drwxrwxr-x 2 els els 4096 12月  4 04:24 .
drwxrwxr-x 5 els els 4096 12月  4 05:36 ..
-rw-rw-r-- 1 els els 5696 12月  4 04:37 index.ts

=== 3. 依存関係の要: package.json ファイル ===
--- apps/electron-app/package.json ---
{
  "name": "glia-electron-app",
  "version": "1.0.0",
  "description": "GLIA Project - Main Electron Controller Application",
  "main": "dist/main.js",
  "scripts": {
    "build": "tsc",
    "start": "npm run build && electron .",
    "watch": "tsc -w"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "electron": "^28.0.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "electron-store": "^8.1.0"
  }
}

--- packages/prompt-core/package.json ---
{
  "name": "glia-prompt-core",
  "version": "0.1.0",
  "description": "GLIA Project - Core Prompt Synthesis Engine",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "test:basic": "npm run build && node test-basic.js"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  },
  "keywords": ["prompt", "ai", "llm", "synthesis"],
  "author": "",
  "license": "ISC"
}

--- packages/browser-agent/package.json ---
{
  "name": "glia-browser-agent",
  "version": "0.1.0",
  "description": "GLIA Project - Browser Automation Agent",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "test:safe": "npm run build && node test-safe.js",
    "test:deepseek": "npm run build && node test-deepseek.js",
    "install-browsers": "npx playwright install chromium"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "playwright": "^1.40.0"
  },
  "keywords": ["automation", "browser", "playwright"],
  "author": "",
  "license": "ISC"
}

=== 4. 統合の要: 既存の主要統合ファイル ===
--- apps/electron-app/src/integration.ts (存在すれば) ---
import { ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export function setupIntegration() {
  console.log('🔄 GLIA統合機能を設定');
  
  ipcMain.handle('synthesize-prompt', async (event, data) => {
    console.log('🔄 synthesize-prompt called:', data);
    return {
      success: true,
      synthesizedPrompt: data.naturalLanguage || 'テストプロンプト'
    };
  });
  
  ipcMain.handle('send-to-llm', async (event, data) => {
    console.log('🔄 IPC受信: send-to-llm', JSON.stringify(data, null, 2));
    
    try {
      // ★★★ 修正箇所: パスから余分な 'apps/' を削除 ★★★
      const browserAgentPath = path.join(
        __dirname, 
        '../../../packages/browser-agent/dist/index.js' // ここを修正
      );
      console.log('📁 モジュールパス:', browserAgentPath);
      console.log('✅ ファイル存在:', fs.existsSync(browserAgentPath));
      
      if (!fs.existsSync(browserAgentPath)) {
        console.log('❌ エラー: モジュールファイルが見つかりません');
        return { 
          success: false, 
          error: 'モジュールファイルが見つかりません',
          path: browserAgentPath
        };
      }
      
      console.log('🔄 モジュール読み込み試行...');
      const browserAgent = require(browserAgentPath);
      console.log('✅ モジュール読み込み成功');
      console.log('📦 エクスポート:', Object.keys(browserAgent));
      
      if (!browserAgent.BrowserAutomationAgent) {
        return { success: false, error: 'BrowserAutomationAgentクラスが見つかりません' };
      }
      
      console.log('🚀 DeepSeekテスト開始...');
      const agent = new browserAgent.BrowserAutomationAgent({ 
        headless: false,
        slowMo: 2000 
      });
      
      await agent.launch();
      console.log('✅ ブラウザ起動成功');
      
      const promptText = data.prompt || 'GLIAからのテストメッセージ';
      const result = await agent.injectPrompt({
        targetUrl: 'https://chat.deepseek.com',
        promptText: promptText,
        elementSelector: 'textarea, [contenteditable="true"], .ProseMirror',
        submitAfterInput: true
      });
      
      console.log('📊 投入結果:', result);
      
      setTimeout(async () => {
        await agent.close();
        console.log('✅ ブラウザ終了');
      }, 3000);
      
      return {
        success: result,
        message: result ? '送信成功！' : '送信に失敗しました',
        debug: 'ブラウザ操作完了'
      };
      
    } catch (error: any) {
      console.error('❌ 統合エラー詳細:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  });
}

--- integration-test/simple-integration.js ---
const path = require('path');

console.log('🚀 GLIA 3モジュール統合テスト\n');

try {
  // 1. プロンプト合成エンジン
  const promptCore = require('../packages/prompt-core/dist/index.js');
  console.log('✅ プロンプト合成エンジン: ロード成功');
  
  // 2. ブラウザエージェント
  const browserAgent = require('../packages/browser-agent/dist/index.js');
  console.log('✅ ブラウザエージェント: ロード成功');
  
  // 3. テスト実行
  const sampleSchema = promptCore.createSampleSchema();
  const input = {
    naturalLanguage: 'GLIA統合テストです。ファイル命名規則に従ってコードを書いてください。',
    selectedSchemas: [sampleSchema]
  };
  
  const synthesizedPrompt = promptCore.synthesizePrompt(input);
  console.log('\n📝 合成されたプロンプト（先頭100文字）:');
  console.log(synthesizedPrompt.substring(0, 100) + '...\n');
  
  console.log('🎯 統合テスト完了：3モジュール正常に連携可能');
  
} catch (error) {
  console.error('❌ 統合テスト失敗:', error.message);
  process.exit(1);
}