# SIE Executor – UML (Complete)

---

## 1. SIE 全体コンポーネント構造図
```plantuml
@startuml SIE_Component

package "SIE (Structured Instruction Executor)" {
    class SIE {
        + execute(instruction: SIEInstruction)
        - validate()
        - parse()
        - dispatch()
    }

    class InstructionParser {
        + parse(raw): SIEInstruction
    }

    class InstructionValidator {
        + validate(instruction): boolean
    }

    class SIEExecutor {
        + run(instruction: SIEInstruction)
        - runNavigation()
        - runClick()
        - runInput()
        - runEval()
    }
}

package "Target Layer (BrowserManager)" {
    class BrowserManager {
        + runAction(action)
    }
}

SIE --> InstructionParser
SIE --> InstructionValidator
SIE --> SIEExecutor
SIEExecutor --> BrowserManager

@enduml
```

## 2. SIE Instruction Life-Cycle Sequence
```plantuml
@startuml SIE_Sequence

actor "Swarm / TOON" as Swarm

Swarm -> SIE : execute(rawInstruction)
SIE -> InstructionParser : parse(raw)
InstructionParser --> SIE : SIEInstruction

SIE -> InstructionValidator : validate(instruction)
InstructionValidator --> SIE : ok

SIE -> SIEExecutor : run(instruction)

SIEExecutor -> BrowserManager : runAction(ActionRequest)
BrowserManager --> SIEExecutor : ActionResult

SIEExecutor --> SIE : result
SIE --> Swarm : FinalResult

@enduml
```

## 3. Instruction Validation Flow
```plantuml
@startuml SIE_Validation

start
:Load JSON schema;
:Check required fields;
if (valid opcode?) then (yes)
else (no)
  :throw ValidationError;
endif

:Check argument shape;
if (OK?) then (yes)
else (no)
  :throw SchemaError;
endif

stop

@enduml
```

## 4. Executor Operation Dispatch
```plantuml
@startuml SIE_Dispatch

start
:receive SIEInstruction;
if (instruction.type == "navigation") then (yes)
  :runNavigation;
elseif (type == "click") then (click)
  :runClick;
elseif (type == "input") then (input)
  :runInput;
elseif (type == "eval") then (eval)
  :runEval;
else (unknown)
  :throw UnsupportedOperationError;
endif

stop

@enduml
```

## 5. Action Delegation to BrowserManager
```plantuml
@startuml SIE_to_BrowserManager

SIEExecutor -> BrowserManager : runAction(ActionRequest)
BrowserManager -> Browser : resolve
Browser -> Context : resolve
Context -> Page : resolve

Page -> Page : performOperation()
Page --> BrowserManager : ActionResult
BrowserManager --> SIEExecutor : ActionResult

@enduml
```
