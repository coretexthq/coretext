# Coretext Setup Automation

**Trigger:** Deploying the Coretext package to new workspaces

## Context
Deploying the Coretext package to new workspaces required manual installation of Node.js modules for the dashboard and Python library dependencies.

## Axiom
Use `setup_coretext.sh` to automatically navigate to `.coretext/coretext-graph-ui/` to run `npm install`, and utilize the existing `pyproject.toml` at the root via `pip install -e .` to setup the environment natively.