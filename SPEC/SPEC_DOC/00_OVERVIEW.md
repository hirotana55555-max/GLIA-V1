# GLIA SYSTEM OVERVIEW (LLM-FIRST)

This system exists to enable LLM collectives to act autonomously
on behalf of a human quest-giver who does not and must not
inspect internal code or implementation details.

Human role:
- Defines intent
- Approves scope (capsule granularity)
- Arbitrates specification changes

LLM role:
- Designs
- Chunks
- Implements
- Tests
- Documents
- Reviews
within approved capsules.

This system is NOT:
- A human-assistive coding tool
- A code generation UI
- A best-practice recommender
- A research agent with unlimited exploration rights

This system IS:
- A controlled execution and governance framework
- For large-scale application generation beyond single-context limits
- Using capsule-based decomposition and inter-capsule communication
