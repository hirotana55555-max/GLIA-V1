export type Action = { type: string; params?: any };
export type Result = { ok: boolean; result?: any };

export class BrowserManager {
  browsers: Map<string, any> = new Map();

  createBrowser(pid: string) {
    const browser = { pid, contexts: new Map(), createdAt: Date.now() };
    this.browsers.set(pid, browser);
    return browser;
  }

  createContext(pid: string, contextId: string) {
    const browser = this.browsers.get(pid);
    if (!browser) throw new Error("Browser not found");
    const ctx = { id: contextId, pages: new Map(), createdAt: Date.now() };
    browser.contexts.set(contextId, ctx);
    return ctx;
  }

  createPage(pid: string, contextId: string, pageId: string) {
    const ctx = this.browsers.get(pid)?.contexts.get(contextId);
    if (!ctx) throw new Error("Context not found");
    const page = { id: pageId, state: "idle", createdAt: Date.now() };
    ctx.pages.set(pageId, page);
    return page;
  }

  async runAction(pid: string, contextId: string, pageId: string, action: Action): Promise<Result> {
    const { SIE } = await import("../../sie/SIE.js").catch(()=>({SIE: null}));
    if (SIE && SIE.execute) {
      return SIE.execute({ pid, contextId, pageId, action });
    }
    return { ok: true, result: "no-op" };
  }
}
