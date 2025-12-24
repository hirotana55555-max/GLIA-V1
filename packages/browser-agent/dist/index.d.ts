/**
 * packages/browser-agent/src/index.ts
 *
 * BrowserAutomationAgent - 修正版
 * userDataDirの扱いを修正
 */
import { BrowserContext } from 'playwright';
export interface BrowserAgentConfig {
    headless?: boolean;
    slowMo?: number;
    userDataDir?: string;
    managedContext?: BrowserContext;
}
export interface InjectionRequest {
    targetUrl: string;
    promptText: string;
    elementSelector?: string;
    submitAfterInput?: boolean;
    waitForResponseMs?: number;
}
export declare class BrowserAutomationAgent {
    private browser;
    private context;
    private config;
    private managed;
    constructor(config?: BrowserAgentConfig);
    /**
     * ランチ。userDataDirが指定されている場合はlaunchPersistentContextを使用
     */
    launch(): Promise<void>;
    /**
     * 注入操作
     */
    injectPrompt(request: InjectionRequest): Promise<boolean>;
    /**
     * クローズ
     */
    close(): Promise<void>;
    /**
     * 外部コンテキストをアタッチ
     */
    attachToContext(context: BrowserContext): void;
}
export default BrowserAutomationAgent;
