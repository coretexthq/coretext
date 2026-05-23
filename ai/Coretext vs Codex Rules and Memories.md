# Coretext vs Codex Rules and Memories

## Summary
This session analyzed the architecture and functional scope of Coretext, comparing it to other agentic guardrail and memory systems. We explored how Coretext operates as a deterministic, repo-local context-routing system mapping file paths to architectural rules via an append-only JSONL log. Unlike security-oriented sandboxes or probabilistic client memories, Coretext enforces codebase consistency by dynamically managing context hydration and write access.

We conceptualized Coretext as bridging the gap between Codex Rules and Codex Memories. It borrows the deterministic, Git-tracked, and block-capable enforcement style of Codex Rules, and applies it to the engineering design and project architecture domains typical of Codex Memories, providing a reliable cognitive Memory Management Unit (MMU) for agents.

## Problems & Solutions
- **Problem**: Is Coretext redundant with Codex execution rules?
  - **Solution**: No. Codex Rules regulate terminal commands and sandbox security (low-level safety), whereas Coretext regulates file operations and architectural constraints (high-level code alignment).
- **Problem**: How does Coretext compare to client memory systems like Antigravity Knowledge, Codex Memories, or Gemini CLI Auto Memory?
  - **Solution**: Client memories are probabilistic and user-specific history/preference trackers. Coretext is deterministic, repository-bound, and collaborative, utilizing write-guards to ensure rules are read before files are changed.
- **Problem**: Where does Coretext fit in the broader agent landscape?
  - **Solution**: Coretext bridges Codex Rules and Codex Memories, acting as a deterministic context router and architectural guardrail.

## Resource
- [[coretext|Coretext MOC]]
- [[coretext.architecture|Coretext Architecture]]
- [[coretext.context|Coretext Context]]
- [[coretext.resource|Coretext References]]
- [docs/codex_rules.md](file:///Users/mac/Git/coretext/docs/codex_rules.md)
- [docs/antigravity_knowledge.md](file:///Users/mac/Git/coretext/docs/antigravity_knowledge.md)
- [docs/codex_memories.md](file:///Users/mac/Git/coretext/docs/codex_memories.md)
- [docs/gemini_cli_auto_memory.md](file:///Users/mac/Git/coretext/docs/gemini_cli_auto_memory.md)

## Original Prompts
what are the directories you are having access to

compare coretext.md and its child notes, to compare it as a tool, with @[docs/codex_rules.md] , is it redundant of what codex already have

how about coretext being compared to @[docs/antigravity_knowledge.md] and @[docs/codex_memories.md] and @[docs/gemini_cli_auto_memory.md]

so basically, we can say, that, coretext is somewhare between codex rules and codex memories?

/summary then organize for coretext
