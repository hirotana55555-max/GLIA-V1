"use strict";
/**
 * packages/browser-agent/src/index.ts
 *
 * BrowserAutomationAgent - 修正版
 * userDataDirの扱いを修正
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserAutomationAgent = void 0;
const playwright_1 = require("playwright");
class BrowserAutomationAgent {
    constructor(config = { headless: true }) {
        this.browser = null;
        this.context = null;
        this.managed = false;
        this.config = config;
        if (config.managedContext) {
            this.context = config.managedContext;
            this.managed = true;
        }
    }
    /**
     * ランチ。userDataDirが指定されている場合はlaunchPersistentContextを使用
     */
    async launch() {
        if (this.managed && this.context) {
            return;
        }
        if (this.config.userDataDir) {
            // userDataDirが指定されている場合はlaunchPersistentContextを使用
            this.context = await playwright_1.chromium.launchPersistentContext(this.config.userDataDir, {
                headless: this.config.headless ?? true,
                slowMo: this.config.slowMo ?? 0,
                args: ['--no-sandbox', '--disable-dev-shm-usage'],
            });
            this.browser = this.context.browser();
        }
        else {
            const launchOptions = {
                headless: this.config.headless ?? true,
                slowMo: this.config.slowMo ?? 0,
                args: ['--no-sandbox', '--disable-dev-shm-usage'],
            };
            this.browser = await playwright_1.chromium.launch(launchOptions);
            this.context = await this.browser.newContext();
        }
    }
    /**
     * 注入操作
     */
    async injectPrompt(request) {
        if (!this.context) {
            throw new Error('No browser context available. Call launch() or provide managedContext.');
        }
        const page = await this.context.newPage();
        try {
            await page.goto(request.targetUrl, { waitUntil: 'domcontentloaded' });
            const selectors = (request.elementSelector || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
            const fallback = ['textarea', '[contenteditable="true"]', 'input[type="text"]', '.ProseMirror', 'div[role="textbox"]'];
            const allSelectors = [...selectors, ...fallback];
            let found = false;
            for (const sel of allSelectors) {
                try {
                    const el = await page.waitForSelector(sel, { timeout: 5000 });
                    if (el) {
                        try {
                            await el.fill(request.promptText);
                        }
                        catch (e) {
                            await el.evaluate((elNode, text) => {
                                elNode.innerText = text;
                            }, request.promptText);
                        }
                        found = true;
                        break;
                    }
                }
                catch (e) {
                    const err = e;
                    console.log(`[BrowserAgent] セレクタ失敗: ${sel}`, err.message);
                }
            }
            if (!found) {
                await page.evaluate((text) => {
                    if (typeof document !== 'undefined') {
                        document.body.setAttribute('data-glia-temp', String(text).slice(0, 200));
                    }
                }, request.promptText);
                return false;
            }
            if (request.submitAfterInput) {
                try {
                    const submitSelectors = ['button[type="submit"]', '[data-testid="send-button"]', 'button:has-text("Send")', 'button:has-text("送信")'];
                    let sent = false;
                    for (const s of submitSelectors) {
                        try {
                            const btn = await page.$(s);
                            if (btn) {
                                await btn.click();
                                sent = true;
                                break;
                            }
                        }
                        catch (e) {
                            const err = e;
                            console.log('[BrowserAgent] 送信方法失敗:', err.message);
                        }
                    }
                    if (!sent) {
                        await page.keyboard.press('Enter');
                    }
                }
                catch (e) {
                    // ignore
                }
            }
            if (request.waitForResponseMs && request.waitForResponseMs > 0) {
                await page.waitForTimeout(request.waitForResponseMs);
            }
            else {
                await page.waitForTimeout(2000);
            }
            return true;
        }
        catch (err) {
            const error = err;
            console.error('[BrowserAutomationAgent] injectPrompt error:', error);
            return false;
        }
        finally {
            try {
                await page.close();
            }
            catch (e) {
                // ignore
            }
        }
    }
    /**
     * クローズ
     */
    async close() {
        if (this.managed) {
            this.context = null;
            return;
        }
        if (this.browser) {
            try {
                await this.browser.close();
            }
            catch (e) {
                // ignore
            }
            finally {
                this.browser = null;
                this.context = null;
            }
        }
    }
    /**
     * 外部コンテキストをアタッチ
     */
    attachToContext(context) {
        this.context = context;
        this.managed = true;
    }
}
exports.BrowserAutomationAgent = BrowserAutomationAgent;
exports.default = BrowserAutomationAgent;
//# sourceMappingURL=index.js.map