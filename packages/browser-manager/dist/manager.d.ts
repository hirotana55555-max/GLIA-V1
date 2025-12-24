import { ResourcePool } from "./resource-pool";
import { BrowserProcess, ManagedBrowserContext, ManagedBrowserPage } from "./types";
import { AuditLogger } from "@glia/audit";
export type RunActionResult = {
    id: string;
    status: "ok" | "error";
    detail?: any;
};
/**
 * Enhanced SIESessionManager that maps high-level SIE instructions to actual operations.
 */
export declare class SIESessionManager {
    private pool;
    private audit;
    constructor(pool: ResourcePool, audit: AuditLogger);
    createContext(pid: string): Promise<ManagedBrowserContext>;
    createPage(context: ManagedBrowserContext): Promise<ManagedBrowserPage>;
    runAction(proc: BrowserProcess, context: ManagedBrowserContext, page: ManagedBrowserPage, action: {
        action: string;
        target?: string;
        value?: string | null;
        meta?: any;
    }): Promise<RunActionResult>;
}
//# sourceMappingURL=manager.d.ts.map