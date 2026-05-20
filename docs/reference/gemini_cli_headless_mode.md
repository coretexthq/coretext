# Gemini CLI Headless Mode

Headless mode in Gemini CLI provides a non-interactive, programmatic interface designed for automation, shell scripting, and CI/CD pipelines.

## How it Works
Headless mode is automatically triggered in two scenarios:
1. When providing a prompt using the `-p` (or `--prompt`) flag.
2. When the CLI is executed in a **non-TTY environment** (e.g., when input or output is piped or redirected).

In this mode, the CLI skips the interactive Terminal User Interface (TUI), processes the request, and outputs the result directly to the console before exiting.

## How to Run It
You can run Gemini CLI in headless mode using the following commands:
* **Standard Prompt:** `gemini -p "Summarize the README.md file"`
* **Piping Input:** `cat logs.txt | gemini -p "Analyze these logs for errors"`
* **Structured JSON Output:** `gemini --output-format json -p "Extract todos from @file.ts"`
* **Resuming a Session:** `gemini -r latest -p "Explain the last change"`

## Features
* **Structured Output:** Supports `--output-format json` (a single JSON object) and `stream-json` (newline-delimited JSONL) for integration with tools like `jq`.
* **Standard Exit Codes:** Returns specific codes to indicate results:
  * `0`: Success.
  * `1`: General error or API failure.
  * `42`: Input error (invalid prompt or arguments).
  * `53`: Turn limit exceeded.
* **Piping Support:** Seamlessly reads from `stdin` and writes to `stdout`, allowing it to be used in Unix-style command chains.
* **Automated Plan Mode:** In headless environments, Plan Mode auto-approves transitions (`enter_plan_mode`, `exit_plan_mode`) and automatically switches to **YOLO mode** during implementation to avoid manual confirmation prompts.
* **Model Routing:** Continues to use automatic model routing (e.g., routing complex planning to Pro models and implementation to Flash models).

## Limitations
* **Auto-Denial of Tools:** To prevent hanging in non-interactive environments, any tool call that would normally require user confirmation (an `ask_user` decision in the policy engine) is **automatically denied**.
* **Interactive Tool Failure:** Tools explicitly designed for user interaction, such as `ask_user`, cannot function and will effectively return a "denied" state.
* **Turn Limits:** Headless executions are subject to a maximum turn limit (indicated by exit code `53`).
* **No UI Feedback:** You lose interactive features like progress bars, real-time Markdown rendering, and the ability to manually edit plans via `Ctrl+X` unless you use an external editor and resume the session later.
