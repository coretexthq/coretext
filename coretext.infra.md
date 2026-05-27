# Coretext Organization Infrastructure

## Status
- Current setup is local-first: the root repo, the hidden `.coretext/` engine, and the mirrored `coretext_package/` distribution.
- The main infrastructure concern is keeping the install and sync scripts working across those two copies.

## Infrastructure Components
- Hidden engine in `.coretext/`.
- Package mirror in `coretext_package/`.
- Setup and sync scripts in `setup_coretext.sh` and `sync_coretext.sh`.
- Dashboard dependencies under `.coretext/coretext-graph-ui/`.

## Resource
- [[coretext.infra.hosting]]
- [[docs/rules/coretext_setup_script.md]]
- [[docs/rules/coretext_sync_packaging.md]]
