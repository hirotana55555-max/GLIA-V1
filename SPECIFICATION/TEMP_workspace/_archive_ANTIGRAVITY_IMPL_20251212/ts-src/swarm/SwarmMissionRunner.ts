import { BrowserManager } from "../browser-manager/BrowserManager";

export class SwarmMissionRunner {
  manager: BrowserManager;
  constructor() {
    this.manager = new BrowserManager();
  }

  async runMission(mission: any) {
    const pid = mission.pid || "P1";
    const ctx = "CTX1";
    const page = "PAGE1";
    this.manager.createBrowser(pid);
    this.manager.createContext(pid, ctx);
    this.manager.createPage(pid, ctx, page);
    const results: any[] = [];
    for (const action of mission.actions || []) {
      const r = await this.manager.runAction(pid, ctx, page, action);
      results.push(r);
    }
    return results;
  }
}
