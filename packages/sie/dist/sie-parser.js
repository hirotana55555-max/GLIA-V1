"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIEParser = void 0;
class SIEParser {
    parse(instructions) {
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
exports.SIEParser = SIEParser;
