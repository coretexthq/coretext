#!/usr/bin/env python3
# /// script
# requires-python = ">=3.8"
# ///
import json
import sys
import re
from pathlib import Path
from typing import List, Dict, Tuple, Optional

def get_all_workspace_paths(workspace_root: Path) -> List[str]:
    paths = []
    ignore_dirs = {".git", "node_modules", "__pycache__", ".idea", ".gemini"}
    ignore_files = {".DS_Store"}
    
    def traverse(path: Path):
        for item in path.iterdir():
            if item.is_dir():
                if item.name not in ignore_dirs:
                    rel_path = item.relative_to(workspace_root)
                    paths.append(str(rel_path))
                    traverse(item)
            elif item.is_file():
                if item.name not in ignore_files:
                    rel_path = item.relative_to(workspace_root)
                    paths.append(str(rel_path))
                    
    if workspace_root.exists():
        traverse(workspace_root)
    return paths

def has_glob_wildcards(pattern: str) -> bool:
    return any(c in pattern for c in ("*", "?", "["))

def glob_to_regex(pattern: str) -> re.Pattern:
    regex_parts = []
    i = 0
    n = len(pattern)
    while i < n:
        if pattern[i:i+4] == "/**/":
            regex_parts.append(r"(?:/|/.+/)")
            i += 4
        elif pattern[i:i+2] == "**":
            regex_parts.append(r".*")
            i += 2
        elif pattern[i] == "*":
            regex_parts.append(r"[^/]*")
            i += 1
        elif pattern[i] == "?":
            regex_parts.append(r"[^/]")
            i += 1
        elif pattern[i] == "[":
            j = i + 1
            if j < n and pattern[j] == "!":
                j += 1
            if j < n and pattern[j] == "]":
                j += 1
            while j < n and pattern[j] != "]":
                j += 1
            if j >= n:
                regex_parts.append(re.escape("["))
                i += 1
            else:
                stuff = pattern[i+1:j]
                if stuff.startswith("!"):
                    stuff = "^" + stuff[1:]
                regex_parts.append(f"[{stuff}]")
                i = j + 1
        else:
            regex_parts.append(re.escape(pattern[i]))
            i += 1
    return re.compile("^" + "".join(regex_parts) + "$")

def match_source(filepath: str, source_pattern: str) -> bool:
    rx = glob_to_regex(source_pattern)
    if rx.match(filepath):
        return True
        
    clean_pattern = source_pattern
    while clean_pattern.endswith('*') or clean_pattern.endswith('/') or clean_pattern.endswith('?'):
        if clean_pattern.endswith('*'):
            clean_pattern = clean_pattern[:-1]
        elif clean_pattern.endswith('?'):
            clean_pattern = clean_pattern[:-1]
        elif clean_pattern.endswith('/'):
            clean_pattern = clean_pattern[:-1]
            
    if clean_pattern:
        norm_source = clean_pattern + '/'
        if filepath.startswith(norm_source) or filepath == clean_pattern:
            return True
            
    return False

def validate_schema(data: dict, schema: dict) -> Tuple[bool, Optional[str]]:
    if not isinstance(data, dict):
        return False, "Data must be a JSON object"
        
    required = schema.get("required", [])
    for req in required:
        if req not in data:
            return False, f"Missing required key: '{req}'"
            
    properties = schema.get("properties", {})
    for key, val in data.items():
        if key not in properties:
            continue
        prop_schema = properties[key]
        prop_type = prop_schema.get("type")
        if prop_type == "string" and not isinstance(val, str):
            return False, f"Key '{key}' must be a string, got {type(val).__name__}"
            
        prop_enum = prop_schema.get("enum")
        if prop_enum and val not in prop_enum:
            return False, f"Key '{key}' value '{val}' is not in allowed enum: {prop_enum}"
            
    return True, None

def main():
    from coretext_engine import CoretextEngine
    script_dir = Path(__file__).resolve().parent
    engine = CoretextEngine(str(script_dir))
    workspace_root = engine.workspace_root
    jsonl_path = engine.jsonl_path
    schema_path = engine.schema_path
    
    # Fail-Open logic
    if not jsonl_path.exists():
        print(f"Graph ledger file not found at {jsonl_path}. Fail-Open: Exiting 0.")
        sys.exit(0)
        
    if not schema_path.exists():
        print(f"Schema file not found at {schema_path}. Fail-Open: Exiting 0.")
        sys.exit(0)
        
    # Load schema
    try:
        with open(schema_path, "r", encoding="utf-8") as f:
            schema = json.load(f)
    except Exception as e:
        print(f"Error loading schema file: {e}", file=sys.stderr)
        sys.exit(1)
        
    # Read ledger
    try:
        with open(jsonl_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading ledger file: {e}", file=sys.stderr)
        sys.exit(1)
        
    all_workspace_paths = get_all_workspace_paths(workspace_root)
    
    errors = []
    warnings = []
    valid_targets = []
    
    for idx, line in enumerate(lines, 1):
        stripped = line.strip()
        if not stripped:
            continue
            
        # Parse JSON
        try:
            edge = json.loads(stripped)
        except json.JSONDecodeError as e:
            errors.append(f"Line {idx}: JSON decode error: {e}")
            continue
            
        # Validate schema
        is_valid, schema_err = validate_schema(edge, schema)
        if not is_valid:
            errors.append(f"Line {idx}: Schema validation failed: {schema_err}")
            continue
            
        source = edge["source"]
        target = edge["target"]
        valid_targets.append(target)
        
        # Check target existence
        target_path = workspace_root / target
        if not target_path.exists():
            errors.append(f"Line {idx}: Target path '{target}' does not exist on disk.")
            
        # Check source existence
        if has_glob_wildcards(source):
            # Glob source pattern
            has_match = any(match_source(p, source) for p in all_workspace_paths)
            if not has_match:
                warnings.append(f"Line {idx}: Glob source pattern '{source}' matches 0 paths in the workspace.")
        else:
            # Literal source path
            is_virtual_command = " " in source or source in ("git push", "git commit", "pre-push", "post-commit")
            if not is_virtual_command:
                source_path = workspace_root / source
                if not source_path.exists():
                    errors.append(f"Line {idx}: Literal source path '{source}' does not exist on disk.")
                
    # Check for standalone rules (files in .coretext-data/rules/ not targeted in the ledger)
    rules_dir = engine.data_dir / "rules"
    rule_paths = []
    if rules_dir.is_dir():
        for p in rules_dir.glob("**/*.md"):
            try:
                rel_rule = p.relative_to(workspace_root)
                rule_paths.append(str(rel_rule))
            except ValueError:
                pass
                
    targeted_paths = set(valid_targets)
    standalone_rules = []
    for rule in rule_paths:
        if rule in targeted_paths:
            continue
        
        # Check if targeted via a parent folder
        is_targeted_via_folder = False
        for target in targeted_paths:
            target_path = workspace_root / target
            if target_path.is_dir():
                try:
                    p_rule = workspace_root / rule
                    p_rule.relative_to(target_path)
                    is_targeted_via_folder = True
                    break
                except ValueError:
                    pass
        if not is_targeted_via_folder:
            standalone_rules.append(rule)
            
    # Report standalone rules as warnings
    for rule in standalone_rules:
        warnings.append(f"Standalone rule file '{rule}' is not targeted by any graph edges in the ledger.")
        
    # Report results
    if warnings:
        print("=== LINTER WARNINGS ===")
        for w in warnings:
            print(f"WARNING: {w}")
        print()
        
    if errors:
        print("=== LINTER ERRORS ===", file=sys.stderr)
        for e in errors:
            print(f"ERROR: {e}", file=sys.stderr)
        print(f"\nLint failed with {len(errors)} error(s) and {len(warnings)} warning(s).", file=sys.stderr)
        sys.exit(1)
        
    print(f"Lint successful! Verified {len(lines)} lines with 0 errors and {len(warnings)} warning(s).")
    sys.exit(0)

if __name__ == "__main__":
    main()
