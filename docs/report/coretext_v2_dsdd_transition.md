# Coretext v2: Transitioning to Deterministic State-Driven Development (D-SDD)

## Executive Summary

This report outlines the architectural transition of the Coretext project from its initial implementations—a rigid Spec-Driven approach (Experiment B) and a semantic Graph-Based approach (Experiment C)—to **Coretext v2: Deterministic State-Driven Development (D-SDD)**. 

Based on rigorous qualitative and quantitative analysis of Project Trore, we identified critical failures in both previous methodologies regarding context management and architectural compliance. Coretext v2 resolves these issues by abandoning probabilistic "Hebbian" memory in favor of a deterministic Operating System metaphor, leveraging isolated subagents and hard-coded dependency graphs.

---

## 1. The Problems: Analysis of Coretext v1 (Exp-B & Exp-C)

Our evaluation of Project Trore (Epic 1) exposed fundamental limitations in both file-based and semantic graph-based retrieval systems for autonomous AI agents.

### 1.1. Experiment B (File-Based / BMad): The "Context Overload" Problem
In Exp-B, the agent was provided with monolithic specification documents (PRD, Architecture, Epics).
*   **Hierarchical Tunnel Vision:** The agent frequently suffered from "Lost in the Middle" syndrome. Overwhelmed by the volume of text (~1,300+ lines), it rigidly followed local user story criteria but missed cross-document requirements (e.g., missing "FR3: Keyword Search" buried in the PRD).
*   **Token Inefficiency:** Loading entire specifications for every atomic task resulted in massive token waste and diminishing returns as the project scaled.

### 1.2. Experiment C (Coretext v1 Graph): The "Topological Blindness" Problem
In Exp-C, the agent was blocked from reading full files and relied on Coretext v1's semantic vector search over AST-parsed document chunks.
*   **The "Architectural Triad" Failure:** The vector search systematically missed global structural rules (feature-folder structures, state management, type pipelines). These global constraints were *semantically equidistant* from specific feature queries, causing the agent to retrieve only local business logic and fail architectural compliance (scoring 65.1% vs Exp-B's 93.0%).
*   **Nearest-Neighbor Pollution (Hallucination):** When querying for non-existent or vague concepts, the vector search returned tangentially related nodes, leading to scope creep and hallucinated requirements.
*   **Non-Deterministic Queries:** The system relied on the agent to formulate natural language queries (`query_knowledge`). Poorly formulated queries led to cascading failures.

**The Core Tension:** Exp-B traded efficiency for safety (high token cost, rigid compliance), while Exp-C traded safety for efficiency (token savings, but high architectural drift).

---

## 2. Research & Ideation: Learning from the Ecosystem

To resolve this tension, we analyzed emerging minimalist frameworks and evaluated the long-term viability of heavy execution harnesses.

### 2.1. The Vulnerability of Heavy Harnesses (Why BMad is Replaced)
While BMad provided the necessary "training wheels" to execute complex tasks with current-generation LLMs, it fundamentally acts as a **Managerial Exoskeleton**. Frameworks like BMad, and even newer robust systems like Oh-My-OpenAgent (OmO), rely on rigid internal state machines, dozens of lifecycle hooks, and heavy boilerplate documentation (e.g., forcing a monolithic `epics.md` file) to prevent agent hallucination. 

As foundational models evolve toward superior long-chain reasoning and zero-shot coding capabilities, this heavy scaffolding becomes bureaucratic bloat. Coretext v2 recognizes that the execution layer (the harness) is ephemeral and subject to rapid market trends, while the data layer (the graph) is permanent. By replacing BMad with a minimal, barebone set of instructions (D-SDD), we achieve **Framework Agnosticism**. We decouple the permanent semantic knowledge from the temporary execution tool, ensuring the architecture remains future-proof as models outgrow the need for heavy hand-holding.

### 2.2. Insights from Minimalist Frameworks
1.  **OpenSpec (Fission AI):**
    *   *Insight:* Demonstrated the power of "Delta Specifications" (isolated change folders) and "Knowledge Distillation" (merging deltas back into core specs upon completion). It proved that context can be dynamically expanded and shrunk.
2.  **Superpowers (Obra):**
    *   *Insight:* Validated the necessity of **Subagent Isolation** (using Git worktrees) and strict **Adversarial Review Loops** (Implementer vs. Code Reviewer) to prevent context contamination and enforce quality gates.

---

## 3. The Solution: Coretext v2 and D-SDD

Coretext v2 introduces **Deterministic State-Driven Development (D-SDD)**. It shifts the paradigm from a biological "Hebbian/Intuition" model to a mathematically rigorous **Operating System (OS) Metaphor**. 

### 3.1. The OS Metaphor Architecture
We redefined the system components to enforce strict causality (`Intent -> Execution`):

*   **The State (The Filesystem/Law):** `ARCHITECTURE.md` and `docs/` are the immutable, deterministic source of truth. We eliminated "Agile slop" (massive Epics/PRDs).
*   **The Kernel (Planner Agent):** The high-level orchestrator residing on the `main` branch. It interacts with the human, defines the exact atomic task, and manages the State. It *never* writes code.
*   **The User Process (Executor Subagent):** Boots **cold** in an isolated Git worktree. It is a "blind typist" given only the immediate task (`target_state.md` and `atomic_step.md`) and the global `ARCHITECTURE.md`.
*   **The Quality Gate (Reviewer Subagent):** Boots cold in the Executor's worktree. It nitpicks the diff against the architecture, applies minor fixes, and reports back to the Kernel.

### 3.2. Resolving "Context Overload" (The BMad Failure)
We eliminated monolithic files. The Planner translates high-level discussions into ephemeral, hyper-focused artifacts:
*   `_coretext/target_state.md` (The "What")
*   `_coretext/atomic_step.md` (The "How")
By restricting the Executor to these localized files and the global `ARCHITECTURE.md`, we mathematically eliminate the "Lost in the Middle" phenomenon observed in Exp-B.

### 3.3. Resolving "Topological Blindness" (The Coretext v1 Failure)
We abandoned fuzzy vector search for task execution. SurrealDB is no longer a semantic search engine; it is the **Memory Management Unit (MMU) / Page Table**.
*   **Deterministic Routing:** Instead of the agent guessing queries, the Coretext daemon intercepts native file reads (e.g., `cat auth.py`) and executes a hard-coded SurrealQL lookup (`[auth.py] -> REQUIRES -> [security.md]`).
*   **Passive Injection:** The daemon passively injects a system prompt (e.g., *"Hint: Read docs/security.md"*), ensuring the agent receives the exact cross-document context (like FR3) *Just-In-Time*, without vector pollution.

### 3.4. The Distillation Loop & Telemetry (Replacing Hebbian Decay)
Agents no longer update probabilistic weights. They generate an explicit telemetry audit log (`_coretext/experience.json`).
*   **The Hardware Interrupt:** If an Executor hits an architectural impossibility, it does not hallucinate a workaround. It halts, writes the paradox to `_coretext/handoff.md`, and yields to the Planner.
*   **Distillation:** The Planner periodically analyzes the `experience.json` telemetry. If it sees that `payment.py` consistently requires the `api_handling` skill, the Planner executes a deterministic query to create a permanent, hard-coded edge in the SurrealDB graph. 
*   Temporary execution artifacts (`atomic_step.md`, `handoff.md`) are deleted upon completion, keeping the knowledge base lean.

---

## 4. Conclusion

Coretext v2 successfully bridges the "Topological Autonomy Gap." By externalizing the project's mental model into a deterministic graph and enforcing process isolation via the OS metaphor, D-SDD achieves the token efficiency of targeted retrieval without sacrificing the architectural safety of full-context loading. The system is now a highly scalable, headless software factory.