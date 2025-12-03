// ブラウザ自動化エージェントのコアモジュール
// このパッケージは、Playwrightを使用してブラウザ操作を行います。
// プロンプトの内容やUIとは一切関わりません。

import { chromium, Browser, Page, BrowserContext } from 'playwright';

export interface BrowserAgentConfig {
  headless: boolean;
  slowMo?: number;
  userDataDir?: string; // ユーザーデータディレクトリ（ログイン状態保持用）
}

export interface InjectionRequest {
  targetUrl: string;
  promptText: string;
  elementSelector?: string;
  submitAfterInput?: boolean; // 入力後に送信するかどうか
}

export class BrowserAutomationAgent {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private config: BrowserAgentConfig;

  constructor(config: BrowserAgentConfig = { headless: false }) {
    this.config = config;
  }

  async launch(): Promise<void> {
    const launchOptions: any = {
      headless: this.config.headless,
      slowMo: this.config.slowMo
    };

    if (this.config.userDataDir) {
      launchOptions.args = [`--user-data-dir=${this.config.userDataDir}`];
    }

    this.browser = await chromium.launch(launchOptions);
    this.context = await this.browser.newContext();
    console.log('✅ ブラウザエージェント: 起動完了');
  }

  async injectPrompt(request: InjectionRequest): Promise<boolean> {
    if (!this.context) {
      throw new Error('エージェントが起動していません');
    }

    const page: Page = await this.context.newPage();
    
    try {
      await page.goto(request.targetUrl, { waitUntil: 'domcontentloaded' });
      
      // 入力欄を探す（複数のセレクタを試す）
      const selectors = [
        request.elementSelector,
        'textarea',
        '[contenteditable="true"]',
        'input[type="text"]',
        '.ProseMirror',
        '.input-area',
        'div[role="textbox"]'
      ].filter((selector): selector is string => selector !== undefined);

      let inputFound = false;
      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          await page.fill(selector, request.promptText);
          inputFound = true;
          console.log(`✅ 入力成功: ${selector}`);
          break;
        } catch (e) {
          continue;
        }
      }

      if (!inputFound) {
        console.warn('⚠️  入力欄が見つかりませんでした');
        return false;
      }

      // 必要に応じて送信
      if (request.submitAfterInput) {
        await page.keyboard.press('Enter');
        console.log('✅ Enterキーで送信');
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ エラー:', error.message);
      } else {
        console.error('❌ 未知のエラー:', error);
      }
      return false;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      console.log('✅ ブラウザエージェント: 終了');
    }
  }
}

// テスト用関数
export async function safeDemo() {
  console.log('🧪 安全なデモを開始します...');
  
  const agent = new BrowserAutomationAgent({ 
    headless: false, 
    slowMo: 1000 
  });

  try {
    await agent.launch();

    // 安全なテスト（実際のLLMではなくローカルテストページ）
    const testRequest: InjectionRequest = {
      targetUrl: 'https://example.com',
      promptText: 'GLIAブラウザエージェントテスト成功',
      elementSelector: 'body', // example.comには入力欄がないのでbodyにフォールバック
      submitAfterInput: false
    };

    const success = await agent.injectPrompt(testRequest);
    
    if (success) {
      console.log('🎉 基本機能テスト成功！');
      console.log('⚠️  実際のLLMを使用するには、targetUrlを変更してください');
    } else {
      console.log('⚠️  入力はできませんでしたが、ブラウザ起動は成功');
    }

    console.log('🔄 5秒後にブラウザを閉じます...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('デモエラー:', error);
  } finally {
    await agent.close();
  }
}

// DeepSeek用の特別なデモ（ログイン済み前提）
export async function deepseekDemo() {
  console.log('🔍 DeepSeekデモ（ログイン済み前提）');
  console.log('⚠️  事前に手動でDeepSeekにログインしている必要があります');
  
  const agent = new BrowserAutomationAgent({ 
    headless: false,
    slowMo: 2000,
    userDataDir: '/tmp/playwright-profile' // プロファイルを保存してログイン状態を保持
  });

  try {
    await agent.launch();

    const request: InjectionRequest = {
      targetUrl: 'https://chat.deepseek.com',
      promptText: 'こんにちは、これはGLIAからのテストです。',
      elementSelector: 'textarea, .ProseMirror, [contenteditable="true"]',
      submitAfterInput: true
    };

    console.log('🕒 DeepSeekに接続中...（時間がかかる場合があります）');
    const success = await agent.injectPrompt(request);
    
    if (success) {
      console.log('✅ DeepSeekデモ成功！');
      console.log('⏳ 応答を待っています...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
  } catch (error) {
    console.error('DeepSeekデモエラー:', error);
  } finally {
    await agent.close();
  }
}
