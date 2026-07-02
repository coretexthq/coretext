# Coretext Sync-Subtree Utility

The `sync-subtree.sh` script is a generalized automation tool for managing `git subtree` synchronizations between a source codebase repository and a target vault repository via a shared remote.

## Overview

The Coretext system uses `git subtree` to share components (like knowledge vaults, skill sets, and documentation) across independent repositories. The `sync-subtree.sh` script coordinates these push and pull operations across multiple repositories with preflight change checks and environment resolutions, ensuring consistency.

## Usage

```bash
bash sync-subtree.sh <codebase-dir> <vault-dir> [command] [project-name]
```

### Arguments

- `<codebase-dir>`: Absolute or relative path to the local codebase repository (the source).
- `<vault-dir>`: Absolute or relative path to the local vault repository (the central target).
- `[command]`: (Optional) The synchronization command to execute. Defaults to `sync`.
- `[project-name]`: (Optional) The specific project namespace configured in the vault repository. If omitted during `sync` or `status`, the script will operate on all configured projects found in the vault.

### Commands

1. **`sync` (Default)**
   Fully integrates the codebase and the vault repository.
   - Pushes codebase changes to the shared remote.
   - Pulls updates from the shared remote into the vault repository.
   - Pushes vault changes to the shared remote.
   - Pulls updates back into the local codebase.

2. **`preflight`**
   Checks both the codebase and vault repositories for uncommitted changes. Aborts with an error if working trees are not clean.

3. **`from-vault`**
   A one-way synchronization prioritizing vault updates.
   - Pushes committed vault changes to the remote.
   - Refreshes the local codebase by pulling from the remote.

4. **`status`**
   Prints the current Git subtree configuration for both the provided vault and codebase directories.

## Configuration Requirements

The script relies on local Git configurations (`git config --local`) applied to both the vault repository and the codebase repository.

### 1. Vault Repository Configuration
Inside the `<vault-dir>`, you must configure the remotes and prefixes for your connected subtrees.

```bash
git config --local subtree.<project>.remote "git@github.com:user/remote-repo.git"
git config --local subtree.<project>.prefix "project/<project>"
```

### 2. Codebase Repository Configuration
Inside the `<codebase-dir>`, you must configure the remote and local prefix.

```bash
git config --local subtree.remote "git@github.com:user/remote-repo.git"
git config --local subtree.prefix "knowledge"
```

## Example Workflow

```bash
# Check status and configuration
bash sync-subtree.sh /path/to/my-codebase /path/to/my-vault status

# Run a preflight check before proceeding
bash sync-subtree.sh /path/to/my-codebase /path/to/my-vault preflight my-project

# Perform a full sync
bash sync-subtree.sh /path/to/my-codebase /path/to/my-vault sync my-project
```
