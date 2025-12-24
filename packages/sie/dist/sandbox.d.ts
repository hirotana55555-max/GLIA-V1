import { InstructionAST } from "./sie-parser";
export type RiskAssessment = {
    instructionId: string;
    riskScore: number;
    reasons: string[];
    requiresUserApproval: boolean;
};
export declare function assessRisk(ast: InstructionAST[]): RiskAssessment[];
