# Fixture Manifest

This manifest documents the frozen inputs for the formal validation of Trore-v3.

| Fixture ID | Source path or origin | Frozen path | SHA-256 | Contracts | Freeze timestamp | Reviewer | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-ROUTE-001 | Mock Route Ledger | `fixtures/F-ROUTE-001/route_ledger.jsonl` | 120e46a9066725e59137259df7b9d4503f2e5d4f5409e79fe1667af9be6dabec | FV-01.1, FV-01.2, FV-01.3 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-RENDER-001 | Mock Target Rules/Notes | `fixtures/F-RENDER-001/docs/rules/` | (multiple) | FV-02.1, FV-02.2, FV-02.3 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-RUNTIME-CODEX-READ-001 | Mock Codex Read Request | `fixtures/F-RUNTIME-CODEX-READ-001/payload.json` | dbf9f77037603100f8c4bc0e2b7461be055949454d33ae4fad2e8ec9159eb573 | FV-03.1 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-RUNTIME-CODEX-WRITE-001 | Mock Codex Write Request | `fixtures/F-RUNTIME-CODEX-WRITE-001/payload.json` | d291bb2a560c1e69244169434cfec5e0daf4b92b885892a68f08b7d627c7f253 | FV-03.2 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-RUNTIME-ANTIGRAVITY-001 | Mock Antigravity Write Request | `fixtures/F-RUNTIME-ANTIGRAVITY-001/payload.json` | 431ba573c4179aae2239d7c8b5c4a0940e3b885860c065f59858729f7e4ff54d | FV-03.3 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-RUNTIME-ANTIGRAVITY-LINEAGE-001 | Mock Lineage Requests | `fixtures/F-RUNTIME-ANTIGRAVITY-LINEAGE-001/view_payload.json` | f07f6398b515ae908663cc5f7bbea41feb7405ce7aeb6aa7449eccd8aff4bc09 | FV-03.3 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-RUNTIME-UNSUPPORTED-001 | Mock Unsupported Request | `fixtures/F-RUNTIME-UNSUPPORTED-001/payload.json` | d405c8f96d788ca8f4a3cdba8adfe00170eaf081d7714b26eb76971c2040c24d | FV-03.4 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-GATE-NO-MATCH-001 | Mock Write Gate (No Match) | `fixtures/F-GATE-NO-MATCH-001/payload.json` | 72cff178e760c253dc0271f7b4d04a9bb6dbe82f66ef019962cb9d9ca2dbacaa | FV-04.1 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-GATE-FIRST-WRITE-001 | Mock Write Gate (First Write) | `fixtures/F-GATE-FIRST-WRITE-001/payload.json` | 72a0eaaf24614c389c7cef5c1d864e941744b942e2a4d6cc36e602e4199263c3 | FV-04.2 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-GATE-RETRY-001 | Mock Write Gate (Retry) | `fixtures/F-GATE-RETRY-001/payload.json` | 1080f75403b056f7a21a862f6fa17f021b61ec7326d809d80392ac06389311ac | FV-04.3 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-GATE-SESSION-ISOLATION-001 | Mock Write Gate (Isolated) | `fixtures/F-GATE-SESSION-ISOLATION-001/payloads.json` | 1ab35792e98c300e57f99a34973a3ad42b8679113f68eacfb6847c5dd149c9f2 | FV-04.4 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-GATE-FAIL-OPEN-001 | Mock Write Gate (Failing Hook) | `fixtures/F-GATE-FAIL-OPEN-001/payload.json` | 0fc4745a09dc1ef71792e3527340d871cb6284fdd4fbc22a45ea6088ac35977e | FV-04.5 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-HIERARCHY-001 | Mock Knowledge Tree | `fixtures/F-HIERARCHY-001/knowledge/` | (multiple) | FV-05.1 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-HIERARCHY-SESSION-001 | Mock Knowledge Tree (Session) | `fixtures/F-HIERARCHY-SESSION-001/knowledge/` | (multiple) | FV-05.2 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-HIERARCHY-EXCLUSION-001 | Mock Knowledge Tree (Exclude) | `fixtures/F-HIERARCHY-EXCLUSION-001/knowledge/` | (multiple) | FV-05.3 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-DELEGATION-001 | Mock Subagent Instruction | `fixtures/F-DELEGATION-001/` | (multiple) | FV-05.4 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-SESSION-REUSE-001 | Complete/Incomplete Summaries | `fixtures/F-SESSION-REUSE-001/` | (multiple) | FV-06.1 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-PROMOTION-001 | Scope/Session notes for promotion | `fixtures/F-PROMOTION-001/` | (multiple) | FV-06.2 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-RULE-PROMOTION-001 | Promoted rule example | `fixtures/F-RULE-PROMOTION-001/` | (multiple) | FV-06.3 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-DASH-SESSION-001 | Telemetry log | `fixtures/F-DASH-SESSION-001/` | (multiple) | FV-07.1 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-DASH-LABEL-001 | Telemetry + Summary Frontmatter | `fixtures/F-DASH-LABEL-001/` | (multiple) | FV-07.2 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-DASH-HIGHLIGHT-001 | Telemetry highlight rules | `fixtures/F-DASH-HIGHLIGHT-001/` | (multiple) | FV-07.3 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
| F-DASH-DERIVED-001 | Derived state immutable check | `fixtures/F-DASH-DERIVED-001/` | (multiple) | FV-07.4 | 2026-06-18T22:30:00Z | Coretext Agent | frozen |
