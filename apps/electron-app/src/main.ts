import { app, BrowserWindow } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// アプリ終了時のクリーンアップ処理
app.on('before-quit', async () => {
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
    } catch (error) {
    if (error instanceof Error) {
      console.error('⚠️ クリーンアップエラー:', error.message);
    } else {
      console.error('⚠️ クリーンアップエラー: 不明なエラー', error);
    }
  }
});
