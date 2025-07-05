#!/bin/bash

# Script to test different Notes Panel concepts
# Usage: ./test-concepts.sh [A|B|current]

NOTES_DIR="/Users/justindoff/Cursor Projects/Krushr/frontend/src/components/notes"

case "$1" in
  "A"|"a")
    echo "🎨 Switching to Concept A (Post-it Style)..."
    cp "$NOTES_DIR/NotesPanel.tsx" "$NOTES_DIR/NotesPanel.backup.tsx"
    cp "$NOTES_DIR/NotesPanel.ConceptA.tsx" "$NOTES_DIR/NotesPanel.tsx"
    echo "✅ Concept A is now active. Refresh your browser to see the changes."
    ;;
  "B"|"b")
    echo "📝 Switching to Concept B (Professional List)..."
    cp "$NOTES_DIR/NotesPanel.tsx" "$NOTES_DIR/NotesPanel.backup.tsx"
    cp "$NOTES_DIR/NotesPanel.ConceptB.tsx" "$NOTES_DIR/NotesPanel.tsx"
    echo "✅ Concept B is now active. Refresh your browser to see the changes."
    ;;
  "current"|"restore")
    echo "🔄 Restoring current version..."
    if [ -f "$NOTES_DIR/NotesPanel.backup.tsx" ]; then
      cp "$NOTES_DIR/NotesPanel.backup.tsx" "$NOTES_DIR/NotesPanel.tsx"
      echo "✅ Current version restored."
    else
      echo "❌ No backup found."
    fi
    ;;
  *)
    echo "📋 Notes Panel Concept Tester"
    echo ""
    echo "Usage: ./test-concepts.sh [option]"
    echo ""
    echo "Options:"
    echo "  A        Switch to Concept A (Post-it Style Cards)"
    echo "  B        Switch to Concept B (Professional List)"
    echo "  current  Restore current version"
    echo ""
    echo "Current concepts available:"
    echo "  🎨 Concept A: Card-based Post-it Style with colors"
    echo "  📝 Concept B: Clean List-based with Rich Preview"
    ;;
esac