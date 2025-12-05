/**
 * packages/browser-agent/src/index.ts
 *
 * BrowserAutomationAgent をリファクタリング：
 * - 「単独で起動して操作するモード」と
 * - 「BrowserManager 経由で渡された BrowserContext を利用する管理モード」
 * を両方サポートします。
 *
 * 仕様互換性を保ちつつ、Managed モード時には BrowserManager がライフサイクルを管理する想定です。
 *
 * 使い方:
 *  - 単独起動: `const a = new BrowserAutomationAgent({ headless: true }); await a.launch();`
 *  - 管理モード: `const a = new BrowserAutomationAgent({ managedContext: context }); await a.injectPrompt({...});`
 *
 * 注意:
 *  - 管理モードの場合、close() はコンテキストを閉じない（ライフサイクルは BrowserManager に委譲）
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';

export interface BrowserAgentConfig {
  headless?: boolean;
  slowMo?: number;
  userDataDir?: string;
  managedContext?: BrowserContext; // 管理モード用。与えられると launch() はスキップ
}

export interface InjectionRequest {
  targetUrl: string;
  promptText: string;
  elementSelector?: string; // 単一またはカンマ区切りで指定
  submitAfterInput?: boolean;
  waitForResponseMs?: number;
}

export class BrowserAutomationAgent {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private config: BrowserAgentConfig;
  private managed: boolean = false;

  constructor(config: BrowserAgentConfig = { headless: true }) {
    this.config = config;
    if (config.managedContext) {
      this.context = config.managedContext;
      this.managed = true;
    }
  }

  /**
   * ランチ。managedContext が提供されている場合は何もしない。
   */
  public async launch(): Promise<void> {
    if (this.managed && this.context) {
      // 管理モード: 何もしない（BrowserManager がコンテキストライフサイクルを管理）
      return;
    }

    const launchOptions: any = {
      headless: this.config.headless ?? true,
      slowMo: this.config.slowMo ?? 0,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    };

    if (this.config.userDataDir) {
      launchOptions.args = [...launchOptions.args, `--user-data-dir=${this.config.userDataDir}`];
    }

    this.browser = await chromium.launch(launchOptions);
    this.context = await this.browser!.newContext(); // nullチェック済み
  }

  /**
   * 注入操作。context が null の場合は launch() を先に呼んでおくこと。
   * 返り値: true=成功, false=失敗
   */
  public async injectPrompt(request: InjectionRequest): Promise<boolean> {
    if (!this.context) {
      throw new Error('No browser context available. Call launch() or provide managedContext.');
    }

    const page: Page = await this.context.newPage();
    try {
      await page.goto(request.targetUrl, { waitUntil: 'domcontentloaded' });

      // 選択子リストの準備（カンマ区切りをサポート）
      const selectors = (request.elementSelector || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const fallback = ['textarea', '[contenteditable="true"]', 'input[type="text"]', '.ProseMirror', 'div[role="textbox"]'];
      const allSelectors = [...selectors, ...fallback];

      let found = false;
      for (const sel of allSelectors) {
        try {
          const el = await page.waitForSelector(sel, { timeout: 3000 });
          if (el) {
            // 可能なら fill()、できないなら evaluate で innerText を設定
            try {
              await el.fill(request.promptText);
            } catch (e) {
              // fill が効かない要素（contenteditable 等）の場合
              await el.evaluate((elNode, text) => {
                // TypeScriptのDOM型チェックを回避
                (elNode as HTMLElement).innerText = text;
              }, request.promptText);
            }
            found = true;
            break;
          }
        } catch (e) {
          // 試行錯誤を続ける
          const err = e as Error;
          console.log(`[BrowserAgent] セレクタ失敗: ${sel}`, err.message);
        }
      }

      if (!found) {
        // 最終フォールバック: body に注入（ほとんどの場合無意味だがログ用）
        await page.evaluate((text) => {
          // documentはブラウザコンテキスト内で有効
          if (typeof document !== 'undefined') {
            document.body.setAttribute('data-glia-temp', String(text).slice(0, 200));
          }
        }, request.promptText);
        return false;
      }

      // 送信
      if (request.submitAfterInput) {
        try {
          // 送信ボタンを探してクリック
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
            } catch (e) {
              const err = e as Error;
              console.log('[BrowserAgent] 送信方法失敗:', err.message);
              // continue
            }
          }
          if (!sent) {
            // Enter キーでの送信を試す
            await page.keyboard.press('Enter');
          }
        } catch (e) {
          // ignore
        }
      }

      // 応答を待つ（簡易）
      if (request.waitForResponseMs && request.waitForResponseMs > 0) {
        await page.waitForTimeout(request.waitForResponseMs);
      } else {
        await page.waitForTimeout(2000);
      }

      return true;
    } catch (err) {
      const error = err as Error;
      console.error('[BrowserAutomationAgent] injectPrompt error:', error);
      return false;
    } finally {
      // 管理モード以外ではページを閉じる。managedContext の場合もページは閉じるべき。
      try {
        await page.close();
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Managed モードでは何もしない（BrowserManager が context をクローズする）
   * Standalone モードでは browser を close する
   */
  public async close(): Promise<void> {
    if (this.managed) {
      // do not close context/browser here
      this.context = null;
      return;
    }
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (e) {
        // ignore
      } finally {
        this.browser = null;
        this.context = null;
      }
    }
  }

  /**
   * Attach to an externally provided context (BrowserManager の context を受け取る)
   */
  public attachToContext(context: BrowserContext) {
    this.context = context;
    this.managed = true;
  }
}

export default BrowserAutomationAgent;
