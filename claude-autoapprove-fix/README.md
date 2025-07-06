# Claude Code Auto-Approve Fix

This guide provides a solution for enabling auto-approve functionality in Claude Code extension for Cursor IDE when permission prompts keep appearing.

## Problem

Claude Code extension in Cursor IDE repeatedly shows permission prompts for every tool use (Bash, Read, Write, etc.), making the workflow inefficient and interrupting the development process.

## Root Cause

Claude Code extension stores project-specific permissions in `~/.claude.json` file. Each project has an `allowedTools` array that determines which tools can run without permission prompts. When this array is empty `[]`, all tools require manual approval.

## Solution

The fix involves updating the project's `allowedTools` array in the Claude configuration file to include all available tools.

### Automatic Fix Script

Use the provided `fix-autoapprove.py` script:

```bash
python3 fix-autoapprove.py
```

### Manual Fix Steps

1. **Backup the Claude configuration:**
   ```bash
   cp ~/.claude.json ~/.claude.json.backup.$(date +%Y%m%d_%H%M%S)
   ```

2. **Locate your project path in the configuration:**
   - Open `~/.claude.json`
   - Find your project under the `projects` section
   - Note the `allowedTools` array (likely empty: `[]`)

3. **Update the allowedTools array:**
   Replace the empty array with the complete list of tools (see `fix-autoapprove.py` for the full list)

4. **Restart Cursor IDE completely** for changes to take effect

## File Structure

```
claude-autoapprove-fix/
├── README.md                 # This file
├── fix-autoapprove.py       # Automatic fix script
└── claude-config-backup.py  # Backup utility
```

## Tools Included in Auto-Approval

The fix enables auto-approval for 72+ tools including:
- Core tools: `Bash`, `Read`, `Write`, `Edit`, `MultiEdit`, `Glob`, `Grep`, `LS`
- Todo tools: `TodoRead`, `TodoWrite` 
- Web tools: `WebFetch`, `WebSearch`
- MCP tools: All filesystem, memory, IDE, and Puppeteer tools
- Notebook tools: `NotebookRead`, `NotebookEdit`
- And many more...

## Verification

After applying the fix, test that auto-approve is working:

1. Run any Claude Code command
2. Verify no permission prompts appear
3. Tools should execute immediately

## Troubleshooting

### Issue: Changes don't take effect
**Solution:** Restart Cursor IDE completely (quit and reopen)

### Issue: Project not found in configuration
**Solution:** Run Claude Code once in your project to create the project entry, then apply the fix

### Issue: Configuration gets corrupted
**Solution:** Restore from backup and re-apply the fix:
```bash
cp ~/.claude.json.backup.YYYYMMDD_HHMMSS ~/.claude.json
python3 fix-autoapprove.py
```

## Important Notes

- ⚠️ **Always backup** your Claude configuration before making changes
- 🔄 **Restart Cursor IDE** after applying the fix
- 📁 **Project-specific**: Each project needs to be configured separately
- 🔧 **Persistent**: The fix remains active until the configuration is modified

## Technical Details

### Configuration Location
- **File:** `~/.claude.json`
- **Section:** `projects[PROJECT_PATH].allowedTools`
- **Type:** Array of tool names

### Project Path Format
```json
{
  "projects": {
    "/Users/username/path/to/project": {
      "allowedTools": ["Bash", "Read", "Write", ...],
      "history": [...],
      ...
    }
  }
}
```

## Security Considerations

This fix grants automatic approval for all tools. Ensure you trust your Claude Code usage patterns and the projects you're working on. The auto-approval is limited to the specific project path configured.

## Support

If you encounter issues:
1. Check that Cursor IDE was restarted after applying the fix
2. Verify the project path matches exactly in the configuration
3. Ensure the backup was successful before troubleshooting
4. Try the manual fix steps if the script doesn't work

---

**Success indicator:** No more permission prompts! Claude Code tools execute immediately without interruption.