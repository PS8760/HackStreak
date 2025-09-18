#!/bin/bash
# Render build script for PaperFlow

echo "🔧 Building PaperFlow for Render..."

# Upgrade pip first
pip install --upgrade pip

# Install dependencies with no cache to avoid issues
pip install --no-cache-dir -r requirements-render.txt

echo "✅ Build complete!"