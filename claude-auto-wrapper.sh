#!/bin/bash

# Claude Code Auto-Approval Wrapper
# Uses OFFICIAL Claude Code flags that actually work

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Default to bypass permissions mode
PERMISSION_MODE="bypassPermissions"
ADDITIONAL_FLAGS=""

# Function to show usage
show_usage() {
    echo "Claude Code Auto-Approval Wrapper"
    echo ""
    echo "Usage: $0 [mode] [additional_flags] -- [claude_args...]"
    echo ""
    echo "Modes:"
    echo "  yolo        Full auto-approval (--dangerously-skip-permissions)"
    echo "  bypass      Bypass permission mode (--permission-mode bypassPermissions)"
    echo "  edits       Auto-approve edits only (--permission-mode acceptEdits)"
    echo "  plan        Planning mode (--permission-mode plan)"
    echo "  safe        Default safe mode (--permission-mode default)"
    echo ""
    echo "Examples:"
    echo "  $0 yolo -- \"Fix all linting errors\""
    echo "  $0 bypass -- \"Refactor this component\""
    echo "  $0 edits --allowedTools \"Edit\" -- \"Update README\""
    echo ""
    echo "Created files:"
    echo "  claude-yolo    - Quick YOLO mode alias"
    echo "  claude-auto    - Quick bypass mode alias"
}

# Parse arguments
case "${1:-bypass}" in
    yolo|YOLO)
        echo -e "${YELLOW}⚡ YOLO MODE: Full auto-approval activated${NC}"
        CLAUDE_CMD="claude --dangerously-skip-permissions"
        shift
        ;;
    bypass|auto)
        echo -e "${GREEN}🚀 AUTO MODE: Bypass permissions activated${NC}"
        CLAUDE_CMD="claude --permission-mode bypassPermissions"
        shift
        ;;
    edits)
        echo -e "${GREEN}✏️  EDIT MODE: Auto-approve edits only${NC}"
        CLAUDE_CMD="claude --permission-mode acceptEdits"
        shift
        ;;
    plan)
        echo -e "${GREEN}📋 PLAN MODE: Planning mode activated${NC}"
        CLAUDE_CMD="claude --permission-mode plan"
        shift
        ;;
    safe)
        echo -e "${GREEN}🔒 SAFE MODE: Default permissions${NC}"
        CLAUDE_CMD="claude --permission-mode default"
        shift
        ;;
    help|--help|-h)
        show_usage
        exit 0
        ;;
    *)
        # No mode specified, default to bypass
        echo -e "${GREEN}🚀 AUTO MODE: Bypass permissions activated (default)${NC}"
        CLAUDE_CMD="claude --permission-mode bypassPermissions"
        ;;
esac

# Parse additional flags before --
while [[ $# -gt 0 && "$1" != "--" ]]; do
    ADDITIONAL_FLAGS="$ADDITIONAL_FLAGS $1"
    shift
done

# Skip the -- separator
if [[ "$1" == "--" ]]; then
    shift
fi

# Build final command
FINAL_CMD="$CLAUDE_CMD $ADDITIONAL_FLAGS"

# If arguments provided, run immediately
if [[ $# -gt 0 ]]; then
    echo -e "${GREEN}Running: $FINAL_CMD \"$*\"${NC}"
    $FINAL_CMD "$*"
else
    # Interactive mode
    echo -e "${GREEN}Starting interactive mode...${NC}"
    echo -e "${YELLOW}Command: $FINAL_CMD${NC}"
    $FINAL_CMD
fi 