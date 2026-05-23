#!/bin/bash

echo "Setting up Coretext environment..."

# Ensure we are in the project root containing .coretext
if [ ! -d ".coretext" ]; then
    echo "Error: .coretext directory not found. Please run this script from the root of your project."
    exit 1
fi

# 0. Submodule & Git Hooks Setup
if [ -e ".git" ]; then
    echo "Initializing and updating submodules..."
    git submodule update --init --recursive

    echo "Configuring post-checkout git hook..."
    HOOKS_DIR=$(git rev-parse --git-path hooks)
    mkdir -p "$HOOKS_DIR"
    cat << 'EOF' > "$HOOKS_DIR/post-checkout"
#!/bin/sh
# Ensures coretext-docs submodule is always populated on checkout
git submodule update --init --recursive
EOF
    chmod +x "$HOOKS_DIR/post-checkout"
    echo "Submodules and git hooks configured."
fi

# 1. Install dashboard dependencies
if [ -d ".coretext/coretext-graph-ui" ]; then
    echo "Installing dashboard dependencies..."
    cd .coretext/coretext-graph-ui
    npm install --silent
    cd ../..
else
    echo "Warning: .coretext/coretext-graph-ui not found, skipping dashboard setup."
fi

# 2. Install Python package (using pyproject.toml)
if [ -f "pyproject.toml" ]; then
    echo "Installing Python dependencies and Coretext package..."
    pip install -e .
else
    echo "Warning: pyproject.toml not found, skipping Python package installation."
fi

echo "Coretext setup complete! You can now run the dashboard with: cd .coretext/coretext-graph-ui && npm run start"
