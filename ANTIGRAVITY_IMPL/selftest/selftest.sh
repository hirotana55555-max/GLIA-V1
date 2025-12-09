#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NODE_CMD=$(command -v node || echo "")
if [ -z "$NODE_CMD" ]; then
  echo "Node.js not found in PATH. Please install Node.js."
  exit 2
fi

echo "Running Antigravity integration test..."
node "$ROOT/ANTIGRAVITY_IMPL/integration-test/test-runner.js" > "$ROOT/ANTIGRAVITY_IMPL/selftest/last-run.log" 2>&1 || { echo "Test failed. See last-run.log"; exit 1; }

echo "Integration test completed. Output written to selftest/last-run.log"
exit 0
