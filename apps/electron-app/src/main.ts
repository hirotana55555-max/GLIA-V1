/**
 * apps/electron-app/src/main.ts
 * 
 * Electronメインエントリーポイント - 更新版
 * アプリケーション終了時にBrowserManagerの確実なクリーンアップを実行
 */

import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { setupIntegration } from './integration';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// アプリケーションの単一インスタンスを保証
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // 2つ目のインスタンスが起動しようとした場合、既存のウィンドウをフォーカス
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    setupTray();
    setupIntegration(); // GLIA統合機能のセットアップ
  });
}

// 全ウィンドウが閉じられたときの処理
app.on('window-all-closed', () => {
  // macOSではCmd+Qで明示的に終了するまでアプリを残す
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// アプリケーション終了前のクリーンアップ
app.on('before-quit', async (event) => {
  console.log('🔄 アプリケーション終了前のクリーンアップを開始します...');
  
  // BrowserManagerのクリーンアップを実行（forceKillProcesses: trueで確実に終了）
  try {
    const browserManagerPath = path.join(__dirname, '../../../packages/browser-manager/dist/index.js');
    if (fs.existsSync(browserManagerPath)) {
      const { BrowserManager } = require(browserManagerPath);
      const manager = BrowserManager.getInstance();
      
      console.log('🧹 BrowserManagerの全リソースをクリーンアップします...');
      await manager.cleanupAll({ 
        forceKillProcesses: true,
        timeoutMs: 10000 
      });
      console.log('✅ BrowserManagerクリーンアップ完了');
    }
  } catch (error) {
    console.error('❌ BrowserManagerクリーンアップ中にエラー:', error);
    // エラーがあっても終了は続行
  }
});

// アクティベート時の処理（macOS）
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 300,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: true,
    title: 'GLIA - Generative Language Integration Assistant',
    icon: path.join(__dirname, '../assets/icon.png')
  });

  // 開発モードでは開発者ツールを開く
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // メニューの設定（シンプル化）
  const menu = Menu.buildFromTemplate([
    {
      label: 'GLIA',
      submenu: [
        {
          label: '終了',
          click: () => app.quit()
        }
      ]
    },
    {
      label: '表示',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);

  // メインHTMLのロード
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupTray() {
  if (process.platform === 'linux') {
    // Linuxではトレイアイコンをサポートしない場合がある
    return;
  }

  const iconPath = path.join(__dirname, '../assets/tray-icon.png');
  
  // アイコンファイルが存在するか確認
  if (!fs.existsSync(iconPath)) {
    console.warn('トレイアイコンファイルが見つかりません:', iconPath);
    return;
  }

  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'GLIAを表示',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'リソース統計',
      click: async () => {
        // IPC経由でリソース統計を取得して表示
        if (mainWindow) {
          mainWindow.webContents.send('show-resource-stats');
        }
      }
    },
    { type: 'separator' },
    {
      label: '終了',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('GLIA - Generative Language Integration Assistant');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}
