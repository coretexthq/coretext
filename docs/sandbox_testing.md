### Run 1: The Execution Phase (Creating Files)
In this run, you will have the agent create some standard project files so we have fresh targets to link rules to.

1. Open your terminal and navigate to the sandbox:
   ```bash
   cd experiments/sandbox
   ```
2. Start an interactive Gemini session:
   ```bash
   gemini
   ```
3. **Prompt the agent:**
   > "Please create a new file `src/math_utils.py` with a simple `add(a, b)` function. Next, create a test file `tests/test_math_utils.py` for it. Finally, write a brief design document in `docs/math_design.md`."
4. **Expected Outcome:** The agent will use the `write_file` tool to create these three files. *(Note: Because `src/*` already has some global rules mapped in your `coretext.jsonl`, you might actually see the "Electric Fence" write-block trigger here automatically! The agent should get blocked once, then retry and succeed.)*
5. Exit the session (`/exit`).

### Run 2: The Review Phase (Consolidating Rules)
In this run, you simulate the Reviewer agent extracting a lesson and mechanically linking it into the Coretext Graph using the `consolidate-rules` skill.

1. Start a new interactive Gemini session:
   ```bash
   gemini
   ```
2. **Prompt the agent:**
   > "Please activate the `consolidate-rules` skill. I want to create a new rule mapping. Use the script to link the source `src/math_utils.py` to the target `docs/math_design.md`. Set the type to `hint`, the description to 'Consult design before modifying math logic', and apply it to `both` hooks."
3. **Expected Outcome:** The agent will read the skill instructions and execute the shell command:
   `python .coretext/add_rules.py --source "src/math_utils.py" --target "docs/math_design.md" --type hint --description "Consult design before modifying math logic"`
   This will append a new JSON object to `.coretext/coretext.jsonl`.
4. Exit the session (`/exit`).

### Run 3: The Validation Phase (Testing the Hooks)
In this final run, you act as a future agent unaware of the rules. You will test both the passive injection (Read) and the disruptive "Electric Fence" (Write).

1. Start a fresh interactive Gemini session:
   ```bash
   gemini
   ```
2. **Test the Read Hook (`AfterTool`):**
   > "Use the `read_file` tool to read `src/math_utils.py`. Carefully look at the very bottom of the tool output. Tell me exactly what injected context or rules you see appended there."
   * **Expected Outcome:** The Python script intercepts the read, matches `src/math_utils.py` in the JSONL, and appends the payload. The agent should report seeing `--- INJECTED CONTEXT FOR src/math_utils.py (READ) ---` along with the hint pointing to `docs/math_design.md` and the other global `src/*` hints.

3. **Test the Write Hook (`BeforeTool` / Electric Fence):**
   > "Now, I need you to add a `subtract(a, b)` function to `src/math_utils.py`."
   * **Expected Outcome:** Watch the CLI interface closely. 
     - The agent will attempt to use the `replace` or `write_file` tool.
     - **The hook will DENY it.** You should see the tool call fail. Behind the scenes, the hook returns `"decision": "deny"` with the message *"ACTION BLOCKED: You must read and acknowledge the following architectural rules..."* and writes the path to `.coretext/.acknowledged_paths`.
     - Because the error message tells the agent to retry, the agent should immediately "think" and try the exact same tool call a second time.
     - **The second attempt will SUCCEED**, because the script sees the path is now acknowledged.

By completing these three runs, you will have manually verified the entire D-SDD loop: code creation, graph updating, passive context injection, and active write-blocking.