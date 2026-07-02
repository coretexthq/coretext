import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
CORETEXT_SOURCE = REPO_ROOT / ".coretext"


class RuntimeHookTests(unittest.TestCase):
    def make_workspace(self):
        temp_dir = tempfile.TemporaryDirectory()
        workspace = Path(temp_dir.name) / "sample"
        coretext_dir = workspace / ".coretext"
        coretext_dir.mkdir(parents=True)

        for name in [
            "coretext_engine.py",
            "inject_context.py",
            "note_hierarchy.py",
            "notify_action.py",
            "runtime_hook_adapter.py",
        ]:
            shutil.copyfile(CORETEXT_SOURCE / name, coretext_dir / name)

        (workspace / "src").mkdir()
        (workspace / "docs" / "rules").mkdir(parents=True)
        (workspace / "docs" / "guide.md").parent.mkdir(parents=True, exist_ok=True)
        (workspace / "knowledge" / "ai").mkdir(parents=True)
        return temp_dir, workspace

    def write_graph(self, workspace, edges):
        graph_path = workspace / ".coretext-data" / f"{workspace.name}_rules.jsonl"
        graph_path.parent.mkdir(parents=True, exist_ok=True)
        graph_path.write_text(
            "\n".join(json.dumps(edge) for edge in edges) + "\n",
            encoding="utf-8",
        )

    def run_hook(self, workspace, script_name, payload, extra_env=None):
        env = os.environ.copy()
        if extra_env:
            env.update(extra_env)

        proc = subprocess.run(
            [sys.executable, str(workspace / ".coretext" / script_name)],
            input=json.dumps(payload),
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=str(workspace),
            env=env,
            check=False,
        )
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertTrue(proc.stdout.strip(), "hook did not print a JSON response")
        return json.loads(proc.stdout)

    def write_lineage_notes(self, workspace):
        notes = {
            "knowledge/alpha.md": "project body must not be injected\n",
            "knowledge/alpha.other.md": "sibling body must not be injected\n",
            "knowledge/alpha.scope.md": "scope body must not be injected\n",
            "knowledge/ai/alpha.scope.session.md": (
                "session body must not be injected\n"
            ),
        }
        for relative_path, content in notes.items():
            (workspace / relative_path).write_text(content, encoding="utf-8")

    def codex_lineage_payload(self, workspace, path, session_id):
        return {
            "session_id": session_id,
            "cwd": str(workspace),
            "hook_event_name": "PreToolUse",
            "tool_name": "mcp__filesystem__read_file",
            "tool_input": {"path": str(path)},
        }

    def antigravity_view_payload(self, workspace, path, session_id):
        return {
            "toolCall": {
                "name": "view_file",
                "args": {"AbsolutePath": str(path)},
            },
            "conversationId": session_id,
            "workspacePaths": [str(workspace)],
            "stepIdx": 2,
        }

    def antigravity_invocation_payload(self, workspace, session_id):
        return {
            "invocationNum": 3,
            "initialNumSteps": 10,
            "conversationId": session_id,
            "workspacePaths": [str(workspace)],
        }

    def test_unsupported_gemini_payload_does_not_inject_context(self):
        temp_dir, workspace = self.make_workspace()
        self.addCleanup(temp_dir.cleanup)
        (workspace / "src" / "app.py").write_text("print('ok')\n", encoding="utf-8")
        (workspace / "docs" / "rules" / "app.md").write_text("# App Rule\n", encoding="utf-8")
        self.write_graph(
            workspace,
            [
                {
                    "source": "src/app.py",
                    "target": "docs/rules/app.md",
                    "type": "hint",
                    "description": "review app rule",
                    "hook": "read",
                }
            ],
        )

        response = self.run_hook(
            workspace,
            "inject_context.py",
            {
                "tool_name": "read_file",
                "tool_input": {"file_path": str(workspace / "src" / "app.py")},
                "session_id": "unsupported-read",
                "hook_event_name": "AfterTool",
            },
        )

        self.assertEqual(response, {})

    def test_antigravity_write_guard_blocks_once_then_allows_retry(self):
        temp_dir, workspace = self.make_workspace()
        self.addCleanup(temp_dir.cleanup)
        (workspace / "src" / "guarded.py").write_text("old\n", encoding="utf-8")
        (workspace / "docs" / "rules" / "write.md").write_text("WRITE RULE\n", encoding="utf-8")
        self.write_graph(
            workspace,
            [
                {
                    "source": "src/guarded.py",
                    "target": "docs/rules/write.md",
                    "type": "full",
                    "description": "read write rule",
                    "hook": "write",
                }
            ],
        )

        payload = {
            "toolCall": {
                "name": "replace_file_content",
                "args": {"TargetFile": str(workspace / "src" / "guarded.py")},
            },
            "conversationId": "antigravity-session",
            "workspacePaths": [str(workspace)],
            "stepIdx": 2,
        }

        first = self.run_hook(workspace, "inject_context.py", payload)
        self.assertEqual(first["decision"], "deny")
        self.assertIn("WRITE RULE", first["reason"])

        second = self.run_hook(workspace, "inject_context.py", payload)
        self.assertEqual(second["decision"], "allow")

    def test_codex_apply_patch_write_guard_uses_codex_deny_shape(self):
        temp_dir, workspace = self.make_workspace()
        self.addCleanup(temp_dir.cleanup)
        (workspace / "src" / "guarded.py").write_text("old\n", encoding="utf-8")
        (workspace / "docs" / "rules" / "write.md").write_text("WRITE RULE\n", encoding="utf-8")
        self.write_graph(
            workspace,
            [
                {
                    "source": "src/guarded.py",
                    "target": "docs/rules/write.md",
                    "type": "full",
                    "description": "read write rule",
                    "hook": "write",
                }
            ],
        )

        response = self.run_hook(
            workspace,
            "inject_context.py",
            {
                "session_id": "codex-session",
                "cwd": str(workspace),
                "hook_event_name": "PreToolUse",
                "tool_name": "apply_patch",
                "tool_input": {
                    "command": "*** Begin Patch\n*** Update File: src/guarded.py\n@@\n-old\n+new\n*** End Patch\n"
                },
            },
        )

        hook_output = response["hookSpecificOutput"]
        self.assertEqual(hook_output["hookEventName"], "PreToolUse")
        self.assertEqual(hook_output["permissionDecision"], "deny")
        self.assertIn("WRITE RULE", hook_output["permissionDecisionReason"])

    def test_codex_mcp_read_payload_can_inject_context(self):
        temp_dir, workspace = self.make_workspace()
        self.addCleanup(temp_dir.cleanup)
        (workspace / "docs" / "guide.md").write_text("guide\n", encoding="utf-8")
        (workspace / "docs" / "rules" / "guide.md").write_text("# Guide Rule\n", encoding="utf-8")
        self.write_graph(
            workspace,
            [
                {
                    "source": "docs/guide.md",
                    "target": "docs/rules/guide.md",
                    "type": "hint",
                    "description": "review guide rule",
                    "hook": "read",
                }
            ],
        )

        response = self.run_hook(
            workspace,
            "inject_context.py",
            {
                "session_id": "codex-read",
                "cwd": str(workspace),
                "hook_event_name": "PostToolUse",
                "tool_name": "mcp__filesystem__read_file",
                "tool_input": {"path": str(workspace / "docs" / "guide.md")},
                "tool_response": {"content": "guide"},
            },
        )

        hook_output = response["hookSpecificOutput"]
        self.assertEqual(hook_output["hookEventName"], "PostToolUse")
        self.assertIn("review guide rule: docs/rules/guide.md", hook_output["additionalContext"])

    def test_codex_pretool_lineage_injects_and_marks_seen(self):
        temp_dir, workspace = self.make_workspace()
        self.addCleanup(temp_dir.cleanup)
        self.write_lineage_notes(workspace)
        target = workspace / "knowledge" / "alpha.scope.md"

        response = self.run_hook(
            workspace,
            "inject_context.py",
            self.codex_lineage_payload(
                workspace,
                target,
                "codex-lineage",
            ),
        )

        hook_output = response["hookSpecificOutput"]
        self.assertEqual(hook_output["hookEventName"], "PreToolUse")
        self.assertIn(
            "Note lineage: knowledge/alpha.scope.md",
            hook_output["additionalContext"],
        )
        self.assertIn(
            "* scope [scope] knowledge/alpha.scope.md",
            hook_output["additionalContext"],
        )
        self.assertNotIn(
            "scope body must not be injected",
            hook_output["additionalContext"],
        )
        seen_file = (
            workspace / ".coretext-data" / ".lineage_seen_codex-lineage"
        )
        self.assertEqual(
            seen_file.read_text(encoding="utf-8").splitlines(),
            ["knowledge/alpha.scope.md"],
        )

    def test_codex_lineage_normalizes_absolute_and_relative_paths(self):
        temp_dir, workspace = self.make_workspace()
        self.addCleanup(temp_dir.cleanup)
        self.write_lineage_notes(workspace)
        absolute_target = workspace / "knowledge" / "alpha.scope.md"

        absolute_response = self.run_hook(
            workspace,
            "inject_context.py",
            self.codex_lineage_payload(
                workspace,
                absolute_target,
                "absolute-lineage",
            ),
        )
        relative_response = self.run_hook(
            workspace,
            "inject_context.py",
            self.codex_lineage_payload(
                workspace,
                "./knowledge/alpha.scope.md",
                "relative-lineage",
            ),
        )

        absolute_context = absolute_response["hookSpecificOutput"][
            "additionalContext"
        ]
        relative_context = relative_response["hookSpecificOutput"][
            "additionalContext"
        ]
        self.assertEqual(absolute_context, relative_context)
        self.assertIn(
            "Note lineage: knowledge/alpha.scope.md",
            relative_context,
        )

    def test_codex_lineage_is_once_per_note_per_session(self):
        temp_dir, workspace = self.make_workspace()
        self.addCleanup(temp_dir.cleanup)
        self.write_lineage_notes(workspace)
        session_id = "codex-once"
        scope_payload = self.codex_lineage_payload(
            workspace,
            "knowledge/alpha.scope.md",
            session_id,
        )

        first = self.run_hook(workspace, "inject_context.py", scope_payload)
        repeated = self.run_hook(
            workspace,
            "inject_context.py",
            scope_payload,
        )
        sibling = self.run_hook(
            workspace,
            "inject_context.py",
            self.codex_lineage_payload(
                workspace,
                "knowledge/alpha.other.md",
                session_id,
            ),
        )

        self.assertIn("hookSpecificOutput", first)
        self.assertEqual(repeated, {})
        self.assertIn("hookSpecificOutput", sibling)
        seen_file = workspace / ".coretext-data" / ".lineage_seen_codex-once"
        self.assertEqual(
            seen_file.read_text(encoding="utf-8").splitlines(),
            [
                "knowledge/alpha.scope.md",
                "knowledge/alpha.other.md",
            ],
        )

    def test_antigravity_queues_then_preinvocation_delivers_lineage(self):
        temp_dir, workspace = self.make_workspace()
        self.addCleanup(temp_dir.cleanup)
        self.write_lineage_notes(workspace)
        session_id = "antigravity-lineage"
        target = workspace / "knowledge" / "ai" / "alpha.scope.session.md"

        queued = self.run_hook(
            workspace,
            "inject_context.py",
            self.antigravity_view_payload(
                workspace,
                target,
                session_id,
            ),
        )

        seen_file = (
            workspace / ".coretext-data" / ".lineage_seen_antigravity-lineage"
        )
        pending_file = (
            workspace
            / ".coretext-data"
            / ".pending_lineage_antigravity-lineage.jsonl"
        )
        self.assertEqual(queued, {"decision": "allow"})
        self.assertFalse(seen_file.exists())
        self.assertTrue(pending_file.exists())

        delivered = self.run_hook(
            workspace,
            "inject_context.py",
            self.antigravity_invocation_payload(
                workspace,
                session_id,
            ),
        )

        self.assertEqual(len(delivered["injectSteps"]), 1)
        message = delivered["injectSteps"][0]["ephemeralMessage"]
        self.assertIn(
            "Note lineage: knowledge/ai/alpha.scope.session.md",
            message,
        )
        self.assertEqual(
            seen_file.read_text(encoding="utf-8").splitlines(),
            ["knowledge/ai/alpha.scope.session.md"],
        )
        self.assertFalse(pending_file.exists())

        repeated_view = self.run_hook(
            workspace,
            "inject_context.py",
            self.antigravity_view_payload(
                workspace,
                target,
                session_id,
            ),
        )
        self.assertEqual(repeated_view, {"decision": "allow"})
        self.assertFalse(pending_file.exists())

        no_pending = self.run_hook(
            workspace,
            "inject_context.py",
            self.antigravity_invocation_payload(
                workspace,
                session_id,
            ),
        )
        self.assertEqual(no_pending, {"injectSteps": []})

    def test_antigravity_pending_paths_are_deduplicated_before_delivery(self):
        temp_dir, workspace = self.make_workspace()
        self.addCleanup(temp_dir.cleanup)
        self.write_lineage_notes(workspace)
        session_id = "antigravity-dedup"
        payload = self.antigravity_view_payload(
            workspace,
            workspace / "knowledge" / "alpha.scope.md",
            session_id,
        )

        first = self.run_hook(workspace, "inject_context.py", payload)
        second = self.run_hook(workspace, "inject_context.py", payload)

        pending_file = (
            workspace
            / ".coretext-data"
            / ".pending_lineage_antigravity-dedup.jsonl"
        )
        seen_file = (
            workspace / ".coretext-data" / ".lineage_seen_antigravity-dedup"
        )
        self.assertEqual(first, {"decision": "allow"})
        self.assertEqual(second, {"decision": "allow"})
        self.assertEqual(
            len(pending_file.read_text(encoding="utf-8").splitlines()),
            1,
        )
        self.assertFalse(seen_file.exists())

        delivered = self.run_hook(
            workspace,
            "inject_context.py",
            self.antigravity_invocation_payload(
                workspace,
                session_id,
            ),
        )
        message = delivered["injectSteps"][0]["ephemeralMessage"]
        self.assertEqual(message.count("Note lineage:"), 1)
        self.assertTrue(seen_file.exists())

    def test_lineage_invalid_missing_non_note_and_archive_paths_fail_open(self):
        temp_dir, workspace = self.make_workspace()
        self.addCleanup(temp_dir.cleanup)
        self.write_lineage_notes(workspace)
        (workspace / "knowledge" / "archive").mkdir()
        (workspace / "knowledge" / "archive" / "alpha.hidden.md").write_text(
            "hidden\n",
            encoding="utf-8",
        )
        (workspace / "knowledge" / "nested").mkdir()
        (workspace / "knowledge" / "nested" / "alpha.deep.md").write_text(
            "nested\n",
            encoding="utf-8",
        )
        (workspace / "src" / "app.py").write_text(
            "print('ok')\n",
            encoding="utf-8",
        )

        cases = {
            "missing-argument": None,
            "missing-note": "knowledge/alpha.missing.md",
            "non-markdown": "src/app.py",
            "archive-note": "knowledge/archive/alpha.hidden.md",
            "nested-note": "knowledge/nested/alpha.deep.md",
        }
        for name, path in cases.items():
            with self.subTest(name=name):
                payload = self.codex_lineage_payload(
                    workspace,
                    path or "",
                    f"fail-open-{name}",
                )
                if path is None:
                    payload["tool_input"] = {}
                response = self.run_hook(
                    workspace,
                    "inject_context.py",
                    payload,
                )
                self.assertEqual(response, {})

    def test_lineage_ignores_shell_writes_and_unsupported_payloads(self):
        temp_dir, workspace = self.make_workspace()
        self.addCleanup(temp_dir.cleanup)
        self.write_lineage_notes(workspace)
        target = str(workspace / "knowledge" / "alpha.scope.md")

        payloads = [
            {
                "session_id": "shell-read",
                "cwd": str(workspace),
                "hook_event_name": "PreToolUse",
                "tool_name": "Bash",
                "tool_input": {"path": target, "command": f"cat {target}"},
            },
            {
                "session_id": "write-note",
                "cwd": str(workspace),
                "hook_event_name": "PreToolUse",
                "tool_name": "apply_patch",
                "tool_input": {
                    "command": (
                        "*** Begin Patch\n"
                        "*** Update File: knowledge/alpha.scope.md\n"
                        "@@\n-old\n+new\n"
                        "*** End Patch\n"
                    )
                },
            },
            {
                "tool_name": "read_file",
                "tool_input": {"file_path": target},
                "hook_event_name": "PreToolUse",
            },
        ]

        for payload in payloads:
            with self.subTest(tool=payload["tool_name"]):
                response = self.run_hook(
                    workspace,
                    "inject_context.py",
                    payload,
                )
                self.assertEqual(response, {})

    def test_telemetry_logs_normalized_project_relative_paths(self):
        # Deprecated: notify_action.py is now a no-op that always allows.
        temp_dir, workspace = self.make_workspace()
        self.addCleanup(temp_dir.cleanup)

        response = self.run_hook(
            workspace,
            "notify_action.py",
            {
                "toolCall": {
                    "name": "write_to_file",
                    "args": {"TargetFile": str(workspace / "src" / "logged.py")},
                },
                "conversationId": "telemetry-session",
                "workspacePaths": [str(workspace)],
            },
        )

        self.assertEqual(response, {"decision": "allow"})
        history_path = workspace / ".coretext-data" / "sessions" / "session_telemetry-session.jsonl"
        self.assertFalse(history_path.exists())

    def test_project_local_new_runtime_configs_are_enabled_by_default(self):
        self.assertFalse((REPO_ROOT / ".gemini" / "settings.json").exists())

        antigravity_hooks = json.loads((REPO_ROOT / ".agents" / "hooks.json").read_text(encoding="utf-8"))
        self.assertTrue(antigravity_hooks["coretext-context-injector"]["enabled"])
        self.assertIn(
            "PreToolUse",
            antigravity_hooks["coretext-context-injector"],
        )
        self.assertIn(
            "PreInvocation",
            antigravity_hooks["coretext-context-injector"],
        )
        self.assertNotIn("coretext-visual-feedback", antigravity_hooks)

        codex_config = (REPO_ROOT / ".codex" / "config.toml").read_text(encoding="utf-8")
        self.assertIn("[features]", codex_config)
        self.assertIn("hooks = true", codex_config)

        codex_hooks = json.loads((REPO_ROOT / ".codex" / "hooks.json").read_text(encoding="utf-8"))
        self.assertIn("PreToolUse", codex_hooks["hooks"])
        self.assertIn("PostToolUse", codex_hooks["hooks"])
        codex_pretool_commands = [
            hook["command"]
            for group in codex_hooks["hooks"]["PreToolUse"]
            for hook in group["hooks"]
        ]
        self.assertTrue(
            any(
                "inject_context.py" in command
                for command in codex_pretool_commands
            )
        )


if __name__ == "__main__":
    unittest.main()
