# Bare-Metal AI Context Primitives

## Summary
The conversation analyzed the `ghost` repository to understand how the [[Temporal]] dimension maps to a Concept-Skill Graph. The core architectural breakthrough is the realization that AI memory systems should rely entirely on bare-metal primitives that match how LLMs are pre-trained. Rigid frameworks and heavy databases are not the source of truth; they act only as performance indexes.

### Key Breakthroughs
- **Prompt-Based vs. Session-Based Memory:** While `ghost` commits atomic text prompts ("Code is the artifact, intent is the source of truth"), episodic memory for AI should be session-based. A Git commit consolidates an entire session's cognitive work, tracking how the agent's world model ([[Topology Awareness]]) evolves.
- **The Holy Trinity of Native AI Context:**
  1. **[[Markdown]] (Content Dimension):** The shared interface between human and AI; the "What".
  2. **[[JSON]] (Topological Dimension):** The Concept-Skill Graph mapping connections; the "How". LLMs natively understand JSON, acting as a "Digital Hippocampus".
  3. **[[Git]] (Temporal Dimension):** The Episodic Memory; the "When and Why". Git perfectly mimics human [[Episodic Memory]] for a machine, grouping discrete changes into intentional events.
- **Engines as Indexes:** The absolute Source of Truth is the raw files (Markdown/JSON) and the ledger of events (Git Commits). Frameworks, Agent Skills, or databases (like SurrealDB) are "purely for performance" (Materialized Views). If the engine crashes, zero knowledge is lost.
- **Alignment with AI Engineering Trends:** This decoupled graph approach aligns with the current industry shift toward [[KISS]] (Keep It Simple, Stupid) AI engineering. The industry is abandoning monolithic orchestrators in favor of lightweight, [[CLI Coding Agent]] that operate on plain text files using standard Unix tools.

## Related Notes
- [[coretext.memory.concept_skill_graph|The Concept-Skill Graph Architecture]]
- [[coretext.memory.decoupled_graph|Decoupled Graph and Episodic Memory]]
- [[Agility for Agents]]

## Original Prompts Reference
> https://github.com/adamveld12/ghost discuss with me about this repo. connect this to my idea about having git to add the temporal dimension of the skill concept graph. just that, i think, just like human whose memory is session based, git commit  should be session-based instead of prompt-based like this ghost repo. but i think maybe i can still learn from it? i like that they say Code is the artifact, intent is the source of truth

> but looking at this, i think the concept of "git" is the only concept of "time" that somewhat match the human's perception of time that the computer understand, the llm being trained over the internet understand? that said, i think continuing that skill-concept graph for coretext, it should be clear that only git and files are the persistent thing. like without any additional "engine" or "agent skills", the cli agent like claude code can still navigate within the markdown/json files, or use git to see the history. and that said, the 3 atomic concepts for my thesis is only markdown (for storing text, an interface for both human and ai agent), git (for the perception of time and changes), json (the llm already trained on a lot of json, which introduces the structure that needed for graph knowledge base). an agent skill that orchestrate with the tool query graph or something in its skill config, or a whole coretext engine running with surrealdb, are just purely for performance.

> and this is exactly the trend in ai engineering? providing it the very basic and primitive tools? stripping down all the rigid frameworks? that also explain the rise of cli tools again? search to validate if it is true.

> end discussion. save a detailed summary
