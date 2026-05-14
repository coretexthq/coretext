#!/bin/bash

echo "Setting up Coretext environment..."

# Ensure we are in the project root containing .coretext
if [ ! -d ".coretext" ]; then
    echo "Error: .coretext directory not found. Please run this script from the root of your project."
    exit 1
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
