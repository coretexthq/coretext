# Coretext Hosting

## Status
- Hosting is currently secondary to the local-first Coretext repo.
- The live source of truth is the root workspace plus the mirrored `coretext_package/` copy.

## Current Shape
- Keep the hidden `.coretext/` engine local.
- Keep the dashboard local in `.coretext/coretext-graph-ui/`.
- Use `setup_coretext.sh` and `sync_coretext.sh` to move between source and package copies.
- Treat any remote deployment as an optional layer, not the primary runtime.

## Shared Resources
- Local CLI workflows.
- Workspace-scoped scripts.
- Package sync rather than separate hosted state.
