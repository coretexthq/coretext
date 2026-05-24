## Chapter I: Introduction
*   **Topological Autonomy Gap:** Context overload and flat-file limitations in autonomous agent loops.
    *   **Topological Blindness:** Failure of vector search to respect hierarchical constraints.
    *   **Ex Post Facto Development:** Anti-pattern of writing specifications after code generation.
*   **Proactivity vs. Autonomy:**
    *   [Agentic Coding Needs Proactivity, Not Just Autonomy](https://arxiv.org/abs/2605.06717): Argues for proactive information-gathering agents.
*   **Constraint Amnesia & Agent Failure Modes:**
    *   [ProjDevBench](https://arxiv.org/abs/2602.01655): Identifies agents passing functional tests but violating architectural rules.
    *   [Interaction Smells](https://arxiv.org/abs/2603.09701): Classifies failures like "Must-Do Omission" and "Must-Not Violate."
*   **Deterministic Policies:**
    *   `Agent Convention Enforcement (andrewpat24)`: Outlines pre-tool regex routing and post-tool hook checks.
    *   `Shipping AI That Works (Mightybot)`: Outlines project-level deterministic policies over soft prompt cues.

## Chapter II: Theoretical Background & Related Work
*   **Agent Evolution & Anatomy:**
    *   [SWE-Agent](https://arxiv.org/abs/2405.15793): CLI-native agent baseline.
    *   [Building Effective AI Coding Agents for the Terminal](https://arxiv.org/abs/2603.05344): Terminal optimization strategies.
    *   [Recursive Language Models](https://arxiv.org/abs/2512.24601): Limits of scaling under recursive steps.
    *   [AIOS: LLM Agent Operating System](https://arxiv.org/abs/2403.16971): Treats LLM as kernel for scheduling and resource control.
*   **Ecosystem Standardization:**
    *   **AGENTS.md ([[AGENTS.md file]]):** Repo-level context conventions (https://agents.md/).
        *   [Evaluating AGENTS.md](https://arxiv.org/abs/2602.11988): Validates value of repository-level context files.
    *   **Agent Skills ([[Agent Skills]]):** Modular capabilities using frontmatter (https://www.skills.sh/, https://agentskills.io/).
        *   [Agent Skills for Large Language Models](https://arxiv.org/abs/2602.12430): Modular tool-execution paradigm.
    *   **Hooks ([[Hooks]]):** Pre/post hooks in CLI agents.
        *   [Claude Code Hooks](https://code.claude.com/docs/en/hooks)
        *   [OpenAI Codex Hooks](https://developers.openai.com/codex/hooks)
        *   [Gemini CLI Hooks](https://geminicli.com/docs/hooks/)
    *   [Natural-Language Agent Harnesses](https://arxiv.org/abs/2603.25723): Standardizing tool-use protocols via language specifications.
*   **MCP vs. CLI Agent Platforms:**
    *   [[will MCP be dead soon]]: Critiques token inflation in JSON-RPC servers.
    *   [[You Need to Rewrite Your CLI for AI Agents]]: Recommends clean CLI flags and JSON interfaces over custom servers.
    *   `Critique on Harness Engineering (Substack)`: validation of pivot away from heavy harnesses.
    *   `Claude Code Memory System`: Official `@` file injection documentation.
    *   `Anthropic Best Practices`: Claude Code context engineering standards.
    *   `sshh.io / arbatov.dev Guides`: Best practices for CLI agent memories.
    *   `shanraisshan guide`: Community Claude Code best practice compilation.
*   **Memory Architectures & GraphRAG:**
    *   [Graphs Meet AI Agents](https://arxiv.org/abs/2506.18019): Graph taxonomy for agent reasoning.
    *   [AriGraph](https://arxiv.org/abs/2407.04363): Graph world models with episodic memory.
    *   [A-MEM](https://arxiv.org/abs/2502.12110): Agentic memory systems.
    *   `Creating Knowledge Graphs in SurrealDB (blog)`: Generating graphs from unstructured data.
    *   `SurrealDB / SurrealMCP`: Multi-model database for indexing context graphs.
    *   `SQLite & JSONL/NDJSON`: Storage choice for append-only logs.
*   **Client Memory Comparison:**
    *   [[Coretext vs Codex Rules and Memories]]: Comparison of Coretext to Codex and Gemini CLI memory.
    *   `Codex Rules`: Regex-based command blocking sandboxes.
    *   `Codex Memories`: Trans-session developer preferences.
    *   `Antigravity Knowledge`: Autonomous capture of solutions as Knowledge Items.
    *   `Gemini CLI Auto Memory`: Transcripts scanning for codebase patches.
*   **Orchestration Frameworks:**
    *   **Spec-Driven Development:** `obrasuperpowers`, `fission-ai_openspec`, `BMad Method`, `Oh-My-Openagent (OmO)`.
    *   **Legacy Frameworks:** `ClaudeKit`, `LangGraph`, `DeerFlow`, `CrewAI`. Rigid DAGs that smart models outgrow.
- [[coretext.dev.open-source-swarm-community]]

## Chapter III: System Design & Methodology
*   **Methodology & Metaphors:**
    *   **Design Science Research (DSR):** Recursive self-reflexive bootstrapping via BMad.
    *   **Virtual MMU Metaphor:** CPU/MMU page-fault paging model applied to context hydration.
    *   [Transformer Residual](https://arxiv.org/abs/2603.15031): Proof of attention models serving as secondary context layer.
*   **Design Standards:**
    *   `ISO/IEC/IEEE 29148:2018`: Requirements engineering standard.
    *   `SysML v2`: Model-based systems engineering modeling.
    *   `Executable Specifications`: BDD testing via Gherkin/Cucumber.
    *   `GitNexus`: Separating code intelligence from repository topologies.

## Chapter IV: Implementation & Mechanization
*   **AST Analysis:**
    *   `LSP, pyright, marksman, treesitter`: Construction of code-spec AST connections.
*   **Linter Enforcement:**
    *   [SlopCodeBench](https://arxiv.org/abs/2603.24755): Proves failure of purely prompt-based context over time.
    *   **AST Enforcement:** Natural-language rule compilation to zero-token CI blockers.

## Chapter V: Results & Quantitative Evaluation
*   **Metrics & Evaluation:**
    *   [SWE-CI](https://arxiv.org/abs/2603.03823): Tracking agentic code quality degradation via "EvoScore."
    *   [EvoClaw](https://arxiv.org/abs/2603.13428): Analyzes recall vs. precision and the "snowball effect" of technical debt.
*   **Project Trore Case Study:**
    *   Quantitative case study measuring token efficiency and API call reductions.

## Chapter VI: Conclusion & Future Directions
*   **Future Paradigms:**
    *   **Hebbian Learning (`experience.json`):** Git hooks tracing tool calls to update synapse weights.
    *   **Stateful Pointers:** Direct CLI node arguments instead of context-dumping.
