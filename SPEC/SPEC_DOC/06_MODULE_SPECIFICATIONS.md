# MODULE SPECIFICATIONS

Modules are sovereign within capsules.

## Rules
- External interfaces are contracts.
- Internal structure is mutable.
- Breaking a contract requires human approval.

## Trust Model
- LLM-generated code is untrusted by default.
- Validation gates are mandatory.
- Tests are first-class artifacts.

## Module Declarations
Modules must declare:
- Inputs
- Outputs
- Side effects

## Core Data Types (TOON)
The following types define the standardized communication protocol between agents (`packages/toon`).

### Mission
```typescript
type Mission {
    id: UUID;
    title: string;
    description: string; // Detailed description of the task
    evaluation_prompt: string; // Dynamic Evaluation Criteria
    created_at: Timestamp;
    created_by: string; // default("human")
}
```

### Proposal
```typescript
type Proposal {
    id: UUID;
    mission_id: UUID; // Link to Mission
    author_id: AgentId;
    content: string; // The proposed solution (code, text, plan, etc.)
    reasoning: string?; // Explanation of why this solution was chosen
    instructions: Instruction[]?; // Structured Instructions for SIE
    metadata: Record<string, any>?;
    created_at: Timestamp;
}
```

### Critique
```typescript
type Critique {
    proposal_id: UUID;
    mission_id: UUID;
    reviewer_id: AgentId;
    feedback: string; // Detailed feedback based on evaluation_prompt
    score: number; // 0-100
    status: "ACCEPTED" | "REJECTED" | "NEEDS_REVISION";
    created_at: Timestamp;
}
```

### Instruction (SIE)
```typescript
type Instruction {
    action: "navigate" | "click" | "input" | "extract" | "noop";
    target: string?; // Selector or URL
    value: string?; // Input text
    options: Record<string, any>?;
}
```
