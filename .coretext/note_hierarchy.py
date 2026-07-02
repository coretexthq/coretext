#!/usr/bin/env python3
# /// script
# requires-python = ">=3.8"
# ///
"""Deterministic hierarchy construction for Coretext knowledge notes."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Iterable


Node = dict[str, Any]


class NoteHierarchyError(ValueError):
    """Base error for hierarchy construction and projection failures."""


class InvalidProjectError(NoteHierarchyError):
    """Raised when a project name cannot identify a hierarchy root."""


class InvalidTargetError(NoteHierarchyError):
    """Raised when a lineage target is outside the supported note surfaces."""


class TargetNotFoundError(NoteHierarchyError):
    """Raised when a lineage target does not exist in the hierarchy."""


def _validate_project(project: str) -> str:
    project = project.strip()
    if (
        not project
        or project in {".", ".."}
        or "." in project
        or "/" in project
        or "\\" in project
    ):
        raise InvalidProjectError(
            f"Invalid project name {project!r}; expected one filename segment"
        )
    return project


def _belongs_to_project(qualified_name: str, project: str) -> bool:
    return qualified_name == project or qualified_name.startswith(f"{project}.")


def _relative_path(path: Path, repository_root: Path) -> str:
    return path.relative_to(repository_root).as_posix()


def _node(
    qualified_name: str,
    node_type: str,
    path: str | None,
    *,
    virtual: bool,
    name: str | None = None,
) -> Node:
    node_id = (
        f"session::{qualified_name}"
        if node_type == "session"
        else qualified_name
    )
    res = {
        "id": node_id,
        "qualifiedName": qualified_name,
        "name": name if name is not None else qualified_name.rsplit(".", 1)[-1],
        "type": node_type,
        "path": path,
        "virtual": virtual,
        "children": [],
    }
    if node_type == "session":
        res["sessionName"] = qualified_name
    return res


def _scan_markdown_files(directory: Path) -> Iterable[Path]:
    if not directory.is_dir():
        return ()
    return (
        path
        for path in sorted(directory.iterdir(), key=lambda item: item.name)
        if path.is_file() and path.suffix == ".md"
    )


def _sort_children(node: Node) -> None:
    node["children"].sort(
        key=lambda child: (
            1 if child["type"] == "session" else 0,
            child["qualifiedName"],
        )
    )
    for child in node["children"]:
        _sort_children(child)


def _check_has_backlog(repository_root: Path, relative_path: str) -> bool:
    if not relative_path:
        return False
    absolute_path = repository_root / relative_path
    if not absolute_path.is_file():
        return False
    try:
        content = absolute_path.read_text(encoding="utf-8")
        lines = content.splitlines()
        in_backlog = False
        backlog_content = ""
        for line in lines:
            trimmed = line.strip()
            if trimmed == "# Backlog":
                in_backlog = True
                continue
            if in_backlog:
                if trimmed == "---" or trimmed == "# Resource":
                    break
                backlog_content += trimmed
        return len(backlog_content) > 0
    except Exception:
        return False


def auto_detect_project(knowledge_dir: Path) -> str:
    if knowledge_dir.is_dir():
        for path in sorted(knowledge_dir.iterdir()):
            if path.is_file() and path.suffix == ".md" and path.stem.lower() != "readme":
                return path.stem.split(".")[0]
    return "coretext"


def build_note_tree(repository_root: str | Path, project: str | None) -> Node:
    """Build the complete durable/session hierarchy for one project."""

    root_path = Path(repository_root).resolve()
    knowledge_dir = root_path / "knowledge"
    if not knowledge_dir.is_dir():
        raise NoteHierarchyError(
            f"Knowledge directory not found: {knowledge_dir}"
        )

    # Auto-detect project if none is specified or if the specified one doesn't exist
    if not project or not any(_belongs_to_project(path.stem, project) for path in _scan_markdown_files(knowledge_dir)):
        project = auto_detect_project(knowledge_dir)

    project = _validate_project(project)
 
    durable_paths = {
        path.stem: _relative_path(path, root_path)
        for path in _scan_markdown_files(knowledge_dir)
        if _belongs_to_project(path.stem, project)
    }
    session_paths = {
        path.stem: _relative_path(path, root_path)
        for path in _scan_markdown_files(knowledge_dir / "ai")
        if _belongs_to_project(path.stem, project)
    }

    root = _node(
        project,
        "project",
        durable_paths.get(project),
        virtual=project not in durable_paths,
        name=project,
    )
    if root["path"] and _check_has_backlog(root_path, root["path"]):
        root["hasBacklog"] = True
    durable_nodes: dict[str, Node] = {project: root}

    for qualified_name in sorted(
        durable_paths,
        key=lambda name: (len(name.split(".")), name),
    ):
        if qualified_name == project:
            continue

        parts = qualified_name.split(".")
        parent = root
        for depth in range(2, len(parts) + 1):
            prefix = ".".join(parts[:depth])
            child = durable_nodes.get(prefix)
            if child is None:
                path = durable_paths.get(prefix)
                child = _node(
                    prefix,
                    "scope",
                    path,
                    virtual=path is None,
                )
                if path and _check_has_backlog(root_path, path):
                    child["hasBacklog"] = True
                durable_nodes[prefix] = child
                parent["children"].append(child)
            parent = child

    existing_durable_names = set(durable_paths)
    for qualified_name, path in sorted(session_paths.items()):
        parts = qualified_name.split(".")
        owner_name = project
        for depth in range(len(parts) - 1, 1, -1):
            prefix = ".".join(parts[:depth])
            if prefix in existing_durable_names:
                owner_name = prefix
                break

        owner = durable_nodes[owner_name]
        prefix = f"{owner_name}."
        display_name = (
            qualified_name[len(prefix):]
            if qualified_name.startswith(prefix)
            else qualified_name
        )
        owner["children"].append(
            _node(
                qualified_name,
                "session",
                path,
                virtual=False,
                name=display_name or qualified_name,
            )
        )

    _sort_children(root)
    return root


def _shallow_copy(node: Node) -> Node:
    return {
        "id": node["id"],
        "qualifiedName": node["qualifiedName"],
        "name": node["name"],
        "type": node["type"],
        "path": node["path"],
        "virtual": node["virtual"],
        "children": [],
    }


def _find_route(node: Node, target_path: str) -> list[Node] | None:
    if node["path"] == target_path:
        return [node]
    for child in node["children"]:
        route = _find_route(child, target_path)
        if route is not None:
            return [node, *route]
    return None


def project_lineage(tree: Node, target_path: str | Path) -> Node:
    """Project a tree to the target chain plus siblings at expanded levels."""

    normalized_target = Path(target_path).as_posix().removeprefix("./")
    route = _find_route(tree, normalized_target)
    if route is None:
        raise TargetNotFoundError(
            f"Target is not present in the note hierarchy: {normalized_target}"
        )
    target_is_session = route[-1]["type"] == "session"

    def clone_route(depth: int) -> Node:
        source = route[depth]
        projected = _shallow_copy(source)
        if depth == len(route) - 1:
            return projected

        next_id = route[depth + 1]["id"]
        for child in source["children"]:
            if child["id"] == next_id:
                projected["children"].append(clone_route(depth + 1))
            elif not target_is_session and child["type"] == "session":
                continue
            else:
                projected["children"].append(_shallow_copy(child))
        return projected

    return clone_route(0)


def _resolve_target(
    repository_root: Path,
    target_path: str | Path,
) -> tuple[Path, str, str]:
    raw_target = Path(target_path)
    candidate = (
        raw_target.resolve()
        if raw_target.is_absolute()
        else (repository_root / raw_target).resolve()
    )
    try:
        relative = candidate.relative_to(repository_root)
    except ValueError as exc:
        raise InvalidTargetError(
            f"Target is outside the repository: {target_path}"
        ) from exc

    parts = relative.parts
    is_durable = (
        len(parts) == 2
        and parts[0] == "knowledge"
        and relative.suffix == ".md"
    )
    is_session = (
        len(parts) == 3
        and parts[0] == "knowledge"
        and parts[1] == "ai"
        and relative.suffix == ".md"
    )
    if not (is_durable or is_session):
        raise InvalidTargetError(
            "Target must be a top-level knowledge/*.md durable note or "
            "knowledge/ai/*.md session note"
        )
    if not candidate.is_file():
        raise TargetNotFoundError(
            f"Target note does not exist: {relative.as_posix()}"
        )

    qualified_name = candidate.stem
    project = _validate_project(qualified_name.split(".", 1)[0])
    return candidate, relative.as_posix(), project


def build_lineage_projection(
    repository_root: str | Path,
    target_path: str | Path,
) -> Node:
    """Build and project the hierarchy containing a durable or session target."""

    root_path = Path(repository_root).resolve()
    _, relative_target, project = _resolve_target(root_path, target_path)
    tree = build_note_tree(root_path, project)
    return project_lineage(tree, relative_target)


def render_lineage_text(tree: Node, target_path: str | Path) -> str:
    """Render a projected lineage tree without reading note contents."""

    normalized_target = Path(target_path).as_posix().removeprefix("./")
    lines = [f"Note lineage: {normalized_target}"]

    def render(node: Node, depth: int) -> None:
        marker = "*" if node["path"] == normalized_target else "-"
        qualifiers = node["type"]
        if node["virtual"]:
            qualifiers += ", virtual"
        location = f" {node['path']}" if node["path"] else ""
        lines.append(
            f"{'  ' * depth}{marker} {node['name']} [{qualifiers}]{location}"
        )
        for child in node["children"]:
            render(child, depth + 1)

    render(tree, 0)
    return "\n".join(lines)


class NoteHierarchy:
    """Repository-rooted API for note indexing and lineage rendering."""

    def __init__(self, repository_root: str | Path):
        self.repository_root = Path(repository_root).resolve()

    def build_tree(self, project: str) -> Node:
        return build_note_tree(self.repository_root, project)

    def lineage(self, target_path: str | Path) -> Node:
        return build_lineage_projection(self.repository_root, target_path)

    def render_lineage(self, target_path: str | Path) -> str:
        _, relative_target, _ = _resolve_target(
            self.repository_root,
            target_path,
        )
        projection = self.lineage(relative_target)
        return render_lineage_text(projection, relative_target)


def audit_backlogs(repository_root: Path) -> tuple[list[str], dict[str, list[str]]]:
    knowledge_dir = repository_root / "knowledge"
    errors = []
    backlogs = {}
    seen_items: dict[str, list[str]] = {}

    for path in sorted(knowledge_dir.glob("*.md")):
        if "archive" in path.parts or "ai" in path.parts:
            continue

        relative_path = path.relative_to(repository_root).as_posix()
        try:
            content = path.read_text(encoding="utf-8")
        except Exception as e:
            errors.append(f"Failed to read {relative_path}: {e}")
            continue

        lines = content.splitlines()
        in_backlog = False
        items = []
        for line in lines:
            trimmed = line.strip()
            if trimmed == "# Backlog":
                in_backlog = True
                continue
            if in_backlog:
                if trimmed == "---" or trimmed == "# Resource":
                    break
                if trimmed.startswith("- ") or trimmed.startswith("* "):
                    item_text = trimmed[2:].strip()
                    if item_text.startswith("[ ]") or item_text.startswith("[x]") or item_text.startswith("[/]"):
                        item_text = item_text[3:].strip()

                    if item_text:
                        items.append(item_text)
                        seen_items.setdefault(item_text, []).append(relative_path)

        if items:
            backlogs[relative_path] = items

    for item_text, paths in seen_items.items():
        if len(paths) > 1:
            errors.append(f"Duplicate backlog item '{item_text}' found in: {', '.join(paths)}")

    return errors, backlogs

def auto_detect_graph(repository_root: Path, graph_name: str) -> str:
    coretext_data_dir = repository_root / ".coretext-data"
    if coretext_data_dir.is_dir():
        # Check if workspace name graph exists
        workspace_name = repository_root.name
        workspace_graph = coretext_data_dir / f"{workspace_name}_rules.jsonl"
        if workspace_graph.is_file():
            return workspace_name
        # Fall back to any *_rules.jsonl file
        for path in sorted(coretext_data_dir.iterdir()):
            if path.is_file() and path.name.endswith("_rules.jsonl"):
                return path.name.replace("_rules.jsonl", "")
    return graph_name


def normalize_path(p: str | None) -> str:
    if not p:
        return ""
    return p.replace("\\", "/").lstrip(".").lstrip("/")


def _find_node_by_path(node: Node, target_path: str) -> Node | None:
    if node.get("path"):
        if normalize_path(node["path"]) == normalize_path(target_path):
            return node
    for child in node.get("children", []):
        found = _find_node_by_path(child, target_path)
        if found:
            return found
    return None


def build_architecture_tree(repository_root: str | Path, project: str, graph_name: str = "coretext") -> Node:
    root_path = Path(repository_root).resolve()
    root_node = build_note_tree(root_path, project)

    graph_file = root_path / ".coretext-data" / f"{graph_name}_rules.jsonl"
    if not graph_file.is_file():
        graph_name = auto_detect_graph(root_path, graph_name)
        graph_file = root_path / ".coretext-data" / f"{graph_name}_rules.jsonl"

    ledger_edges = []
    if graph_file.is_file():
        try:
            content = graph_file.read_text(encoding="utf-8")
            for line in content.splitlines():
                line = line.strip()
                if line:
                    ledger_edges.append(json.loads(line))
        except Exception:
            pass

    trigger_counts = {}
    for edge in ledger_edges:
        target = edge.get("target")
        source = edge.get("source")
        if not target or not source:
            continue

        matching_node = _find_node_by_path(root_node, target)
        if matching_node:
            node_id = matching_node["id"]
            idx = trigger_counts.get(node_id, 0)
            trigger_counts[node_id] = idx + 1

            trigger_node = {
                "id": f"{node_id}::trigger::{idx}",
                "name": source,
                "type": "trigger",
                "path": source,
                "meta": {
                    "source": source,
                    "type": edge.get("type"),
                    "description": edge.get("description"),
                    "hook": edge.get("hook")
                }
            }
            matching_node["children"].append(trigger_node)

    def add_leading_slash(node: Node) -> None:
        if node.get("type") in {"project", "scope", "session"}:
            if node.get("path") and not node["path"].startswith("/"):
                node["path"] = "/" + node["path"]
        for child in node.get("children", []):
            add_leading_slash(child)

    add_leading_slash(root_node)
    return root_node


def _extract_yaml_frontmatter(content: str) -> str | None:
    import re
    match = re.match(r"^---\r?\n([\s\S]*?)\r?\n---", content)
    return match.group(1) if match else None


def _extract_conversation_ids_from_yaml(yaml_text: str | None) -> list[str]:
    if not yaml_text:
        return []
    lines = yaml_text.splitlines()
    ids = []
    for i, line in enumerate(lines):
        import re
        scalar_match = re.match(r"^conversations:\s*[\"']?([^\"'\s][^\"']*?)[\"']?\s*$", line)
        if scalar_match and scalar_match.group(1).strip():
            ids.append(scalar_match.group(1).strip())
            continue
        if re.match(r"^conversations:\s*$", line):
            for j in range(i + 1, len(lines)):
                list_match = re.match(r"^\s*-\s*[\"']?([^\"']+?)[\"']?\s*$", lines[j])
                if not list_match:
                    break
                ids.append(list_match.group(1).strip())
    return ids


def build_sessions_index(repository_root: Path) -> dict[str, str]:
    ai_path = repository_root / "knowledge" / "ai"
    index = {}
    if not ai_path.is_dir():
        return index

    for file in ai_path.iterdir():
        if file.is_file() and file.suffix == ".md":
            try:
                content = file.read_text(encoding="utf-8")
                yaml_text = _extract_yaml_frontmatter(content)
                summary_name = file.stem
                for conv_id in _extract_conversation_ids_from_yaml(yaml_text):
                    if conv_id not in index:
                        index[conv_id] = summary_name
            except Exception:
                pass
    return index


def get_mapped_sessions(repository_root: Path) -> list[dict[str, str]]:
    sessions_dir = repository_root / ".coretext-data" / "sessions"
    if not sessions_dir.is_dir():
        return []

    conv_summary_index = build_sessions_index(repository_root)
    session_files = []
    for file in sessions_dir.iterdir():
        if file.is_file() and file.suffix == ".jsonl":
            try:
                mtime = file.stat().st_mtime
                session_files.append((file.name, mtime))
            except Exception:
                pass

    session_files.sort(key=lambda x: x[1], reverse=True)

    result = []
    for filename, _ in session_files:
        conv_id = filename.replace(".jsonl", "").replace("session_", "")
        label = conv_summary_index.get(conv_id, conv_id)
        result.append({
            "name": filename,
            "label": label
        })
    return result


def get_highlights(repository_root: Path, session_names: list[str]) -> dict[str, Any]:
    sessions_dir = repository_root / ".coretext-data" / "sessions"
    highlighted_nodes = set()
    actions = {}

    for name in session_names:
        file_path = sessions_dir / name
        if not file_path.is_file():
            continue
        try:
            content = file_path.read_text(encoding="utf-8")
            for line in content.splitlines():
                line = line.strip()
                if not line:
                    continue
                try:
                    data = json.loads(line)
                    node_id = data.get("node_id")
                    if node_id:
                        highlighted_nodes.add(node_id)
                        normalized_id = node_id.replace("\\", "/")
                        
                        tool_name = data.get("tool_name", "")
                        is_write = "write" in tool_name or "replace" in tool_name
                        action = data.get("action", "write" if is_write else "read")
                        
                        if action == "write" or node_id not in actions:
                            actions[node_id] = action
                            actions[normalized_id] = action
                except Exception:
                    pass
        except Exception:
            pass

    return {
        "nodes": list(highlighted_nodes),
        "actions": actions
    }


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Build and project the Coretext note hierarchy"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    index_parser = subparsers.add_parser(
        "index",
        help="Print a complete project note tree",
    )
    index_parser.add_argument("--project", default=None)

    lineage_parser = subparsers.add_parser(
        "lineage",
        help="Print a target note lineage projection",
    )
    lineage_parser.add_argument("--target", required=True)
    lineage_parser.add_argument(
        "--format",
        required=True,
        choices=("json", "text"),
    )

    backlog_parser = subparsers.add_parser(
        "backlog",
        help="Audit, validate and list all backlog items in the knowledge base",
    )
    backlog_parser.add_argument(
        "--lint",
        action="store_true",
        help="Run validation checks on the backlogs",
    )

    architecture_parser = subparsers.add_parser(
        "architecture",
        help="Print rules-integrated architecture tree in JSON",
    )
    architecture_parser.add_argument("--project", default=None)
    architecture_parser.add_argument("--graph", default="coretext")

    sessions_parser = subparsers.add_parser(
        "sessions",
        help="Print the mapped list of sessions in JSON",
    )

    highlights_parser = subparsers.add_parser(
        "highlights",
        help="Print highlights for selected sessions in JSON",
    )
    highlights_parser.add_argument("--sessions", required=True)
    return parser


def main(
    argv: list[str] | None = None,
    *,
    repository_root: str | Path | None = None,
) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)
    root = (
        Path(repository_root).resolve()
        if repository_root is not None
        else Path(__file__).resolve().parent.parent
    )
    hierarchy = NoteHierarchy(root)

    try:
        if args.command == "index":
            output = hierarchy.build_tree(args.project)
            print(json.dumps(output, indent=2))
        elif args.command == "backlog":
            errors, backlogs = audit_backlogs(root)
            if args.lint:
                if errors:
                    print("Backlog Lint Errors found:", file=sys.stderr)
                    for err in errors:
                        print(f"- {err}", file=sys.stderr)
                    return 1
                else:
                    print("Backlog lint passed successfully!")
                    return 0
            else:
                if errors:
                    print("Warnings:", file=sys.stderr)
                    for err in errors:
                        print(f"- {err}", file=sys.stderr)
                for note_path, items in backlogs.items():
                    print(f"\n# {note_path}")
                    for item in items:
                        print(f"  - {item}")
        elif args.command == "architecture":
            output = build_architecture_tree(root, args.project, args.graph)
            print(json.dumps(output, indent=2))
        elif args.command == "sessions":
            output = get_mapped_sessions(root)
            print(json.dumps({"sessions": output}, indent=2))
        elif args.command == "highlights":
            session_list = [s.strip() for s in args.sessions.split(",") if s.strip()]
            output = get_highlights(root, session_list)
            print(json.dumps(output, indent=2))
        else:
            projection = hierarchy.lineage(args.target)
            if args.format == "json":
                print(json.dumps(projection, indent=2))
            else:
                _, relative_target, _ = _resolve_target(root, args.target)
                print(render_lineage_text(projection, relative_target))
    except NoteHierarchyError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
