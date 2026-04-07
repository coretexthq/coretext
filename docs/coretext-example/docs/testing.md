# Coretext Testing Axioms

This document defines the physics of testing within the Coretext project. It is automatically injected as a passive hint via SQLite when the Planner authors tests or the Executor writes code.

## 1. The Prime Directive
- **Never mock the Coretext injection engine (SQLite) or SurrealDB connections.** All tests must execute against a temporary, isolated, in-memory database instance to verify true structural integrity.

## 2. Structural Verification
- A test is only considered valid if it explicitly verifies the structural schema of `experience.json` or the accurate retrieval of JIT hints based on simulated telemetry.

## 3. End-to-End Boundaries
- E2E tests must interact with the system entirely through the CLI subprocess. **Do not** import and call internal core functions directly for integration testing.

## 4. "Green-Washing" Prohibition
- The Executor is forbidden from modifying the test file provided by the Planner. Passing the test by altering the assertions constitutes an immediate failure of the Adversarial Audit.