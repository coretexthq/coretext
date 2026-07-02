import os
import sys
import json
import tempfile
import unittest
from pathlib import Path

# Add .coretext directory to sys.path so we can import coretext_engine
REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / ".coretext"))
from coretext_engine import CoretextEngine


class TestCoretextEngine(unittest.TestCase):
    def setUp(self):
        # Create a temporary workspace root
        self.temp_dir = tempfile.TemporaryDirectory()
        self.workspace_root = Path(self.temp_dir.name).resolve()
        
        # Create a .coretext directory inside the workspace
        self.coretext_dir = self.workspace_root / ".coretext"
        self.coretext_dir.mkdir(parents=True)
        
        # Initialize CoretextEngine
        self.engine = CoretextEngine(str(self.coretext_dir))

    def tearDown(self):
        # Cleanup temporary directory
        self.temp_dir.cleanup()

    def test_validate_schema_valid(self):
        valid_edge = {
            "source": "src/api/auth.py",
            "target": "docs/rules/auth.md",
            "type": "hint",
            "description": "verify auth",
            "hook": "both"
        }
        is_valid, err = self.engine._validate_schema(valid_edge)
        self.assertTrue(is_valid)
        self.assertIsNone(err)

    def test_validate_schema_invalid_type(self):
        invalid_edge = {
            "source": "src/api/auth.py",
            "target": "docs/rules/auth.md",
            "type": "invalid",
            "description": "verify auth",
            "hook": "both"
        }
        is_valid, err = self.engine._validate_schema(invalid_edge)
        self.assertFalse(is_valid)
        self.assertIn("Invalid type 'invalid'", err)

    def test_validate_schema_missing_key(self):
        for key in ["source", "target", "type", "description"]:
            edge = {
                "source": "src/api/auth.py",
                "target": "docs/rules/auth.md",
                "type": "hint",
                "description": "verify auth",
                "hook": "both"
            }
            del edge[key]
            is_valid, err = self.engine._validate_schema(edge)
            self.assertFalse(is_valid)
            self.assertIn(f"Missing required key '{key}'", err)

    def test_validate_schema_non_string_values(self):
        edge = {
            "source": 123,
            "target": "docs/rules/auth.md",
            "type": "hint",
            "description": "verify auth",
            "hook": "both"
        }
        is_valid, err = self.engine._validate_schema(edge)
        self.assertFalse(is_valid)
        self.assertIn("Has non-string values", err)

    def test_validate_schema_invalid_hook(self):
        edge = {
            "source": "src/api/auth.py",
            "target": "docs/rules/auth.md",
            "type": "hint",
            "description": "verify auth",
            "hook": "invalid"
        }
        is_valid, err = self.engine._validate_schema(edge)
        self.assertFalse(is_valid)
        self.assertIn("Invalid hook 'invalid'", err)

    def test_add_rules_valid(self):
        # Add new rule
        success, err = self.engine.add_rules(
            source_file="src/api/auth.py",
            target_rules_file="docs/rules/auth.md",
            edge_type="hint",
            description="verify auth",
            hook="both"
        )
        self.assertTrue(success)
        self.assertIsNone(err)

        # Check file was created and contains the rule
        self.assertTrue(self.engine.jsonl_path.exists())
        lines = self.engine.jsonl_path.read_text(encoding="utf-8").splitlines()
        self.assertEqual(len(lines), 1)
        data = json.loads(lines[0])
        self.assertEqual(data["source"], "src/api/auth.py")

    def test_add_rules_duplicate(self):
        # Add first rule
        self.engine.add_rules("src/api/auth.py", "docs/rules/auth.md", "hint", "first desc", "both")
        # Add duplicate rule (different description/hook, but same source, target, type)
        success, err = self.engine.add_rules("src/api/auth.py", "docs/rules/auth.md", "hint", "second desc", "read")
        self.assertTrue(success)
        self.assertIsNone(err)

        # Check only one entry exists in JSONL
        lines = self.engine.jsonl_path.read_text(encoding="utf-8").splitlines()
        self.assertEqual(len(lines), 1)
        data = json.loads(lines[0])
        self.assertEqual(data["description"], "first desc")

    def test_add_rules_invalid(self):
        # Invalid rule (missing description)
        success, err = self.engine.add_rules(
            source_file="src/api/auth.py",
            target_rules_file="docs/rules/auth.md",
            edge_type="invalid_type",
            description="verify auth"
        )
        self.assertFalse(success)
        self.assertIn("Schema validation failed", err)

    def test_pattern_matching_literal(self):
        self.engine.add_rules("src/api/auth.py", "docs/rules/auth.md")
        self.engine.add_rules("src/api/other.py", "docs/rules/other.md")

        # Match exactly
        matches = self.engine.get_context_for_file("src/api/auth.py")
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]["target"], "docs/rules/auth.md")

        # No match for different file
        matches_none = self.engine.get_context_for_file("src/api/different.py")
        self.assertEqual(len(matches_none), 0)

    def test_pattern_matching_glob_wildcard(self):
        # Glob with '*'
        self.engine.add_rules("src/api/*.py", "docs/rules/api.md")
        # Glob with '?'
        self.engine.add_rules("src/api/auth?.py", "docs/rules/auth_wildcard.md")
        # Glob with '['
        self.engine.add_rules("src/api/[a-z]uth.py", "docs/rules/auth_range.md")

        # Test '*' wildcard
        matches_star = self.engine.get_context_for_file("src/api/users.py")
        self.assertEqual(len(matches_star), 1)
        self.assertEqual(matches_star[0]["target"], "docs/rules/api.md")

        # Test '?' wildcard
        matches_question = self.engine.get_context_for_file("src/api/auth1.py")
        self.assertEqual(len(matches_question), 2)  # matches *.py and auth?.py
        targets = [m["target"] for m in matches_question]
        self.assertIn("docs/rules/api.md", targets)
        self.assertIn("docs/rules/auth_wildcard.md", targets)

        # Test '[' wildcard
        matches_bracket = self.engine.get_context_for_file("src/api/auth.py")
        self.assertEqual(len(matches_bracket), 2)  # matches *.py and [a-z]uth.py
        targets = [m["target"] for m in matches_bracket]
        self.assertIn("docs/rules/auth_range.md", targets)

    def test_hook_action_filtering(self):
        self.engine.add_rules("src/api/auth.py", "docs/rules/read.md", hook="read")
        self.engine.add_rules("src/api/auth.py", "docs/rules/write.md", hook="write")
        self.engine.add_rules("src/api/auth.py", "docs/rules/both.md", hook="both")

        # Action: read
        matches_read = self.engine.get_context_for_file("src/api/auth.py", action="read")
        targets_read = {m["target"] for m in matches_read}
        self.assertEqual(targets_read, {"docs/rules/read.md", "docs/rules/both.md"})

        # Action: write
        matches_write = self.engine.get_context_for_file("src/api/auth.py", action="write")
        targets_write = {m["target"] for m in matches_write}
        self.assertEqual(targets_write, {"docs/rules/write.md", "docs/rules/both.md"})

        # Action: both
        matches_both = self.engine.get_context_for_file("src/api/auth.py", action="both")
        targets_both = {m["target"] for m in matches_both}
        self.assertEqual(targets_both, {"docs/rules/read.md", "docs/rules/write.md", "docs/rules/both.md"})

    def test_pattern_matching_folder(self):
        # Folder pattern with trailing slash
        self.engine.add_rules("src/api/", "docs/rules/api_folder.md")
        # Folder pattern without trailing slash
        self.engine.add_rules("src/config", "docs/rules/config_folder.md")

        # Match files inside folder (trailing slash)
        matches_api = self.engine.get_context_for_file("src/api/auth.py")
        self.assertEqual(len(matches_api), 1)
        self.assertEqual(matches_api[0]["target"], "docs/rules/api_folder.md")

        # Match exact folder name
        matches_api_exact = self.engine.get_context_for_file("src/api/")
        self.assertEqual(len(matches_api_exact), 1)

        # Match files inside folder (no trailing slash)
        matches_config = self.engine.get_context_for_file("src/config/database.json")
        self.assertEqual(len(matches_config), 1)
        self.assertEqual(matches_config[0]["target"], "docs/rules/config_folder.md")

        # Verify no false positive suffix match (e.g. src/config-backup)
        matches_config_false = self.engine.get_context_for_file("src/config-backup/db.json")
        self.assertEqual(len(matches_config_false), 0)

    def test_context_rendering_missing_target(self):
        self.engine.add_rules("src/api/auth.py", "docs/rules/missing.md", edge_type="hint")
        payload = self.engine.render_context_payload("src/api/auth.py")
        self.assertIn("Not Found: docs/rules/missing.md", payload["hints"])

    def test_context_rendering_hint_file_and_directory(self):
        # Create a directory target for hint
        target_dir = self.workspace_root / "docs" / "rules"
        target_dir.mkdir(parents=True)
        (target_dir / "rule1.md").write_text("rule 1 content", encoding="utf-8")
        (target_dir / "rule2.md").write_text("rule 2 content", encoding="utf-8")
        
        self.engine.add_rules("src/api/auth.py", "docs/rules", edge_type="hint", description="check directory")
        payload = self.engine.render_context_payload("src/api/auth.py")
        
        self.assertIn("check directory: docs/rules", payload["hints"])
        self.assertIn("Files in target folder:\n- docs/rules/rule1.md\n- docs/rules/rule2.md", payload["hints"])

    def test_context_rendering_full_file(self):
        # Create a file target
        rule_file = self.workspace_root / "docs" / "rules" / "rule.md"
        rule_file.parent.mkdir(parents=True, exist_ok=True)
        rule_file.write_text("Rule description body", encoding="utf-8")

        self.engine.add_rules("src/api/auth.py", "docs/rules/rule.md", edge_type="full", description="full rule")
        payload = self.engine.render_context_payload("src/api/auth.py")

        self.assertIn("full rule: docs/rules/rule.md", payload["hints"])
        self.assertIn("File: docs/rules/rule.md\n```\nRule description body\n```", payload["full_files"])

    def test_context_rendering_full_directory(self):
        # Create a directory target for full injection
        target_dir = self.workspace_root / "docs" / "rules"
        target_dir.mkdir(parents=True, exist_ok=True)
        (target_dir / "rule1.md").write_text("content 1", encoding="utf-8")
        
        # Sub-folder
        sub_dir = target_dir / "sub"
        sub_dir.mkdir()
        (sub_dir / "rule2.md").write_text("content 2", encoding="utf-8")

        self.engine.add_rules("src/api/auth.py", "docs/rules", edge_type="full", description="full dir")
        payload = self.engine.render_context_payload("src/api/auth.py")

        self.assertIn("File: docs/rules/rule1.md\n```\ncontent 1\n```", payload["full_files"])
        self.assertIn("File: docs/rules/sub/rule2.md\n```\ncontent 2\n```", payload["full_files"])

    def test_context_rendering_binary_file_handling(self):
        # Create target binary file
        binary_file = self.workspace_root / "docs" / "rules" / "binary.png"
        binary_file.parent.mkdir(parents=True, exist_ok=True)
        with open(binary_file, "wb") as f:
            f.write(b"\x80\xff\x00\x01\x02")

        # Test single binary file full target
        self.engine.add_rules("src/api/auth.py", "docs/rules/binary.png", edge_type="full", description="binary rule")
        payload = self.engine.render_context_payload("src/api/auth.py")
        self.assertIn("File: docs/rules/binary.png (Binary File)", payload["full_files"])

        # Test directory containing binary file
        target_dir = self.workspace_root / "docs" / "assets"
        target_dir.mkdir(parents=True, exist_ok=True)
        (target_dir / "text.md").write_text("text content", encoding="utf-8")
        with open(target_dir / "binary.bin", "wb") as f:
            f.write(b"\x80\xff")

        self.engine.add_rules("src/api/other.py", "docs/assets", edge_type="full", description="mixed dir")
        payload_dir = self.engine.render_context_payload("src/api/other.py")

        self.assertIn("File: docs/assets/text.md\n```\ntext content\n```", payload_dir["full_files"])
        # Binary file in directory should be skipped in full mode (UnicodeDecodeError is caught)
        self.assertNotIn("binary.bin", payload_dir["full_files"])


if __name__ == "__main__":
    unittest.main()
