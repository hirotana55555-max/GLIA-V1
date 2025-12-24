"use strict";
/**
 * packages/browser-manager/src/ProcessManager.ts
 *
 * OSレベルのプロセス追跡・強制終了ユーティリティ。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessManager = void 0;
class ProcessManager {
    /**
     * Playwright Browser オブジェクトから PID を取得する（存在する最善の方法を複数試す）
     */
    static getBrowserPID(browser) {
        try {
            // Playwright の公開 API: browser.process() -> ChildProcess (Chromium only)
            const maybeProcess = browser.process?.();
            if (maybeProcess && typeof (maybeProcess.pid) === 'number') {
                return maybeProcess.pid;
            }
        }
        catch (e) {
            // ignore
        }
        try {
            // プライベート領域の探索（コア実装に依存する）
            const internalProcess = browser._process || browser.process;
            if (internalProcess && typeof internalProcess.pid === 'number') {
                return internalProcess.pid;
            }
        }
        catch (e) {
            // ignore
        }
        // 最後の手段: Browser オブジェクトの launchedProcess/childProcess 系プロパティをチェック
        try {
            const child = browser._childProcess || browser.__childProcess;
            if (child && typeof child.pid === 'number') {
                return child.pid;
            }
        }
        catch (e) {
            // ignore
        }
        return undefined;
    }
    /**
     * 指定 PID を安全に kill する
     */
    static killPID(pid, force = true) {
        try {
            // eslint-disable-next-line node/no-process-exit
            if (process.platform === 'win32') {
                // Windows: taskkill を試す（sync ではなく spawn が望ましいが簡便のため）
                const spawnSync = require('child_process').spawnSync;
                const cmd = force ? ['taskkill', '/PID', String(pid), '/F'] : ['taskkill', '/PID', String(pid)];
                const res = spawnSync(cmd[0], cmd.slice(1));
                return res.status === 0;
            }
            else {
                // Unix: SIGKILL または SIGTERM
                process.kill(pid, force ? 'SIGKILL' : 'SIGTERM');
                return true;
            }
        }
        catch (err) {
            // 失敗（既に死んでいる等）
            return false;
        }
    }
}
exports.ProcessManager = ProcessManager;
//# sourceMappingURL=ProcessManager.js.map