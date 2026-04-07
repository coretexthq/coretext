# Coretext v2: Transitioning to Deterministic State-Driven Development (D-SDD)

## Executive Summary

This report outlines the architectural transition of the Coretext project from its initial implementations—a rigid file-based approach (Experiment B) and a probabilistic semantic graph approach (Experiment C)—to **Coretext v2: Deterministic State-Driven Development (D-SDD)**. 

Based on rigorous qualitative and quantitative analysis of Project Trore, we identified critical failures in both previous methodologies regarding context management and architectural compliance. Coretext v2 resolves these issues by completely abandoning probabilistic vector search (SurrealDB) and heavy managerial frameworks (BMad) in favor of a brutally minimalist, deterministic SQLite routing engine (`experience.json`) and a **Symmetrical Adversarial Contract** between specialized subagents.

---

## 1. The Impetus for Change: Lessons from Project Trore

Our evaluation of Project Trore exposed fundamental limitations in both file-based and semantic vector-based retrieval systems for autonomous AI agents.

### 1.1. Experiment B (File-Based / BMad): Context Overload and Bureaucracy
In Exp-B, the agent was provided with monolithic specification documents (PRD, Architecture, Epics).
*   **High Spec Alignment:** The agent achieved excellent architectural compliance (93.0% alignment) because the global rules were always present in context.
*   **Token Inefficiency & Tunnel Vision:** Loading entire specifications (~1,300+ lines) for every atomic task resulted in massive token waste. Furthermore, the agent rigidly followed local user story criteria but sometimes missed cross-document requirements.

### 1.2. Experiment C (Coretext v1 Vector Graph): Topological Blindness
In Exp-C, the agent relied on Coretext v1's semantic vector search over AST-parsed document chunks to save tokens.
*   **Token Efficiency:** The graph-augmented agent achieved a 5.4% improvement in overall token efficiency, with peak savings of 30.6% input tokens on complex tasks.
*   **The Architectural Compliance Crisis:** Vector search systematically missed global structural rules (feature-folder structures, state management, type pipelines). These global constraints were *semantically equidistant* from specific feature queries, causing architecture compliance to plummet to **65.1%** (compared to Exp-B's 93.0%).
*   **Nearest-Neighbor Hallucination:** When querying for vague concepts, the vector search returned tangentially related nodes, leading to scope creep and hallucinated requirements.

**The Core Tension:** Exp-B traded efficiency for safety (high token cost, rigid compliance), while Exp-C traded safety for efficiency (token savings, but high architectural drift).

---

## 2. Research & Ideation: Learning from the Ecosystem

To resolve this tension, we analyzed emerging minimalist frameworks and evaluated the long-term viability of heavy execution harnesses.

### 2.1. The Vulnerability of Heavy Harnesses (Why BMad is Replaced)
While BMad provided the necessary "training wheels" to execute complex tasks with current-generation LLMs, it fundamentally acts as a **Managerial Exoskeleton**. Frameworks like BMad, and even newer robust systems like Oh-My-OpenAgent (OmO), rely on rigid internal state machines, dozens of lifecycle hooks, and heavy boilerplate documentation (e.g., forcing a monolithic `epics.md` file) to prevent agent hallucination. 

As foundational models evolve toward superior long-chain reasoning and zero-shot coding capabilities, this heavy scaffolding becomes bureaucratic bloat. Coretext v2 rejects this "harness engineering." We have stripped agent system prompts down to 5-6 essential bullet points, relying instead on the inherent intelligence of foundational models and the physical laws of the project. We decouple the permanent semantic knowledge from the temporary execution tool, ensuring the architecture remains future-proof as models outgrow the need for heavy hand-holding.

### 2.2. Insights from Minimalist Frameworks
1.  **OpenSpec (Fission AI):**
    *   *Insight:* Demonstrated the power of "Delta Specifications" (isolated change folders) and "Knowledge Distillation" (merging deltas back into core specs upon completion). It proved that context can be dynamically expanded and shrunk.
2.  **Superpowers (Obra):**
    *   *Insight:* Validated the necessity of **Subagent Isolation** (using Git worktrees) and strict **Adversarial Review Loops** (Implementer vs. Code Reviewer) to prevent context contamination and enforce quality gates.

### 2.3. The Symmetrical Adversarial Contract
Building on the insights from Superpowers, we implemented a strict "Separation of Powers" using isolated Git worktrees:
*   **The Planner (Legislative):** Interacts with the human, writes the Goal (`target_state.md`), the Scope (`atomic_step.md`), and—crucially—authors **Failing Tests** (The Technical Gate). It never writes application code.
*   **The Executor (Labor):** Boots cold. It only sees the immediate scope, the failing tests, and passive context hints. Its only job is to write code to pass the tests without modifying them. It halts on paradoxes.
*   **The Reviewer (Judicial/Auditor):** Boots cold. It audits the diff against the global `ARCHITECTURE.md`. It verifies the tests were passed without cheating, extracts architectural lessons, and reports back to the human for final merge approval.

---

## 3. The Engine: Deterministic SQLite Context Routing

The most significant technical pivot in Coretext v2 is the removal of SurrealDB and probabilistic vector search. We replaced it with a deterministic routing engine powered by SQLite and a single JSON ledger: `_coretext/experience.json`.

### 3.1. The Edge Ledger (`experience.json`)
Instead of guessing what context an agent needs via vector similarity, `experience.json` maintains a hard-coded, typed edge graph mapping source code paths to specific documentation or lesson files. 

The engine uses strict enum types to dictate *how* context is injected:
*   `docs`: Mandatory full-text injection (e.g., forcing `ARCHITECTURE.md` into the Planner and Reviewer context).
*   `skills`: Mandatory full-text injection of specific capabilities.
*   `templates`: Mandatory injection of formatting skeletons (e.g., `target_state_template.md`), eliminating the need for verbose prompting on how to format outputs.
*   `knowledge`: **Passive hint injection.** If the Executor touches `src/api/auth.py`, SQLite injects a one-line hint that `knowledge/bcrypt_rounds.md` exists, saving tokens while preserving awareness.
*   `archive`: Ignored during execution; used strictly for historical provenance tracking (linking knowledge back to the original `handoff.md`).

### 3.2. Atomic Knowledge over Monolithic Logs
Instead of a monolithic `changelog.md` that breaks SQLite line-number indexing, the Reviewer extracts discoveries into atomic, immutable files (`knowledge/*.md`). The file path becomes the permanent primary key for SQLite.

---

## 4. Resolving the Project Trore Failures

The D-SDD architecture directly addresses the failures observed in our quantitative and qualitative evaluations:

1.  **Solving "Topological Blindness":** Global constraints (like state management and folder structure) are no longer subject to the whims of vector search. `experience.json` maps the Planner and Reviewer to `ARCHITECTURE.md` with a `docs` (mandatory) type. The system is structurally bound to the global laws of physics.
2.  **Solving "Context Overload":** The Executor is shielded from monolithic PRDs and Epics. It only receives the `atomic_step.md`, the failing tests, and precisely targeted `knowledge/*.md` hints injected by SQLite based on the specific files it is modifying.
3.  **Solving "Green-Washing":** By forcing the Planner to write the tests and isolating the Executor to pass them, we prevent the agent from lowering testing standards to achieve a quick success. The Reviewer acts as the semantic backstop.

## 5. Conclusion

Coretext v2 abandons the complexity of probabilistic AI retrieval for the reliability of traditional software engineering primitives: isolated processes, explicit contracts, and deterministic data routing. By externalizing the project's "Mental Model" into `experience.json` and enforcing the Symmetrical Adversarial Contract, we achieve the token efficiency of targeted retrieval without sacrificing the architectural safety of full-context loading. The system is now a highly scalable, bare-metal software factory.