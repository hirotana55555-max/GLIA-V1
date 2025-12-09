import { createWriteStream, existsSync, mkdirSync } from "fs";
import path from "path";

export interface AuditEvent {
    timestamp?: string; // Optional on input, filled by log()
    source: string;
    action: string;
    payload: any;
}

export class AuditLogger {
    private stream: ReturnType<typeof createWriteStream>;
    private logfile: string;

    constructor(logDir = "./logs", filename = "audit.jsonl") {
        if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });
        this.logfile = path.join(logDir, filename);
        this.stream = createWriteStream(this.logfile, { flags: "a" });
    }

    async log(event: AuditEvent): Promise<void> {
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
