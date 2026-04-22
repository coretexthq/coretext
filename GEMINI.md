# Agent Instructions

This repository utilizes a custom context injection engine called **Coretext**. 

## Coretext Context Engine

The Coretext engine dynamically links files together. When you interact with a file (read or write), the engine uses pure Python glob-matching against `.coretext/coretext.jsonl` to automatically inject the content or hints of any linked target files directly into your context. 

This allows any file or pattern in the repository to be structurally connected to any other file, ensuring you always have the necessary context when editing specific parts of the codebase.

## Consolidating Rules & Linking Files

When you discover new architectural lessons, traps, or rules, or when you realize that editing one file requires understanding another, you MUST mechanically link them using the Coretext engine.

You can link to existing files, or you can extract lessons into new rule files and link those.

### How to Link Files

Use the provided script to register a rule/link into `.coretext/coretext.jsonl`. This ensures the Coretext Engine will inject the target file's context whenever the source file is accessed in the future.

Run the following command in your shell:

```bash
python .coretext/add_rules.py --source "<source>" --target "<target>" --type <full|hint> --description "<intent>" --hook <read|write|both>
```

**Parameters:**
- `--source`: The path to the source file or glob pattern (e.g., `src/api/*.py`, `tests/**/*.js`, or a specific file).
- `--target`: The path to the target file or folder that contains the necessary context.
- `--type`: 
  - `full`: Mandatory full-text injection. Use this when the target file's content is critical.
  - `hint`: Injects just the path/title as a hint. Use this to notify future agents that the file exists and is relevant.
- `--description`: A short description of why this link exists or the intent (e.g., 'follow architectural guidelines', 'use test helper').
- `--hook`: Optional. Specifies when the injection should occur (`read`, `write`, or `both`). Defaults to `both`.

*(If the script returns a schema validation error, read the error message, correct your parameters, and try again.)*
