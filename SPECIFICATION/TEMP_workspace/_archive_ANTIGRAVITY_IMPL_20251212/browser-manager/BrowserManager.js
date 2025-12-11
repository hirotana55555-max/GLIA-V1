// BrowserManager - MVP 実装版（実行環境: Antigravity）
// 完全分離3.5層構造：browser → context → page
// runAction() は TOON Mission の実ミッションを受けて sandbox 実行へ mapping

export class BrowserManager {
  constructor() {
    this.browsers = new Map();
  }

  createBrowser(pid) {
    const browser = {
      pid,
      contexts: new Map(),
      createdAt: Date.now()
    };
    this.browsers.set(pid, browser);
    return browser;
  }

  createContext(pid, contextId) {
    const browser = this.browsers.get(pid);
    if (!browser) throw new Error("Browser not found");
    const ctx = {
      id: contextId,
      pages: new Map(),
      createdAt: Date.now()
    };
    browser.contexts.set(contextId, ctx);
    return ctx;
  }

  createPage(pid, contextId, pageId) {
    const ctx = this.browsers.get(pid)?.contexts.get(contextId);
    if (!ctx) throw new Error("Context not found");
    const page = {
      id: pageId,
      state: "idle",
      createdAt: Date.now()
    };
    ctx.pages.set(pageId, page);
    return page;
  }

  // 🚀 TOON ミッションの Action → 実 Exec mapping
  async runAction(pid, contextId, pageId, action) {
    // SIE Executor に委譲（安全サンドボックス）
    const { SIE } = await import("../sie/SIE.js");
    return await SIE.execute({ pid, contextId, pageId, action });
  }
}
