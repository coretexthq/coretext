# Experimental Design: Superpowers vs. Superpowers + Coretext v2 (D-SDD)

**Objective:** To empirically prove that while prompt-based frameworks (Superpowers) excel at initial code generation, they inevitably succumb to structural erosion and constraint amnesia over long-horizon tasks. We hypothesize that embedding Superpowers within Coretext v2's Deterministic State-Driven Development (D-SDD) "Operating System" will mathematically halt this degradation by enforcing mechanical architectural boundaries and explicit state transfers between cold-booted agent sessions.

---

## 1. Theoretical Foundations (The 5 Benchmarks)

This experiment abandons the flawed "snapshot-based" evaluation paradigm in favor of a continuous, evolutionary benchmark. Our methodology is directly synthesized from five recent breakthroughs in AI software engineering evaluation:

1.  **SlopCodeBench (arxiv:2603.24755):** We adopt the **Iterative Trajectory** model. The agent is forced to extend its *own prior code* across 5 checkpoints. We measure **Structural Erosion** (complexity concentrating in God Components) and **Verbosity** (redundant code) as the primary indicators of framework failure.
2.  **ProjDevBench (arxiv:2602.01655):** We adopt the **Strict Constraint / Black-Box** model. The problem specifies *only* the external behavior and absolute global invariants (e.g., "URL-state only"). We do not prescribe internal React component structures, forcing the agent to make (and live with) its own architectural decisions.
3.  **SWE-CI (arxiv:2603.03823):** We adopt the concept of **Maintainability via Evolution**. We will calculate an **EvoScore** for the final output, weighting the success of later milestones (Checkpoints 4 & 5) higher than the initial MVP to penalize technical debt accumulation.
4.  **EvoClaw (arxiv:2603.13428):** We adopt the **Develop-in-place, evaluate-in-isolation** pipeline. Each milestone operates on the persistent Git state of the previous one. We measure the divergence between **Recall** (ability to add the new map view) and **Precision** (preventing the regression of the previous URL filter logic).
5.  **Interaction Smells (arxiv:2603.09701v2):** We use this taxonomy as our qualitative penalty ledger. Specifically, we will track **Must-Do Omission** and **Must-Not Violate** events (e.g., when Superpowers forgets the global URL constraint and uses `useState`).

---

## 2. Experimental Setup & Constraints

To ensure scientific validity, both the Control and Treatment groups must operate under identical environmental constraints.

### The "Clean Session" Constraint
The primary variable we are testing is **Context Management vs. Mechanical State**. Therefore, both approaches will use the exact same number of fresh LLM sessions per Milestone. 
*   **1 Milestone = 1 Clean Session Lifecycle.**
*   Between milestones, the LLM context window is completely wiped. 
*   The *only* things that survive between milestones are the artifacts committed to the file system (Code, Specs, Knowledge Markdown files). This forces the frameworks to rely on their respective methods for passing down knowledge.

### The "Framework Agnostic" Harness
We will use the same underlying LLM (e.g., Claude 3.5 Sonnet or Opus 4.6) and the same terminal harness (Claude Code) for both runs to isolate the framework logic as the only independent variable.

---

## 3. Control Group: Superpowers Alone

**Philosophy:** Relying on massive prompt injection and the LLM's internal attention mechanism to maintain architectural discipline.

**Workflow per Milestone (1 Clean Session):**
1.  Initialize a fresh Claude Code session.
2.  Provide the `checkpoints.md` Global Invariants and the specific prompt for Milestone *N*.
3.  Instruct the agent: `"Use the Superpowers framework to implement this milestone. You must use the brainstorming, writing-plans, and test-driven-development skills."`
4.  Allow the agent to execute autonomously until it declares the milestone complete.
5.  **Artifact Transfer:** The agent must rely on Superpowers' native plan documents (`docs/superpowers/plans/`) to pass context to the next milestone's fresh session.

**Expected Failure Mode:** By Milestone 3 or 4, the context window will fill with React code. The agent will experience *Constraint Amnesia*, forget the Global Invariants, and fail to read its own previous plan documents deeply enough, resulting in a "Must-Not Violate" Interaction Smell.

---

## 4. Treatment Group: Superpowers + Coretext v2 (D-SDD)

**Philosophy:** Treating Superpowers as ephemeral "User-Space" execution skills, governed by Coretext v2 as the strict "Kernel" enforcing state transfer and review.

**Workflow per Milestone (Orchestrated by Coretext):**
*Coretext v2 physically breaks the milestone into discrete, cold-booted agent processes.*

1.  **Phase 1: Planner (Session A)**
    *   Boot Coretext `.gemini/agents/planner.md`.
    *   Input: Global Invariants + Milestone *N* + existing `ARCHITECTURE.md`.
    *   Action: Planner uses Superpowers' `writing-plans` skill to generate `atomic_step.md` and writes the exact Failing Tests (F2P).
    *   *Session terminates.*
2.  **Phase 2: Executor (Session B)**
    *   Boot Coretext `.gemini/agents/executor.md`.
    *   Input: `atomic_step.md` + passive SQLite injected `knowledge/*.md`.
    *   Action: Executor uses Superpowers' `test-driven-development` and `systematic-debugging` skills. It is physically trapped; it must make the Planner's tests pass.
    *   *Session terminates.*
3.  **Phase 3: Reviewer (Session C)**
    *   Boot Coretext `.gemini/agents/reviewer.md`.
    *   Input: Git Diff + `ARCHITECTURE.md` (containing the URL-State Only rule).
    *   Action: Audits the code. If Superpowers used `useState`, the Reviewer mechanically rejects the commit. If approved, it extracts lessons to `knowledge/` and updates `experience.json`.
    *   *Session terminates.*

**Expected Success Mode:** Because the Reviewer boots completely cold and reads *only* the Diff and the Architecture rules, it is immune to context exhaustion. It will mechanically block the Structural Erosion that Superpowers attempts to introduce in Milestone 3 and 5.

---

## 5. Evaluation & Measurement

After both frameworks complete (or fail) the 5 milestones, we will evaluate the resulting Git repositories:

1.  **Automated Testing (F2P / P2P):** Run the test assertions defined in `checkpoints.md`. 
    *   *Calculation:* Determine the **Recall** (features added) and **Precision** (regressions prevented) for each framework.
2.  **Structural Erosion Analysis:** Run an ESLint Cyclomatic Complexity checker against the `src/` directory at the end of Milestone 1, 3, and 5. 
    *   *Proof:* We expect Superpowers' main filtering component to spike in complexity, while Coretext's codebase remains modular due to Reviewer rejection of God Components.
3.  **Interaction Smell Audit:** Manually review the git commit history. Count the number of times Superpowers violated the URL-only rule (Must-Not Violate) compared to Coretext v2.
4.  **EvoScore:** Calculate the final SWE-CI EvoScore, proving that Coretext v2 maintained a higher trajectory of functional correctness over the 5 iterations.