# RUNTIME COMPONENTS

SwarmOrchestrator:
- Central governor
- Coordinates planning, validation, execution
- No domain logic allowed

BrowserAgent:
- Acts as sensory organ
- Executes instructions
- Does not interpret intent

BrowserManager:
- Allocates and recycles browser resources
- Enforces lifecycle boundaries

ResourcePool:
- Manages scarcity explicitly
- Resources are finite by design

Runtime State Rules:
- Mutable state allowed only inside capsules
- Cross-capsule state mutation forbidden
