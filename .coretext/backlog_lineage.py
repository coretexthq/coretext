#!/usr/bin/env python3
# /// script
# requires-python = ">=3.8"
# ///

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any

# Ensure we can import note_hierarchy
script_dir = Path(__file__).resolve().parent
if str(script_dir) not in sys.path:
    sys.path.insert(0, str(script_dir))

from note_hierarchy import (
    NoteHierarchy,
    NoteHierarchyError,
    _resolve_target,
)

# A Node type is a dictionary representing a node in the tree.
Node = dict[str, Any]


def parse_backlog_items(root_path: Path, relative_path: str | None) -> list[str]:
    """Parse active backlog items from the given note path, stripping checkboxes."""
    if not relative_path:
        return []
    path = root_path / relative_path
    if not path.is_file():
        return []
    try:
        content = path.read_text(encoding="utf-8")
    except Exception:
        return []

    lines = content.splitlines()
    in_backlog = False
    items = []
    for line in lines:
        trimmed = line.strip()
        if trimmed == "# Backlog":
            in_backlog = True
            continue
        if in_backlog:
            # Backlog section ends at the next divider or header
            if trimmed == "---" or trimmed == "# Resource" or (trimmed.startswith("#") and trimmed != "# Backlog"):
                break
            if trimmed.startswith("- ") or trimmed.startswith("* "):
                item_text = trimmed[2:].strip()
                # Check for checkboxes and filter out completed ones
                is_completed = False
                if item_text.startswith("[x]") or item_text.startswith("[X]"):
                    is_completed = True
                elif item_text.startswith("[ ]") or item_text.startswith("[/]"):
                    item_text = item_text[3:].strip()
                
                if not is_completed and item_text:
                    items.append(item_text)
    return items


def collect_backlog_entries(
    root_path: Path,
    node: Node,
    seen: set[str],
) -> list[tuple[str, list[str]]]:
    """Recursively collect nodes that have active backlog items."""
    entries = []
    node_path = node["path"]
    if node_path and not node["virtual"] and node_path not in seen:
        items = parse_backlog_items(root_path, node_path)
        if items:
            entries.append((node_path, items))
            seen.add(node_path)
            
    for child in node["children"]:
        entries.extend(collect_backlog_entries(root_path, child, seen))
    return entries


def render_flat_backlogs(root_path: Path, tree: Node) -> list[str]:
    """Collect and format backlog items in a simplified flat list."""
    seen: set[str] = set()
    entries = collect_backlog_entries(root_path, tree, seen)
    
    lines = []
    for node_path, items in entries:
        lines.append(f"- {node_path} BACKLOG")
        for item in items:
            lines.append(f"   - {item}")
    return lines


def resolve_input_target(
    root_path: Path,
    target: str,
) -> tuple[str, bool, str | None]:
    """Resolve the command line target into project, is_project_root, and relative path."""
    # Normalize target path
    # If the target doesn't contain dot or slash, try to treat it as project name
    if (
        not target.endswith(".md")
        and "/" not in target
        and "\\" not in target
        and "." not in target
    ):
        proj_file = root_path / "knowledge" / f"{target}.md"
        if proj_file.is_file():
            return target, True, f"knowledge/{target}.md"

    # Try resolving it as a note path using _resolve_target
    try:
        norm_target = target
        if not target.startswith("knowledge/") and not target.startswith("knowledge\\"):
            if target.startswith("ai/"):
                norm_target = f"knowledge/{target}"
            else:
                if (root_path / "knowledge" / "ai" / target).is_file():
                    norm_target = f"knowledge/ai/{target}"
                elif (root_path / "knowledge" / f"{target}.md").is_file():
                    norm_target = f"knowledge/{target}.md"
                else:
                    norm_target = f"knowledge/{target}"

        if not norm_target.endswith(".md"):
            norm_target += ".md"

        _, relative_target, project = _resolve_target(root_path, norm_target)
        
        # If target matches project file itself, treat it as project root tree view
        if relative_target == f"knowledge/{project}.md":
            return project, True, relative_target
        return project, False, relative_target
    except Exception:
        # Fallback: assume it is a project name
        return target, True, None


def find_node_by_path(node: Node, target_path: str) -> Node | None:
    """Find a node by its path within the tree."""
    if node.get("path") == target_path:
        return node
    for child in node.get("children", []):
        found = find_node_by_path(child, target_path)
        if found:
            return found
    return None


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Display note hierarchy and active backlog items for a target note lineage or project."
    )
    parser.add_argument(
        "target",
        help="Project name or target note path (e.g. 'coretext' or 'knowledge/coretext.dashboard.md')",
    )
    args = parser.parse_args()

    root_path = Path(__file__).resolve().parent.parent
    hierarchy = NoteHierarchy(root_path)

    project_name, is_project_root, relative_target = resolve_input_target(
        root_path, args.target
    )

    try:
        tree = hierarchy.build_tree(project_name)
        if not is_project_root and relative_target:
            target_node = find_node_by_path(tree, relative_target)
            if target_node:
                tree = target_node
            else:
                tree = hierarchy.lineage(relative_target)
            
        lines = render_flat_backlogs(root_path, tree)
        if lines:
            print("\n".join(lines))
    except NoteHierarchyError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2
    except Exception as exc:
        print(f"Unexpected error: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
