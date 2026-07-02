#!/usr/bin/env python3
# /// script
# requires-python = ">=3.8"
# ///
import os
import sys
import json
import glob
import datetime
import re

# -- Action inference helpers --

WRITE_MARKERS = ("write", "replace", "edit", "apply_patch", "multi_replace", "delete", "create")
READ_MARKERS = ("read", "view", "grep", "search", "list")

# Shell commands whose primary purpose is to mutate files
WRITE_CMDS = frozenset({
    "cp", "mv", "mkdir", "rm", "rmdir", "touch", "tee",
    "chmod", "chown", "install", "ln",
})

def infer_action_from_tool(tool_name):
    """Classify a high-level tool name as 'read' or 'write'."""
    if not tool_name:
        return "read"
    name = tool_name.lower()
    if any(m in name for m in WRITE_MARKERS):
        return "write"
    if any(m in name for m in READ_MARKERS):
        return "read"
    return "read"

def infer_action_from_cmd(cmd_str):
    """Classify a shell command string as 'read' or 'write'."""
    if not cmd_str or not isinstance(cmd_str, str):
        return "read"
    tokens = cmd_str.strip().split()
    if not tokens:
        return "read"
    # Skip env-var assignments (FOO=bar) and sudo
    idx = 0
    while idx < len(tokens):
        if "=" in tokens[idx] and not tokens[idx].startswith("-"):
            idx += 1
            continue
        if tokens[idx] == "sudo":
            idx += 1
            continue
        break
    if idx >= len(tokens):
        return "read"
    cmd = tokens[idx].rsplit("/", 1)[-1]  # strip path prefix
    if cmd in WRITE_CMDS:
        return "write"
    # sed with -i flag is a write
    if cmd == "sed" and any(t == "-i" or t.startswith("-i") for t in tokens[idx:]):
        return "write"
    return "read"


def normalize_path(file_path, repo_root):
    if not file_path or not isinstance(file_path, str):
        return None
    
    file_path = file_path.strip().strip("'\"")
    
    # Handle worktrees
    wt_index = file_path.find('.worktrees/')
    if wt_index != -1:
        after_wt = file_path[wt_index + len('.worktrees/'):]
        slash_index = after_wt.find('/')
        if slash_index != -1:
            file_path = after_wt[slash_index + 1:]
            
    # If absolute path, make relative to repo_root
    if os.path.isabs(file_path):
        try:
            rel = os.path.relpath(file_path, repo_root)
            if not rel.startswith('..'):
                file_path = rel
        except ValueError:
            pass
            
    # Normalize separators to unix-style
    file_path = file_path.replace('\\', '/')
    
    # Strip leading slash if any
    if file_path.startswith('/'):
        file_path = file_path[1:]
        
    return file_path

def extract_session_id(file_path):
    uuid_pattern = r'[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}'
    
    base_no_ext = os.path.splitext(os.path.basename(file_path))[0]
    
    # 1. Check if the filename itself matches a UUID
    if re.match(r'^' + uuid_pattern + r'$', base_no_ext):
        return base_no_ext
        
    # 2. Check if the filename contains a UUID (e.g. rollout-YYYY...-UUID)
    matches = re.findall(uuid_pattern, base_no_ext)
    if matches:
        return matches[-1]
        
    # 3. Check if any parent directory matches a UUID
    parts = os.path.normpath(file_path).split(os.sep)
    for part in reversed(parts):
        if re.match(r'^' + uuid_pattern + r'$', part):
            return part
            
    # 4. Fallback to base name
    return base_no_ext

def get_all_repo_paths(repo_root):
    paths = []
    for root, dirs, files in os.walk(repo_root):
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', 'dist', '__pycache__', '.DS_Store', '.idea']]
        
        for d in dirs:
            abs_path = os.path.join(root, d)
            rel_path = os.path.relpath(abs_path, repo_root).replace('\\', '/')
            paths.append(rel_path)
            
        for f in files:
            if f in ['.DS_Store', 'skills-lock.json']:
                continue
            abs_path = os.path.join(root, f)
            rel_path = os.path.relpath(abs_path, repo_root).replace('\\', '/')
            paths.append(rel_path)
            
    # Sort by length descending to match longest/most specific paths first
    paths.sort(key=len, reverse=True)
    return paths

def scan_mentions(args_str, repo_paths, timestamp, tool_name, action="read"):
    entries = []
    # Normalize path separators in args_str to match repo_paths
    args_str_norm = args_str.replace('\\/', '/').replace('\\\\', '/')
    
    matched_indices = []
    
    for path in repo_paths:
        escaped_path = re.escape(path)
        # Match path bounded by quotes, spaces, slash, start/end of line, shell operators
        pattern = r'(?:^|[^a-zA-Z0-9_.-])' + escaped_path + r'(?:$|[^a-zA-Z0-9_.-])'
        if re.search(pattern, args_str_norm):
            overlap = False
            for start, end in matched_indices:
                for m in re.finditer(escaped_path, args_str_norm):
                    m_start, m_end = m.span()
                    if m_start >= start and m_end <= end:
                        overlap = True
                        break
                if overlap:
                    break
            
            if not overlap:
                for m in re.finditer(escaped_path, args_str_norm):
                    matched_indices.append(m.span())
                    
                entries.append({
                    "node_id": path,
                    "timestamp": timestamp,
                    "tool_name": tool_name,
                    "action": action
                })
    return entries

def parse_antigravity_line(line_dict, repo_root):
    entries = []
    if line_dict.get("source") == "MODEL" and line_dict.get("type") == "PLANNER_RESPONSE":
        tool_calls = line_dict.get("tool_calls", [])
        timestamp = line_dict.get("created_at") or datetime.datetime.utcnow().isoformat() + "Z"
        for call in tool_calls:
            tool_name = call.get("name")
            args = call.get("args") or {}
            
            file_path = None
            for key in ["TargetFile", "AbsolutePath", "file_path", "path", "file", "filepath"]:
                if key in args:
                    file_path = args[key]
                    break
            
            if file_path:
                norm_path = normalize_path(file_path, repo_root)
                if norm_path:
                    entries.append({
                        "node_id": norm_path,
                        "timestamp": timestamp,
                        "tool_name": tool_name,
                        "action": infer_action_from_tool(tool_name)
                    })
    return entries

def parse_apply_patch_paths(patch_text):
    """Extract file paths from apply_patch *** headers."""
    paths = []
    prefixes = (
        "*** Add File: ",
        "*** Update File: ",
        "*** Delete File: ",
    )
    for line in patch_text.splitlines():
        for prefix in prefixes:
            if line.startswith(prefix):
                path = line[len(prefix):].strip()
                if path:
                    paths.append(path)
    return paths

def parse_codex_line(line_dict, repo_root, repo_paths):
    entries = []
    line_type = line_dict.get("type")
    timestamp = line_dict.get("timestamp") or datetime.datetime.utcnow().isoformat() + "Z"

    if line_type == "response_item":
        payload = line_dict.get("payload") or {}
        payload_type = payload.get("type")

        if payload_type == "function_call":
            tool_name = payload.get("name")
            raw_args = payload.get("arguments") or {}
            
            args = {}
            args_str = ""
            if isinstance(raw_args, str):
                args_str = raw_args
                try:
                    args = json.loads(raw_args)
                except Exception:
                    pass
            elif isinstance(raw_args, dict):
                args = raw_args
                args_str = json.dumps(raw_args)
            
            file_path = None
            for key in ["file_path", "path", "TargetFile", "AbsolutePath", "file", "filepath"]:
                if key in args:
                    file_path = args[key]
                    break
            
            if file_path:
                norm_path = normalize_path(file_path, repo_root)
                if norm_path:
                    entries.append({
                        "node_id": norm_path,
                        "timestamp": timestamp,
                        "tool_name": tool_name,
                        "action": infer_action_from_tool(tool_name)
                    })
            
            # Workaround: For terminal commands and REPL scripts, scan for mentioned workspace files/directories
            if not file_path and tool_name in ["exec_command", "js", "run_command"]:
                # Infer action from the shell command content
                cmd_str = args.get("cmd", args.get("code", args_str))
                action = infer_action_from_cmd(cmd_str)
                entries.extend(scan_mentions(args_str, repo_paths, timestamp, tool_name, action))

        elif payload_type == "custom_tool_call":
            # Codex uses custom_tool_call for apply_patch with structured patch text in "input"
            tool_name = payload.get("name")
            patch_input = payload.get("input", "")

            if tool_name == "apply_patch" and isinstance(patch_input, str):
                for file_path in parse_apply_patch_paths(patch_input):
                    norm_path = normalize_path(file_path, repo_root)
                    if norm_path:
                        entries.append({
                            "node_id": norm_path,
                            "timestamp": timestamp,
                            "tool_name": "apply_patch",
                            "action": "write"
                        })

    elif line_type == "event_msg":
        # mcp_tool_call_end events contain full invocation details from MCP tools
        payload = line_dict.get("payload") or {}
        if payload.get("type") == "mcp_tool_call_end":
            invocation = payload.get("invocation") or {}
            tool_name = invocation.get("tool", "")
            args = invocation.get("arguments") or {}

            file_path = None
            for key in ["file_path", "path", "TargetFile", "AbsolutePath", "file", "filepath"]:
                if key in args:
                    file_path = args[key]
                    break

            if file_path:
                norm_path = normalize_path(file_path, repo_root)
                if norm_path:
                    entries.append({
                        "node_id": norm_path,
                        "timestamp": timestamp,
                        "tool_name": tool_name,
                        "action": infer_action_from_tool(tool_name)
                    })
            elif tool_name in ["js", "run_command"]:
                args_str = json.dumps(args) if isinstance(args, dict) else str(args)
                cmd_str = args.get("code", args_str) if isinstance(args, dict) else args_str
                action = infer_action_from_cmd(cmd_str)
                entries.extend(scan_mentions(args_str, repo_paths, timestamp, tool_name, action))

    return entries

def process_file(file_path, repo_root, output_dir, repo_paths):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return False
        
    session_id = extract_session_id(file_path)
    
    normalized_file_path = file_path.replace('\\', '/')
    parser_mode = None
    
    if '/sessions/codex' in normalized_file_path or '/codex/' in normalized_file_path:
        parser_mode = "codex"
    elif '/sessions/antigravity' in normalized_file_path or '/antigravity/' in normalized_file_path:
        parser_mode = "antigravity"
    else:
        for line in lines[:20]:
            if not line.strip():
                continue
            try:
                data = json.loads(line)
                if "step_index" in data:
                    parser_mode = "antigravity"
                    break
                elif data.get("type") in ["session_meta", "response_item"]:
                    parser_mode = "codex"
                    break
            except Exception:
                continue
        if not parser_mode:
            parser_mode = "auto-detect (defaulting to mixed)"

    print(f"Ingesting transcript '{file_path}' using '{parser_mode}' parser...")
    
    reformatted_entries = []
    
    for line in lines:
        if not line.strip():
            continue
        try:
            data = json.loads(line)
            if parser_mode == "antigravity":
                reformatted_entries.extend(parse_antigravity_line(data, repo_root))
            elif parser_mode == "codex":
                reformatted_entries.extend(parse_codex_line(data, repo_root, repo_paths))
            else:
                reformatted_entries.extend(parse_antigravity_line(data, repo_root))
                reformatted_entries.extend(parse_codex_line(data, repo_root, repo_paths))
        except Exception:
            continue
            
    if not reformatted_entries:
        print(f"No file tool calls or command file mentions found in transcript '{file_path}'")
        return False
        
    os.makedirs(output_dir, exist_ok=True)
    out_file = os.path.join(output_dir, f"{session_id}.jsonl")
    
    try:
        with open(out_file, 'w', encoding='utf-8') as f:
            for entry in reformatted_entries:
                f.write(json.dumps(entry) + '\n')
        print(f"Successfully reformatted -> '{out_file}' ({len(reformatted_entries)} entries)")
        return True
    except Exception as e:
        print(f"Error writing output {out_file}: {e}")
        return False

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.abspath(os.path.join(script_dir, ".."))
    data_dir = os.path.join(repo_root, ".coretext-data")
    sessions_dir = os.path.join(data_dir, "sessions")
    
    repo_paths = get_all_repo_paths(repo_root)
    
    if len(sys.argv) > 1:
        target_path = sys.argv[1]
        if os.path.isfile(target_path):
            process_file(target_path, repo_root, sessions_dir, repo_paths)
        else:
            print(f"Error: {target_path} is not a valid file.")
            sys.exit(1)
    else:
        codex_transcripts = glob.glob(os.path.join(sessions_dir, "codex", "*.jsonl"))
        antigravity_transcripts = glob.glob(os.path.join(sessions_dir, "antigravity", "*.jsonl"))
        
        all_transcripts = codex_transcripts + antigravity_transcripts
        if not all_transcripts:
            print("No raw transcripts found in .coretext-data/sessions/codex/ or .coretext-data/sessions/antigravity/")
            return
            
        success_count = 0
        for path in all_transcripts:
            if process_file(path, repo_root, sessions_dir, repo_paths):
                success_count += 1
                
        print(f"\nBatch processing complete. Reformatted {success_count} / {len(all_transcripts)} transcripts.")

if __name__ == "__main__":
    main()
