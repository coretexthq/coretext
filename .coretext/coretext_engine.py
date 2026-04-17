import json
from pathlib import Path
import fnmatch
from typing import List, Dict, Optional, Tuple

class CoretextEngine:
    def __init__(self, coretext_dir: str):
        self.coretext_dir = Path(coretext_dir)
        self.workspace_root = self.coretext_dir.parent
        self.jsonl_path = self.coretext_dir / "coretext.jsonl"
        self.schema_path = self.coretext_dir / "coretext_schema.json"

    def _validate_schema(self, edge: dict) -> Tuple[bool, Optional[str]]:
        if not isinstance(edge, dict):
            return False, "Data must be a JSON object"
            
        allowed_types = ["full", "hint"]
        allowed_hooks = ["read", "write", "both"]
        
        for req in ["source", "target", "type", "description"]:
            if req not in edge:
                return False, f"Missing required key '{req}'"
        if not isinstance(edge["source"], str) or not isinstance(edge["target"], str) or not isinstance(edge["type"], str) or not isinstance(edge["description"], str):
            return False, "Has non-string values"
        if edge["type"] not in allowed_types:
            return False, f"Invalid type '{edge['type']}'. Allowed: {allowed_types}"
        
        hook = edge.get("hook", "both")
        if hook not in allowed_hooks:
            return False, f"Invalid hook '{hook}'. Allowed: {allowed_hooks}"
            
        return True, None

    def add_rules(self, source_file: str, target_rules_file: str, edge_type: str = "hint", description: str = "", hook: str = "both") -> Tuple[bool, Optional[str]]:
        """
        API for consolidate-rules skill.
        Adds a new edge to the graph, validating it against the schema first.
        """
        new_edge = {"source": source_file, "target": target_rules_file, "type": edge_type, "description": description, "hook": hook}
        
        is_valid, err = self._validate_schema(new_edge)
        if not is_valid:
            return False, f"Schema validation failed for new edge: {err}"

        # check if it already exists
        if self.jsonl_path.exists():
            with open(self.jsonl_path, "r") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            edge = json.loads(line)
                            if edge.get("source") == source_file and edge.get("target") == target_rules_file and edge.get("type") == edge_type:
                                return True, None  # Already exists
                        except json.JSONDecodeError:
                            pass
                            
        with open(self.jsonl_path, "a") as f:
            f.write(json.dumps(new_edge) + "\n")
        
        return True, None

    def get_context_for_file(self, filepath: str, action: str = "both") -> List[dict]:
        """
        API for File Read Hooks.
        Parses the jsonl event log, matches `source` pattern against filepath using fnmatch or directory prefix.
        Filters by hook action.
        """
        if not self.jsonl_path.exists():
            return []

        matched_edges = []
        with open(self.jsonl_path, "r") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        edge = json.loads(line)
                        if "source" in edge:
                            source_pattern = edge["source"]
                            is_match = fnmatch.fnmatch(filepath, source_pattern)
                            if not is_match and "**/" in source_pattern:
                                is_match = fnmatch.fnmatch(filepath, source_pattern.replace("**/", ""))
                            if not is_match and "**" in source_pattern:
                                is_match = fnmatch.fnmatch(filepath, source_pattern.replace("**", "*"))
                            
                            if not is_match:
                                # Match if source is a folder
                                norm_source = source_pattern.rstrip('/') + '/'
                                if filepath.startswith(norm_source) or filepath == source_pattern:
                                    is_match = True
                            
                            if is_match:
                                hook = edge.get("hook", "both")
                                if hook == "both" or action == "both" or hook == action:
                                    matched_edges.append(edge)
                    except json.JSONDecodeError:
                        pass
                        
        return matched_edges
        
    def render_context_payload(self, filepath: str, action: str = "both") -> Dict[str, str]:
        """
        Retrieves the context files and reads their contents to build an injection string.
        Returns a dictionary separating hints and full files.
        """
        context_edges = self.get_context_for_file(filepath, action)
        if not context_edges:
            return {"hints": "", "full_files": ""}
            
        hints = []
        full_files = []
        
        for edge in context_edges:
            target = edge.get("target", "")
            etype = edge.get("type", "hint")
            desc = edge.get("description", "")
            
            hints.append(f"{desc}: {target}")
            
            target_path = self.workspace_root / target
            if not target_path.exists():
                hints.append(f"Not Found: {target}")
                continue

            if etype == "full":
                if target_path.is_file():
                    try:
                        with open(target_path, "r", encoding="utf-8") as f:
                            content = f.read()
                        full_files.append(f"\nFile: {target}\n```\n{content}\n```")
                    except UnicodeDecodeError:
                        full_files.append(f"\nFile: {target} (Binary File)")
                elif target_path.is_dir():
                    for child in target_path.glob("**/*"):
                        if child.is_file():
                            try:
                                with open(child, "r", encoding="utf-8") as f:
                                    content = f.read()
                                full_files.append(f"\nFile: {child.relative_to(self.workspace_root)}\n```\n{content}\n```")
                            except UnicodeDecodeError:
                                pass
            elif etype == "hint":
                if target_path.is_dir():
                    hint_files = []
                    for child in target_path.glob("**/*"):
                        if child.is_file():
                            hint_files.append(str(child.relative_to(self.workspace_root)))
                    if hint_files:
                        hints.append("Files in target folder:\n- " + "\n- ".join(hint_files))
                        
        return {
            "hints": "\n".join(hints),
            "full_files": "\n".join(full_files)
        }

if __name__ == "__main__":
    import sys
    script_dir = Path(__file__).parent
    
    engine = CoretextEngine(str(script_dir))
    print(engine.render_context_payload("src/api/auth.py", "read"))
