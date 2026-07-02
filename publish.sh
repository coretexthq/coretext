#!/bin/bash

# Configuration and path setup
SOURCE_REPO="${1:-$HOME/Git/coretext}"
DEST_REMOTE="https://github.com/coretexthq/coretext.git"

echo "=================================================="
echo "Coretext Publishing Workflow"
echo "=================================================="
echo ""

if [ ! -d "$SOURCE_REPO" ]; then
    echo "ERROR: Source repository not found at $SOURCE_REPO"
    exit 1
fi

# Create a temporary directory that will be automatically cleaned up
TEMP_DIR=$(mktemp -d)
trap 'echo "Cleaning up temporary directory: $TEMP_DIR"; rm -rf "$TEMP_DIR"' EXIT

# Step 1: Clone Public Repo
echo "=== Step 1: Cloning public repository (coretexthq/coretext) ==="
git clone "$DEST_REMOTE" "$TEMP_DIR/coretext-public"
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to clone public repository."
    exit 1
fi
echo ""

# Step 2: Sync Files
echo "=== Step 2: Syncing files from development to public clone ==="
echo "Excluding: .git/, knowledge/, graduation-thesis/"
rsync -av --delete \
    --exclude='.git/' \
    --exclude='knowledge/' \
    --exclude='graduation-thesis/' \
    "$SOURCE_REPO/" "$TEMP_DIR/coretext-public/"

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to sync files via rsync."
    exit 1
fi
echo ""

# Step 3: Commit & Push to a Feature Branch
echo "=== Step 3: Committing and Pushing ==="
(
    cd "$TEMP_DIR/coretext-public" || exit 1
    
    # Check if there are any changes
    if [ -z "$(git status --porcelain)" ]; then
        echo "No changes detected between $SOURCE_REPO and public remote."
        exit 0
    fi
    
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    BRANCH_NAME="publish-$TIMESTAMP"
    
    echo "Creating new branch: $BRANCH_NAME"
    git checkout -b "$BRANCH_NAME"
    
    echo "Staging files..."
    git add .
    
    echo "Committing..."
    git commit -m "chore: sync upstream changes from development repo ($TIMESTAMP)"
    
    echo "Pushing branch to coretexthq/coretext..."
    git push -u origin "$BRANCH_NAME"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "=================================================="
        echo "Publish complete! A new branch '$BRANCH_NAME' has been pushed."
        echo "Please open a Pull Request on GitHub to merge these changes."
        echo "URL: https://github.com/coretexthq/coretext/pull/new/$BRANCH_NAME"
        echo "=================================================="
    else
        echo "ERROR: Failed to push to remote."
        exit 1
    fi
)
