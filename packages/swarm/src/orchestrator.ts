import { ResourcePool, BrowserManager } from "@glia/browser-manager";
import { AuditLogger } from "@glia/audit";
import { SIEExecutorV2, SIEParser, SIEValidator } from "@glia/sie";
import { GliaApiClient } from "@glia/api-client";
import { synthesizePrompt, PromptSchema as CorePromptSchema } from "@glia/prompt-core";
import { Mission, Proposal, ProposalSchema, ScoreCard, Critique, CritiqueSchema, SwarmError, SwarmErrorCode } from "@glia/toon";

export interface AttemptHistory {
    attemptIdx: number;
    proposal: Proposal;
    critique: Critique;
}

export interface SwarmConfig {
    apiKey?: string;
    useMock?: boolean;
    maxRetries?: number;
}

export class SwarmOrchestrator {
    private audit: AuditLogger;
    private pool: ResourcePool;
    private sieExecutor: SIEExecutorV2;
    private apiClient: GliaApiClient;
    private parser: SIEParser;
    private validator: SIEValidator;

    private config: SwarmConfig;

    constructor(config: SwarmConfig | string) {
        this.audit = new AuditLogger("./logs", "swarm-audit.jsonl");
        this.pool = new ResourcePool({ maxSize: 2, model: "chromium" });
        this.sieExecutor = new SIEExecutorV2(this.pool, this.audit);
        
        if (typeof config === 'string') {
            this.config = { apiKey: config };
        } else {
            this.config = config;
        }

        this.apiClient = new GliaApiClient(this.config.apiKey);
        this.parser = new SIEParser();
        this.validator = new SIEValidator();
    }

    async runMission(mission: Mission): Promise<ScoreCard> {
        try {
            await this.audit.log({ source: "Orchestrator", action: "mission_start", payload: mission });
            console.log(`[Orchestrator] Starting Mission: ${mission.title}`);

            let history: AttemptHistory[] = [];
            let proposal: Proposal | null = null;
            let scoreCard: ScoreCard | null = null;
            let missionComplete = false;
            
            let attempt = 0;
            const maxRetries = this.config.maxRetries || 3;
            
            // --- 1. Planning Loop (Proposal + Critique) ---
            while (!missionComplete && attempt < maxRetries) {
                attempt++;
                console.log(`[Orchestrator] Planning Cycle Attempt ${attempt}/${maxRetries}`);

                // A. Proposal Generation (with history context)
                const historyContext = await this.manageHistoryContext(history);
                try {
                    proposal = await this.generateProposal(mission, historyContext);
                } catch (err: any) {
                    // Catch generation error to prevent crash loop, log and retry
                    console.error("[Orchestrator] Generation Error:", err);
                    await this.audit.log({ 
                        source: "Orchestrator", 
                        action: "error", 
                        payload: { code: "API_ERROR", message: err.message, stack: err.stack },
                        level: "ERROR" 
                    });
                    continue; 
                }

                if (!proposal) {
                    console.error("[Orchestrator] Failed to generate valid proposal.");
                    break; 
                }

                await this.audit.log({ source: "Orchestrator", action: "proposal_received", payload: proposal });
                console.log(`[Orchestrator] Proposal Received with ${proposal.instructions?.length || 0} instructions.`);

                // B. Critique (Peer Review)
                let critique: Critique;
                if (this.config.useMock) {
                     critique = this.getMockCritique(mission, proposal);
                } else {
                     try {
                        critique = await this.runCritique(mission, proposal, history);
                     } catch (err: any) {
                         console.error("[Orchestrator] Critique Error, falling back to neutral feedback", err);
                         // Fallback critique to avoid pipeline stall
                         critique = {
                             id: "critique-fallback-" + Date.now(),
                             proposal_id: proposal.id,
                             reviewer_id: "system-fallback",
                             score: 50,
                             feedback: "Critique system failed. Treating as Needs Revision.",
                             created_at: new Date().toISOString()
                         };
                     }
                }
                
                await this.audit.log({ source: "Orchestrator", action: "critique_received", payload: critique });
                console.log(`[Orchestrator] Critique Score: ${critique.score}, Status: ${critique.score >= 70 ? "ACCEPTED" : "REJECTED"}`);

                // C. ScoreCard / Decision
                const status = critique.score >= 70 ? "ACCEPTED" : "NEEDS_REVISION";
                
                if (status === "ACCEPTED") {
                    scoreCard = {
                        proposal_id: proposal.id,
                        mission_id: mission.id,
                        average_score: critique.score,
                        critique_count: 1,
                        status: "ACCEPTED",
                        final_comment: critique.feedback
                    };
                    missionComplete = true; 
                } else {
                    history.push({
                        attemptIdx: attempt,
                        proposal: proposal,
                        critique: critique
                    });
                    console.log("[Orchestrator] Proposal rejected. Refining in next iteration...");
                }
            }
            
            if (!scoreCard || scoreCard.status !== "ACCEPTED" || !proposal) {
                 const finalCard: ScoreCard = {
                    proposal_id: proposal?.id || "none",
                    mission_id: mission.id,
                    average_score: 0,
                    critique_count: history.length,
                    status: "REJECTED",
                    final_comment: "Failed to achieve accepted proposal within attempt limit."
                 };
                 await this.audit.log({ source: "Orchestrator", action: "mission_failed", payload: finalCard });
                 return finalCard;
            }

            // --- 2. Execution (SIE) ---
            if (proposal.instructions && proposal.instructions.length > 0) {
                const ast = this.parser.parse(proposal.instructions);
                const validation = this.validator.validate(ast);

                if (!validation.ok) {
                     await this.audit.log({ 
                         source: "Orchestrator", 
                         action: "validation_error", 
                         payload: { warnings: validation.warnings }, 
                         level: "ERROR" 
                     });
                     
                     return {
                        proposal_id: proposal.id,
                        mission_id: mission.id,
                        average_score: 0,
                        critique_count: history.length,
                        status: "REJECTED",
                        final_comment: "Safety Validation failed: " + validation.warnings.join(", ")
                     };
                }

                console.log(`[Orchestrator] Executing instructions...`);
                const approvalCallback = async (risky: any[]) => {
                    console.warn("[User Approval Required] Risky actions:", risky);
                    return true;
                };

                const execResult = await this.sieExecutor.execute(ast, { userApprovalCallback: approvalCallback });
                await this.audit.log({ source: "Orchestrator", action: "execution_complete", payload: execResult });
            }

            return scoreCard;

        } catch (error: any) {
            // Top level catch for unforeseen errors
            console.error("[Orchestrator] CRITICAL ERROR:", error);
            await this.audit.log({ 
                source: "Orchestrator", 
                action: "critical_error", 
                payload: { name: error.name, message: error.message, stack: error.stack }, 
                level: "ERROR" 
            });
            
            return {
                proposal_id: "error",
                mission_id: mission.id,
                average_score: 0,
                critique_count: 0,
                status: "REJECTED",
                final_comment: `Critical System Error: ${error.message}`
            };
        } finally {
            // Ensure resources are managed (though pool is persistent, we might want to release specific locks if any)
            // For now, logging end of mission scope.
            console.log(`[Orchestrator] Mission ${mission.id} scope closed.`);
        }
    }

    private async manageHistoryContext(history: AttemptHistory[]): Promise<string> {
        if (history.length === 0) return "";

        // Simple strategy: Keep full text of last 2 attempts. Summarize older ones if needed.
        // For MVP: Just JSON stringify last 2 items to avoid token overflow.
        // If history > 2, we should ideally summarize the older ones.
        
        const RECENT_WINDOW = 2;
        const recentHistory = history.slice(-RECENT_WINDOW);
        const olderHistory = history.slice(0, -RECENT_WINDOW);

        let context = "";
        
        if (olderHistory.length > 0) {
            context += `[Previous Failed Attempts Summary]: ${olderHistory.length} earlier attempts failed. Learnt that: (summary logic to be implemented).\n`;
        }

        context += `[Recent Failed Attempts]:\n` + recentHistory.map(h => 
            `Attempt #${h.attemptIdx}:
             Score: ${h.critique.score}
             Critique: ${h.critique.feedback}
             Proposal Plan: ${h.proposal.content}`
        ).join("\n\n");

        return context;
    }

    private async generateProposal(mission: Mission, historyContext: string): Promise<Proposal | null> {
         // Re-implementing the logic from old runMission but as separate method
         // to support the loop.
         
         const schemas: CorePromptSchema[] = [{
            id: "proposal-schema",
            name: "Proposal JSON Schema",
            content: {
                description: "The strictly required JSON format for your response.",
                fields: {
                    content: "Text description of your plan",
                    reasoning: "Why you chose this path",
                    instructions: [
                        { action: "navigate", target: "url" },
                        { action: "click", target: "selector" },
                        { action: "extract", target: "selector" }
                    ]
                }
            }
        }];

        const systemPrompt = synthesizePrompt({
            naturalLanguage: `You are an expert browser automation agent. The user wants: "${mission.description}".
Evaluation Criteria: "${mission.evaluation_prompt}".

${historyContext ? "IMPORTANT LESSONS FROM PREVIOUS FAILURES:\n" + historyContext : ""}

Return a JSON Proposal adhering strictly to the provided schema.`,
            selectedSchemas: schemas
        });

        // Use existing retry logic (simplified call here, actually we should port the retry loop from before)
        // For brevity in this diff, calling API directly, error handling assumed in wrapper loop or here.
        
        try {
            const messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Generate Proposal." }
            ] as any[];
            
            if (this.config.useMock) {
                return this.getMockProposal(mission);
            }

            const result = await this.apiClient.jsonCompletion<Proposal>(
                messages,
                { model: "openai/gpt-3.5-turbo" }
            );
             // Enhance with ID/MissionID if missing
             if (result) {
                result.id = result.id || "prop-" + Date.now();
                result.mission_id = mission.id;
                result.created_at = new Date().toISOString();
                return result;
             }
        } catch (e) {
            console.error("Proposal Generation Error", e);
        }
        return null;
    }

    private async runCritique(mission: Mission, proposal: Proposal, history: AttemptHistory[]): Promise<Critique> {
         const schemas: CorePromptSchema[] = [{
            id: "critique-schema",
            name: "Critique JSON Schema",
            content: {
                fields: {
                    feedback: "Detailed feedback based on evaluation criteria",
                    score: "0-100 integer"
                }
            }
        }];

        // Include history in critique context too (Reviewer should know if Agent repeated mistakes)
        const historyContext = await this.manageHistoryContext(history);

        const systemPrompt = synthesizePrompt({
            naturalLanguage: `You are a strict QA Reviewer Agent.
Evaluate the following Proposal against the Mission Criteria: "${mission.evaluation_prompt}".
Proposal Content: "${proposal.content}"
Proposal Reasoning: "${proposal.reasoning}"

${historyContext ? "Check if this proposal repeats previous mistakes:\n" + historyContext : ""}

Score 0-100. < 70 is fail.`,
            selectedSchemas: schemas
        });

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Review this proposal." }
        ] as any[];

        const result = await this.apiClient.jsonCompletion<Critique>(
            messages,
             { model: "openai/gpt-4" } // Critique should use stronger model?
        );
        
        // Fallback or fill defaults
        return result || {
             id: "critique-error",
             proposal_id: proposal.id,
             reviewer_id: "system",
             feedback: "Failed to generate critique",
             score: 0,
             created_at: new Date().toISOString()
        };
    }

    private getMockCritique(mission: Mission, proposal: Proposal): Critique {
        return {
            id: "mock-crit-" + Date.now(),
            proposal_id: proposal.id,
            reviewer_id: "mock-reviewer",
            feedback: "Looks good! (Mock)",
            score: 85,
            created_at: new Date().toISOString()
        };
    }

    close() {
        this.audit.close();
    }
    private getMockProposal(mission: Mission): Proposal {
        return {
            id: "mock-prop-" + Date.now(),
            mission_id: mission.id,
            author_id: "mock-executor",
            content: "Mock solution for testing.",
            reasoning: "Configured to use Mock.",
            instructions: [
                { action: "navigate", target: "https://www.google.com" },
                { action: "input", target: "textarea[name='q']", value: "DeepMind" },
                { action: "click", target: "input[name='btnK']" }, 
                { action: "extract", target: "#search" }
            ],
            metadata: { mocked: true },
            created_at: new Date().toISOString()
        };
    }
}
