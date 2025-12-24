# PHASES AND ROADMAP

Current Phase:
- Phase 3: Stabilization (Completed)

## Phase History
- **Phase 1: Foundation** (Type System) - ✅ DONE
- **Phase 2: Core Features** (Critique System) - ✅ DONE
- **Phase 3: Stabilization** (Refactoring & Consistency) - ✅ DONE

## Roadmap & Priorities

### Phase 4: Intelligence Integration (Planned/TBD)
- **Tool Unification**: Integration of legacy tool concepts (Cognize, Scanner, DEM) into GLIA Swarm.
  - **Cognize (Context Awareness)**: Porting file dependency analysis to supply Agents with "Tree-Gazer" context.
  - **DEM (Dynamic Error Montior)**: Establishing a feedback loop from Electron/Browser runtime errors back to the Swarm.
  - **Scanner (Forest-Gazer)**: Macro-level project overview generation.

### Next Priorities
- Design of "Context Provider" module (New Cognize).
- Design of "Runtime Feedback" hook (New DEM).

### Unimplemented Features / Technical Debt (TODOs)
- remove once this package no longer supports TS 5.5, and replace NodeJS.BuiltinIteratorReturn with BuiltinIteratorReturn.
- avoid DOM dependency until WASM moved to own lib.
- Narrow to DOM types
- PerformanceNodeEntry is missing
- Just Plain Wrong™ (see also nodejs/node#57392)
- remove globals in future version

## Rules
Allowed:
- Capsule-based scaling
- Internal refactors
- Test evolution

Disallowed:
- System-wide redesign without human approval
- Cost-unbounded optimization

Never Do:
- Fully autonomous upstream requirement definition
- Infinite research phases

Technical debt is acceptable when:
- Explicitly recorded
- Scoped to a capsule
