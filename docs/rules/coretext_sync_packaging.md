# Coretext Sync Packaging

**Trigger:** Packaging Coretext for distribution

## Context
`sync_coretext.sh` was only packaging the `.coretext/` directory, omitting crucial CLI hook settings, documentation, and relevant agent skills.

## Axiom
Always include `README.md`, `.gemini/settings.json`, and `.agents/skills/coretext/` directly into the package root when modifying `sync_coretext.sh`.