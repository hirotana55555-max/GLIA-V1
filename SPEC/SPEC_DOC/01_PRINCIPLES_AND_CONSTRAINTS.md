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
- **Web Interface LLM Usage**: All intelligence must be accessed via API (e.g., OpenRouter) to comply with ToS. Automation of web-based LLM chats is strictly prohibited.
- **Unrestricted Web Scraping**: Playwright usage is restricted to:
  1. Localhost / Internal Application Testing (Primary Purpose).
  2. Explicitly allow-listed services with permissive ToS.
  3. General web scraping is forbidden.

## Cost Governance

- API usage must be bounded.
- Failure causes must be recorded.
- Repeated failures indicate workflow breakage and require redesign.
