// SwarmMissionRunner - TOON Swarm から BrowserManager.runAction を束ねる

import { BrowserManager } from "../browser-manager/BrowserManager.js";

export class SwarmMissionRunner {
  constructor() {
    this.manager = new BrowserManager();
  }

  async runMission(mission) {
    const pid = mission.pid || "P1";
    const ctx = "CTX1";
    const page = "PAGE1";

    this.manager.createBrowser(pid);
    this.manager.createContext(pid, ctx);
    this.manager.createPage(pid, ctx, page);

    const results = [];
    for (const action of mission.actions) {
      const r = await this.manager.runAction(pid, ctx, page, action);
      results.push(r);
    }
    return results;
  }
}
