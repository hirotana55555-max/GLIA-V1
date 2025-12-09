# Package Information
Generated: 2025年 12月 10日 水曜日 01:05:28 JST
## Root package.json
```json
{
  "name": "glia-v1-monorepo",
  "version": "1.0.0",
  "description": "GLIA V1 - Generative Language Integration Assistant",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build:all": "npm run build --workspaces",
    "build": "npm run build --workspaces",
    "start": "npm run build && cd apps/electron-app && npm start",
    "test": "cd integration-test && node simple-integration.js",
    "clean": "rm -rf node_modules packages/*/node_modules packages/*/dist apps/*/node_modules apps/*/dist",
    "install:all": "npm install && cd packages/prompt-core && npm install && cd ../browser-manager && npm install && cd ../browser-agent && npm install && cd ../../apps/electron-app && npm install"
  },
  "devDependencies": {
    "@types/node": "^24.10.2",
    "ts-node": "^10.9.2",
    "typedoc": "^0.28.15",
    "typescript": "^5.9.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```
