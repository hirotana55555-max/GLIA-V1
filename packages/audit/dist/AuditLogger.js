"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogger = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class AuditLogger {
    constructor(logDir = "./logs", filename = "audit.jsonl") {
        if (!(0, fs_1.existsSync)(logDir))
            (0, fs_1.mkdirSync)(logDir, { recursive: true });
        this.logfile = path_1.default.join(logDir, filename);
        this.stream = (0, fs_1.createWriteStream)(this.logfile, { flags: "a" });
    }
    async log(event) {
        const record = {
            ...event,
            timestamp: event.timestamp || new Date().toISOString()
        };
        this.stream.write(JSON.stringify(record) + "\n");
    }
    close() {
        this.stream.end();
    }
}
exports.AuditLogger = AuditLogger;
