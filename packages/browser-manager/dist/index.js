"use strict";
/**
 * packages/browser-manager/src/index.ts
 *
 * エントリポイント：ビルド後に dist/index.js に出力されます。
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
// 名前付きエクスポート - 正しい再エクスポート構文
__exportStar(require("./types"), exports);
__exportStar(require("./BrowserManager"), exports);
__exportStar(require("./ProcessManager"), exports);
__exportStar(require("./MemoryProfiler"), exports);
__exportStar(require("./resource-pool"), exports);
__exportStar(require("./manager"), exports);
// デフォルトエクスポートとして再エクスポート
var BrowserManager_1 = require("./BrowserManager");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return BrowserManager_1.BrowserManager; } });
//# sourceMappingURL=index.js.map