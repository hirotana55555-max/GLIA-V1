"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIEValidator = void 0;
class SIEValidator {
    validate(ast) {
        const warnings = [];
        for (const ins of ast) {
            if (ins.action === "navigate" && !ins.target?.startsWith("http") && !ins.target?.startsWith("about:blank")) {
                warnings.push(`Instruction ${ins.id}: navigate URL '${ins.target}' is not standard http/https`);
            }
            if (ins.action === "click" && !ins.target) {
                warnings.push(`Instruction ${ins.id}: click action missing target selector`);
            }
            if (ins.action === "input" && (!ins.target || ins.value === undefined)) {
                warnings.push(`Instruction ${ins.id}: input action requires target and value`);
            }
        }
        return {
            ok: warnings.length === 0,
            warnings
        };
    }
}
exports.SIEValidator = SIEValidator;
