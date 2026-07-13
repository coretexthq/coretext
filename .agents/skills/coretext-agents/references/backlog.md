# Coretext Backlog CLI Tool

Use this guide to view note hierarchy backlogs, inspect active backlog items, and audit backlog state for human developers and agents.

## Overview

The backlog lineage tool allows you to print the active backlog items of a project or target note's descendants. Unlike the visualization dashboard, this tool runs directly in the terminal and outputs a clean list.

---

## 1. Commands

To run the backlog lineage script, execute the following command:

```bash
python3 .coretext/backlog_lineage.py <target>
```

Where `<target>` is one of:
- **Project Name**: e.g., `coretext`. Resolves the entire project tree and lists all active backlog items.
- **Qualified Note Name**: e.g., `coretext.architecture.knowledge`. Resolves the scope note path and lists its backlog items and descendants' backlog items.
- **Note Filepath**: e.g., `knowledge/coretext.architecture.knowledge.md`. Resolves the note and lists its backlog items and descendants' backlog items.

---

## 2. Output Format

The output is formatted as a flat list, stripping checkboxes (`[ ]` and `[/]`) and excluding completed items (`[x]`):

```text
- <note_path> BACKLOG
   - <backlog_item_text>
```

For example, running it with `coretext.architecture.knowledge` prints:
```text
- knowledge/coretext.architecture.knowledge.md BACKLOG
   - Decide whether git/subtree mechanics need a future sub-scope note such as `coretext.architecture.knowledge.git`.
   - Define how session JSONL traces should be digested into durable notes, rules, tests, hooks, or graph edges.
   - Evaluate whether the knowledge hierarchy reduces repeated context reconstruction compared with native compaction and ordinary search.
   - Add diff-based injection so review sessions can load knowledge for files changed by `git diff --name-only`.
```

---

## 3. Descendant Filtering

When targeting a specific note (either by qualified name or file path), the script only prints that target note and its descendants (children, grandchildren, etc.). Sibling notes and ancestor notes are completely excluded to keep context focused.
