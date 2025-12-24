import { InstructionAST } from "./sie-parser";
import { ResourcePool } from "@glia/browser-manager";
import { AuditLogger } from "@glia/audit";
export declare class SIEExecutorV2 {
    private pool;
    private audit;
    private manager;
    constructor(pool: ResourcePool, audit: AuditLogger);
    execute(ast: InstructionAST[], options?: {
        userApprovalCallback?: (warnings: any) => Promise<boolean>;
    }): Promise<{
        aborted: boolean;
        reason: string;
        risky: import("./sandbox").RiskAssessment[];
        results?: undefined;
    } | {
        aborted: boolean;
        results: any[];
        reason?: undefined;
        risky?: undefined;
    }>;
}
