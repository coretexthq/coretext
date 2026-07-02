#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: bash setup.sh /path/to/fresh-target-repo [--hooks|--no-hooks]"
  echo
  echo "Apply the Trore-v3-4 Coretext experiment overlay after the Coretext engine setup."
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_ROOT="${1:-$(pwd)}"
HOOK_FLAG="${2:---hooks}"

if [ ! -d "$TARGET_ROOT" ]; then
  echo "Error: target repository does not exist: $TARGET_ROOT" >&2
  exit 1
fi

TARGET_ROOT="$(cd "$TARGET_ROOT" && pwd -P)"

if [ ! -d "$TARGET_ROOT/.coretext" ]; then
  echo "Installing Coretext engine into $TARGET_ROOT..."
  cp -r "$SCRIPT_DIR/../../../.coretext" "$TARGET_ROOT/.coretext"
fi

copy_overlay_file() {
  local src="$1"
  local dst="$2"
  local label="$3"

  mkdir -p "$(dirname "$dst")"

  if [ -f "$dst" ] && ! cmp -s "$src" "$dst"; then
    local backup="${dst}.pre-trore-v3-4"
    if [ ! -e "$backup" ]; then
      cp "$dst" "$backup"
      echo "Backed up existing $label to ${backup#$TARGET_ROOT/}"
    else
      echo "Backup already exists for $label at ${backup#$TARGET_ROOT/}"
    fi
  fi

  cp "$src" "$dst"
  echo "Installed $label"
}

copy_overlay_file "$SCRIPT_DIR/AGENTS.md" "$TARGET_ROOT/AGENTS.md" "AGENTS.md"
copy_overlay_file "$SCRIPT_DIR/.codex/config.toml" "$TARGET_ROOT/.codex/config.toml" ".codex/config.toml"
copy_overlay_file "$SCRIPT_DIR/.codex/hooks.json" "$TARGET_ROOT/.codex/hooks.json" ".codex/hooks.json"
copy_overlay_file "$SCRIPT_DIR/.agents/hooks.json" "$TARGET_ROOT/.agents/hooks.json" ".agents/hooks.json"
copy_overlay_file "$SCRIPT_DIR/.coretext-data/.gitignore" "$TARGET_ROOT/.coretext-data/.gitignore" ".coretext-data/.gitignore"

mkdir -p "$TARGET_ROOT/knowledge/ai"
mkdir -p "$TARGET_ROOT/.coretext-data/sessions"

if [ -d "$TARGET_ROOT/.agents/skills" ]; then
  skills_backup="$TARGET_ROOT/.agents/skills.pre-trore-v3-4"
  if [ -e "$skills_backup" ]; then
    echo "Error: $skills_backup already exists. Move or remove the active .agents/skills directory manually before applying the overlay." >&2
    exit 1
  fi
  mv "$TARGET_ROOT/.agents/skills" "$skills_backup"
  echo "Moved active .agents/skills to ${skills_backup#$TARGET_ROOT/} for the no-skill experiment condition"
fi

touch "$TARGET_ROOT/knowledge/.gitkeep"
touch "$TARGET_ROOT/knowledge/ai/.gitkeep"
touch "$TARGET_ROOT/.coretext-data/.gitkeep"
touch "$TARGET_ROOT/.coretext-data/sessions/.gitkeep"

# Hook configuration based on flag
if [ "$HOOK_FLAG" = "--no-hooks" ]; then
  echo -e "[features]\nhooks = false" > "$TARGET_ROOT/.codex/config.toml"
  sed -i '' 's/"enabled": true/"enabled": false/g' "$TARGET_ROOT/.agents/hooks.json" 2>/dev/null || sed -i 's/"enabled": true/"enabled": false/g' "$TARGET_ROOT/.agents/hooks.json"
  echo "Hooks explicitly disabled for the no-hooks experiment condition."
else
  echo -e "[features]\nhooks = true" > "$TARGET_ROOT/.codex/config.toml"
  sed -i '' 's/"enabled": false/"enabled": true/g' "$TARGET_ROOT/.agents/hooks.json" 2>/dev/null || sed -i 's/"enabled": false/"enabled": true/g' "$TARGET_ROOT/.agents/hooks.json"
  echo "Hooks explicitly enabled for the hooks experiment condition."
fi

workspace_name="$(basename "$TARGET_ROOT")"
ledger="$TARGET_ROOT/.coretext-data/${workspace_name}_rules.jsonl"

if [ ! -f "$ledger" ]; then
  if [ -f "$SCRIPT_DIR/.coretext-data/trore-v3-4_rules.jsonl" ]; then
    cp "$SCRIPT_DIR/.coretext-data/trore-v3-4_rules.jsonl" "$ledger"
  else
    touch "$ledger"
  fi
  echo "Created ledger placeholder ${ledger#$TARGET_ROOT/}"
else
  echo "Ledger already exists at ${ledger#$TARGET_ROOT/}"
fi

echo "Trore-v3-4 Coretext overlay complete for $TARGET_ROOT"
echo "Review and trust project-local hooks in Codex or Antigravity before starting the experiment."
