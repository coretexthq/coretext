# Coretext Engine Modification Rules

When an agent needs to modify or interact with any file within the `.coretext/` directory:

1. **Context Adherence:** Always read and respect `docs/ARCHITECTURE.md`. The Coretext system is heavily reliant on pure Python glob matching (`fnmatch`) and an append-only JSONL event log.
2. **Schema Validity:** Any updates directly to the engine or schema must not break backwards compatibility with existing `.jsonl` entries.
3. **No Database Dependencies:** Do not attempt to use `SQLite`, `JSON Array wrappers`, or exact-matching functions across this system. We strictly use `fnmatch` for path resolution.
