import { BrowserProcess } from "./types";
export interface ResourcePoolOptions {
    maxSize: number;
    model: "chromium" | "firefox";
}
export declare class ResourcePool {
    private pool;
    private busy;
    private maxSize;
    private model;
    constructor(options: ResourcePoolOptions);
    acquire(): Promise<BrowserProcess>;
    release(pid: string): void;
    private launchBrowser;
}
//# sourceMappingURL=resource-pool.d.ts.map