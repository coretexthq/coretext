import json
import os
import shutil
import subprocess
import socket
import sys
import time
import unittest
import urllib.request
import urllib.parse
import urllib.error
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]

class DashboardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create temporary isolated workspace structure
        cls.temp_dir = tempfile.TemporaryDirectory()
        cls.workspace = Path(cls.temp_dir.name) / "coretext"
        cls.workspace.mkdir(parents=True)
        
        # Real paths in the repository
        cls.ui_dir = REPO_ROOT / ".coretext" / "coretext-graph-ui"
        
        # Isolated UI paths in temporary workspace
        cls.temp_ui_dir = cls.workspace / ".coretext" / "coretext-graph-ui"
        cls.temp_ui_dir.mkdir(parents=True)
        (cls.temp_ui_dir / "server").mkdir()
        
        # Symlink node_modules to avoid copying large node modules
        os.symlink(cls.ui_dir / "node_modules", cls.temp_ui_dir / "node_modules")
        
        # Copy package.json and index.js
        shutil.copyfile(cls.ui_dir / "package.json", cls.temp_ui_dir / "package.json")
        shutil.copyfile(cls.ui_dir / "server" / "index.js", cls.temp_ui_dir / "server" / "index.js")
        shutil.copyfile(
            REPO_ROOT / ".coretext" / "note_hierarchy.py",
            cls.workspace / ".coretext" / "note_hierarchy.py"
        )
        
        # Setup other required directories in temp workspace, matching server paths:
        # __dirname is in .coretext/coretext-graph-ui/server/
        # sessionsDir: ../../sessions -> .coretext-data/sessions
        # logsDir: ../../.coretext/logs -> .coretext/logs
        # rulesDir: ../../rules -> .coretext-data/rules
        # coretextDir: ../../ -> .coretext-data
        # repoRoot: ../../../ -> workspace root (coretext)
        # projectPath: repoRoot/knowledge -> knowledge
        (cls.workspace / ".coretext-data" / "sessions").mkdir(parents=True, exist_ok=True)
        (cls.workspace / ".coretext" / "logs").mkdir(parents=True, exist_ok=True)
        (cls.workspace / ".coretext-data" / "rules").mkdir(parents=True, exist_ok=True)
        (cls.workspace / "knowledge" / "ai").mkdir(parents=True, exist_ok=True)
        
        # Non-conflicting port for Express server
        cls.port = 3002
        cls.base_url = f"http://127.0.0.1:{cls.port}"
        
        # Environment for subprocess
        env = os.environ.copy()
        env["PORT"] = str(cls.port)
        env["PYTHON"] = sys.executable
        
        # Spawn Express server in subprocess
        cls.process = subprocess.Popen(
            ["node", "server/index.js"],
            cwd=str(cls.temp_ui_dir),
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait for the server to start (up to 5 seconds)
        started = False
        start_time = time.time()
        while time.time() - start_time < 5.0:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                if s.connect_ex(("127.0.0.1", cls.port)) == 0:
                    started = True
                    break
            time.sleep(0.1)
            
        if not started:
            cls.process.terminate()
            stdout, stderr = cls.process.communicate()
            raise RuntimeError(
                f"Express server failed to start: stdout={stdout.decode('utf-8', errors='ignore')}, "
                f"stderr={stderr.decode('utf-8', errors='ignore')}"
            )

    @classmethod
    def tearDownClass(cls):
        # Gracefully terminate Node process
        if cls.process:
            cls.process.terminate()
            try:
                cls.process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                cls.process.kill()
                cls.process.wait()
            # Close process standard streams
            if cls.process.stdout:
                cls.process.stdout.close()
            if cls.process.stderr:
                cls.process.stderr.close()
        
        # Clean up the temporary workspace
        cls.temp_dir.cleanup()

    def get_json(self, path, query_params=None):
        url = f"{self.base_url}{path}"
        if query_params:
            url += "?" + urllib.parse.urlencode(query_params)
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            return json.loads(response.read().decode('utf-8'))

    def post_json(self, path, data=None):
        url = f"{self.base_url}{path}"
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8') if data is not None else b"",
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            return json.loads(response.read().decode('utf-8'))

    def find_node(self, node, node_id):
        if node.get("id") == node_id:
            return node
        for child in node.get("children", []):
            found = self.find_node(child, node_id)
            if found:
                return found
        return None

    def test_1_sessions_empty_and_populated(self):
        # Verify initially empty sessions list
        res = self.get_json("/api/sessions")
        self.assertIn("sessions", res)
        self.assertEqual(res["sessions"], [])
        
        # Add mock session file
        session_file = self.workspace / ".coretext-data" / "sessions" / "session_test.jsonl"
        session_file.write_text('{"node_id": "src/app.py"}\n', encoding="utf-8")
        summary_file = self.workspace / "knowledge" / "ai" / "coretext.dashboard.session-label.md"
        summary_file.write_text(
            '---\nconversations: "test"\n---\nSummary\n',
            encoding="utf-8"
        )
        
        # Verify session file listed
        res = self.get_json("/api/sessions")
        self.assertIn(
            {"name": "session_test.jsonl", "label": "coretext.dashboard.session-label"},
            res["sessions"]
        )

    def test_2_ingest_logs(self):
        # Create a mock JSON log file representing a function call
        log_data = [
            {
                "parts": [
                    {
                        "functionCall": {
                            "name": "write_file",
                            "args": {
                                "file_path": "src/main.py"
                            }
                        }
                    }
                ]
            }
        ]
        log_file = self.workspace / ".coretext" / "logs" / "log_session_1.json"
        log_file.write_text(json.dumps(log_data), encoding="utf-8")
        
        # Ingest
        res = self.post_json("/api/ingest")
        self.assertEqual(res.get("ingested"), 1)
        
        # Verify ingested session output
        session_file = self.workspace / ".coretext-data" / "sessions" / "log_session_1.jsonl"
        self.assertTrue(session_file.exists())
        
        content = session_file.read_text(encoding="utf-8")
        lines = [json.loads(line) for line in content.splitlines() if line.strip()]
        self.assertEqual(len(lines), 1)
        self.assertEqual(lines[0]["node_id"], "src/main.py")
        self.assertEqual(lines[0]["tool_name"], "write_file")

    def test_3_highlights(self):
        # Create mock session files and verify highlights are read correctly
        session1 = self.workspace / ".coretext-data" / "sessions" / "h_session1.jsonl"
        session1.write_text('{"node_id": "src/alpha.py"}\n{"node_id": "src/beta.py"}\n', encoding="utf-8")
        session2 = self.workspace / ".coretext-data" / "sessions" / "h_session2.jsonl"
        session2.write_text('{"node_id": "src/gamma.py"}\n', encoding="utf-8")
        
        # Order by mtime: make session2 newer
        os.utime(session2, (time.time() + 10, time.time() + 10))
        os.utime(session1, (time.time() - 10, time.time() - 10))
        
        # No query params -> returns empty highlights (manual session select only)
        res = self.get_json("/api/highlights")
        self.assertEqual(res["nodes"], [])
        
        # Query with sessions parameter
        res = self.get_json("/api/highlights", {"sessions": "h_session1.jsonl,h_session2.jsonl"})
        self.assertCountEqual(res["nodes"], ["src/alpha.py", "src/beta.py", "src/gamma.py"])

    def test_4_graphs_list(self):
        # Add graph ledger file to the mock workspace root
        graph_file = self.workspace / ".coretext-data" / "test_graph_ledger_rules.jsonl"
        graph_file.write_text('{"source": "a", "target": "b", "type": "hint", "hook": "both"}\n', encoding="utf-8")
        
        res = self.get_json("/api/graphs")
        self.assertIn("test_graph_ledger", res["graphs"])

    def test_5_graph_data(self):
        # Create a custom graph file and query it
        graph_file = self.workspace / ".coretext-data" / "custom_layout_rules.jsonl"
        edge_data = [
            {"source": "src/main.py", "target": "docs/rules/main_rule.md", "type": "full", "hook": "write"},
            {"source": "docs/rules/main_rule.md", "target": ".agents/skills/coretext/SKILL.md", "type": "hint", "hook": "both"}
        ]
        graph_file.write_text("\n".join(json.dumps(e) for e in edge_data) + "\n", encoding="utf-8")
        
        res = self.get_json("/api/graph", {"graph": "custom_layout"})
        self.assertIn("nodes", res)
        self.assertIn("edges", res)
        
        nodes = res["nodes"]
        edges = res["edges"]
        
        self.assertEqual(len(nodes), 3)
        self.assertEqual(len(edges), 2)
        
        # Verify node categorization/role mapping logic
        nodes_by_id = {n["id"]: n for n in nodes}
        self.assertEqual(nodes_by_id["src/main.py"]["data"]["category"], "trigger")
        self.assertEqual(nodes_by_id["docs/rules/main_rule.md"]["data"]["category"], "trigger")
        self.assertEqual(nodes_by_id[".agents/skills/coretext/SKILL.md"]["data"]["category"], "knowledge")

    def test_6_architecture_tree(self):
        # Set up a hierarchy with a virtual durable prefix and a longest-prefix session.
        knowledge_dir = self.workspace / "knowledge"
        knowledge_dir.mkdir(parents=True, exist_ok=True)
        (knowledge_dir / "coretext.md").write_text("# Coretext\n", encoding="utf-8")
        (knowledge_dir / "coretext.architecture.dashboard.md").write_text(
            "# Dashboard\nreference_rule.md\n",
            encoding="utf-8"
        )
        (knowledge_dir / "coretext.evaluation.test.md").write_text("# Test\n", encoding="utf-8")
        
        ai_dir = knowledge_dir / "ai"
        ai_dir.mkdir(parents=True, exist_ok=True)
        (ai_dir / "coretext.evaluation.test.dashboard.session-1.md").write_text("# Session 1\n", encoding="utf-8")
        
        # Graph ledger file for rules trigger mapping
        graph_file = self.workspace / ".coretext-data" / "coretext_rules.jsonl"
        edge_data = [
            {"source": "src/main.py", "target": "knowledge/ai/coretext.evaluation.test.dashboard.session-1.md", "type": "full", "hook": "both"}
        ]
        graph_file.write_text("\n".join(json.dumps(e) for e in edge_data) + "\n", encoding="utf-8")
        
        res = self.get_json("/api/architecture", {"graph": "coretext"})
        self.assertEqual(res.get("id"), "coretext")
        self.assertEqual(res.get("type"), "project")
        self.assertEqual(res.get("path"), "/knowledge/coretext.md")

        virtual_architecture = self.find_node(res, "coretext.architecture")
        self.assertIsNotNone(virtual_architecture)
        self.assertTrue(virtual_architecture["virtual"])
        self.assertIsNone(virtual_architecture["path"])

        dashboard = self.find_node(res, "coretext.architecture.dashboard")
        self.assertEqual(
            dashboard["path"],
            "/knowledge/coretext.architecture.dashboard.md"
        )

        test_scope = self.find_node(res, "coretext.evaluation.test")
        session = self.find_node(
            test_scope,
            "session::coretext.evaluation.test.dashboard.session-1"
        )
        self.assertEqual(session["name"], "dashboard.session-1")
        self.assertEqual(
            session["sessionName"],
            "coretext.evaluation.test.dashboard.session-1"
        )
        self.assertEqual(
            session["path"],
            "/knowledge/ai/coretext.evaluation.test.dashboard.session-1.md"
        )
        trigger = self.find_node(session, "session::coretext.evaluation.test.dashboard.session-1::trigger::0")
        self.assertIsNotNone(trigger)
        self.assertEqual(trigger["type"], "trigger")
        self.assertEqual(trigger["name"], "src/main.py")

    def test_7_architecture_kernel_failures_are_useful(self):
        kernel_path = self.workspace / ".coretext" / "note_hierarchy.py"
        original = kernel_path.read_bytes()
        try:
            kernel_path.write_text("print('not json')\n", encoding="utf-8")
            with self.assertRaises(urllib.error.HTTPError) as ctx:
                self.get_json("/api/architecture")
            self.assertEqual(ctx.exception.code, 500)
            body = json.loads(ctx.exception.read().decode("utf-8"))
            self.assertIn("invalid JSON", body["error"])
            ctx.exception.close()

            kernel_path.write_bytes(original)
            missing_path = kernel_path.with_suffix(".missing")
            kernel_path.rename(missing_path)
            try:
                with self.assertRaises(urllib.error.HTTPError) as ctx:
                    self.get_json("/api/architecture")
                self.assertEqual(ctx.exception.code, 500)
                body = json.loads(ctx.exception.read().decode("utf-8"))
                self.assertIn("kernel failed", body["error"])
                ctx.exception.close()
            finally:
                missing_path.rename(kernel_path)
        finally:
            kernel_path.write_bytes(original)

    def test_8_file_content(self):
        # Write dummy file inside the mock workspace
        dummy_file = self.workspace / "knowledge" / "coretext.md"
        dummy_file.parent.mkdir(parents=True, exist_ok=True)
        dummy_file.write_text("Hello Coretext Content!", encoding="utf-8")
        
        # Test content retrieval
        res = self.get_json("/api/file-content", {"path": "knowledge/coretext.md"})
        self.assertIn("content", res)
        self.assertEqual(res["content"], "Hello Coretext Content!")
        self.assertEqual(res["relativePath"], "/knowledge/coretext.md")
        
        # Non-existent path returns 404
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            self.get_json("/api/file-content", {"path": "nonexistent.md"})
        self.assertEqual(ctx.exception.code, 404)
        ctx.exception.close()


class DashboardStaticCompilerTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.workspace = Path(self.temp_dir.name) / "coretext"
        (self.workspace / ".coretext").mkdir(parents=True, exist_ok=True)
        (self.workspace / ".coretext-data" / "rules").mkdir(parents=True)
        (self.workspace / ".coretext-data" / "sessions").mkdir(parents=True)
        (self.workspace / "knowledge" / "ai").mkdir(parents=True)
        shutil.copyfile(
            REPO_ROOT / "compile-dashboard-data.js",
            self.workspace / "compile-dashboard-data.js"
        )
        shutil.copyfile(
            REPO_ROOT / ".coretext" / "note_hierarchy.py",
            self.workspace / ".coretext" / "note_hierarchy.py"
        )

    def tearDown(self):
        self.temp_dir.cleanup()

    def find_node(self, node, node_id):
        if node.get("id") == node_id:
            return node
        for child in node.get("children", []):
            found = self.find_node(child, node_id)
            if found:
                return found
        return None

    def test_static_architecture_uses_kernel_and_keeps_site_filter(self):
        knowledge_dir = self.workspace / "knowledge"
        (knowledge_dir / "coretext.md").write_text("# Coretext\n", encoding="utf-8")
        (knowledge_dir / "coretext.dashboard.md").write_text(
            "# Dashboard\n",
            encoding="utf-8"
        )
        (knowledge_dir / "coretext.dashboard.deep.leaf.md").write_text(
            "# Leaf\n",
            encoding="utf-8"
        )
        (knowledge_dir / "coretext.architecture.md").write_text(
            "# Architecture\n",
            encoding="utf-8"
        )
        (knowledge_dir / "ai" / "coretext.dashboard.deep.leaf.static-session.md").write_text(
            "# Static session\n",
            encoding="utf-8"
        )
        (knowledge_dir / "ai" / "other.session-label.md").write_text(
            "---\nconversations: static-test\n---\n# Other session\n",
            encoding="utf-8"
        )
        (self.workspace / ".coretext-data" / "sessions" / "session_static-test.jsonl").write_text(
            '{"node_id": "src/static.py"}\n',
            encoding="utf-8"
        )

        env = os.environ.copy()
        env["PYTHON"] = sys.executable
        subprocess.run(
            ["node", "compile-dashboard-data.js"],
            cwd=self.workspace,
            env=env,
            check=True,
            capture_output=True,
            text=True
        )

        architecture_path = (
            self.workspace / "dist" / "knowledge" / "api" / "architecture.json"
        )
        architecture = json.loads(architecture_path.read_text(encoding="utf-8"))
        self.assertEqual(
            [child["id"] for child in architecture["children"]],
            ["coretext.dashboard"]
        )
        dashboard = self.find_node(architecture, "coretext.dashboard")
        self.assertEqual(dashboard["path"], "/knowledge/coretext.dashboard.md")

        virtual_deep = self.find_node(architecture, "coretext.dashboard.deep")
        self.assertTrue(virtual_deep["virtual"])
        self.assertIsNone(virtual_deep["path"])

        leaf = self.find_node(architecture, "coretext.dashboard.deep.leaf")
        self.assertEqual(
            leaf["path"],
            "/knowledge/coretext.dashboard.deep.leaf.md"
        )
        session = self.find_node(
            leaf,
            "session::coretext.dashboard.deep.leaf.static-session"
        )
        self.assertEqual(
            session["sessionName"],
            "coretext.dashboard.deep.leaf.static-session"
        )
        self.assertEqual(
            session["path"],
            "/knowledge/ai/coretext.dashboard.deep.leaf.static-session.md"
        )

        sessions_path = (
            self.workspace / "dist" / "knowledge" / "api" / "sessions.json"
        )
        sessions = json.loads(sessions_path.read_text(encoding="utf-8"))
        self.assertIn(
            {
                "name": "session_static-test.jsonl",
                "label": "other.session-label"
            },
            sessions["sessions"]
        )


if __name__ == "__main__":
    unittest.main()
