# Summary: Adding a Graph Dimension to a Flat Filesystem

## The Problem
Moving beyond a flat filesystem without the complexity of a heavy database (like [[SurrealDB]]).

## The "Middle Ground" Architecture
1. **Two Sources of Truth:**
   - **Content:** [[Markdown]] files (Human-readable).
   - **Structure:** A single external [[JSON]] file ([[Machine-Readable State]] map).
1. **[[Progressive Disclosure]]:** The agent loads the JSON map first to see the topology, then reads specific file content only when needed ([[Just-in-Time]]).
2. **Brute Force Retrieval:** Use standard [[CLI]] tools (grep/regex) for search. The database becomes an optimization, not a requirement.

## Time and Memory
1. **[[Episodic Memory]]:** Human memory works by "sessions." We use **[[Git]] Commits** as the atomic time unit instead of exact timestamps.
2. **Causal Index:** Each node or heading in the JSON structure can link to a commit hash. This tracks how content was gradually created.
3. **[[Temporal]] Graph:** Since the structure is versioned with the files, the agent can checkout old commits to see how the graph and its content have changed over time.

## Granularity
- **Heading-Based:** The structure maps connections between specific headings, not just whole files. This allows the agent to navigate using precise line numbers.

## Conclusion
A "Headless" [[Knowledge Graph]] that preserves the [[Obsidian]] feel while giving the agent temporal and topology awareness.

---
## Related Notes Read
- [[What I Learned Building a Memory System for My Coding Agent]]
- [[coretext]]
- [[The Assistant Axis]]
- [[Agility for Agents]]
- [[dotMD]]
- [[resource/Claude Code Context Engineering]]
- [[BMAD]]
- [[resource/Progressive Disclosure]]
