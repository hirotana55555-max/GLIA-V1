const { GliaApiClient } = require('../packages/api-client/dist/index.js');
const { MissionSchema, ProposalSchema, CritiqueSchema } = require('../packages/toon/dist/index.js');
const process = require('process');
const crypto = require('crypto');

async function main() {
    console.log("🚀 Starting Peer Review Prototype...");

    // Generate IDs
    const missionId = crypto.randomUUID();
    const proposalId = crypto.randomUUID();

    // 1. Define a Mission (Quest)
    const mission = {
        id: missionId,
        title: "Write a Haiku about Rust",
        description: "Write a haiku that captures the essence of the Rust programming language.",
        evaluation_prompt: "Evaluate the haiku based on 1) Adherence to 5-7-5 structure, 2) Mention of safety or speed, 3) Poetic quality. Scold generic outputs.",
        created_at: new Date().toISOString(),
        created_by: "human"
    };

    // Validate Mission
    const validatedMission = MissionSchema.parse(mission);
    console.log("\n✅ Mission Validated:", validatedMission.title);

    // 2. Define a Proposal (Solution from Executor)
    // In a real swarm, this would come from another LLM call.
    const proposal = {
        id: proposalId,
        mission_id: missionId,
        author_id: "agent-executor-01",
        content: "Memory safe and fast\nBorrow checker is your friend\nSystems programming",
        reasoning: "I focused on memory safety and the borrow checker as key traits.",
        created_at: new Date().toISOString()
    };

    // Validate Proposal
    const validatedProposal = ProposalSchema.parse(proposal);
    console.log("\n✅ Proposal Validated:", validatedProposal.content.replace(/\n/g, ' / '));

    // 3. Critcize (Reviewer Agent)
    console.log("\n🤔 Reviewer Agent is analyzing...");

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.warn("⚠️  No OPENROUTER_API_KEY found. Skipping actual API call.");
        console.log("--- MOCKED REVIEW ---");
        console.log("Score: 95");
        console.log("Feedback: Excellent structure and content.");
        return;
    }

    const client = new GliaApiClient(apiKey);

    try {
        const result = await client.jsonCompletion([
            { role: 'user', content: "Perform the review now." }
        ], {
            model: 'qwen/qwen-2.5-72b-instruct',
            temperature: 0.1 // Low temp for rigid evaluation
        });

        // Construct valid TOON Critique
        const critique = {
            id: crypto.randomUUID(),
            proposal_id: proposalId,
            reviewer_id: "agent-reviewer-01",
            feedback: result.feedback,
            score: result.score,
            created_at: new Date().toISOString()
        };

        const validatedCritique = CritiqueSchema.parse(critique);
        console.log("\n🔍 Verification Result (from LLM):");
        console.log("Score:", validatedCritique.score);
        console.log("Feedback:", validatedCritique.feedback);

    } catch (err) {
        console.error("❌ API Call Failed:", err.message);
    }
}

main();
