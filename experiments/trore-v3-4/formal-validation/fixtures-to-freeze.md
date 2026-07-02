# Fixtures To Freeze

The formal validation experiment must use frozen copies, not live repository state. This file defines the fixture inventory to prepare before execution.

## Freeze Rules

1. Copy each fixture into `experiments/trore-v3/formal-validation/fixtures/<fixture-id>/`.
2. Record source path, copied path, source Git commit, SHA-256 hash, and acceptance reviewer.
3. Store expected outputs separately under `experiments/trore-v3/formal-validation/expected/`.
4. Do not edit a fixture after hashing.
5. If a fixture is wrong, create a new fixture ID and mark the old one rejected.
6. Do not copy or inspect anything under `knowledge/archive/`.
7. Do not enable or run project-local hooks against the live repository.

## Hash Manifest Format

Use this table shape in `fixtures/manifest.md` after freezing:

| Fixture ID | Source path or origin | Frozen path | SHA-256 | Contracts | Freeze timestamp | Reviewer | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-ROUTE-001 | TBD | TBD | TBD | FV-01 | TBD | TBD | planned |

## Fixture Groups

### F-ROUTE-001: Route Ledger

Purpose: validate ordered route selection, path matching, and hook filtering.

Required records:

- literal source path with `hook = read`;
- literal source path with `hook = write`;
- glob source using `*`;
- glob source using `?` or character-range syntax;
- directory-prefix source with and without trailing slash;
- at least one `hook = both` edge;
- at least two edges matching the same input path to prove collect-all ordered behavior;
- one stale or missing target only if testing render or linter classification, not route selection.

Expected outputs:

- ordered route list per path/action;
- active/inactive hook table;
- match predicate table.

### F-RENDER-001: Render Targets

Purpose: validate `hint` and `full` rendering without changing route selection.

Required target artifacts:

- one readable Markdown rule or note for a `hint` route;
- one readable file for a `full` route;
- one directory target containing at least two readable files;
- one missing target;
- one binary or non-UTF-8 file.

Expected outputs:

- hint payload lines;
- full payload content inventory;
- diagnostic behavior for missing and binary targets.

### F-RUNTIME-CODEX-READ-001: Codex Read Payload

Purpose: validate Codex read-context normalization where a stable path is available.

Required payload fields:

- runtime-identifying Codex shape;
- `PostToolUse` or equivalent supported read event;
- read-like tool name;
- path argument accepted by the adapter;
- session identifier.

Expected outputs:

- `runtime = codex`;
- action inferred as `read`;
- sanitized session ID;
- project-relative normalized path.

### F-RUNTIME-CODEX-WRITE-001: Codex Write Payload

Purpose: validate `apply_patch` and write-like normalization.

Required payload fields:

- `apply_patch` command or tool input containing at least two patch file headers;
- session identifier containing characters that require sanitization;
- project root or cwd context needed for relative path normalization.

Expected outputs:

- action inferred as `write`;
- all patched paths normalized;
- sanitized state filename component.

### F-RUNTIME-ANTIGRAVITY-001: Antigravity Write Payload

Purpose: validate Antigravity write guard normalization.

Required payload fields:

- Antigravity runtime shape;
- `PreToolUse` event;
- write-like tool name such as `write_to_file`, `replace_file_content`, or `multi_replace_file_content`;
- `conversationId`;
- target file path.

Expected outputs:

- `runtime = antigravity`;
- action inferred as `write`;
- normalized path list;
- runtime-specific deny or allow response shape for write-gate checks.

### F-RUNTIME-ANTIGRAVITY-LINEAGE-001: Antigravity Lineage Payloads

Purpose: validate queued lineage behavior.

Required payloads:

- `PreToolUse` view payload for a top-level `knowledge/*.md` note;
- following `PreInvocation` payload for the same session;
- repeated queue attempt for deduplication.

Expected outputs:

- pending-lineage JSONL before delivery;
- delivered `injectSteps` shape;
- seen-state update after delivery.

### F-RUNTIME-UNSUPPORTED-001: Unsupported Payload

Purpose: validate fail-open behavior.

Required payloads:

- unsupported runtime shape;
- malformed payload with missing stable path;
- shell or non-file action that should not inject lineage or route context.

Expected outputs:

- no context injection;
- no deny decision;
- no acknowledgement or lineage state mutation.

### F-GATE-001: Write Gate State

Purpose: validate the first-write finite-state machine.

Required fixture pieces:

- copied ledger with a write-enabled matching edge;
- copied target context;
- empty acknowledgement state;
- pre-populated acknowledgement state for retry;
- two distinct session IDs;
- simulated unreadable or failing state path if fail-open is tested.

Expected outputs:

- `AllowNoContext`;
- `DenyAndRecord`;
- `AllowRetry`;
- session isolation;
- fail-open allow/no-op with unchanged ledger.

### F-HIERARCHY-001: Knowledge Tree

Purpose: validate hierarchy, virtual scopes, session attachment, and exclusions.

Required note tree:

- `knowledge/coretext.md`;
- at least two direct child durable scopes;
- one missing intermediate durable scope that creates a virtual node;
- multiple session notes under `knowledge/ai/`;
- one session whose longest existing durable prefix is not the full filename prefix;
- one unrelated project note;
- one archive-like path outside the active copied tree only if exclusion is tested without reading `knowledge/archive/`.

Expected outputs:

- complete hierarchy JSON;
- lineage projection for a durable note;
- lineage projection for a session note;
- exclusion report.

### F-DELEGATION-001: Packaged Protocol Audit

Purpose: validate hierarchy/delegation as a protocol surface.

Required artifacts:

- frozen `docs/coretext_agent_instruction.md`;
- optional frozen `docs/coretext_subagents.md` as provenance;
- sample parent prompt assigning a child namespace;
- sample child session note path;
- sample parent durable-note delta.

Expected outputs:

- role-to-namespace mapping audit;
- write-boundary audit;
- parent-read-child-summary audit;
- no hierarchy-skipping wikilink audit.

### F-SESSION-REUSE-001: Session Summary Quality

Purpose: validate reusable session evidence.

Required session summaries:

- one complete session summary;
- one intentionally incomplete summary if failure classification is tested;
- original prompt blockquotes;
- verification statement;
- changed artifact list;
- unresolved risks or explicit none.

Expected outputs:

- required-field audit table;
- classification for missing fields.

### F-PROMOTION-001: Durable Distillation

Purpose: validate promotion from session evidence to durable state.

Required artifacts:

- session summary with stable durable delta;
- owning durable scope note before and after distillation;
- evidence link or explanation;
- optional graph edge or rule only if promotion is claimed.

Expected outputs:

- durable delta audit;
- promotion-predicate audit;
- graph lint evidence when rule or edge promotion is in scope.

### F-DASH-001: Dashboard And Session History

Purpose: validate observability and derived dashboard mappings.

Required artifacts:

- `.coretext-data/sessions/session_<id>.jsonl` telemetry fixture;
- `knowledge/ai/*.md` summary with matching `conversations` frontmatter;
- route ledger fixture;
- hierarchy fixture;
- expected mapped sessions JSON;
- expected highlights JSON.

Expected outputs:

- mapped session labels;
- read/write highlights;
- architecture or hierarchy JSON;
- optional screenshot for human inspection.

## Fixture Acceptance Checklist

Before execution, confirm:

- every fixture has a hash;
- every fixture maps to at least one contract row;
- expected outputs exist for every contract row;
- fixture copies are isolated from the live repository;
- no fixture depends on live hooks, live dashboard state, or provider chat state;
- no archive content was used.
