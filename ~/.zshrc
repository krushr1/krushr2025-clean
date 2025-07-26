# Claude Code - No Interruptions + Cache
export CLAUDE_DISABLE_AUTO_COMPACT=true  
export CLAUDE_MAX_CONTEXT_THRESHOLD=0.99

# Function to start Claude with cache and auto-approval
claude-supercharged() {
    cd "Github-CC-Research/claude-cache-system"
    source venv/bin/activate
    python claude_cache_daemon.py &
    cd ../../
    claude --permission-mode bypassPermissions
}

alias claude-noint='claude --permission-mode bypassPermissions --no-compact --max-context-usage=0.99'
alias claude-yolo='claude --dangerously-skip-permissions' 