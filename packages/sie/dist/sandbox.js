"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessRisk = assessRisk;
// Example set of dangerous actions (can be expanded)
const HIGH_RISK_ACTIONS = new Set(["run_shell", "delete_file", "write_file"]);
function assessRisk(ast) {
    const out = [];
    for (const ins of ast) {
        let score = 0;
        const reasons = [];
        // Check for suspicious URLs
        if (ins.action === "navigate") {
            if (!ins.target?.startsWith("http") && !ins.target?.startsWith("about:blank")) {
                score += 20;
                reasons.push("non-http target for navigate");
            }
        }
        // Check for suspicious selectors
        if (ins.action === "click" || ins.action === "input" || ins.action === "extract") {
            // Very crude check: assumes valid CSS selectors often start with # or . or tag name
            // This is just a heuristic for the prototype
            if (ins.target && !ins.target.match(/^([#.]|[a-z])/i)) {
                score += 10;
                reasons.push("selector might be malformed or non-standard");
            }
        }
        // Check for explicit danger flag
        if (ins.meta?.danger === true) {
            score += 80;
            reasons.push("meta.danger=true flagged");
        }
        // Check against forbidden actions (even if not in current Instruction enum, strictly)
        if (HIGH_RISK_ACTIONS.has(ins.action)) {
            score += 90;
            reasons.push(`Action '${ins.action}' is classified as HIGH RISK`);
        }
        out.push({
            instructionId: ins.id,
            riskScore: Math.min(100, score),
            reasons,
            requiresUserApproval: score >= 50
        });
    }
    return out;
}
