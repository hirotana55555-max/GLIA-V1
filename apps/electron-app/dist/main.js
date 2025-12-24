"use strict";
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
const electron_1 = require("electron");
const path = __importStar(require("path"));
let mainWindow = null;
electron_1.app.whenReady().then(() => {
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    // 開発モードでは開発者ツールを開く
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
    // 正しいパスでindex.htmlをロード
    // __dirnameは 'dist' ディレクトリなので、1つ上の階層のindex.htmlを参照
    mainWindow.loadFile(path.join(__dirname, '../index.html'));
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// アプリ終了時のクリーンアップ処理
electron_1.app.on('before-quit', async () => {
    console.log('🔄 GLIAアプリケーション終了処理');
    // BrowserManagerのクリーンアップ（オプション）
    try {
        const browserManagerPath = path.join(__dirname, '../../../packages/browser-manager/dist/index.js');
        if (require('fs').existsSync(browserManagerPath)) {
            const { BrowserManager } = require(browserManagerPath);
            const manager = BrowserManager.getInstance();
            await manager.cleanupAll({ forceKillProcesses: true });
            console.log('✅ BrowserManagerクリーンアップ完了');
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('⚠️ クリーンアップエラー:', error.message);
        }
        else {
            console.error('⚠️ クリーンアップエラー: 不明なエラー', error);
        }
    }
});
