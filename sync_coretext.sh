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

echo "Sync complete."
