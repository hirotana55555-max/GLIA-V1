# 06 MODULE SPECIFICATIONS — Module summaries (templates)

## Cognize (static analyzer)
- Input: repository files (.ts/.js/.json)
- Output: dependency graph (.json), function index (.json), chunk proposals (.json)
- API: analyze(repo_root) → {graphs, fingerprints, chunks}

## Scanner / sync-project.sh (project snapshot)
- Input: repo root
- Output: SPEC_SYNC.md, GLIA_PROJECT_TREE.md, GIT_STATUS.md, PACKAGE_LIST.md
- Operation: run periodically or on-demand before handing to LLM

## DEM (dynamic error monitor)
- Input: runtime logs, audit events
- Output: JSONL errors, aggregated reports
- API: record(event), query(time_range)

## BrowserManager
- API: createContext, newPage, runAction, dispose
- runAction must call Playwright APIs; no setTimeout mocks.

## SIE
- Responsibilities: parse → validate → dispatch → collect result
- Validator types: schema (TOON) + dynamic (LLM-based auditor)
