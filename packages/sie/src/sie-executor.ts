import { InstructionAST } from "./sie-parser";
import { ResourcePool } from "@glia/browser-manager";
import { AuditLogger } from "@glia/audit";
import { SIESessionManager } from "@glia/browser-manager";
import { assessRisk } from "./sandbox";

export class SIEExecutorV2 {
    private manager: SIESessionManager;

    constructor(private pool: ResourcePool, private audit: AuditLogger) {
        this.manager = new SIESessionManager(this.pool, this.audit);
    }

    // options: { userApprovalCallback?: (warnings) => Promise<boolean> }
    async execute(ast: InstructionAST[], options: { userApprovalCallback?: (warnings: any) => Promise<boolean> } = {}) {
        // 1. Risk assessment
        const risks = assessRisk(ast);
        const risky = risks.filter(r => r.requiresUserApproval);

        if (risky.length > 0) {
            // If caller provided an approval callback, call it
            if (options.userApprovalCallback) {
                const approve = await options.userApprovalCallback(risky);
                if (!approve) {
                    await this.audit.log({ source: "SIE", action: "execution_aborted_by_user", payload: { risky } });
                    return { aborted: true, reason: "user_denied", risky };
                }
            } else {
                // No callback: abort and return warnings
                return { aborted: true, reason: "approval_required", risky };
            }
        }

        // 2. Acquire browser process
        const proc = await this.pool.acquire();
        const context = await this.manager.createContext(proc.pid);
        const page = await this.manager.createPage(context);

        // Initial audit log
        await this.audit.log({
            source: "SIE",
            action: "session_start",
            payload: { instructionCount: ast.length, pid: proc.pid }
        });

        const results: any[] = [];
        for (const ins of ast) {
            // Map AST -> BrowserManager.runAction
            const action = {
                action: ins.action,
                target: ins.target,
                value: ins.value,
                meta: ins.options ?? ins.meta
            };

            const res = await this.manager.runAction(proc, context, page, action);

            results.push({ instructionId: ins.id, res });

            // Audit per instruction
            await this.audit.log({ source: "SIE", action: "instruction_executed", payload: { instructionId: ins.id, res } });
        }

        this.pool.release(proc.pid);
        return { aborted: false, results };
    }
}
