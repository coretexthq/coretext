#!/bin/bash

# Sync files from .coretext/ to coretext_package/.coretext/
# Excludes .jsonl and .acknowledged_paths to preserve package-specific data.

SRC=".coretext/"
DEST="coretext_package/.coretext/"

# Create destination if it doesn't exist
mkdir -p "$DEST"

echo "Syncing $SRC to $DEST (excluding .jsonl and .acknowledged_paths)..."

rsync -av \
  --exclude='*.jsonl' \
  --exclude='.acknowledged_paths' \
  "$SRC" "$DEST"

echo "Copying setup script to package root..."
cp setup_coretext.sh coretext_package/

echo "Copying README.md to package root..."
cp README.md coretext_package/

echo "Copying .gemini/settings.json to package root..."
mkdir -p coretext_package/.gemini
cp .gemini/settings.json coretext_package/.gemini/

echo "Copying .agents/skills/coretext to package root..."
mkdir -p coretext_package/.agents/skills/coretext
cp -r .agents/skills/coretext/* coretext_package/.agents/skills/coretext/

echo "Sync complete."
