import { InstructionAST } from "./sie-parser";
export interface ValidationResult {
    ok: boolean;
    warnings: string[];
}
export declare class SIEValidator {
    validate(ast: InstructionAST[]): ValidationResult;
}
