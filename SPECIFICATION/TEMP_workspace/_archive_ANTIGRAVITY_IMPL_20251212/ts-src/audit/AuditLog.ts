export class AuditLog {
  logs: any[] = [];
  push(entry: any) {
    this.logs.push({ ts: new Date().toISOString(), ...entry });
  }
  dump() { return this.logs; }
}
