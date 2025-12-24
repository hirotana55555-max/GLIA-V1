"use strict";
/**
 * apps/electron-app/src/integration.ts
 *
 * Electron 側の統合ハンドラーを BrowserManager v2 と browser-agent の Managed モードに対応させした更新版。
 *
 * - BrowserManager は dist にビルド済みであることを前提（packages/browser-manager/dist/index.js）
 * - browser-agent は dist にビルド済み（packages/browser-agent/dist/index.js）
 *
 * 実装ノート:
 * - 管理モードでは BrowserManager.acquireContext() で Context を取得し、Agent.attachToContext(context) して injectPrompt を呼ぶ
 * - エラーや例外時は manager.releaseContext() を忘れず、必要時は manager.cleanupAll() を呼ぶ
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIntegration = setupIntegration;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function setupIntegration() {
    console.log('🔄 GLIA 統合機能 初期化');
    // 動的パス（dist 配下を想定）
    const browserManagerPath = path.join(__dirname, '../../../packages/browser-manager/dist/index.js');
    const browserAgentPath = path.join(__dirname, '../../../packages/browser-agent/dist/index.js');
    let BrowserManagerModule = null;
    let BrowserAgentModule = null;
    function loadModules() {
        if (!fs.existsSync(browserManagerPath)) {
            console.error('❌ BrowserManager モジュールが見つかりません:', browserManagerPath);
            return false;
        }
        if (!fs.existsSync(browserAgentPath)) {
            console.error('❌ BrowserAgent モジュールが見つかりません:', browserAgentPath);
            return false;
        }
        try {
            BrowserManagerModule = require(browserManagerPath);
            BrowserAgentModule = require(browserAgentPath);
            return true;
        }
        catch (e) {
            console.error('❌ モジュールロード失敗:', e);
            return false;
        }
    }
    const modulesLoaded = loadModules();
    if (!modulesLoaded) {
        console.warn('⚠️ モジュールがロードできませんでした。後で再試行します。');
    }
    electron_1.ipcMain.handle('synthesize-prompt', async (event, data) => {
        // 既存の synthesize を呼ぶ（packages/prompt-core）
        try {
            const promptCorePath = path.join(__dirname, '../../../packages/prompt-core/dist/index.js');
            if (!fs.existsSync(promptCorePath)) {
                return { success: false, error: 'prompt-core が見つかりません' };
            }
            const promptCore = require(promptCorePath);
            const sampleSchema = typeof promptCore.createSampleSchema === 'function' ? promptCore.createSampleSchema() : null;
            const input = {
                naturalLanguage: data.naturalLanguage || 'テストプロンプト',
                selectedSchemas: sampleSchema ? [sampleSchema] : []
            };
            const synthesized = typeof promptCore.synthesizePrompt === 'function' ? promptCore.synthesizePrompt(input) : (data.naturalLanguage || 'テストプロンプト');
            return { success: true, synthesizedPrompt: synthesized };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    });
    electron_1.ipcMain.handle('send-to-llm', async (event, data) => {
        // ensure modules loaded
        if (!BrowserManagerModule || !BrowserAgentModule) {
            if (!loadModules()) {
                return { success: false, error: '内部モジュールをロードできません' };
            }
        }
        const BrowserManagerClass = BrowserManagerModule.BrowserManager || BrowserManagerModule.default || BrowserManagerModule;
        const BrowserAgentClass = BrowserAgentModule.BrowserAutomationAgent || BrowserAgentModule.default || BrowserAgentModule;
        const manager = BrowserManagerClass.getInstance();
        // Acquire a clean context for robustness
        let context = null;
        try {
            context = await manager.acquireContext({ requireCleanContext: true, reuseExisting: false });
        }
        catch (e) {
            return { success: false, error: 'コンテキスト取得失敗:' + String(e) };
        }
        // Use agent in managed mode (attach to context)
        const agent = new BrowserAgentClass({ managedContext: context });
        try {
            // no need to call agent.launch() in managed mode
            const promptText = data.prompt || 'GLIAからのテストメッセージ';
            const req = {
                targetUrl: data.targetUrl || 'https://chat.deepseek.com',
                promptText,
                elementSelector: data.elementSelector || 'textarea, [contenteditable="true"], .ProseMirror',
                submitAfterInput: data.submitAfterInput ?? true,
                waitForResponseMs: data.waitForResponseMs ?? 3000,
            };
            const success = await agent.injectPrompt(req);
            // Inform manager that context usage is done
            manager.releaseContext(context);
            return {
                success,
                message: success ? '送信成功' : '送信失敗（入力要素未発見等）',
            };
        }
        catch (err) {
            // On error, attempt cleanup
            try {
                manager.releaseContext(context);
            }
            catch (e) {
                // ignore
            }
            return { success: false, error: String(err) };
        }
        finally {
            try {
                await agent.close();
            }
            catch (e) {
                // ignore
            }
        }
    });
    electron_1.ipcMain.handle('get-resource-stats', async () => {
        if (!BrowserManagerModule) {
            if (!loadModules())
                return { success: false, error: 'BrowserManager 未ロード' };
        }
        const BrowserManagerClass = BrowserManagerModule.BrowserManager || BrowserManagerModule.default || BrowserManagerModule;
        const stats = BrowserManagerClass.getInstance().getResourcePoolStats();
        return { success: true, stats, timestamp: new Date().toISOString() };
    });
    electron_1.ipcMain.handle('force-cleanup', async (evt, opts) => {
        if (!BrowserManagerModule) {
            if (!loadModules())
                return { success: false, error: 'BrowserManager 未ロード' };
        }
        const BrowserManagerClass = BrowserManagerModule.BrowserManager || BrowserManagerModule.default || BrowserManagerModule;
        try {
            await BrowserManagerClass.getInstance().cleanupAll({ forceKillProcesses: opts?.forceKillProcesses ?? false, timeoutMs: opts?.timeoutMs ?? 10000 });
            return { success: true, message: 'クリーンアップ完了' };
        }
        catch (e) {
            return { success: false, error: String(e) };
        }
    });
}
