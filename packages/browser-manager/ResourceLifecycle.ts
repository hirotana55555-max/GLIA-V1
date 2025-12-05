/**
 * packages/browser-manager/src/ResourceLifecycle.ts
 * 簡易版リソースライフサイクル管理
 */

import { BrowserManager } from './BrowserManager';

export class ResourceLifecycle {
  private browserManager: BrowserManager;
  
  constructor(browserManager: BrowserManager) {
    this.browserManager = browserManager;
  }

  async withBrowserSession<T>(
    options: any,
    operation: (resources: {
      browserId: string;
      contextId: string;
      pageId: string;
      browser: any;
      context: any;
      page: any;
    }) => Promise<T>
  ): Promise<T> {
    let resources: any = null;
    
    try {
      resources = await this.browserManager.acquireResources(options);
      return await operation(resources);
    } finally {
      if (resources) {
        await this.browserManager.releaseResources(resources.pageId, true);
      }
    }
  }
}
