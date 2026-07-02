#!/bin/bash

echo "Setting up Coretext environment..."

# 1. Mode check and installer logic
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"

IS_DEVELOPMENT=0
IS_SUBMODULE=0
IS_UNZIP_INSTALLER=0

if [ -d "$SCRIPT_DIR/.git" ]; then
    IS_DEVELOPMENT=1
elif [ "$(basename "$SCRIPT_DIR")" = ".coretext" ]; then
    IS_SUBMODULE=1
else
    IS_UNZIP_INSTALLER=1
fi

PROJECT_ROOT="$SCRIPT_DIR"
ENGINE_DIR=".coretext"

if [ "$IS_SUBMODULE" -eq 1 ]; then
    PROJECT_ROOT="$PARENT_DIR"
    ENGINE_DIR=".coretext/.coretext"
elif [ "$IS_UNZIP_INSTALLER" -eq 1 ]; then
    PROJECT_ROOT="$PARENT_DIR"
fi

if [ "$IS_UNZIP_INSTALLER" -eq 1 ]; then
    echo "Running in unzip installer mode. Copying Coretext files to project root ($PARENT_DIR)..."
    
    # 1. Copy engine files to .coretext/ (flat layout, copying from script dir to parent/.coretext)
    echo "Copying engine files to .coretext/..."
    mkdir -p "$PARENT_DIR/.coretext"
    rsync -a \
      --exclude='setup.sh' \
      --exclude='.agents/' \
      --exclude='.codex/' \
      --exclude='tests/' \
      --exclude='package/' \
      "$SCRIPT_DIR/" "$PARENT_DIR/.coretext/"
      
    # 2. Copy config templates and tests selectively
    for skill in "knowledge" "export"; do
        if [ -d "$SCRIPT_DIR/.agents/skills/$skill" ]; then
            echo "Copying $skill skill..."
            mkdir -p "$PARENT_DIR/.agents/skills/$skill"
            rsync -a "$SCRIPT_DIR/.agents/skills/$skill/" "$PARENT_DIR/.agents/skills/$skill/"
        fi
    done
    
    if [ -f "$SCRIPT_DIR/.agents/hooks.json" ]; then
        if [ ! -f "$PARENT_DIR/.agents/hooks.json" ]; then
            echo "Copying Antigravity hooks.json..."
            mkdir -p "$PARENT_DIR/.agents"
            cp "$SCRIPT_DIR/.agents/hooks.json" "$PARENT_DIR/.agents/hooks.json"
        else
            echo "Warning: Project already has .agents/hooks.json, skipping hooks configuration."
        fi
    fi
    
    if [ -d "$SCRIPT_DIR/.codex" ]; then
        mkdir -p "$PARENT_DIR/.codex"
        for file in "config.toml" "hooks.json"; do
            if [ -f "$SCRIPT_DIR/.codex/$file" ]; then
                if [ ! -f "$PARENT_DIR/.codex/$file" ]; then
                     echo "Copying .codex/$file..."
                     cp "$SCRIPT_DIR/.codex/$file" "$PARENT_DIR/.codex/$file"
                fi
            fi
        done
    fi
    
    # Move to the project root for the rest of setup
    cd "$PROJECT_ROOT"

elif [ "$IS_SUBMODULE" -eq 1 ]; then
    echo "Running in submodule mode. Configuring host project root ($PARENT_DIR)..."
    
    # 1. Copy/merge config templates and tests selectively
    for skill in "knowledge" "export"; do
        if [ -d "$SCRIPT_DIR/.agents/skills/$skill" ]; then
            echo "Copying $skill skill..."
            mkdir -p "$PARENT_DIR/.agents/skills/$skill"
            rsync -a "$SCRIPT_DIR/.agents/skills/$skill/" "$PARENT_DIR/.agents/skills/$skill/"
        fi
    done
    
    if [ -f "$SCRIPT_DIR/.agents/hooks.json" ]; then
        if [ ! -f "$PARENT_DIR/.agents/hooks.json" ]; then
            echo "Copying Antigravity hooks.json..."
            mkdir -p "$PARENT_DIR/.agents"
            cp "$SCRIPT_DIR/.agents/hooks.json" "$PARENT_DIR/.agents/hooks.json"
        else
            echo "Warning: Project already has .agents/hooks.json, skipping hooks configuration."
        fi
    fi
    
    if [ -d "$SCRIPT_DIR/.codex" ]; then
        mkdir -p "$PARENT_DIR/.codex"
        for file in "config.toml" "hooks.json"; do
            if [ -f "$SCRIPT_DIR/.codex/$file" ]; then
                if [ ! -f "$PARENT_DIR/.codex/$file" ]; then
                    echo "Copying .codex/$file..."
                    cp "$SCRIPT_DIR/.codex/$file" "$PARENT_DIR/.codex/$file"
                fi
            fi
        done
    fi
    
    # Move to the project root for the rest of setup
    cd "$PROJECT_ROOT"
fi

# Ensure we are in the project root containing .coretext
if [ ! -d ".coretext" ]; then
    echo "Error: .coretext directory not found. Please run this script from the root of your project."
    exit 1
fi

# Ensure .coretext-data directory exists and copy .gitignore
if [ ! -d ".coretext-data" ]; then
    echo "Creating .coretext-data directory..."
    mkdir -p ".coretext-data"
fi
if [ -f "$ENGINE_DIR/.gitignore" ]; then
    cp "$ENGINE_DIR/.gitignore" ".coretext-data/.gitignore"
fi

# 3. Install dashboard dependencies
if [ -d "$ENGINE_DIR/coretext-graph-ui" ]; then
    echo "Installing dashboard dependencies..."
    cd "$ENGINE_DIR/coretext-graph-ui"
    npm install --silent
    cd "$PROJECT_ROOT"
else
    echo "Warning: $ENGINE_DIR/coretext-graph-ui not found, skipping dashboard setup."
fi

# 4. Install Python package & setup virtual environment
if [ "$IS_DEVELOPMENT" -eq 1 ]; then
    if [ -f "pyproject.toml" ]; then
        if command -v uv &> /dev/null; then
            echo "uv detected. Synchronizing Python virtual environment..."
            uv sync
        else
            echo "Warning: uv not found. Creating a standard virtual environment..."
            python3 -m venv .venv
            
            # Determine the platform-specific activation script
            if [ -f ".venv/bin/activate" ]; then
                source .venv/bin/activate
            elif [ -f ".venv/Scripts/activate" ]; then
                source ".venv/Scripts/activate"
            fi
            
            echo "Installing Python dependencies and Coretext package..."
            pip install --upgrade pip
            pip install -e .
        fi
    fi
else
    # Submodule or Unzip mode: pyproject.toml is inside .coretext/
    if [ -f ".coretext/pyproject.toml" ]; then
        if command -v uv &> /dev/null; then
            if [ ! -d ".venv" ]; then
                echo "Creating a virtual environment with uv..."
                uv venv
            fi
            
            # Activate venv
            if [ -f ".venv/bin/activate" ]; then
                source .venv/bin/activate
            elif [ -f ".venv/Scripts/activate" ]; then
                source ".venv/Scripts/activate"
            fi
            
            echo "uv detected. Installing Coretext package..."
            uv pip install -e .coretext
        else
            if [ ! -d ".venv" ]; then
                echo "Warning: uv not found. Creating a standard virtual environment..."
                python3 -m venv .venv
            fi
            
            # Activate venv
            if [ -f ".venv/bin/activate" ]; then
                source .venv/bin/activate
            elif [ -f ".venv/Scripts/activate" ]; then
                source ".venv/Scripts/activate"
            fi
            
            echo "Installing Coretext package in editable mode..."
            pip install --upgrade pip
            pip install -e .coretext
        fi
    else
        echo "Warning: .coretext/pyproject.toml not found, skipping Python package installation."
    fi
fi

# 5. Install Git hooks (only in development mode to guard upstream contributions)
if [ "$IS_DEVELOPMENT" -eq 1 ]; then
    if [ -d ".git/hooks" ]; then
        echo "Git repository detected. Installing pre-push hook..."
        if [ -f "$ENGINE_DIR/pre-push" ]; then
            cp "$ENGINE_DIR/pre-push" ".git/hooks/pre-push"
            chmod +x ".git/hooks/pre-push"
            echo "pre-push hook installed successfully."
        else
            echo "Warning: $ENGINE_DIR/pre-push hook template not found."
        fi
    else
        echo "Warning: .git/hooks directory not found, skipping Git hook installation."
    fi
fi

echo "Coretext setup complete! You can run the dashboard with: cd $ENGINE_DIR/coretext-graph-ui && npm run start"
echo "If uv was used, run scripts/tests via: uv run <command> (e.g. uv run pytest)"
