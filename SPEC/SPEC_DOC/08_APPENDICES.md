# APPENDICES

## Definitions

Capsule:
- A bounded unit of responsibility
- Fully delegated to LLM after approval

Reverse_spec:
- Machine-readable truth derived from implementation

## Historical Failures

- Infinite retries due to missing cost ceilings
- Repeated hallucinated fixes
- Human forced into unreadable code inspection

## Diagnostic Rule

If system behavior is unclear:
- Inspect capsule boundaries
- Inspect cost logs
- Inspect failure recurrence
