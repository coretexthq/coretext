#!/bin/bash

# Target packaging directory
TARGET="./package"

echo "Syncing and compiling clean package in $TARGET..."

# 1. Clean existing packaging directory
if [ -d "$TARGET" ]; then
    echo "Cleaning existing $TARGET directory..."
    rm -rf "$TARGET"
fi
mkdir -p "$TARGET"

# 2. Copy .coretext engine files directly to the root of the package
echo "Copying engine files..."
rsync -a \
  --exclude='.DS_Store' \
  --exclude='node_modules/' \
  --exclude='__pycache__/' \
  --exclude='*.pyc' \
  --exclude='*.pyo' \
  --exclude='*.pyd' \
  --exclude='coretext.egg-info/' \
  .coretext/ "$TARGET/"

# 3. Copy other required files/directories
echo "Copying configuration, agent templates, and tests..."

# Copy .agents/ and .codex/ directories
rsync -a --exclude='.DS_Store' .agents/ "$TARGET/.agents/"
rsync -a --exclude='.DS_Store' .codex/ "$TARGET/.codex/"

# Copy single files
cp setup.sh "$TARGET/setup.sh"
sed 's/package-dir = {"" = ".coretext"}/package-dir = {"" = "."}/g' pyproject.toml > "$TARGET/pyproject.toml"
cp README.md "$TARGET/README.md"
cp docs/dashboard_guide.md "$TARGET/coretext-graph-ui/README.md"
cp LICENSE "$TARGET/LICENSE"
cp sync-subtree.sh "$TARGET/sync-subtree.sh"

# Copy tests/ directory
rsync -a \
  --exclude='.DS_Store' \
  --exclude='__pycache__/' \
  --exclude='*.pyc' \
  tests/ "$TARGET/tests/"

echo "Sync and packaging complete!"
