# 08 APPENDICES — Reference artifacts

## TOON (Typed Object-Oriented Notation) — minimal
{
  "task_id": "string",
  "current_phase": "REQUIREMENT_GATHERING|IMPLEMENTATION|DEBUGGING|REVIEW",
  "status": "PENDING|IN_PROGRESS|AWAITING_AUDIT|COMPLETED",
  "input_prompt": "string",
  "structured_instruction": {
    "action": "navigate|click|input|extract|run_test|apply_patch|noop",
    "target": "string",
    "content": "string|null",
    "meta": {}
  },
  "context_summary": "string",
  "audit_log": [],
  "next_role": "NAVIGATOR|AUDITOR|EXECUTOR"
}

## Thought Schemas (example)
- Critic, Optimizer, Historian, Explorer

## Promotion commands (manual)
# validate and create package (TEMP -> validation)
# ./make_spec_package.sh
# promote to main (manual, operator)
# ./promote_spec_to_main.sh
