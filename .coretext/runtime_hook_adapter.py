# /// script
# requires-python = ">=3.8"
# ///
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional


PATH_KEYS = (
    "file_path",
    "filePath",
    "filepath",
    "path",
    "Path",
    "AbsolutePath",
    "TargetFile",
    "target_file",
    "targetFile",
    "FilePath",
)

WRITE_MARKERS = (
    "write",
    "replace",
    "edit",
    "apply_patch",
    "multi_replace",
    "delete",
)

READ_MARKERS = (
    "read",
    "view",
)


@dataclass
class RuntimeHookRequest:
    runtime: str
    event: str
    tool_name: str
    tool_input: Dict[str, Any]
    action: str
    session_id: str
    project_root: Path
    file_paths: List[str]

    @property
    def primary_path(self) -> Optional[str]:
        return self.file_paths[0] if self.file_paths else None

    @property
    def is_write_gate(self) -> bool:
        return (
            self.runtime in {"antigravity", "codex"}
            and self.action == "write"
            and self.event in {"PreToolUse"}
        )

    @property
    def can_inject_read_context(self) -> bool:
        if self.action != "read":
            return False
        if self.runtime == "codex":
            return self.event == "PostToolUse"
        return False


def parse_request(payload: Dict[str, Any], coretext_dir: Path) -> RuntimeHookRequest:
    runtime = detect_runtime(payload)
    event = extract_event(payload, runtime)
    tool_name = extract_tool_name(payload, runtime)
    tool_input = extract_tool_input(payload, runtime)
    project_root = find_project_root(payload, coretext_dir)
    session_id = sanitize_session_id(extract_session_id(payload, runtime))
    action = infer_action(tool_name, event)
    file_paths = extract_file_paths(tool_input, tool_name, project_root, payload)

    return RuntimeHookRequest(
        runtime=runtime,
        event=event,
        tool_name=tool_name,
        tool_input=tool_input,
        action=action,
        session_id=session_id,
        project_root=project_root,
        file_paths=file_paths,
    )


def detect_runtime(payload: Dict[str, Any]) -> str:
    if "toolCall" in payload or "conversationId" in payload or "workspacePaths" in payload:
        return "antigravity"
    tool_name = payload.get("tool_name", "")
    if (
        "cwd" in payload
        or "turn_id" in payload
        or "permission_mode" in payload
        or "model" in payload
        or tool_name == "apply_patch"
        or str(tool_name).startswith("mcp__")
    ):
        return "codex"
    return "unknown"


def extract_event(payload: Dict[str, Any], runtime: str) -> str:
    event = payload.get("hook_event_name") or payload.get("hookEventName") or payload.get("hookType")
    if event:
        return str(event)
    if runtime == "antigravity" and "toolCall" in payload:
        return "PreToolUse"
    if runtime == "antigravity" and (
        "invocationNum" in payload or "initialNumSteps" in payload
    ):
        return "PreInvocation"
    return ""


def extract_tool_name(payload: Dict[str, Any], runtime: str) -> str:
    if runtime == "antigravity":
        return str(payload.get("toolCall", {}).get("name", ""))
    return str(
        payload.get(
            "tool_name",
            payload.get("toolName", payload.get("request", {}).get("name", "")),
        )
    )


def extract_tool_input(payload: Dict[str, Any], runtime: str) -> Dict[str, Any]:
    if runtime == "antigravity":
        args = payload.get("toolCall", {}).get("args", {})
        return args if isinstance(args, dict) else {}

    params = payload.get(
        "tool_input",
        payload.get("toolParameters", payload.get("request", {}).get("parameters", {})),
    )
    return params if isinstance(params, dict) else {}


def find_project_root(payload: Dict[str, Any], coretext_dir: Path) -> Path:
    coretext_dir = Path(coretext_dir).resolve()
    candidates = []
    
    # Check CORETEXT_PROJECT_DIR first
    project_dir_env = os.environ.get("CORETEXT_PROJECT_DIR")
    if project_dir_env:
        candidates.append(project_dir_env)
        
    # Prioritize active workspace paths from subagent metadata
    workspace_paths = payload.get("workspacePaths", [])
    if isinstance(workspace_paths, list):
        candidates.extend(workspace_paths)
        
    # Include cwd and fallback project dir
    candidates.append(payload.get("cwd"))
    candidates.append(str(coretext_dir.parent))

    for candidate in candidates:
        if not candidate:
            continue
        candidate_str = str(candidate).strip("'\"")
        path = Path(candidate_str).expanduser().resolve()
        if (path / ".coretext").exists() or path == coretext_dir.parent:
            return path

    # Fallback to the first existing directory from the candidates list
    for candidate in candidates:
        if not candidate:
            continue
        candidate_str = str(candidate).strip("'\"")
        path = Path(candidate_str).expanduser().resolve()
        if path.is_dir():
            return path

    return coretext_dir.parent


def extract_session_id(payload: Dict[str, Any], runtime: str) -> str:
    if runtime == "antigravity":
        return str(payload.get("conversationId", "default_session"))
    return str(payload.get("session_id", payload.get("sessionId", "default_session")))


def sanitize_session_id(session_id: str) -> str:
    safe = re.sub(r"[^A-Za-z0-9_.-]+", "_", session_id.strip())
    return safe or "default_session"


def infer_action(tool_name: str, event: str) -> str:
    name = tool_name.lower()
    if any(marker in name for marker in WRITE_MARKERS):
        return "write"
    if any(marker in name for marker in READ_MARKERS):
        return "read"
    if event in {"AfterTool", "PostToolUse"}:
        return "read"
    return "read"


def extract_file_paths(
    tool_input: Dict[str, Any],
    tool_name: str,
    project_root: Path,
    payload: Optional[Dict[str, Any]] = None,
) -> List[str]:
    raw_paths = []
    for key in PATH_KEYS:
        value = tool_input.get(key)
        if isinstance(value, str) and value:
            raw_paths.append(value)

    if tool_name == "apply_patch":
        command = tool_input.get("command", "")
        if isinstance(command, str):
            raw_paths.extend(parse_apply_patch_paths(command))

    cwd = None
    if payload and isinstance(payload.get("cwd"), str):
        cwd = Path(payload["cwd"])

    normalized = []
    for raw_path in raw_paths:
        path = normalize_path(raw_path, project_root, cwd)
        if path not in normalized:
            normalized.append(path)
    return normalized


def parse_apply_patch_paths(command: str) -> List[str]:
    paths = []
    prefixes = (
        "*** Add File: ",
        "*** Update File: ",
        "*** Delete File: ",
    )
    for line in command.splitlines():
        for prefix in prefixes:
            if line.startswith(prefix):
                path = line[len(prefix) :].strip()
                if path:
                    paths.append(path)
    return paths


def normalize_path(path: str, project_root: Path, cwd: Optional[Path] = None) -> str:
    cleaned_path = str(path).strip("'\"")
    raw = Path(cleaned_path).expanduser()
    
    # If the path is absolute and contains project_root prefix, slice it off directly.
    # This prevents resolver/relative_to failures due to symlinks or mount point mismatches.
    raw_str = raw.as_posix()
    root_str = project_root.resolve().as_posix()
    if raw_str.startswith(root_str):
        return raw_str[len(root_str):].lstrip("/")

    base = cwd or project_root
    absolute = raw if raw.is_absolute() else base / raw
    absolute = absolute.resolve()
    root = project_root.resolve()

    try:
        return absolute.relative_to(root).as_posix()
    except ValueError:
        abs_str = absolute.as_posix()
        if abs_str.startswith(root_str):
            return abs_str[len(root_str):].lstrip("/")
        return raw.as_posix().lstrip("./")


def allow_response(request: RuntimeHookRequest) -> Dict[str, Any]:
    if request.runtime == "antigravity" and request.event == "PreToolUse":
        return {"decision": "allow"}
    return {}


def deny_response(request: RuntimeHookRequest, reason: str) -> Dict[str, Any]:
    if request.runtime == "codex":
        return {
            "hookSpecificOutput": {
                "hookEventName": request.event or "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": reason,
            }
        }
    return {"decision": "deny", "reason": reason}


def context_response(request: RuntimeHookRequest, additional_context: str) -> Dict[str, Any]:
    if request.runtime == "codex":
        return {
            "hookSpecificOutput": {
                "hookEventName": request.event or "PostToolUse",
                "additionalContext": additional_context,
            }
        }
    return {
        "decision": "allow",
        "hookSpecificOutput": {
            "additionalContext": additional_context,
        },
    }
