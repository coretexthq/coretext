# Bcrypt Rounds

**Trigger:** `src/api/auth.py`

## Context
When implementing authentication, we need to balance security with performance.

## Axiom
Always use at least 12 rounds for bcrypt to ensure adequate resistance against brute-force attacks in current hardware environments.

## Linked Files
- `src/api/auth.py`
