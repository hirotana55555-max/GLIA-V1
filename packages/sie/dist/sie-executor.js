"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIEExecutorV2 = void 0;
const browser_manager_1 = require("@glia/browser-manager");
const sandbox_1 = require("./sandbox");
class SIEExecutorV2 {
    constructor(pool, audit) {
        this.pool = pool;
        this.audit = audit;
        this.manager = new browser_manager_1.SIESessionManager(this.pool, this.audit);
    }
    // options: { userApprovalCallback?: (warnings) => Promise<boolean> }
    async execute(ast, options = {}) {
        // 1. Risk assessment
        const risks = (0, sandbox_1.assessRisk)(ast);
        const risky = risks.filter(r => r.requiresUserApproval);
        if (risky.length > 0) {
            // If caller provided an approval callback, call it
            if (options.userApprovalCallback) {
                const approve = await options.userApprovalCallback(risky);
                if (!approve) {
                    await this.audit.log({ source: "SIE", action: "execution_aborted_by_user", payload: { risky } });
                    return { aborted: true, reason: "user_denied", risky };
                }
            }
            else {
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
        const results = [];
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
exports.SIEExecutorV2 = SIEExecutorV2;
