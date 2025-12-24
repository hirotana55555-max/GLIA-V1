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
exports.createFloatingWindow = createFloatingWindow;
exports.getFloatingWindow = getFloatingWindow;
exports.closeFloatingWindow = closeFloatingWindow;
exports.toggleFloatingWindow = toggleFloatingWindow;
// フローティングウィンドウの管理モジュール
const electron_1 = require("electron");
const path = __importStar(require("path"));
let floatingWindow = null;
function createFloatingWindow() {
    if (floatingWindow) {
        floatingWindow.focus();
        return floatingWindow;
    }
    floatingWindow = new electron_1.BrowserWindow({
        width: 500,
        height: 350,
        x: 100, // 画面左端からの位置
        y: 100, // 画面上端からの位置
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
function getFloatingWindow() {
    return floatingWindow;
}
function closeFloatingWindow() {
    if (floatingWindow) {
        floatingWindow.close();
        floatingWindow = null;
    }
}
function toggleFloatingWindow() {
    if (floatingWindow && !floatingWindow.isDestroyed()) {
        if (floatingWindow.isVisible()) {
            floatingWindow.hide();
        }
        else {
            floatingWindow.show();
            floatingWindow.focus();
        }
    }
    else {
        createFloatingWindow();
    }
}
