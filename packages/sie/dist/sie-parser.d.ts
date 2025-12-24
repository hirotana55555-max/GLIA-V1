import { Instruction } from "@glia/toon";
export interface InstructionAST {
    id: string;
    action: string;
    target?: string;
    value?: string | null;
    options?: Record<string, any>;
    meta?: Record<string, any>;
}
export declare class SIEParser {
    parse(instructions: Instruction[]): InstructionAST[];
}
