// フローティングウィンドウの管理モジュール
import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

let floatingWindow: BrowserWindow | null = null;

export function createFloatingWindow() {
  if (floatingWindow) {
    floatingWindow.focus();
    return floatingWindow;
  }

  floatingWindow = new BrowserWindow({
    width: 500,
    height: 350,
    x: 100,  // 画面左端からの位置
    y: 100,  // 画面上端からの位置
    alwaysOnTop: true,
    frame: true,
    resizable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 簡易的なUIを表示
  floatingWindow.loadFile('floating.html');

  floatingWindow.on('closed', () => {
    floatingWindow = null;
  });

  return floatingWindow;
}

export function getFloatingWindow() {
  return floatingWindow;
}

export function closeFloatingWindow() {
  if (floatingWindow) {
    floatingWindow.close();
    floatingWindow = null;
  }
}

export function toggleFloatingWindow() {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    if (floatingWindow.isVisible()) {
      floatingWindow.hide();
    } else {
      floatingWindow.show();
      floatingWindow.focus();
    }
  } else {
    createFloatingWindow();
  }
}
