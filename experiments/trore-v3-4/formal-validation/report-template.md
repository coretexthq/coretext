# Formal Validation Report Template

Use this template after fixture execution. Do not fill it with planned evidence.

## Execution Summary

| Field | Value |
| --- | --- |
| Report date | TBD |
| Repository commit | TBD |
| Fixture manifest | `fixtures/manifest.md` |
| Execution workspace | TBD |
| Reviewer | TBD |
| Experiment status | TBD |

## Contract Results

| Contract | Fixture IDs | Expected Result | Evidence Artifact | Status | Failure Class | Boundary Note |
| --- | --- | --- | --- | --- | --- | --- |
| FV-01 Route selection | TBD | Expected ordered edge list is returned. | TBD | NOT_RUN |  |  |
| FV-02 Context rendering | TBD | Hints and full content render according to edge type without changing route selection. | TBD | NOT_RUN |  |  |
| FV-03 Runtime normalization | TBD | Supported payloads normalize; unsupported payloads fail open. | TBD | NOT_RUN |  |  |
| FV-04 Write-gate FSM | TBD | No-match allow, first-match deny-and-record, same-session retry allow. | TBD | NOT_RUN |  |  |
| FV-05 Hierarchy/delegation | TBD | Dotted namespace, session ownership, and parent/child evidence protocol hold. | TBD | NOT_RUN |  |  |
| FV-06 Session reuse/promotion | TBD | Reusable summaries and promotions satisfy required evidence predicates. | TBD | NOT_RUN |  |  |
| FV-07 Observability/dashboard | TBD | Session labels, highlights, and dashboard views trace to authoritative files. | TBD | NOT_RUN |  |  |

## Evidence Inventory

| Evidence Path | Contract IDs | Description | Reviewer Notes |
| --- | --- | --- | --- |
| TBD | TBD | TBD | TBD |

## Failure Ledger

| Contract ID | Status | Primary Failure Class | Secondary Cause | Explanation | Owning Surface |
| --- | --- | --- | --- | --- | --- |
| TBD | TBD | TBD | TBD | TBD | Implementation, agent protocol, or knowledge maintenance |

## Boundary Statements

State these boundaries explicitly in Chapter 4:

- formal validation covers deterministic mechanism contracts, not deterministic model behavior;
- write gating is an interaction control, not filesystem security;
- hierarchy/delegation is a workflow ownership protocol, not runtime authorization;
- dashboard output is derived evidence, not authoritative state;
- unexecuted rows remain `NOT_RUN`;
- normal software tests support implementation evidence but do not replace formal validation.

## Chapter 4 Prose Skeleton

Formal validation was conducted against frozen fixtures covering route selection, context rendering, runtime normalization, write-gate acknowledgement, hierarchy/delegation, session reuse/promotion, and observability. For each contract, expected outputs were declared before execution and compared against captured actual artifacts. Failures were classified as Coretext mechanism failures, agent behavior failures, or knowledge-maintenance failures.

The validation supports mechanism-correctness claims only within the frozen fixture boundaries. It does not prove that agents will always use delivered context correctly, that generated code will be correct, or that the workflow improves all long-running software tasks.

## Threats To Validity

- Fixtures may not cover all provider payload variants.
- Small ledgers do not establish route-scale limits.
- Researcher-authored notes may be cleaner than real project notes.
- Dashboard inspection can reveal traceability but cannot prove human usefulness alone.
- Normal tests and formal validation may share implementation assumptions.
- Model/version drift affects agent behavior, but not deterministic route fixtures.
