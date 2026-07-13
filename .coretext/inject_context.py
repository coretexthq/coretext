# /// script
# requires-python = ">=3.8"
# ///
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

from coretext_engine import CoretextEngine
from note_hierarchy import NoteHierarchy, NoteHierarchyError
from runtime_hook_adapter import (
    allow_response,
    context_response,
    deny_response,
    parse_request,
)


def render_context_for_paths(engine, file_paths, action):
    hints = []
    full_files = []

    for file_path in file_paths:
        payload = engine.render_context_payload(file_path, action)
        if payload.get("hints"):
            hints.append(payload["hints"])
        if payload.get("full_files"):
            full_files.append(payload["full_files"])

    return {
        "hints": "\n".join(hints),
        "full_files": "\n".join(full_files),
    }


def combine_context(context_payload):
    hints = context_payload.get("hints", "")
    full_files = context_payload.get("full_files", "")
    if hints and full_files:
        return f"{hints}\n\n{full_files}"
    return hints or full_files


def acknowledged_paths(ack_file):
    if not ack_file.exists():
        return set()
    try:
        return set(ack_file.read_text(encoding="utf-8").splitlines())
    except Exception:
        return set()


def record_acknowledgements(ack_file, file_paths):
    try:
        ack_file.parent.mkdir(parents=True, exist_ok=True)
        with ack_file.open("a", encoding="utf-8") as f:
            for file_path in file_paths:
                f.write(file_path + "\n")
    except Exception:
        pass


def _is_note_path(file_path: str) -> bool:
    path = Path(file_path)
    parts = path.parts
    return (
        path.suffix == ".md"
        and (
            (len(parts) == 2 and parts[0] == "knowledge")
            or (
                len(parts) == 3
                and parts[0] == "knowledge"
                and parts[1] == "ai"
            )
        )
    )


def _is_explicit_read(request: Any) -> bool:
    if request.event != "PreToolUse" or request.action != "read":
        return False

    tool_name = request.tool_name.lower()
    if request.runtime == "codex":
        return tool_name.startswith("mcp__") and any(
            marker in tool_name for marker in ("read", "view")
        )
    if request.runtime == "antigravity":
        return tool_name == "view_file"
    return False


def _seen_paths(seen_file: Path) -> set[str]:
    try:
        return {
            line
            for line in seen_file.read_text(encoding="utf-8").splitlines()
            if line
        }
    except Exception:
        return set()


def _record_seen(seen_file: Path, file_paths: list[str]) -> None:
    if not file_paths:
        return
    try:
        seen_file.parent.mkdir(parents=True, exist_ok=True)
        with seen_file.open("a", encoding="utf-8") as handle:
            for file_path in file_paths:
                handle.write(f"{file_path}\n")
    except Exception:
        pass


def _pending_entries(pending_file: Path) -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []
    known_paths: set[str] = set()
    try:
        lines = pending_file.read_text(encoding="utf-8").splitlines()
    except Exception:
        return entries

    for line in lines:
        try:
            entry = json.loads(line)
        except (json.JSONDecodeError, TypeError):
            continue
        if not isinstance(entry, dict):
            continue
        file_path = entry.get("path")
        lineage = entry.get("lineage")
        if (
            not isinstance(file_path, str)
            or not isinstance(lineage, str)
            or not file_path
            or not lineage
            or file_path in known_paths
        ):
            continue
        known_paths.add(file_path)
        entries.append({"path": file_path, "lineage": lineage})
    return entries


def _append_pending(
    pending_file: Path,
    file_path: str,
    lineage: str,
) -> None:
    try:
        pending_file.parent.mkdir(parents=True, exist_ok=True)
        with pending_file.open("a", encoding="utf-8") as handle:
            handle.write(
                json.dumps(
                    {"path": file_path, "lineage": lineage},
                    ensure_ascii=True,
                )
                + "\n"
            )
    except Exception:
        pass


def _clear_pending(pending_file: Path) -> None:
    try:
        pending_file.unlink(missing_ok=True)
    except Exception:
        pass


def _pending_context_entries(pending_file: Path) -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []
    known_paths: set[str] = set()
    try:
        lines = pending_file.read_text(encoding="utf-8").splitlines()
    except Exception:
        return entries

    for line in lines:
        try:
            entry = json.loads(line)
        except (json.JSONDecodeError, TypeError):
            continue
        if not isinstance(entry, dict):
            continue
        file_path = entry.get("path")
        context = entry.get("context")
        if (
            not isinstance(file_path, str)
            or not isinstance(context, str)
            or not file_path
            or not context
            or file_path in known_paths
        ):
            continue
        known_paths.add(file_path)
        entries.append({"path": file_path, "context": context})
    return entries


def _append_pending_context(
    pending_file: Path,
    file_path: str,
    context: str,
) -> None:
    try:
        pending_file.parent.mkdir(parents=True, exist_ok=True)
        with pending_file.open("a", encoding="utf-8") as handle:
            handle.write(
                json.dumps(
                    {"path": file_path, "context": context},
                    ensure_ascii=True,
                )
                + "\n"
            )
    except Exception:
        pass



def _pre_invocation_response(
    seen_lineage_file: Path,
    pending_lineage_file: Path,
    seen_context_file: Path,
    pending_context_file: Path,
) -> dict[str, Any]:
    seen_lineage = _seen_paths(seen_lineage_file)
    lineage_entries = [
        entry
        for entry in _pending_entries(pending_lineage_file)
        if entry["path"] not in seen_lineage
    ]

    seen_context = _seen_paths(seen_context_file)
    context_entries = [
        entry
        for entry in _pending_context_entries(pending_context_file)
        if entry["path"] not in seen_context
    ]

    if not lineage_entries and not context_entries:
        _clear_pending(pending_lineage_file)
        _clear_pending(pending_context_file)
        return {"injectSteps": []}

    messages = []
    delivered_lineage = []
    delivered_context = []

    if lineage_entries:
        messages.append("\n\n".join(entry["lineage"] for entry in lineage_entries))
        delivered_lineage.extend(entry["path"] for entry in lineage_entries)

    if context_entries:
        context_msg = "Coretext Graph-Edge Context:\n\n" + "\n\n".join(entry["context"] for entry in context_entries)
        messages.append(context_msg)
        delivered_context.extend(entry["path"] for entry in context_entries)

    message = "\n\n".join(messages)

    if delivered_lineage:
        _record_seen(seen_lineage_file, delivered_lineage)
    if delivered_context:
        _record_seen(seen_context_file, delivered_context)

    _clear_pending(pending_lineage_file)
    _clear_pending(pending_context_file)

    return {"injectSteps": [{"ephemeralMessage": message}]}


def _render_unseen_lineage_for_paths(
    request: Any,
    note_paths: list[str],
    seen_file: Path,
) -> list[tuple[str, str]]:
    seen = _seen_paths(seen_file)
    hierarchy = NoteHierarchy(request.project_root)
    rendered: list[tuple[str, str]] = []

    for file_path in note_paths:
        if file_path in seen or not _is_note_path(file_path):
            continue
        try:
            lineage = hierarchy.render_lineage(file_path)
        except NoteHierarchyError:
            continue
        rendered.append((file_path, lineage))
    return rendered


def main():
    request = None
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"decision": "allow"}))
            return
            
        payload = json.loads(input_data)
        if not isinstance(payload, dict):
            print(json.dumps({"decision": "allow"}))
            return

        script_dir = Path(__file__).resolve().parent
        request = parse_request(payload, script_dir)

        engine = CoretextEngine(str(script_dir))

        # 1. Handle Antigravity PreInvocation for lineage injection and graph-edge context delivery
        if request.runtime == "antigravity" and request.event == "PreInvocation":
            seen_lineage_file = engine.data_dir / f".lineage_seen_{request.session_id}"
            pending_lineage_file = engine.data_dir / f".pending_lineage_{request.session_id}.jsonl"
            seen_context_file = engine.data_dir / f".context_seen_{request.session_id}"
            pending_context_file = engine.data_dir / f".pending_context_{request.session_id}.jsonl"
            print(json.dumps(_pre_invocation_response(
                seen_lineage_file, pending_lineage_file,
                seen_context_file, pending_context_file
            )))
            return

        if not request.file_paths:
            print(json.dumps(allow_response(request)))
            return

        # Separate note paths and code paths
        note_paths = [path for path in request.file_paths if _is_note_path(path)]
        code_paths = [path for path in request.file_paths if not _is_note_path(path)]

        # 2. Lineage Injection Logic (for knowledge notes reads)
        if note_paths and _is_explicit_read(request):
            seen_file = engine.data_dir / f".lineage_seen_{request.session_id}"
            pending_file = engine.data_dir / f".pending_lineage_{request.session_id}.jsonl"
            
            rendered = _render_unseen_lineage_for_paths(request, note_paths, seen_file)
            if rendered:
                if request.runtime == "codex":
                    additional_context = "\n\n".join(lineage for _, lineage in rendered)
                    _record_seen(seen_file, [fp for fp, _ in rendered])
                    print(json.dumps(context_response(request, additional_context)))
                    return
                elif request.runtime == "antigravity":
                    pending_paths = {entry["path"] for entry in _pending_entries(pending_file)}
                    for file_path, lineage in rendered:
                        if file_path not in pending_paths:
                            _append_pending(pending_file, file_path, lineage)
                            pending_paths.add(file_path)
                    print(json.dumps({"decision": "allow"}))
                    return

        # 3. Read Context logic
        if request.action == "read" and request.file_paths:
            seen_context_file = engine.data_dir / f".context_seen_{request.session_id}"
            
            if request.runtime == "codex" and request.event == "PostToolUse":
                unseen_paths = [path for path in request.file_paths if path not in _seen_paths(seen_context_file)]
                if unseen_paths:
                    context_payload = render_context_for_paths(engine, unseen_paths, "read")
                    combined_payload = combine_context(context_payload)
                    if combined_payload:
                        _record_seen(seen_context_file, unseen_paths)
                        print(json.dumps(context_response(request, combined_payload)))
                        return
                print(json.dumps(allow_response(request)))
                return
                
            elif request.runtime == "antigravity" and request.event == "PreToolUse":
                pending_context_file = engine.data_dir / f".pending_context_{request.session_id}.jsonl"
                unseen_paths = [path for path in request.file_paths if path not in _seen_paths(seen_context_file)]
                if unseen_paths:
                    context_payload = render_context_for_paths(engine, unseen_paths, "read")
                    # For Antigravity, we only inject hints to prevent token bloat
                    combined_payload = context_payload.get("hints", "")
                    if combined_payload:
                        pending_paths = {entry["path"] for entry in _pending_context_entries(pending_context_file)}
                        for file_path in unseen_paths:
                            if file_path not in pending_paths:
                                _append_pending_context(pending_context_file, file_path, combined_payload)
                                pending_paths.add(file_path)
                print(json.dumps(allow_response(request)))
                return

        # 4. Write-Gating Logic
        if request.is_write_gate and request.file_paths:
            ack_file = engine.data_dir / f".acknowledged_paths_{request.session_id}"
            seen_context_file = engine.data_dir / f".context_seen_{request.session_id}"
            
            acknowledged = acknowledged_paths(ack_file) | _seen_paths(seen_context_file)
            pending_paths = [path for path in request.file_paths if path not in acknowledged]

            if pending_paths:
                context_payload = render_context_for_paths(engine, pending_paths, "write")
                combined_payload = combine_context(context_payload)
                if combined_payload:
                    record_acknowledgements(ack_file, pending_paths)
                    _record_seen(seen_context_file, pending_paths)
                    reason = (
                        "ACTION BLOCKED: You must read and acknowledge the following "
                        "architectural rules before creating or modifying this file.\n\n"
                        "Please read the rules below. Once you understand them, retry "
                        "your write/replace tool call exactly as you just did, and it "
                        f"will be allowed to proceed.\n\n{combined_payload}"
                    )
                    print(json.dumps(deny_response(request, reason)))
                    return

            print(json.dumps(allow_response(request)))
            return

        print(json.dumps(allow_response(request)))
            
    except Exception as e:
        print(f"Coretext Injection Hook Error: {e}", file=sys.stderr)
        if (
            request is not None
            and request.runtime == "antigravity"
            and request.event == "PreInvocation"
        ):
            print(json.dumps({"injectSteps": []}))
        else:
            print(
                json.dumps(
                    allow_response(request) if request is not None else {"decision": "allow"}
                )
            )


if __name__ == "__main__":
    main()
