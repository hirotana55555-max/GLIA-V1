const { SwarmOrchestrator } = require("@glia/swarm");

async function main() {
    console.log("=== Starting GLIA Swarm End-to-End Test ===");

    // 1. Initialize Orchestrator
    const apiKey = process.env.OPENROUTER_API_KEY || "mock-key";
    const orchestrator = new SwarmOrchestrator(apiKey);

    // 2. Define a Mission
    const mission = {
        id: "mission-" + Date.now(),
        title: "Find Google DeepMind",
        description: "Navigate to google.com and search for 'DeepMind'",
        evaluation_prompt: "Verify that the search results page contains DeepMind website link.",
        created_at: new Date().toISOString(),
        created_by: "antigravity-test"
    };

    try {
        // 3. Run Mission
        console.log("Dispatching mission...");
        const scoreCard = await orchestrator.runMission(mission);

        // 4. Output Result
        console.log("=== Mission Completed ===");
        console.log("Status:", scoreCard.status);
        console.log("Score:", scoreCard.average_score);
        console.log("Comments:", scoreCard.final_comment);

        if (scoreCard.status === "ACCEPTED") {
            console.log("SUCCESS: Mission accepted.");
            process.exit(0);
        } else {
            console.error("FAILURE: Mission rejected.");
            process.exit(1);
        }

    } catch (error) {
        console.error("CRITICAL FAILURE:", error);
        process.exit(1);
    } finally {
        orchestrator.close();
    }
}

main();
