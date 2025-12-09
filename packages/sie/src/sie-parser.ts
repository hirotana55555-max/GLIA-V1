
import { Instruction } from "@glia/toon";

export interface InstructionAST {
    id: string;
    action: string;
    target?: string;
    value?: string | null;
    options?: Record<string, any>;
    meta?: Record<string, any>;
}

export class SIEParser {
    parse(instructions: Instruction[]): InstructionAST[] {
        return instructions.map((i, idx) => ({
            id: "instr-" + idx,
            action: i.action,
            target: i.target,
            value: i.value ?? null,
            options: i.options ?? {},
            meta: i.meta ?? {}
        }));
    }
}
