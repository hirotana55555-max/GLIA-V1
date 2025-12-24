export interface AuditEvent {
    timestamp?: string;
    source: string;
    action: string;
    payload: any;
    level?: "INFO" | "WARN" | "ERROR" | "DEBUG";
}
export declare class AuditLogger {
    private stream;
    private logfile;
    constructor(logDir?: string, filename?: string);
    log(event: AuditEvent): Promise<void>;
    close(): void;
}
