# SYSTEM ARCHITECTURE

GLIA architecture is layered and directional.

## Layers
1. **Human Interface Layer** (Intent & Approval)
2. **Swarm Orchestration Layer** (`packages/swarm`)
   - Core Orchestrator: `packages/swarm/src/orchestrator.ts`
   - Orchestrates Agents to solve Missions.
3. **Planning & Validation Layer** (LLM / SIE)
   - SIE (Structured Instruction Executor): Ensures safe browser automation.
   - TOON (Task-Oriented Object Notation): Structured communication protocol (`packages/toon`).
4. **Execution Layer** (Agents, Executors)
   - Browser Agent (`packages/browser-agent`)
   - Browser Manager (`packages/browser-manager`)
5. **Observation Layer** (Audit, Logs)

## Dependency Rules
- Lower layers MUST NOT influence upper intent.
- Execution NEVER modifies architecture definitions.
- Observers NEVER act.

## Runtime Components

### Electron App (`apps/electron-app`)
- **Purpose**: Controlled runtime environment, resource boundary enforcement.
- **Entry Point**: `apps/electron-app/src/main.ts`

### Playwright (Browser Agent)
- **Purpose**: Perception and interaction only. Never for decision-making.
- **Config**: Managed via `BrowserManager`.

## Design Rationale & Decisions
- **Monorepo (npm workspaces)**: Adopted to preserve cross-capsule traceability and enable reverse spec generation.
- **TOON Protocol**: Standardized LLM-to-LLM and LLM-to-System communication.
- **SIE (Structured Instruction Executor)**: Guarantee safe execution of generated instructions (e.g., limit navigation to safe targets).

## Constraints
- **Runtime**: Node.js >=18.0.0
- **API**: OpenRouter API Key required.
