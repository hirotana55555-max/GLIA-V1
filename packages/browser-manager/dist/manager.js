"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIESessionManager = void 0;
/**
 * Enhanced SIESessionManager that maps high-level SIE instructions to actual operations.
 */
class SIESessionManager {
    constructor(pool, audit) {
        this.pool = pool;
        this.audit = audit;
    }
    // create context and page quick helpers
    async createContext(pid) {
        const ctx = {
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
    async createPage(context) {
        const pg = {
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
    async runAction(proc, context, page, action) {
        try {
            await this.audit.log({
                source: "BrowserManager",
                action: "runAction.start",
                payload: { pid: proc.pid, contextId: context.id, pageId: page.id, action }
            });
            let result = {};
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
        }
        catch (err) {
            await this.audit.log({
                source: "BrowserManager",
                action: "runAction.error",
                payload: { error: err.message, stack: err.stack }
            });
            return { id: page.id, status: "error", detail: err.message };
        }
    }
}
exports.SIESessionManager = SIESessionManager;
//# sourceMappingURL=manager.js.map