> Strategy for the product, distinct from the knowledge notes that describe Coretext itself.
# Status
- Coretext's current strategy is to be a deterministic, file-centric knowledge base and routing engine for agents.
- The visible product surface is the dashboard and the package mirror, while the hidden engine provides the routing and review core.
- **Business Model:** Transitioning from "personal companion" to an "Agent-Native Organization Framework" (Company OS).
- **Competitive Advantage:** B2B "Agent-Native Knowledge Base" that eliminates "Corporate Amnesia" and reduces agent token overhead through deterministic grounding in a file-centric graph.
## The Headless Organization
Coretext envisions a "Headless" filesystem layer where agents operate, audit, and synthesize domain knowledge, decoupled from human interfaces like Slack or Discord.
- **Agent-Native KB:** Every decision, dependency, and policy is a node in a file-centric graph (MD+JSON+Git).
- **Frictionless Human Interface:** Humans stay in Slack/Discord (zero onboarding), while Coretext serves as the ruthless, stateful backend for agents.

## OS = Company = Multi-Agent System = Community = Swarm
- **Everything is a File:** Abstracting organizational resources (org, tasks, ledger) as virtual files, following the Plan 9 philosophy.
- **Git as Organizational Time:**
    - **Atomic Time (Commits):** The logical "save state" of the company.
    - **Heartbeat Time (Pulse):** Wall-clock interrupts for agent autonomy.
    - **Hook Time (Reflex):** Event-based safety and enforcement (Git Hooks).
- **Isolation:** Using Git Worktrees as virtual address spaces for agents to work in private, auditable "offices."

## Git Submodules Triangle Architecture
To enable AI agents to natively access and index documentation without symlink recursion problems, we implemented the Triangle Architecture:
- A private subproject repository `coretext-docs` holds all project knowledge.
- In the codebase repo `coretext`, it is added as a submodule at `coretext-docs/` (retaining the existing code-specific `docs/` folder).
- In the master Obsidian vault `knowledge`, it is added as a submodule at `project/coretext/`.
- Automatic synchronization is bootstrapped via `setup_coretext.sh` and enforced via a worktree-compatible `post-checkout` git hook.

# Backlog
- [[coretext.dev.open-source-swarm-community]]
- [[coretext.memory.trace-sync]]

# Log
- [[Organizational Documentation Architecture]] - the origin of {{project}}.{{scope}}.{{issue}}
- [[coretext.dev.strategy.agent_native_kb]]
- [[coretext.dev.strategy.headless_company]]
- [[coretext.architecture.headless_os]]
# Resource


