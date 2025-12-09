# GLIA SYSTEM ARCHITECTURE

## レイヤー構造（3.5 層）
1. Browser  
2. BrowserContext  
3. Page  
3.5. Safe Execution Sandbox (SIE Executor)

## TOON / Swarm 統合
TOON Mission → Swarm Mission Runner → BrowserManager.runAction → SIE Executor

## Antigravity
外部依存ゼロの Node.js 互換 sandbox 実行環境。
