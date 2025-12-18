# PRINCIPLES AND CONSTRAINTS

## Absolute Principles (MUST NOT CHANGE)

- Human intent precedes all execution.
- No action is allowed outside explicitly permitted folders.
- Unlimited API usage is forbidden.
- LLM proposals are untrusted until validated.
- Safety overrides execution completeness and speed.

## Semi-Flexible Principles (Change requires human approval)

- Capsule granularity definition.
- Internal design of a capsule.
- Test strategies inside a capsule.
- Self-update mechanisms.

## Explicit Prohibitions

- Infinite exploration loops.
- Unbounded API retries.
- Research without cost ceiling.
- Assumption that LLM output is correct.
- Skipping human intent clarification at upstream phases.

## Cost Governance

- API usage must be bounded.
- Failure causes must be recorded.
- Repeated failures indicate workflow breakage and require redesign.
