#!/bin/bash

# Install Claude Code Auto-Approval Tools Globally

echo "Installing Claude Code Auto-Approval tools..."

# Copy to user's local bin directory
mkdir -p ~/.local/bin

cp claude-auto-wrapper.sh ~/.local/bin/claude-auto-wrapper
cp claude-yolo ~/.local/bin/claude-yolo  
cp claude-auto ~/.local/bin/claude-auto

# Make executable
chmod +x ~/.local/bin/claude-auto-wrapper
chmod +x ~/.local/bin/claude-yolo
chmod +x ~/.local/bin/claude-auto

# Update the aliases to use absolute paths
sed -i '' 's|./claude-auto-wrapper.sh|claude-auto-wrapper|g' ~/.local/bin/claude-yolo
sed -i '' 's|./claude-auto-wrapper.sh|claude-auto-wrapper|g' ~/.local/bin/claude-auto

# Add to PATH if not already there
if ! echo $PATH | grep -q "$HOME/.local/bin"; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
    echo "Added ~/.local/bin to PATH in ~/.zshrc"
    echo "Run: source ~/.zshrc or restart terminal"
fi

echo "✅ Installation complete!"
echo ""
echo "New global commands available:"
echo "  claude-yolo \"your request\"    # Complete auto-approval"
echo "  claude-auto \"your request\"    # Bypass permissions"  
echo "  claude-auto-wrapper [mode]     # Full wrapper with options"
echo ""
echo "Test with: claude-yolo \"What files are in the current directory?\"" 