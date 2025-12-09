# Swarm × TOON – UML (Complete)

---

## 1. 全体アーキテクチャ構造
```plantuml
@startuml Swarm_TOON_Architecture

package "Swarm" {
    class SwarmOrchestrator {
        + runMission(mission)
        + dispatchToNode()
    }

    class SwarmNode {
        + execute(task)
        + report()
    }
}

package "TOON (Task-Oriented Operator Notation)" {
    class TOONParser {
        + parse(toonText): TOONInstruction
    }

    class TOONValidator {
        + validate(TOONInstruction)
    }

    class TOONGenerator {
        + generateOptimizedSteps()
    }

    class TOONInstruction {
        opcode: string
        params: Map
    }
}

package "Execution Layer" {
    class SIE {
        + execute(instruction)
    }
}

SwarmOrchestrator --> SwarmNode
SwarmNode --> TOONParser
TOONParser --> TOONValidator
TOONValidator --> TOONGenerator
TOONGenerator --> SIE

@enduml
```

## 2. Swarm Mission Execution Sequence
```plantuml
@startuml Swarm_TOON_Sequence

actor "User / AI Agent" as User

User -> SwarmOrchestrator : runMission(spec)

SwarmOrchestrator -> SwarmNode : assignTask()
SwarmNode -> TOONParser : parse(toonText)
TOONParser --> SwarmNode : TOONInstruction

SwarmNode -> TOONValidator : validate(TOONInstruction)
TOONValidator --> SwarmNode : Valid

SwarmNode -> TOONGenerator : generateOptimizedSteps()
TOONGenerator --> SwarmNode : OptimizedTOON[]

SwarmNode -> SIE : execute(step)
SIE --> SwarmNode : StepResult

SwarmNode --> SwarmOrchestrator : Report(result)
SwarmOrchestrator --> User : Final Mission Result

@enduml
```

## 3. TOON Instruction Normalization Flow
```plantuml
@startuml TOON_Normalization

start
:Receive TOON text;
:Trim / Remove comments;
:Tokenize into opcode + params;
:Normalize parameter naming;

if (well-formed?) then (yes)
  :Construct TOONInstruction;
else (no)
  :Raise TOONSyntaxError;
endif

stop

@enduml
```

## 4. Swarm Node Task Dispatch (Parallel)
```plantuml
@startuml Swarm_Parallel

SwarmOrchestrator -> SwarmNode1 : task A
SwarmOrchestrator -> SwarmNode2 : task B
SwarmOrchestrator -> SwarmNode3 : task C

SwarmNode1 -> SIE : execute(A)
SwarmNode2 -> SIE : execute(B)
SwarmNode3 -> SIE : execute(C)

SIE --> SwarmNode1 : result A
SIE --> SwarmNode2 : result B
SIE --> SwarmNode3 : result C

SwarmNode1 --> SwarmOrchestrator : report A
SwarmNode2 --> SwarmOrchestrator : report B
SwarmNode3 --> SwarmOrchestrator : report C

@enduml
```

## 5. Mission Completion Aggregation
```plantuml
@startuml Swarm_Aggregation

start

:Initialize result set;

repeat
    :Receive report from SwarmNode;
    :Merge result into mission state;
repeat while (remaining tasks?)

:Finalize mission;
stop

@enduml
```
