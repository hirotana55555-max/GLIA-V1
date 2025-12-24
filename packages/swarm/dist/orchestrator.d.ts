import { Mission, Proposal, ScoreCard, Critique } from "@glia/toon";
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
export declare class SwarmOrchestrator {
    private audit;
    private pool;
    private sieExecutor;
    private apiClient;
    private parser;
    private validator;
    private config;
    constructor(config: SwarmConfig | string);
    runMission(mission: Mission): Promise<ScoreCard>;
    private manageHistoryContext;
    private generateProposal;
    private runCritique;
    private getMockCritique;
    close(): void;
    private getMockProposal;
}
