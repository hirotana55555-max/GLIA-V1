import { ResourcePool } from "./resource-pool";
import { BrowserProcess, ManagedBrowserContext, ManagedBrowserPage } from "./types";
import { AuditLogger } from "@glia/audit";

export type RunActionResult = { id: string; status: "ok" | "error"; detail?: any };

/**
 * Enhanced SIESessionManager that maps high-level SIE instructions to actual operations.
 */
export class SIESessionManager {
    private pool: ResourcePool;
    private audit: AuditLogger;

    constructor(pool: ResourcePool, audit: AuditLogger) {
        this.pool = pool;
        this.audit = audit;
    }

    // create context and page quick helpers
    async createContext(pid: string): Promise<ManagedBrowserContext> {
        const ctx: ManagedBrowserContext = {
            id: "ctx-" + Math.random().toString(36).slice(2),
            browserPid: pid,
            state: "CREATED",
            createdAt: Date.now(),
            lastActivityAt: Date.now(),
            pages: new Map(),
            metadata: {}
        };
        return ctx;
    }

    async createPage(context: ManagedBrowserContext): Promise<ManagedBrowserPage> {
        const pg: ManagedBrowserPage = {
            id: "page-" + Math.random().toString(36).slice(2),
            contextId: context.id,
            state: "CREATED",
            url: "about:blank",
            title: "New Page",
            createdAt: Date.now()
        };

        context.pages.set(pg.id, pg);
        return pg;
    }

    // Core: execute a single "action" against a page/context
    async runAction(proc: BrowserProcess, context: ManagedBrowserContext, page: ManagedBrowserPage, action: { action: string; target?: string; value?: string | null; meta?: any }): Promise<RunActionResult> {
        try {
            await this.audit.log({
                source: "BrowserManager",
                action: "runAction.start",
                payload: { pid: proc.pid, contextId: context.id, pageId: page.id, action }
            });

            let result: any = {};

            switch (action.action) {
                case "navigate": {
                    const url = action.target ?? "";
                    page.url = url;
                    page.state = "LOADED";

                    await new Promise(r => setTimeout(r, 100));
                    result = `navigated:${url}`;
                    break;
                }
                case "click": {
                    const selector = action.target ?? "";
                    await new Promise(r => setTimeout(r, 50));
                    result = `clicked:${selector}`;
                    break;
                }
                case "input": {
                    const selector = action.target ?? "";
                    const value = action.value ?? "";
                    await new Promise(r => setTimeout(r, 50));
                    result = `inputted:${selector}`;
                    break;
                }
                case "extract": {
                    const selector = action.target ?? "";
                    await new Promise(r => setTimeout(r, 30));
                    result = { extracted: `dummy text from ${selector}` };
                    break;
                }
                case "noop": {
                    result = { ok: true };
                    break;
                }
                default:
                    throw new Error(`Unknown action: ${action.action}`);
            }

            await this.audit.log({
                source: "BrowserManager",
                action: "runAction.end",
                payload: { pid: proc.pid, contextId: context.id, pageId: page.id, result: result }
            });

            return { id: page.id, status: "ok", detail: result };
        } catch (err: any) {
            await this.audit.log({
                source: "BrowserManager",
                action: "runAction.error",
                payload: { error: err.message, stack: err.stack }
            });
            return { id: page.id, status: "error", detail: err.message };
        }
    }
}
