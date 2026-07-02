import contextlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / ".coretext"))

import note_hierarchy


class NoteHierarchyTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.repository_root = Path(self.temp_dir.name)
        (self.repository_root / "knowledge" / "ai").mkdir(parents=True)

    def tearDown(self):
        self.temp_dir.cleanup()

    def write_note(self, relative_path, content="note body must not be rendered"):
        path = self.repository_root / relative_path
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path

    def find_node(self, node, node_id):
        if node["id"] == node_id:
            return node
        for child in node["children"]:
            found = self.find_node(child, node_id)
            if found is not None:
                return found
        return None

    def assert_node_shape(self, node):
        node_type = node.get("type")
        if node_type == "rule":
            core_keys = {"id", "name", "path", "type", "children"}
        elif node_type == "trigger":
            core_keys = {"id", "name", "type", "path"}
        else:
            core_keys = {"id", "qualifiedName", "name", "type", "path", "virtual", "children"}
        self.assertTrue(core_keys.issubset(set(node)), f"Node of type {node_type} missing core keys: {node.keys()}")
        for child in node.get("children", []):
            self.assert_node_shape(child)

    def test_builds_normal_ancestry_with_exact_node_fields(self):
        self.write_note("knowledge/alpha.md")
        self.write_note("knowledge/alpha.architecture.md")
        self.write_note("knowledge/alpha.architecture.knowledge.md")
        self.write_note(
            "knowledge/ai/alpha.architecture.knowledge.session-one.md"
        )

        tree = note_hierarchy.build_note_tree(self.repository_root, "alpha")

        self.assert_node_shape(tree)
        self.assertEqual(tree["id"], "alpha")
        self.assertEqual(tree["qualifiedName"], "alpha")
        self.assertEqual(tree["name"], "alpha")
        self.assertEqual(tree["type"], "project")
        self.assertEqual(tree["path"], "knowledge/alpha.md")
        self.assertFalse(tree["virtual"])

        knowledge = self.find_node(tree, "alpha.architecture.knowledge")
        self.assertEqual(knowledge["name"], "knowledge")
        session = self.find_node(
            tree,
            "session::alpha.architecture.knowledge.session-one",
        )
        self.assertEqual(session["name"], "session-one")
        self.assertEqual(
            session["path"],
            "knowledge/ai/alpha.architecture.knowledge.session-one.md",
        )
        self.assertFalse(session["path"].startswith("/"))

    def test_creates_virtual_missing_durable_parents(self):
        self.write_note("knowledge/alpha.one.two.md")

        tree = note_hierarchy.build_note_tree(self.repository_root, "alpha")

        one = self.find_node(tree, "alpha.one")
        two = self.find_node(tree, "alpha.one.two")
        self.assertTrue(tree["virtual"])
        self.assertIsNone(tree["path"])
        self.assertIsNotNone(one)
        self.assertTrue(one["virtual"])
        self.assertIsNone(one["path"])
        self.assertEqual(one["type"], "scope")
        self.assertFalse(two["virtual"])
        self.assertEqual(two["path"], "knowledge/alpha.one.two.md")

    def test_orders_durable_nodes_before_lexical_session_nodes(self):
        self.write_note("knowledge/alpha.md")
        self.write_note("knowledge/alpha.zeta.md")
        self.write_note("knowledge/alpha.beta.md")
        self.write_note("knowledge/ai/alpha.zz-session.md")
        self.write_note("knowledge/ai/alpha.aa-session.md")

        tree = note_hierarchy.build_note_tree(self.repository_root, "alpha")

        self.assertEqual(
            [child["id"] for child in tree["children"]],
            [
                "alpha.beta",
                "alpha.zeta",
                "session::alpha.aa-session",
                "session::alpha.zz-session",
            ],
        )

    def test_durable_lineage_omits_target_children_and_owned_sessions(self):
        self.write_note("knowledge/alpha.md")
        self.write_note("knowledge/alpha.other.md")
        target = self.write_note("knowledge/alpha.scope.md")
        self.write_note("knowledge/alpha.scope.child.md")
        self.write_note("knowledge/ai/alpha.scope.session.md")

        projection = note_hierarchy.build_lineage_projection(
            self.repository_root,
            target,
        )

        self.assertEqual(
            [child["id"] for child in projection["children"]],
            ["alpha.other", "alpha.scope"],
        )
        scope = self.find_node(projection, "alpha.scope")
        self.assertEqual(scope["children"], [])

    def test_durable_lineage_excludes_sessions_at_every_ancestor_level(self):
        self.write_note("knowledge/alpha.md")
        self.write_note("knowledge/alpha.other.md")
        self.write_note("knowledge/alpha.scope.md")
        target = self.write_note("knowledge/alpha.scope.deep.md")
        self.write_note("knowledge/alpha.scope.stable-sibling.md")
        self.write_note("knowledge/ai/alpha.historical-session.md")
        self.write_note("knowledge/ai/alpha.scope.historical-session.md")

        projection = note_hierarchy.build_lineage_projection(
            self.repository_root,
            target,
        )

        self.assertEqual(
            [child["id"] for child in projection["children"]],
            ["alpha.other", "alpha.scope"],
        )
        scope = self.find_node(projection, "alpha.scope")
        self.assertEqual(
            [child["id"] for child in scope["children"]],
            ["alpha.scope.deep", "alpha.scope.stable-sibling"],
        )
        self.assertNotIn("session::", json.dumps(projection))

    def test_session_uses_longest_existing_durable_prefix(self):
        self.write_note("knowledge/alpha.md")
        self.write_note("knowledge/alpha.scope.md")
        self.write_note("knowledge/alpha.scope.deep.md")
        self.write_note("knowledge/ai/alpha.scope.deep.work.item.md")
        self.write_note("knowledge/ai/alpha.missing.fallback.md")

        tree = note_hierarchy.build_note_tree(self.repository_root, "alpha")

        deep = self.find_node(tree, "alpha.scope.deep")
        self.assertEqual(
            [child["id"] for child in deep["children"]],
            ["session::alpha.scope.deep.work.item"],
        )
        self.assertEqual(deep["children"][0]["name"], "work.item")
        self.assertIn(
            "session::alpha.missing.fallback",
            [child["id"] for child in tree["children"]],
        )

    def test_session_lineage_includes_all_direct_durable_and_session_siblings(self):
        self.write_note("knowledge/alpha.md")
        self.write_note("knowledge/alpha.other.md")
        self.write_note("knowledge/alpha.scope.md")
        self.write_note("knowledge/alpha.scope.child.md")
        target = self.write_note("knowledge/ai/alpha.scope.one.md")
        self.write_note("knowledge/ai/alpha.scope.two.md")

        projection = note_hierarchy.build_lineage_projection(
            self.repository_root,
            target,
        )

        self.assertEqual(
            [child["id"] for child in projection["children"]],
            ["alpha.other", "alpha.scope"],
        )
        scope = self.find_node(projection, "alpha.scope")
        self.assertEqual(
            [child["id"] for child in scope["children"]],
            [
                "alpha.scope.child",
                "session::alpha.scope.one",
                "session::alpha.scope.two",
            ],
        )
        self.assertTrue(all(not child["children"] for child in scope["children"]))

    def test_excludes_archive_directories(self):
        self.write_note("knowledge/alpha.md")
        self.write_note("knowledge/archive/alpha.hidden.md")
        self.write_note("knowledge/ai/archive/alpha.hidden-session.md")

        tree = note_hierarchy.build_note_tree(self.repository_root, "alpha")

        self.assertEqual(tree["children"], [])
        with self.assertRaises(note_hierarchy.InvalidTargetError):
            note_hierarchy.build_lineage_projection(
                self.repository_root,
                "knowledge/archive/alpha.hidden.md",
            )

    def test_project_filter_excludes_unrelated_projects(self):
        self.write_note("knowledge/alpha.md")
        self.write_note("knowledge/alpha.scope.md")
        self.write_note("knowledge/beta.md")
        self.write_note("knowledge/beta.scope.md")
        self.write_note("knowledge/ai/beta.scope.session.md")

        tree = note_hierarchy.build_note_tree(self.repository_root, "alpha")
        serialized = json.dumps(tree)

        self.assertNotIn("beta", serialized)
        self.assertEqual(
            [child["id"] for child in tree["children"]],
            ["alpha.scope"],
        )

    def test_cli_index_and_lineage_json_and_text(self):
        self.write_note("knowledge/alpha.md")
        self.write_note("knowledge/alpha.scope.md")
        target = self.write_note(
            "knowledge/ai/alpha.scope.session.md",
            content="SECRET NOTE CONTENT",
        )

        stdout = io.StringIO()
        stderr = io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            exit_code = note_hierarchy.main(
                ["index", "--project", "alpha"],
                repository_root=self.repository_root,
            )
        self.assertEqual(exit_code, 0)
        self.assertEqual(stderr.getvalue(), "")
        index_tree = json.loads(stdout.getvalue())
        self.assertEqual(index_tree["id"], "alpha")

        stdout = io.StringIO()
        with contextlib.redirect_stdout(stdout):
            exit_code = note_hierarchy.main(
                [
                    "lineage",
                    "--target",
                    str(target),
                    "--format",
                    "json",
                ],
                repository_root=self.repository_root,
            )
        self.assertEqual(exit_code, 0)
        projection = json.loads(stdout.getvalue())
        session = self.find_node(
            projection,
            "session::alpha.scope.session",
        )
        self.assertIsNotNone(session)

        stdout = io.StringIO()
        with contextlib.redirect_stdout(stdout):
            exit_code = note_hierarchy.main(
                [
                    "lineage",
                    "--target",
                    "knowledge/ai/alpha.scope.session.md",
                    "--format",
                    "text",
                ],
                repository_root=self.repository_root,
            )
        text = stdout.getvalue()
        self.assertEqual(exit_code, 0)
        self.assertIn(
            "Note lineage: knowledge/ai/alpha.scope.session.md",
            text,
        )
        self.assertIn("* session [session]", text)
        self.assertNotIn("SECRET NOTE CONTENT", text)

    def test_cli_invalid_target_fails_with_clear_stderr(self):
        stdout = io.StringIO()
        stderr = io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            exit_code = note_hierarchy.main(
                [
                    "lineage",
                    "--target",
                    "knowledge/missing.md",
                    "--format",
                    "json",
                ],
                repository_root=self.repository_root,
            )

        self.assertNotEqual(exit_code, 0)
        self.assertEqual(stdout.getvalue(), "")
        self.assertIn("error: Target note does not exist", stderr.getvalue())

    def test_backlog_command_lists_and_lints_successfully(self):
        self.write_note("knowledge/alpha.md", "# Backlog\n- Task 1\n- Task 2\n--- # Resource")
        self.write_note("knowledge/alpha.scope.md", "# Backlog\n- Task 3\n--- # Resource")

        stdout = io.StringIO()
        stderr = io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            exit_code = note_hierarchy.main(
                ["backlog"],
                repository_root=self.repository_root,
            )
        self.assertEqual(exit_code, 0)
        self.assertIn("knowledge/alpha.md", stdout.getvalue())
        self.assertIn("Task 1", stdout.getvalue())
        self.assertIn("Task 3", stdout.getvalue())

        # Test lint success
        stdout = io.StringIO()
        with contextlib.redirect_stdout(stdout):
            exit_code = note_hierarchy.main(
                ["backlog", "--lint"],
                repository_root=self.repository_root,
            )
        self.assertEqual(exit_code, 0)
        self.assertIn("Backlog lint passed successfully!", stdout.getvalue())

    def test_backlog_command_detects_duplicates(self):
        self.write_note("knowledge/alpha.md", "# Backlog\n- Duplicate Task\n--- # Resource")
        self.write_note("knowledge/alpha.scope.md", "# Backlog\n- Duplicate Task\n--- # Resource")

        stdout = io.StringIO()
        stderr = io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            exit_code = note_hierarchy.main(
                ["backlog", "--lint"],
                repository_root=self.repository_root,
            )
        self.assertEqual(exit_code, 1)
        self.assertIn("Duplicate backlog item 'Duplicate Task' found", stderr.getvalue())

    def test_cli_architecture_json(self):
        self.write_note("knowledge/alpha.md")
        self.write_note("knowledge/alpha.scope.md")
        self.write_note("knowledge/ai/alpha.scope.session-one.md")

        # Graph ledger file for rules trigger mapping
        graph_file = self.repository_root / ".coretext-data" / "alpha_rules.jsonl"
        graph_file.parent.mkdir(parents=True, exist_ok=True)
        edge_data = [
            {"source": "src/main.py", "target": "knowledge/ai/alpha.scope.session-one.md", "type": "full", "hook": "both"}
        ]
        graph_file.write_text("\n".join(json.dumps(e) for e in edge_data) + "\n", encoding="utf-8")

        stdout = io.StringIO()
        stderr = io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            exit_code = note_hierarchy.main(
                ["architecture", "--project", "alpha"],
                repository_root=self.repository_root,
            )
        self.assertEqual(exit_code, 0)
        tree = json.loads(stdout.getvalue())
        self.assert_node_shape(tree)
        self.assertEqual(tree["id"], "alpha")
        scope = self.find_node(tree, "alpha.scope")
        session = self.find_node(scope, "session::alpha.scope.session-one")
        self.assertIsNotNone(session)
        trigger = self.find_node(session, "session::alpha.scope.session-one::trigger::0")
        self.assertIsNotNone(trigger)
        self.assertEqual(trigger["type"], "trigger")
        self.assertEqual(trigger["name"], "src/main.py")

    def test_cli_sessions_and_highlights(self):
        sessions_dir = self.repository_root / ".coretext-data" / "sessions"
        sessions_dir.mkdir(parents=True, exist_ok=True)
        session_file = sessions_dir / "session_abc.jsonl"
        session_file.write_text('{"node_id": "src/main.py", "tool_name": "write_file"}\n', encoding="utf-8")

        self.write_note(
            "knowledge/ai/alpha.scope.summary.md",
            "---\nconversations:\n  - abc\n---\nSummary content"
        )

        stdout = io.StringIO()
        with contextlib.redirect_stdout(stdout):
            exit_code = note_hierarchy.main(
                ["sessions"],
                repository_root=self.repository_root,
            )
        self.assertEqual(exit_code, 0)
        res = json.loads(stdout.getvalue())
        self.assertIn("sessions", res)
        self.assertEqual(len(res["sessions"]), 1)
        self.assertEqual(res["sessions"][0]["name"], "session_abc.jsonl")
        self.assertEqual(res["sessions"][0]["label"], "alpha.scope.summary")

        stdout = io.StringIO()
        with contextlib.redirect_stdout(stdout):
            exit_code = note_hierarchy.main(
                ["highlights", "--sessions", "session_abc.jsonl"],
                repository_root=self.repository_root,
            )
        self.assertEqual(exit_code, 0)
        res = json.loads(stdout.getvalue())
        self.assertIn("nodes", res)
        self.assertIn("actions", res)
        self.assertIn("src/main.py", res["nodes"])
        self.assertEqual(res["actions"]["src/main.py"], "write")


if __name__ == "__main__":
    unittest.main()
