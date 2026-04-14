import json
import sqlite3
from pathlib import Path
from typing import List, Dict, Optional, Tuple

class ExperienceEngine:
    def __init__(self, coretext_dir: str):
        self.coretext_dir = Path(coretext_dir)
        self.workspace_root = self.coretext_dir.parent
        self.json_path = self.coretext_dir / "experience.json"
        self.db_path = self.coretext_dir / "experience.db"
        
        self.conn = self._init_db()
        self.sync_json_to_db()

    def _init_db(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS edges (
                source TEXT NOT NULL,
                target TEXT NOT NULL,
                type TEXT NOT NULL,
                UNIQUE(source, target, type)
            )
        """)
        conn.commit()
        return conn

    def _validate_schema(self, data: dict) -> Tuple[bool, Optional[str]]:
        if not isinstance(data, dict):
            return False, "Data must be a JSON object"
        if "edges" not in data:
            return False, "Missing required key: 'edges'"
        if not isinstance(data["edges"], list):
            return False, "'edges' must be a list"
            
        allowed_types = ["docs", "skills", "knowledge", "templates", "archive"]
        
        for idx, edge in enumerate(data["edges"]):
            if not isinstance(edge, dict):
                return False, f"Edge at index {idx} must be an object"
            for req in ["source", "target", "type"]:
                if req not in edge:
                    return False, f"Edge at index {idx} is missing required key '{req}'"
            if not isinstance(edge["source"], str) or not isinstance(edge["target"], str) or not isinstance(edge["type"], str):
                return False, f"Edge at index {idx} has non-string values"
            if edge["type"] not in allowed_types:
                return False, f"Edge at index {idx} has invalid type '{edge['type']}'. Allowed: {allowed_types}"
                
        return True, None

    def sync_json_to_db(self) -> None:
        """Loads experience.json, validates it, and syncs to SQLite."""
        if not self.json_path.exists():
            return
        
        with open(self.json_path, "r") as f:
            data = json.load(f)
            
        is_valid, err = self._validate_schema(data)
        if not is_valid:
            print(f"Warning: experience.json failed schema validation: {err}")
            return

        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM edges")
        
        for edge in data.get("edges", []):
            cursor.execute(
                "INSERT OR IGNORE INTO edges (source, target, type) VALUES (?, ?, ?)",
                (edge["source"], edge["target"], edge["type"])
            )
        self.conn.commit()

    def sync_db_to_json(self) -> None:
        """Dumps current SQLite state back to experience.json."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT source, target, type FROM edges")
        rows = cursor.fetchall()
        
        data = {
            "$schema": "./experience_schema.json",
            "edges": [{"source": r[0], "target": r[1], "type": r[2]} for r in rows]
        }
        
        with open(self.json_path, "w") as f:
            json.dump(data, f, indent=2)

    def add_knowledge(self, source_file: str, target_knowledge_file: str, edge_type: str = "knowledge") -> Tuple[bool, Optional[str]]:
        """
        API for consolidate-knowledge skill.
        Adds a new edge to the graph, validating it against the schema first.
        Returns (success: bool, error_message: str)
        """
        cursor = self.conn.cursor()
        cursor.execute("SELECT source, target, type FROM edges")
        current_edges = [{"source": r[0], "target": r[1], "type": r[2]} for r in cursor.fetchall()]
        
        new_edge = {"source": source_file, "target": target_knowledge_file, "type": edge_type}
        
        if new_edge in current_edges:
            return True, None
            
        test_data = {
            "edges": current_edges + [new_edge]
        }
        
        is_valid, err = self._validate_schema(test_data)
        if not is_valid:
            return False, f"Schema validation failed for new edge: {err}"
            
        cursor.execute(
            "INSERT INTO edges (source, target, type) VALUES (?, ?, ?)",
            (source_file, target_knowledge_file, edge_type)
        )
        self.conn.commit()
        self.sync_db_to_json()
        
        return True, None

    def get_context_for_file(self, filepath: str) -> Dict[str, List[str]]:
        """
        API for File Read Hooks.
        Queries SQLite to find all target files associated with the read source file.
        Returns a dictionary categorized by edge type (e.g., 'knowledge', 'docs').
        """
        cursor = self.conn.cursor()
        cursor.execute("SELECT target, type FROM edges WHERE source = ?", (filepath,))
        rows = cursor.fetchall()
        
        context_files = {}
        for target, edge_type in rows:
            if edge_type not in context_files:
                context_files[edge_type] = []
            context_files[edge_type].append(target)
            
        return context_files
        
    def render_context_payload(self, filepath: str) -> str:
        """
        Retrieves the context files and reads their contents to build an injection string.
        """
        context_files = self.get_context_for_file(filepath)
        if not context_files:
            return ""
            
        payload = [f"--- INJECTED CONTEXT FOR {filepath} ---"]
        
        for edge_type, targets in context_files.items():
            payload.append(f"\\n[Type: {edge_type.upper()}]")
            for target in targets:
                target_path = self.workspace_root / target
                if target_path.exists():
                    with open(target_path, "r") as f:
                        content = f.read()
                    payload.append(f"\\nFile: {target}\\n```\\n{content}\\n```")
                else:
                    payload.append(f"\\nFile: {target} (Not Found)")
                    
        payload.append("\\n--- END INJECTED CONTEXT ---")
        return "\\n".join(payload)

if __name__ == "__main__":
    # Example usage for testing
    import sys
    script_dir = Path(__file__).parent
    
    engine = ExperienceEngine(str(script_dir))
    
    print("Testing get_context_for_file('src/api/auth.py'):")
    print(engine.get_context_for_file("src/api/auth.py"))
    
    print("\\nTesting add_knowledge():")
    success, err = engine.add_knowledge("src/components/Grid.jsx", "knowledge/react_state_rules.md", "knowledge")
    if success:
        print("Knowledge added successfully.")
    else:
        print(f"Failed: {err}")
    
    print("\\nTesting bad add_knowledge (wrong type):")
    success, err = engine.add_knowledge("src/components/Grid.jsx", "knowledge/react_state_rules.md", "bad_type")
    if not success:
        print(f"Caught schema error as expected: {err}")
