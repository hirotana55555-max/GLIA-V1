"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcePool = void 0;
class ResourcePool {
    constructor(options) {
        this.pool = [];
        this.busy = new Set();
        this.maxSize = options.maxSize;
        this.model = options.model;
    }
    async acquire() {
        const idle = this.pool.find(p => !this.busy.has(p.pid));
        if (idle) {
            this.busy.add(idle.pid);
            return idle;
        }
        if (this.pool.length < this.maxSize) {
            const proc = await this.launchBrowser();
            this.pool.push(proc);
            this.busy.add(proc.pid);
            return proc;
        }
        // Wait for a resource to become available
        // In a real system, you'd use an event emitter or a proper queue
        await new Promise(r => setTimeout(r, 50));
        return this.acquire();
    }
    release(pid) {
        this.busy.delete(pid);
    }
    async launchBrowser() {
        // In a real implementation, this would actually spawn a process via ChildProcess or Playwright
        return {
            pid: "pid-" + Math.random().toString(36).slice(2),
            model: this.model
        };
    }
}
exports.ResourcePool = ResourcePool;
//# sourceMappingURL=resource-pool.js.map