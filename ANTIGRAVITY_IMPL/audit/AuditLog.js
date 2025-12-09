// AuditLog - 実行トレース記録

export class AuditLog {
  constructor() {
    this.logs = [];
  }

  push(entry) {
    this.logs.push({
      ts: new Date().toISOString(),
      ...entry
    });
  }

  dump() {
    return this.logs;
  }
}
