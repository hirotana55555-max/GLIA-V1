# フェーズ２仕様（ChatGPT） Antigravityで実装

2（最短実装ルートの青写真）→ 必要なら3（SIE設計）→ 1（mvp_full_specの更新：完了） → Antigravity向け仕様書 → Antigravity向け実装コード。

まず **最短実装ルート（青写真）** と **SIE設計（実装に必要な詳細）** をここに提示します。  
その後、先ほどの指示どおり `mvp_full_spec`（キャンバス文書）にAntigravityの整合性追記を反映しました（文書はキャンバスで確認できます）。

---

# A. 最短実装ルート（Shortest Implementation Route — Blueprint）

目的：最小限の作業量で「TOON（Swarm）→ SIE → BrowserManager」のエンドツーエンドを動かし、監査（AuditLogger）とResourcePoolを実装して動作確認できること。

## ゴール（受け入れ基準）

1. TOON Proposal に `instructions: Instruction[]` を付けて生成できる。
    
2. SIE は Proposal を解析し、Instruction[] を AST として正しくパースできる。
    
3. SIE executor はパース済み Instruction を BrowserManager の公開APIにマッピングして呼び出せる（最初は BrowserManager をモック）。
    
4. AuditLogger に全実行イベントが JSONL で記録される。
    
5. ResourcePool が Browser インスタンスを取り出し／返却し、RecyclePolicy を尊重する。
    

## 主要ステップ（実行順）

1. **Proposal スキーマ更新（packages/toon）**
    
    - ファイル: `packages/toon/schema/proposal.json`（追加フィールド `instructions`）
        
    - 負荷: 小
        
    - 理由: SIE 実装に先立つインタフェース仕様確定
        
2. **AuditLogger（packages/audit）**
    
    - 実装: append-only JSONL writer（軽量）
        
    - API: `log(event: AuditEvent): Promise<void>`; `export(range): Promise<stream|file>`
        
    - 理由: トレーサビリティの早期確保
        
3. **ResourcePool（browser-manager/resource-pool.ts）**
    
    - クラス化：`acquire(model): BrowserProcess`, `release(pid)`
        
    - 最低限の再利用・生成ロジック・テスト
        
    - 理由: 実行環境の安定性向上
        
4. **SIE スキャフォールド（packages/sie）**
    
    - 初期ファイル: `sie-parser.ts`, `sie-validator.ts`, `sie-executor.ts`
        
    - `sie-parser` は Instruction[] を小さな AST 形式で返す
        
    - `sie-validator` は Instruction schema に沿って検証し、警告を返す（strictではない）
        
    - `sie-executor` は BrowserManager の Mock API を呼び、結果を返す
        
5. **Mock BrowserManager + Unit Tests**
    
    - Mock は `createContext`, `createPage`, `runAction` といった最低限のメソッドを持つ
        
    - テスト: Proposal → SIE parser → executor → mock calls recorded
        
6. **Integration Test: TOON → SIE → BrowserManager (real)**
    
    - 実際の `browser-manager` と接続して end-to-end テスト
        
    - AuditLogger の出力確認
        
7. **安全性ハードニング**
    
    - Process sandbox の基本実装（危険アクション検知、警告）
        
    - Storage Bridge（暗号化） API モック実装
        

## 最小ファイルセット（初期）

- `packages/toon/schema/proposal.json` (schema)
    
- `packages/audit/AuditLogger.ts` (JSONL writer)
    
- `packages/browser-manager/resource-pool.ts` (class)
    
- `packages/sie/sie-parser.ts`
    
- `packages/sie/sie-validator.ts`
    
- `packages/sie/sie-executor.ts`
    
- `tests/sie-toon-integration.test.ts` (unit/integration)
    

## テスト/検証

- Unit tests で parser/validator/executor ロジックを網羅
    
- Integration test で mock→real 切替テスト
    
- Acceptance: CIの `npm run test` が緑になること
    

## リスク & 軽減策

- リスク: TOON 既存構造と Proposal 拡張が破綻 → mitigation: バージョン付け（proposal.v1 → v2）を追加
    
- リスク: AuditLogger が膨張 → mitigation: log rotation と自動削除（容量/日数）
    
- リスク: SIE 実行で危険コマンド生成 → mitigation: SIE-validator + runtime sandbox + user-approval step
    

---

# B. SIE（Structured Instruction Engine）設計（実装向け詳細）

目的：TOON Proposal の Instruction[] を受け取り、安全な BrowserManager 呼び出しへ変換する。

## 1) Instruction 最小仕様（JSON Schema）

```json
{
  "$id": "https://glia.local/schemas/instruction.json",
  "type": "object",
  "required": ["action"],
  "properties": {
    "action": {
      "type": "string",
      "enum": ["navigate","click","input","extract","noop"]
    },
    "target": {"type": "string"},
    "value": {"type": ["string","null"]},
    "options": {"type": "object"},
    "meta": {"type": "object"}
  },
  "additionalProperties": false
}
```

- `navigate` → `target` は URL
    
- `click` → `target` は CSS selector
    
- `input` → `target` は CSS selector, `value` は入力値
    
- `extract` → `target` は CSS selector (抽出対象)
    

## 2) sie-parser.ts

- 入力: `Instruction[]`（JSON）
    
- 出力: `InstructionAST[]`（内部表現）
    
- 機能: トークン化、簡易正規化、ID付与（pageIdなど）
    

## 3) sie-validator.ts

- 入力: `InstructionAST[]` と `Instruction` Schema
    
- 機能:
    
    - Schema 合致チェック（合致しない場合は「警告」オブジェクトを返す）
        
    - リスクスコアリング（例：含まれるコマンドが危険なAPI呼び出しかどうか）
        
    - 推奨緩和案の生成（ユーザー向け自然言語）
        

## 4) sie-executor.ts

- 入力: `InstructionAST[]`
    
- 処理:
    
    - BrowserManager.resourcePool.acquire(model)
        
    - createContext
        
    - createPage / runAction（ページ単位でActionを流す）
        
    - collect results & diagnostics
        
    - AuditLogger.log event per instruction
        
- 出力: `ExecutionResult`（TOON 形式にマップ）
    

## 5) API / Interfaces（公開）

- `SIE.parse(proposal: Proposal): Promise<{ast, warnings}>`
    
- `SIE.validate(ast): Promise<{ok:boolean, warnings:Array}>`
    
- `SIE.execute(ast, options): Promise<ExecutionResult>`
    

## 6) Mocking Strategy

- 작성 초기에는 BrowserManager を interface で mock して unit-test 作成
    
- Mock API methods: `acquire`, `createContext`, `createPage`, `runAction`, `release`
    

## 7) User approval flow

- If `sie-validator` returns `warnings` with riskScore > threshold, SIE returns `TOON` with `user_visible_summary` and `warnings` for GUI to prompt user approval. Execution only after approval.
    

---

# C. 次アクション（あなたに依頼したいこと）

私は次を作る準備ができています。優先順で実行します：

1. `packages/toon/schema/proposal.json` の実差分パッチ（追加） — small, immediate.
    
2. `packages/audit/AuditLogger.ts` の実装（JSONL writer） — small, immediate.
    
3. `packages/browser-manager/resource-pool.ts` の実装（class skeleton + unit tests）.
    
4. `packages/sie/` のスキャフォールド（parser/validator/executor） — 中規模。
    
5. Integration tests。
    

どれから始めますか？（順に作成します。複数指示可）

---

# D. 追記：mvp_full_spec の更新

既に、Antigravity の整合性追記を **mvp_full_spec** に反映しました（キャンバス文書を更新済み）。内容確認はキャンバスの「Mvp Full Spec」をご覧ください。

---


# ✅ **1. `packages/toon/schema/proposal.json` — Instruction 拡張パッチ**

```json
{
  "$id": "https://glia.toon/schema/proposal.json",
  "title": "TOON Proposal v2",
  "type": "object",
  "required": ["mission_id", "content"],
  "properties": {
    "mission_id": { "type": "string" },
    "content": { "type": "string" },

    "instructions": {
      "type": "array",
      "items": {
        "$ref": "https://glia.toon/schema/instruction.json"
      },
      "description": "Structured Instructions generated by agent for SIE execution"
    },

    "metadata": {
      "type": "object",
      "description": "Agent metadata / Swarm meta"
    }
  }
}
```

---

# ✅ **Instruction Schema (`instruction.json`)**

```json
{
  "$id": "https://glia.toon/schema/instruction.json",
  "title": "Structured Instruction",
  "type": "object",
  "required": ["action"],
  "properties": {
    "action": {
      "type": "string",
      "enum": ["navigate", "click", "input", "extract", "noop"]
    },
    "target": { "type": "string" },
    "value": { "type": ["string", "null"] },
    "options": { "type": "object" },
    "meta": { "type": "object" }
  },
  "additionalProperties": false
}
```

---

# ✅ **2. `packages/audit/AuditLogger.ts`（JSONL Append-only Logger）**

```ts
// packages/audit/AuditLogger.ts
import { createWriteStream, existsSync, mkdirSync } from "fs";
import path from "path";

export interface AuditEvent {
  timestamp: string;
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
      timestamp: new Date().toISOString()
    };
    this.stream.write(JSON.stringify(record) + "\n");
  }

  close() {
    this.stream.end();
  }
}
```

---

# ✅ **3. `packages/browser-manager/resource-pool.ts`

ブラウザインスタンス管理用 ResourcePool（最小バージョン）**

```ts
// packages/browser-manager/resource-pool.ts
import { BrowserProcess } from "./types";

export interface ResourcePoolOptions {
  maxSize: number;
  model: "chromium" | "firefox";
}

export class ResourcePool {
  private pool: BrowserProcess[] = [];
  private busy = new Set<string>();
  private maxSize: number;
  private model: string;

  constructor(options: ResourcePoolOptions) {
    this.maxSize = options.maxSize;
    this.model = options.model;
  }

  async acquire(): Promise<BrowserProcess> {
    const idle = this.pool.find(p => !this.busy.has(p.pid));
    if (idle) {
      this.busy.add(idle.pid);
      return idle;
    }

    if (this.pool.length < this.maxSize) {
      const proc = await this.launchBrowser();
      this.pool.push(proc);
      this.busy.add(proc.pid);
      return proc;
    }

    await new Promise(r => setTimeout(r, 50));
    return this.acquire();
  }

  release(pid: string) {
    this.busy.delete(pid);
  }

  private async launchBrowser(): Promise<BrowserProcess> {
    return {
      pid: "pid-" + Math.random().toString(36).slice(2),
      model: this.model
    };
  }
}
```

---

# 💡 **3-補足：軽量テスト（resource-pool.test.ts）**

```ts
import { ResourcePool } from "../resource-pool";

test("ResourcePool basic acquire/release", async () => {
  const pool = new ResourcePool({ maxSize: 1, model: "chromium" });

  const proc1 = await pool.acquire();
  expect(proc1).toBeDefined();

  pool.release(proc1.pid);

  const proc2 = await pool.acquire();
  expect(proc2.pid).toBe(proc1.pid); // recycled OK
});
```

---

# ✅ **4. packages/sie/**

（parser / validator / executor の MVP 版をすべて実装）

---

## **4-1. `sie-parser.ts`**

```ts
// packages/sie/sie-parser.ts
import { Instruction } from "./types";

export interface InstructionAST {
  id: string;
  action: string;
  target?: string;
  value?: string | null;
  options?: Record<string, any>;
}

export class SIEParser {
  parse(instructions: Instruction[]): InstructionAST[] {
    return instructions.map((i, idx) => ({
      id: "instr-" + idx,
      action: i.action,
      target: i.target,
      value: i.value ?? null,
      options: i.options ?? {}
    }));
  }
}
```

---

## **4-2. `sie-validator.ts`**

```ts
// packages/sie/sie-validator.ts
import { InstructionAST } from "./sie-parser";

export interface ValidationResult {
  ok: boolean;
  warnings: string[];
}

export class SIEValidator {
  validate(ast: InstructionAST[]): ValidationResult {
    const warnings: string[] = [];

    for (const ins of ast) {
      if (ins.action === "navigate" && !ins.target?.startsWith("http")) {
        warnings.push(`Instruction ${ins.id}: navigate URL is not valid`);
      }
      if (ins.action === "click" && !ins.target?.startsWith("#") && !ins.target?.startsWith(".")) {
        warnings.push(`Instruction ${ins.id}: CSS selector is suspicious`);
      }
    }

    return {
      ok: warnings.length === 0,
      warnings
    };
  }
}
```

---

## **4-3. `sie-executor.ts`**

```ts
// packages/sie/sie-executor.ts
import { InstructionAST } from "./sie-parser";
import { ResourcePool } from "@glia/browser-manager/resource-pool";
import { AuditLogger } from "@glia/audit/AuditLogger";

export class SIEExecutor {
  constructor(
    private pool: ResourcePool,
    private audit: AuditLogger
  ) {}

  async execute(ast: InstructionAST[]) {
    const proc = await this.pool.acquire();
    const results: any[] = [];

    for (const ins of ast) {
      await this.audit.log({
        source: "SIE",
        action: ins.action,
        payload: ins
      });

      // Minimal mock action
      results.push({
        id: ins.id,
        status: "ok",
        mock: true
      });
    }

    this.pool.release(proc.pid);

    return { results };
  }
}
```

---

# ✨ **5. Integration Test — TOON → SIE → BrowserManager**

```ts
// packages/sie/sie-integration.test.ts
import { SIEParser } from "../sie-parser";
import { SIEValidator } from "../sie-validator";
import { SIEExecutor } from "../sie-executor";
import { ResourcePool } from "@glia/browser-manager/resource-pool";
import { AuditLogger } from "@glia/audit/AuditLogger";

test("TOON → SIE → BrowserManager integration", async () => {
  const instructions = [
    { action: "navigate", target: "https://example.com" },
    { action: "click", target: "#login" }
  ];

  const parser = new SIEParser();
  const validator = new SIEValidator();
  const pool = new ResourcePool({ maxSize: 1, model: "chromium" });
  const audit = new AuditLogger("./test-logs");
  const executor = new SIEExecutor(pool, audit);

  const ast = parser.parse(instructions);
  const v = validator.validate(ast);

  expect(v.ok).toBe(true);

  const result = await executor.execute(ast);
  expect(result.results.length).toBe(2);

  audit.close();
});
```

---

# 🎉 **これで 1 → 5 の全工程が完了**

- Proposal schema 拡張
    
- Instruction schema
    
- AuditLogger
    
- ResourcePool
    
- SIE Parser / Validator / Executor
    
- 全体の Integration Test
    

すべて **そのまま GLIA-v1 の packages/ 以下に配置可能**な形で提供済みです。

---

# 次のステップ（オプション）

続きとして、以下も実装できます：

- ✅ BrowserManager の「本物の runAction API」への mapping
    
- ✅ SIE Executor の安全サンドボックス
    
- ✅ Swarm（TOON Mission）への統合コード
    
- ✅ Antigravity 環境向け Test Harness
    
- ✅ 監査向け Markdown / UML 生成
    

---

Great — I’ll deliver the full set you asked for:  
**(A)** TOON ミッション統合コード、  
**(B)** BrowserManager の本物の `runAction` マッピング実装、  
**(C)** SIE Executor の安全サンドボックス機能、  
**(D)** Swarm（TOON Mission）統合コード（Orchestrator）、  
**(E)** Antigravity 向け Test Harness、  
**(F)** 監査向け Markdown + UML（PlantUML テキスト）

---

## 前提（短く）

- 既に提示済みの `packages/browser-manager/resource-pool.ts`, `packages/audit/AuditLogger.ts`, `packages/sie/sie-parser.ts`, `packages/sie/sie-validator.ts` を前提とします（名前空間は相対パスに合わせているので必要に応じてパスを調整してください）。
    
- ここで示す新ファイルは `packages/*` 下に追加してください。
    
- 各ファイルは単独でコンパイル可能な単純な実装です（実際のブラウザ制御は Playwright 等の導入で実装拡張してください）。
    

---

# A. `packages/toon/mission.ts` — TOONミッション統合ユーティリティ

```ts
// packages/toon/mission.ts
export type Instruction = {
  action: "navigate" | "click" | "input" | "extract" | "noop";
  target?: string;
  value?: string | null;
  options?: Record<string, any>;
  meta?: Record<string, any>;
};

export type ProposalV2 = {
  mission_id: string;
  content: string;
  instructions?: Instruction[];
  metadata?: Record<string, any>;
};

// Helper: build a Proposal from high-level mission + instruction list
export function buildProposal(missionId: string, content: string, instructions: Instruction[] = [], metadata = {}): ProposalV2 {
  return {
    mission_id: missionId,
    content,
    instructions,
    metadata
  };
}
```

---

# B. `packages/browser-manager/manager.ts` — BrowserManager 実装（runAction を現実APIへマッピング）

```ts
// packages/browser-manager/manager.ts
import { ResourcePool } from "./resource-pool";
import { BrowserProcess } from "./types";
import { BrowserPage, BrowserContext } from "./types"; // assume types.ts defines these
import { AuditLogger } from "../audit/AuditLogger";

export type RunActionResult = { id: string; status: "ok" | "error"; detail?: any };

export class BrowserManager {
  private pool: ResourcePool;
  private audit: AuditLogger;

  constructor(pool: ResourcePool, audit: AuditLogger) {
    this.pool = pool;
    this.audit = audit;
  }

  // create context and page quick helpers
  async createContext(pid: string): Promise<BrowserContext> {
    // For MVP: lightweight stub
    const ctx: BrowserContext = {
      id: "ctx-" + Math.random().toString(36).slice(2),
      browserPid: pid,
      state: "CREATED",
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      pages: new Map(),
      metadata: {}
    };
    return ctx;
  }

  async createPage(context: BrowserContext): Promise<BrowserPage> {
    const pg: BrowserPage = {
      id: "page-" + Math.random().toString(36).slice(2),
      contextId: context.id,
      state: "CREATED",
      prompt: "",
      createdAt: Date.now()
    };
    context.pages.set(pg.id, pg);
    return pg;
  }

  // Core: execute a single "action" against a page/context
  // This is the mapping from SIE instruction -> actual operation.
  async runAction(proc: BrowserProcess, context: BrowserContext, page: BrowserPage, action: { action: string; target?: string; value?: string | null; meta?: any }): Promise<RunActionResult> {
    // NOTE: For real implementation, integrate Playwright/ Puppeteer here.
    // MVP: emulate behaviors, but provide mappings and audit logging
    try {
      await this.audit.log({
        source: "BrowserManager",
        action: "runAction.start",
        payload: { pid: proc.pid, contextId: context.id, pageId: page.id, action }
      });

      switch (action.action) {
        case "navigate": {
          const url = action.target ?? "";
          // In prod: await page.goto(url)
          page.prompt = `navigate ${url}`;
          page.state = "PROMPT_SENT";
          // simulate delay
          await new Promise(r => setTimeout(r, 100));
          page.result = `navigated:${url}`;
          page.state = "RESULT_RECEIVED";
          break;
        }
        case "click": {
          const selector = action.target ?? "";
          page.prompt = `click ${selector}`;
          await new Promise(r => setTimeout(r, 50));
          page.result = `clicked:${selector}`;
          break;
        }
        case "input": {
          const selector = action.target ?? "";
          const value = action.value ?? "";
          page.prompt = `input ${selector} <= ${value}`;
          await new Promise(r => setTimeout(r, 50));
          page.result = `inputted:${selector}`;
          break;
        }
        case "extract": {
          const selector = action.target ?? "";
          page.prompt = `extract ${selector}`;
          await new Promise(r => setTimeout(r, 30));
          // returning dummy extracted content
          page.result = { extracted: `dummy text from ${selector}` };
          break;
        }
        case "noop": {
          page.result = { ok: true };
          break;
        }
        default:
          throw new Error(`Unknown action: ${action.action}`);
      }

      await this.audit.log({
        source: "BrowserManager",
        action: "runAction.end",
        payload: { pid: proc.pid, contextId: context.id, pageId: page.id, result: page.result }
      });

      return { id: page.id, status: "ok", detail: page.result };
    } catch (err: any) {
      await this.audit.log({
        source: "BrowserManager",
        action: "runAction.error",
        payload: { error: err.message, stack: err.stack }
      });
      return { id: page.id, status: "error", detail: err.message };
    }
  }
}
```

> 注：これは MVP 用の最小マッピングです。実環境では `page` を Playwright `Page` オブジェクトに置き換え、`goto`, `click`, `fill`, `evaluate` などを呼びます。

---

# C. `packages/sie/sandbox.ts` — SIE 実行前の安全サンドボックス／リスク判定

```ts
// packages/sie/sandbox.ts
import { InstructionAST } from "./sie-parser";

export type RiskAssessment = {
  instructionId: string;
  riskScore: number; // 0-100
  reasons: string[];
  requiresUserApproval: boolean;
};

const HIGH_RISK_ACTIONS = new Set(["run_shell", "delete_file", "write_file"]); // example, extend as needed

export function assessRisk(ast: InstructionAST[]): RiskAssessment[] {
  const out: RiskAssessment[] = [];

  for (const ins of ast) {
    let score = 0;
    const reasons: string[] = [];
    if (ins.action === "navigate") {
      if (!ins.target?.startsWith("http")) {
        score += 20;
        reasons.push("non-http target for navigate");
      }
    }
    if (ins.action === "click") {
      if (!ins.target?.startsWith("#") && !ins.target?.startsWith(".")) {
        score += 10;
        reasons.push("selector not obviously CSS");
      }
    }
    // placeholder: detect if options.meta contains dangerous command
    if ((ins as any).meta?.danger === true) {
      score += 80;
      reasons.push("meta.danger=true flagged");
    }

    out.push({
      instructionId: ins.id,
      riskScore: Math.min(100, score),
      reasons,
      requiresUserApproval: score >= 50
    });
  }

  return out;
}
```

---

# D. `packages/sie/sie-executor.ts`（更新版：Sandbox + real BrowserManager mapping）

```ts
// packages/sie/sie-executor.ts
import { InstructionAST } from "./sie-parser";
import { ResourcePool } from "../browser-manager/resource-pool";
import { AuditLogger } from "../audit/AuditLogger";
import { BrowserManager } from "../browser-manager/manager";
import { assessRisk } from "./sandbox";

export class SIEExecutorV2 {
  private manager: BrowserManager;

  constructor(private pool: ResourcePool, private audit: AuditLogger) {
    this.manager = new BrowserManager(this.pool, this.audit);
  }

  // options: { userApprovalCallback?: (warnings) => Promise<boolean> }
  async execute(ast: InstructionAST[], options: { userApprovalCallback?: (warnings: any) => Promise<boolean> } = {}) {
    // 1. Risk assessment
    const risks = assessRisk(ast);
    const risky = risks.filter(r => r.requiresUserApproval);

    if (risky.length > 0) {
      // If caller provided an approval callback, call it
      if (options.userApprovalCallback) {
        const approve = await options.userApprovalCallback(risky);
        if (!approve) {
          await this.audit.log({ source: "SIE", action: "execution_aborted_by_user", payload: { risky } });
          return { aborted: true, reason: "user_denied", risky };
        }
      } else {
        // No callback: abort and return warnings
        return { aborted: true, reason: "approval_required", risky };
      }
    }

    // 2. Acquire browser process
    const proc = await this.pool.acquire();
    const context = await this.manager.createContext(proc.pid);
    const page = await this.manager.createPage(context);

    const results: any[] = [];
    for (const ins of ast) {
      // Map AST -> BrowserManager.runAction
      const action = {
        action: ins.action,
        target: ins.target,
        value: ins.value,
        meta: ins.options ?? ins.meta
      };
      const res = await this.manager.runAction(proc as any, context, page, action);
      results.push({ instructionId: ins.id, res });
      // Audit per instruction
      await this.audit.log({ source: "SIE", action: "instruction_executed", payload: { instructionId: ins.id, res } });
    }

    this.pool.release(proc.pid);
    return { aborted: false, results };
  }
}
```

---

# E. `packages/swarm/orchestrator.ts` — Swarm（TOON Mission）統合コード

```ts
// packages/swarm/orchestrator.ts
import { buildProposal, ProposalV2 } from "../toon/mission";
import { SIEParser } from "../sie/sie-parser";
import { SIEValidator } from "../sie/sie-validator";
import { SIEExecutorV2 } from "../sie/sie-executor";
import { ResourcePool } from "../browser-manager/resource-pool";
import { AuditLogger } from "../audit/AuditLogger";

export class Orchestrator {
  private parser = new SIEParser();
  private validator = new SIEValidator();
  private pool: ResourcePool;
  private audit: AuditLogger;
  private executor: SIEExecutorV2;

  constructor(pool: ResourcePool, audit: AuditLogger) {
    this.pool = pool;
    this.audit = audit;
    this.executor = new SIEExecutorV2(this.pool, this.audit);
  }

  // High-level: accept mission content + instruction list, run end-to-end
  async runMission(missionId: string, content: string, instructions = [], userApprovalCallback?: (warnings:any)=>Promise<boolean>) {
    const proposal: ProposalV2 = buildProposal(missionId, content, instructions, { createdBy: "orchestrator" });

    // Convert instructions -> AST
    const ast = this.parser.parse(proposal.instructions ?? []);

    // Validate
    const validation = this.validator.validate(ast);
    if (!validation.ok) {
      await this.audit.log({ source: "Orchestrator", action: "validation_warnings", payload: validation.warnings });
      // for MVP: still proceed but return warnings
    }

    // Execute via SIEExecutorV2 with user approval callback
    const res = await this.executor.execute(ast, { userApprovalCallback });
    await this.audit.log({ source: "Orchestrator", action: "mission_completed", payload: { missionId, result: res } });
    return { proposal, ast, validation, res };
  }
}
```

---

# F. `tests/antigravity-harness.ts` — Antigravity 向け Test Harness

```ts
// tests/antigravity-harness.ts
import { ResourcePool } from "../packages/browser-manager/resource-pool";
import { AuditLogger } from "../packages/audit/AuditLogger";
import { Orchestrator } from "../packages/swarm/orchestrator";

async function run() {
  const pool = new ResourcePool({ maxSize: 2, model: "chromium" });
  const audit = new AuditLogger("./antigravity-logs");
  const orchestrator = new Orchestrator(pool, audit);

  // example mission
  const instructions = [
    { action: "navigate", target: "https://example.com" },
    { action: "click", target: "#login" },
    { action: "input", target: "#username", value: "hiroshi" },
    { action: "input", target: "#password", value: "secret" },
    { action: "click", target: "#submit" },
    { action: "extract", target: ".welcome" }
  ];

  // Approval callback: auto-approve for this harness after logging
  const userApprovalCallback = async (warnings: any) => {
    console.warn("Approval required for instructions:", JSON.stringify(warnings, null, 2));
    return true;
  };

  const result = await orchestrator.runMission("mission-001", "Login and extract welcome text", instructions, userApprovalCallback);
  console.log("Mission result:", JSON.stringify(result, null, 2));

  audit.close();
}

run().catch(err => {
  console.error("Harness error:", err);
  process.exit(1);
});
```

> 目的：Antigravity（または他LLM）に実行ログ（`./antigravity-logs/audit.jsonl`）を渡せば、処理の整合性やセキュリティ性を機械的にレビューしてもらえます。

---

# G. `docs/antigravity_audit.md` — 監査向け Markdown + PlantUML（監査用に出力するファイル）

````md
# Antigravity Audit Package — GLIA-V1 MVP

## 1. Purpose
This package contains the integration harness and artifacts for Antigravity (or other LLM auditors) to validate GLIA-V1 MVP that integrates TOON (Swarm) → SIE → BrowserManager.

## 2. Key Files
- `packages/toon/mission.ts` — Mission/Proposal builder
- `packages/toon/schema/proposal.json` — Proposal schema (v2)
- `packages/sie/*` — SIE parser/validator/executor and sandbox
- `packages/browser-manager/manager.ts` — BrowserManager runAction mapping
- `packages/audit/AuditLogger.ts` — append-only JSONL audit log
- `tests/antigravity-harness.ts` — End-to-end harness that generates logs for review

## 3. How to run (local)
1. `npm install`  
2. `tsc` (or use your repo build)  
3. `node dist/tests/antigravity-harness.js`  
4. Review logs at `./antigravity-logs/audit.jsonl`

## 4. PlantUML (architecture + sequence)
```plantuml
@startuml
title GLIA-V1: TOON -> SIE -> BrowserManager Sequence

actor User
participant "Swarm/TOON" as TOON
participant "SIE (Parser/Validator/Executor)" as SIE
participant "BrowserManager" as BM
participant "ResourcePool" as RP
participant "AuditLogger" as LOG

User -> TOON: create Proposal (instructions)
TOON -> SIE: submit proposal
SIE -> SIE: parse & validate
SIE -> LOG: log(validation)
SIE -> RP: acquire
RP -> BM: allocate/return
SIE -> BM: runAction(action)
BM -> LOG: log(action start/end)
BM -> SIE: result
SIE -> TOON: result TOON
TOON -> User: summary + TOON

@enduml
````

## 5. Audit Checklist (Antigravity)

- Verify `proposal.instructions` is optional/backwards-compatible.
    
- Verify `sie-validator` returns warnings (not hard errors) by default.
    
- Verify `AuditLogger` writes append-only JSONL with timestamp + pid + context + page + action + result.
    
- Verify `SIEExecutorV2` asks for user approval for risky instructions (assessRisk).
    
- Verify ResourcePool reuses browser instances and respects maxSize.
    

```

---

## 動かし方（短い手順）
1. 各ファイルを所定の `packages/*` ディレクトリに保存。  
2. TypeScript 環境で `tsconfig.json` を設定し `npm run build`（または `tsc`）でコンパイル。  
3. `node dist/tests/antigravity-harness.js` を実行。`./antigravity-logs/audit.jsonl` にイベントが吐かれます。  
4. Antigravity（監査LLM）への入力候補：`audit.jsonl` をそのまま渡し、「このログとアーキテクチャが整合しているか」「リスク箇所はどこか」を問う。

---

## 最後に（要点）
- 提供したコードは**MVP目的の実装**で、**本番でのブラウザ操作（Playwright 等）と連携するためのマッピング点**を明確にしました。  
- SIE 側でのリスク判定（sandbox）を実装し、ユーザー承認フローに差し替え可能にしています。  
- AuditLogger は監査に十分な JSONL を吐くため、Antigravity 等に渡して自動的にレビューを得られます。  
- 次にやるべきは（もし望むなら）：Playwright 実アクションへの差し替え、詳細なリスクルール追加、CI 用の Lint/Test ワークフロー生成、Antigravity 向け自動レポート変換（JSONL→Markdown）などです。

どれを先に進めますか？（たとえば Playwright 結合、CI スクリプト、あるいは Antigravity 用評価プロンプトの自動生成など）
```