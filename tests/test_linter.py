import os
import sys
import json
import unittest
import tempfile
import contextlib
import io
from pathlib import Path

# Add .coretext to sys.path
REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / ".coretext"))

import lint_graph

class TestGraphLinter(unittest.TestCase):
    def setUp(self):
        # We will create a temporary directory for each test
        self.temp_dir = tempfile.TemporaryDirectory()
        self.workspace = Path(self.temp_dir.name)
        self.coretext_dir = self.workspace / ".coretext"
        self.coretext_dir.mkdir(parents=True, exist_ok=True)
        self.coretext_data_dir = self.workspace / ".coretext-data"
        self.coretext_data_dir.mkdir(parents=True, exist_ok=True)
        
        # Load the real schema and write it to our temp coretext folder
        real_schema_path = REPO_ROOT / ".coretext" / "coretext_schema.json"
        with open(real_schema_path, "r", encoding="utf-8") as f:
            self.schema_data = json.load(f)
            
        # Write schema to temp workspace
        with open(self.coretext_dir / "coretext_schema.json", "w", encoding="utf-8") as f:
            json.dump(self.schema_data, f)
            
        # Save original __file__ of lint_graph so we can restore it in tearDown
        self.original_lint_graph_file = lint_graph.__file__
        # Patch the __file__ variable in the module
        lint_graph.__file__ = str(self.coretext_dir / "lint_graph.py")

    def tearDown(self):
        # Restore __file__
        lint_graph.__file__ = self.original_lint_graph_file
        # Cleanup temp directory
        self.temp_dir.cleanup()

    def write_ledger(self, edges: list):
        # The ledger name is workspace.name + "_rules.jsonl"
        ledger_path = self.coretext_data_dir / f"{self.workspace.name}_rules.jsonl"
        with open(ledger_path, "w", encoding="utf-8") as f:
            for edge in edges:
                if isinstance(edge, str):
                    f.write(edge + "\n")
                else:
                    f.write(json.dumps(edge) + "\n")

    def write_rule_file(self, rel_path: str, content: str = "# Rule Content\n"):
        rule_path = self.coretext_data_dir / "rules" / rel_path
        rule_path.parent.mkdir(parents=True, exist_ok=True)
        with open(rule_path, "w", encoding="utf-8") as f:
            f.write(content)
        return rule_path

    def write_workspace_file(self, rel_path: str, content: str = "some file content\n"):
        file_path = self.workspace / rel_path
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        return file_path

    def run_linter(self) -> tuple:
        stdout_buf = io.StringIO()
        stderr_buf = io.StringIO()
        
        with contextlib.redirect_stdout(stdout_buf), contextlib.redirect_stderr(stderr_buf):
            try:
                lint_graph.main()
                exit_code = 0
            except SystemExit as e:
                exit_code = e.code if e.code is not None else 0
                
        return exit_code, stdout_buf.getvalue(), stderr_buf.getvalue()

    def test_valid_ledger_passes(self):
        # Setup source and target files
        self.write_workspace_file("src/app.py")
        self.write_workspace_file("docs/rules/app.md")
        
        self.write_ledger([
            {
                "source": "src/app.py",
                "target": "docs/rules/app.md",
                "type": "hint",
                "description": "review app rule",
                "hook": "both"
            }
        ])
        
        exit_code, stdout, stderr = self.run_linter()
        self.assertEqual(exit_code, 0)
        self.assertIn("Lint successful!", stdout)
        self.assertIn("Verified 1 lines with 0 errors and 0 warning(s)", stdout)
        self.assertEqual(stderr, "")

    def test_invalid_json_fails(self):
        # Write malformed JSON
        self.write_ledger(["{invalid json"])
        
        exit_code, stdout, stderr = self.run_linter()
        self.assertEqual(exit_code, 1)
        self.assertIn("=== LINTER ERRORS ===", stderr)
        self.assertIn("Line 1: JSON decode error", stderr)

    def test_schema_violation_fails(self):
        # Missing description (required field)
        self.write_ledger([
            {
                "source": "src/app.py",
                "target": "docs/rules/app.md",
                "type": "hint"
            }
        ])
        
        exit_code, stdout, stderr = self.run_linter()
        self.assertEqual(exit_code, 1)
        self.assertIn("=== LINTER ERRORS ===", stderr)
        self.assertIn("Schema validation failed: Missing required key: 'description'", stderr)

        # Invalid type enum
        self.write_ledger([
            {
                "source": "src/app.py",
                "target": "docs/rules/app.md",
                "type": "invalid_type_enum",
                "description": "desc"
            }
        ])
        exit_code, stdout, stderr = self.run_linter()
        self.assertEqual(exit_code, 1)
        self.assertIn("Schema validation failed: Key 'type' value 'invalid_type_enum' is not in allowed enum", stderr)

    def test_missing_target_file_fails(self):
        # Source file exists, target does not
        self.write_workspace_file("src/app.py")
        
        self.write_ledger([
            {
                "source": "src/app.py",
                "target": "docs/nonexistent.md",
                "type": "hint",
                "description": "desc"
            }
        ])
        
        exit_code, stdout, stderr = self.run_linter()
        self.assertEqual(exit_code, 1)
        self.assertIn("=== LINTER ERRORS ===", stderr)
        self.assertIn("Target path 'docs/nonexistent.md' does not exist on disk.", stderr)

    def test_missing_literal_source_file_fails(self):
        # Target exists, literal source does not
        self.write_workspace_file("docs/rules/app.md")
        
        self.write_ledger([
            {
                "source": "src/nonexistent.py",
                "target": "docs/rules/app.md",
                "type": "hint",
                "description": "desc"
            }
        ])
        
        exit_code, stdout, stderr = self.run_linter()
        self.assertEqual(exit_code, 1)
        self.assertIn("=== LINTER ERRORS ===", stderr)
        self.assertIn("Literal source path 'src/nonexistent.py' does not exist on disk.", stderr)

    def test_glob_source_matching_zero_files_triggers_warning(self):
        # Target exists, glob source matches nothing
        self.write_workspace_file("docs/rules/app.md")
        
        self.write_ledger([
            {
                "source": "src/**/*.py",
                "target": "docs/rules/app.md",
                "type": "hint",
                "description": "desc"
            }
        ])
        
        exit_code, stdout, stderr = self.run_linter()
        # Should warning only (exit code 0)
        self.assertEqual(exit_code, 0)
        self.assertIn("=== LINTER WARNINGS ===", stdout)
        self.assertIn("WARNING: Line 1: Glob source pattern 'src/**/*.py' matches 0 paths in the workspace.", stdout)
        self.assertEqual(stderr, "")

    def test_standalone_rule_files_trigger_warning(self):
        # Target and source files exist and targeted
        self.write_workspace_file("src/app.py")
        self.write_workspace_file("docs/rules/app.md")
        
        self.write_ledger([
            {
                "source": "src/app.py",
                "target": "docs/rules/app.md",
                "type": "hint",
                "description": "desc"
            }
        ])
        
        # Write standalone rule in .coretext-data/rules/
        self.write_rule_file("standalone_rule.md")
        
        exit_code, stdout, stderr = self.run_linter()
        self.assertEqual(exit_code, 0)
        self.assertIn("=== LINTER WARNINGS ===", stdout)
        self.assertIn("WARNING: Standalone rule file '.coretext-data/rules/standalone_rule.md' is not targeted by any graph edges in the ledger.", stdout)
        self.assertEqual(stderr, "")

    def test_targeted_rule_files_no_warning(self):
        # Source file exists
        self.write_workspace_file("src/app.py")
        
        # Write rule file
        self.write_rule_file("targeted_rule.md")
        
        # Rule file is targeted
        self.write_ledger([
            {
                "source": "src/app.py",
                "target": ".coretext-data/rules/targeted_rule.md",
                "type": "hint",
                "description": "desc"
            }
        ])
        
        exit_code, stdout, stderr = self.run_linter()
        self.assertEqual(exit_code, 0)
        self.assertNotIn("=== LINTER WARNINGS ===", stdout)
        self.assertNotIn("targeted_rule.md", stdout)

    def test_rule_targeted_via_parent_folder_no_warning(self):
        # Source file exists
        self.write_workspace_file("src/app.py")
        
        # Write rule file in a subdirectory
        self.write_rule_file("sub/nested_rule.md")
        
        # Parent folder of the rule is targeted
        self.write_ledger([
            {
                "source": "src/app.py",
                "target": ".coretext-data/rules/sub",
                "type": "hint",
                "description": "desc"
            }
        ])
        # Also need the target folder to exist on disk to pass target check
        (self.coretext_data_dir / "rules" / "sub").mkdir(parents=True, exist_ok=True)

        exit_code, stdout, stderr = self.run_linter()
        self.assertEqual(exit_code, 0)
        self.assertNotIn("=== LINTER WARNINGS ===", stdout)
        self.assertNotIn("nested_rule.md", stdout)

    def test_has_glob_wildcards(self):
        self.assertFalse(lint_graph.has_glob_wildcards("src/app.py"))
        self.assertTrue(lint_graph.has_glob_wildcards("src/*.py"))
        self.assertTrue(lint_graph.has_glob_wildcards("src/**/app.py"))
        self.assertTrue(lint_graph.has_glob_wildcards("src/?[a-z].py"))

    def test_match_source(self):
        self.assertTrue(lint_graph.match_source("src/app.py", "src/app.py"))
        self.assertTrue(lint_graph.match_source("src/app.py", "src/*.py"))
        self.assertTrue(lint_graph.match_source("src/utils/helper.py", "src/**/*.py"))
        self.assertFalse(lint_graph.match_source("src/utils/helper.py", "src/*.py"))
        
        # Folder matching behaviors
        self.assertTrue(lint_graph.match_source("src/app.py", "src/"))
        self.assertTrue(lint_graph.match_source("src/app.py", "src"))
        self.assertFalse(lint_graph.match_source("docs/app.py", "src"))

    def test_validate_schema(self):
        schema = {
            "required": ["name", "age"],
            "properties": {
                "name": {"type": "string"},
                "age": {"type": "integer"},
                "role": {"type": "string", "enum": ["admin", "user"]}
            }
        }
        
        # Valid
        is_valid, err = lint_graph.validate_schema({"name": "Alice", "age": 30, "role": "admin"}, schema)
        self.assertTrue(is_valid)
        self.assertIsNone(err)
        
        # Missing required
        is_valid, err = lint_graph.validate_schema({"name": "Alice"}, schema)
        self.assertFalse(is_valid)
        self.assertEqual(err, "Missing required key: 'age'")
        
        # Wrong type
        is_valid, err = lint_graph.validate_schema({"name": 123, "age": 30}, schema)
        self.assertFalse(is_valid)
        self.assertEqual(err, "Key 'name' must be a string, got int")
        
        # Wrong enum
        is_valid, err = lint_graph.validate_schema({"name": "Alice", "age": 30, "role": "guest"}, schema)
        self.assertFalse(is_valid)
        self.assertIn("value 'guest' is not in allowed enum", err)

if __name__ == "__main__":
    unittest.main()
