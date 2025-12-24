/**
 * packages/browser-manager/src/ProcessManager.ts
 *
 * OSレベルのプロセス追跡・強制終了ユーティリティ。
 */
import type { Browser } from 'playwright';
export declare class ProcessManager {
    /**
     * Playwright Browser オブジェクトから PID を取得する（存在する最善の方法を複数試す）
     */
    static getBrowserPID(browser: Browser): number | undefined;
    /**
     * 指定 PID を安全に kill する
     */
    static killPID(pid: number, force?: boolean): boolean;
}
//# sourceMappingURL=ProcessManager.d.ts.map