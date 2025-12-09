# GLIA API Reference (MVP surfaces)

## BrowserManager (ANTIGRAVITY_IMPL/browser-manager/BrowserManager.js / ts)
- createBrowser(pid): Browser
- createContext(pid, contextId): Context
- createPage(pid, contextId, pageId): Page
- runAction(pid, contextId, pageId, action): Promise<Result>

## SIE (ANTIGRAVITY_IMPL/sie/SIE.js / ts)
- execute({pid, contextId, pageId, action}): Promise<{ok,..}>
- validate(ast): {ok, warnings}

## SwarmMissionRunner (ANTIGRAVITY_IMPL/swarm/SwarmMissionRunner.js / ts)
- runMission(mission): Promise<Array<Result>>

## AuditLog (ANTIGRAVITY_IMPL/audit/AuditLog.js / ts)
- push(entry)
- dump()

Notes:
- "action" is a TOON action object. See toon-schema/TOONActionSchema.json
- Replace mocks with Playwright bindings for real browser operations.
