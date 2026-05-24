# Coretext Benchmarking

## Status
- Goal: validate the current Coretext runtime, dashboard, and hook flow against the repo's own invariants.
- The most relevant checks now are routing correctness, path normalization, session logging, and packaging sync.

## Key Experiments
- D-SDD evaluation: whether the Planner/Executor/Reviewer loop actually reduces misses.
- Hook reliability: whether write guards, hint injection, and session logging behave consistently.
- Dashboard state: whether graph and session selection remain stable across refreshes.
- Packaging sync: whether `coretext_package/` stays aligned with the hidden engine and settings.

## Resource
- [[coretext.benchmarking.malicious_app_experiment]]
- [[coretext.benchmarking.d_sdd_evaluation]]
- [[coretext.evoclaw]]
