#!/bin/bash

# Configuration and path setup
DEFAULT_BRANCH="main"

show_usage() {
    echo "Usage: $0 <codebase-dir> <vault-dir> [command] [project-name]"
    echo ""
    echo "Arguments:"
    echo "  <codebase-dir> Path to the source codebase repository"
    echo "  <vault-dir>    Path to the target vault repository"
    echo "  [command]      Command to run: sync (default), status, preflight, from-vault"
    echo "  [project-name] Project name configured in vault's git config. If omitted,"
    echo "                 the script will attempt to sync all configured projects."
    echo ""
    echo "Examples:"
    echo "  $0 /path/to/codebase /path/to/vault"
    echo "  $0 /path/to/codebase /path/to/vault status"
    echo "  $0 /path/to/codebase /path/to/vault preflight my-project"
}

if [ $# -lt 2 ]; then
    show_usage
    exit 1
fi

CODEBASE_DIR="$1"
VAULT_DIR="$2"
shift 2

COMMAND="sync"
PROJECT=""

if [ $# -gt 0 ]; then
    case "$1" in
        status|config|info)
            COMMAND="status"
            ;;
        preflight)
            COMMAND="preflight"
            PROJECT="$2"
            ;;
        from-vault)
            COMMAND="from-vault"
            PROJECT="$2"
            ;;
        help|--help|-h)
            show_usage
            exit 0
            ;;
        *)
            COMMAND="sync"
            PROJECT="$1"
            ;;
    esac
fi

# Ensure paths exist
CODEBASE_DIR=$(cd "$CODEBASE_DIR" 2>/dev/null && pwd)
VAULT_DIR=$(cd "$VAULT_DIR" 2>/dev/null && pwd)

if [ -z "$CODEBASE_DIR" ] || [ ! -d "$CODEBASE_DIR" ]; then
    echo "ERROR: Codebase directory not found or invalid: $1"
    exit 1
fi

if [ -z "$VAULT_DIR" ] || [ ! -d "$VAULT_DIR" ]; then
    echo "ERROR: Vault directory not found or invalid: $2"
    exit 1
fi

RESOLVED_CODEBASE_DIR="$CODEBASE_DIR"

is_all_repo_path() {
    local pathspec=$1
    [ "$pathspec" = "none" ] || [ "$pathspec" = "." ]
}

has_changes() {
    local repo_dir=$1
    local pathspec=$2

    if is_all_repo_path "$pathspec"; then
        [ -n "$(cd "$repo_dir" && git status --porcelain)" ]
    else
        [ -n "$(cd "$repo_dir" && git status --porcelain -- "$pathspec")" ]
    fi
}

abort_if_changes() {
    local repo_dir=$1
    local pathspec=$2
    local message=$3

    if has_changes "$repo_dir" "$pathspec"; then
        echo "ERROR: $message"
        echo ""
        if is_all_repo_path "$pathspec"; then
            (cd "$repo_dir" && git status --short)
        else
            (cd "$repo_dir" && git status --short -- "$pathspec")
        fi
        exit 1
    fi
}

resolve_project_config() {
    local proj=$1

    cd "$VAULT_DIR" || exit

    RESOLVED_PROJECT="$proj"
    RESOLVED_VAULT_PREFIX=$(git config --local --get "subtree.$proj.prefix" 2>/dev/null)
    RESOLVED_REMOTE_URL=$(git config --local --get "subtree.$proj.remote" 2>/dev/null)
    RESOLVED_VAULT_PREFIX=${RESOLVED_VAULT_PREFIX:-"project/$proj"}

    if [ -z "$RESOLVED_REMOTE_URL" ]; then
        echo "Skipping $proj: No remote URL configured in vault config."
        return 1
    fi

    RESOLVED_CODEBASE_PREFIX="knowledge"
    if [ -d "$RESOLVED_CODEBASE_DIR" ]; then
        cd "$RESOLVED_CODEBASE_DIR" || exit
        RESOLVED_CODEBASE_PREFIX=$(git config --local --get "subtree.$proj.prefix" 2>/dev/null)
        RESOLVED_CODEBASE_PREFIX=${RESOLVED_CODEBASE_PREFIX:-$(git config --local --get "subtree.prefix" 2>/dev/null)}
        RESOLVED_CODEBASE_PREFIX=${RESOLVED_CODEBASE_PREFIX:-"knowledge"}
    fi

    return 0
}

print_project_config() {
    echo ""
    echo "Syncing Project:  $RESOLVED_PROJECT"
    echo "Vault Prefix:     $RESOLVED_VAULT_PREFIX"
    echo "Codebase Dir:     $RESOLVED_CODEBASE_DIR"
    echo "Codebase Prefix:  $RESOLVED_CODEBASE_PREFIX"
    echo "Remote URL:       $RESOLVED_REMOTE_URL"
    echo "--------------------------------------------------"
}

subtree_pull() {
    local repo_dir=$1
    local prefix=$2
    local remote_url=$3

    if is_all_repo_path "$prefix"; then
        (cd "$repo_dir" && git pull --ff-only origin "$DEFAULT_BRANCH")
    else
        (cd "$repo_dir" && git subtree pull --prefix="$prefix" "$remote_url" "$DEFAULT_BRANCH" --squash)
    fi
}

subtree_push() {
    local repo_dir=$1
    local prefix=$2
    local remote_url=$3

    if is_all_repo_path "$prefix"; then
        (cd "$repo_dir" && git push origin "$DEFAULT_BRANCH")
    else
        (cd "$repo_dir" && git subtree push --prefix="$prefix" "$remote_url" "$DEFAULT_BRANCH")
    fi
}

sync_source_to_remote() {
    echo "Integrating source repo changes..."
    abort_if_changes "$RESOLVED_CODEBASE_DIR" "." \
        "Source repository has uncommitted edits. Commit or stash them before syncing."
    if ! subtree_pull "$RESOLVED_CODEBASE_DIR" "$RESOLVED_CODEBASE_PREFIX" "$RESOLVED_REMOTE_URL"; then
        echo "ERROR: Failed to pull changes from remote into source repo."
        exit 1
    fi
    if ! subtree_push "$RESOLVED_CODEBASE_DIR" "$RESOLVED_CODEBASE_PREFIX" "$RESOLVED_REMOTE_URL"; then
        echo "ERROR: Failed to push source repo changes to remote."
        exit 1
    fi
}

sync_vault_to_remote() {
    echo "Integrating vault subtree changes..."
    abort_if_changes "$VAULT_DIR" "." \
        "Vault repository has uncommitted edits. Commit or stash them before syncing."
    if ! subtree_pull "$VAULT_DIR" "$RESOLVED_VAULT_PREFIX" "$RESOLVED_REMOTE_URL"; then
        echo "ERROR: Failed to pull changes from remote into vault."
        exit 1
    fi
    if ! subtree_push "$VAULT_DIR" "$RESOLVED_VAULT_PREFIX" "$RESOLVED_REMOTE_URL"; then
        echo "ERROR: Failed to push vault changes to remote."
        exit 1
    fi
}

push_vault_to_remote() {
    echo "Pushing committed vault subtree changes..."
    abort_if_changes "$VAULT_DIR" "." \
        "Vault repository has uncommitted edits. Commit or stash them before syncing."
    if ! subtree_push "$VAULT_DIR" "$RESOLVED_VAULT_PREFIX" "$RESOLVED_REMOTE_URL"; then
        echo "ERROR: Failed to push vault changes to remote."
        exit 1
    fi
}

sync_source_from_remote() {
    echo "Refreshing source repo from shared remote..."
    abort_if_changes "$RESOLVED_CODEBASE_DIR" "." \
        "Source repository has uncommitted edits. Commit or stash them before syncing."
    if ! subtree_pull "$RESOLVED_CODEBASE_DIR" "$RESOLVED_CODEBASE_PREFIX" "$RESOLVED_REMOTE_URL"; then
        echo "ERROR: Failed to pull remote changes into source repo."
        exit 1
    fi
}

run_preflight() {
    local target_proj=$1

    if [ -n "$target_proj" ]; then
        resolve_project_config "$target_proj" || exit 1
    fi

    abort_if_changes "$RESOLVED_CODEBASE_DIR" "." \
        "Source repository has uncommitted edits. Commit or stash them before committing vault subtree edits."
    abort_if_changes "$VAULT_DIR" "." \
        "Vault repository has uncommitted edits. Commit or stash them before committing subtree edits."

    echo "Preflight OK."
}

run_from_vault() {
    local target_proj=$1

    if [ -z "$target_proj" ]; then
        echo "ERROR: from-vault requires a project name."
        exit 1
    fi

    resolve_project_config "$target_proj" || exit 1
    print_project_config

    push_vault_to_remote
    sync_source_from_remote
}

show_status() {
    echo "=================================================="
    echo "       Git Subtree Configuration Status"
    echo "=================================================="
    echo ""
    echo "Vault Directory: $VAULT_DIR"
    
    cd "$VAULT_DIR" || exit
    config_lines=$(git config --local --get-regexp "^subtree\." 2>/dev/null)
    if [ -n "$config_lines" ]; then
        echo "  Configured Vault Subtrees:"
        projects=$(git config --local --get-regexp "^subtree\..+\.remote" 2>/dev/null | awk -F'.' '{print $2}')
        for proj in $projects; do
            prefix=$(git config --local --get "subtree.$proj.prefix" 2>/dev/null)
            remote=$(git config --local --get "subtree.$proj.remote" 2>/dev/null)
            prefix=${prefix:-"project/$proj"}
            echo "    - Project: $proj"
            echo "      Prefix:  $prefix"
            echo "      Remote:  $remote"
        done
    else
        echo "  No vault subtrees configured in git config."
    fi
    echo ""
    
    echo "Codebase Repository: $CODEBASE_DIR"
    cd "$CODEBASE_DIR" || exit
    remote=$(git config --local --get "subtree.remote" 2>/dev/null)
    if [ -n "$remote" ]; then
        prefix=$(git config --local --get "subtree.prefix" 2>/dev/null)
        prefix=${prefix:-knowledge}
        echo "  - Prefix:  $prefix"
        echo "  - Remote:  $remote"
    else
        echo "  No default subtree configured locally."
    fi
    echo "=================================================="
}

run_sync() {
    local target_proj=$1
    echo "=================================================="
    echo "         Running Subtree Synchronization"
    echo "=================================================="
    
    local projects=""
    if [ -n "$target_proj" ]; then
        projects="$target_proj"
    else
        cd "$VAULT_DIR" || exit
        projects=$(git config --local --get-regexp "^subtree\..+\.remote" 2>/dev/null | awk -F'.' '{print $2}')
    fi
    
    if [ -z "$projects" ]; then
        echo "No configured projects found to sync."
        return
    fi
    
    for proj in $projects; do
        resolve_project_config "$proj" || continue
        print_project_config

        sync_source_to_remote
        sync_vault_to_remote
        sync_source_from_remote
    done
    echo ""
    echo "Sync complete!"
}

# Main routing logic
case "$COMMAND" in
    status)
        show_status
        ;;
    preflight)
        run_preflight "$PROJECT"
        ;;
    from-vault)
        SUBTREE_SYNC_IN_PROGRESS=1 run_from_vault "$PROJECT"
        ;;
    sync)
        run_sync "$PROJECT"
        ;;
esac
