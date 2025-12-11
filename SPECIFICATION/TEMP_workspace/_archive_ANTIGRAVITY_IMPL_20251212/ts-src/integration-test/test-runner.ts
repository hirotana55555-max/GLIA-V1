import { SwarmMissionRunner } from "../swarm/SwarmMissionRunner";

(async () => {
  const mission = { pid: "TS_TEST", actions: [{ type: "navigate", params: { url: "https://example.com" } }] };
  const runner = new SwarmMissionRunner();
  const res = await runner.runMission(mission);
  console.log(JSON.stringify(res, null, 2));
})();
