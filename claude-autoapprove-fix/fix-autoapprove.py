#!/usr/bin/env python3
"""
Claude Code Auto-Approve Fix Script

This script automatically configures Claude Code extension to auto-approve all tool permissions
for a specific project, eliminating permission prompts during development.

Usage:
    python3 fix-autoapprove.py [project_path]

If no project_path is provided, it will use the current working directory.
"""

import json
import os
import sys
import shutil
from datetime import datetime
from pathlib import Path

# Complete list of all Claude Code tools to auto-approve
ALL_TOOLS = [
    # Core tools
    'Bash', 'Glob', 'Grep', 'LS', 'exit_plan_mode', 'Read', 'Edit', 'MultiEdit', 'Write',
    
    # Notebook tools
    'NotebookRead', 'NotebookEdit',
    
    # Web tools
    'WebFetch', 'TodoRead', 'TodoWrite', 'WebSearch',
    
    # MCP IDE tools
    'mcp__ide__getDiagnostics', 'mcp__ide__executeCode',
    
    # MCP Memory tools
    'mcp__memory__create_entities', 'mcp__memory__create_relations', 'mcp__memory__add_observations',
    'mcp__memory__delete_entities', 'mcp__memory__delete_observations', 'mcp__memory__delete_relations',
    'mcp__memory__read_graph', 'mcp__memory__search_nodes', 'mcp__memory__open_nodes',
    
    # MCP Filesystem tools (krushr-filesystem)
    'mcp__krushr-filesystem__read_file', 'mcp__krushr-filesystem__read_multiple_files',
    'mcp__krushr-filesystem__write_file', 'mcp__krushr-filesystem__edit_file',
    'mcp__krushr-filesystem__create_directory', 'mcp__krushr-filesystem__list_directory',
    'mcp__krushr-filesystem__list_directory_with_sizes', 'mcp__krushr-filesystem__directory_tree',
    'mcp__krushr-filesystem__move_file', 'mcp__krushr-filesystem__search_files',
    'mcp__krushr-filesystem__get_file_info', 'mcp__krushr-filesystem__list_allowed_directories',
    
    # MCP Filesystem tools (standard)
    'mcp__filesystem__read_file', 'mcp__filesystem__read_multiple_files', 'mcp__filesystem__write_file',
    'mcp__filesystem__edit_file', 'mcp__filesystem__create_directory', 'mcp__filesystem__list_directory',
    'mcp__filesystem__list_directory_with_sizes', 'mcp__filesystem__directory_tree',
    'mcp__filesystem__move_file', 'mcp__filesystem__search_files', 'mcp__filesystem__get_file_info',
    'mcp__filesystem__list_allowed_directories',
    
    # MCP Filesystem tools (krushr-clean-filesystem)
    'mcp__krushr-clean-filesystem__read_file', 'mcp__krushr-clean-filesystem__read_multiple_files',
    'mcp__krushr-clean-filesystem__write_file', 'mcp__krushr-clean-filesystem__edit_file',
    'mcp__krushr-clean-filesystem__create_directory', 'mcp__krushr-clean-filesystem__list_directory',
    'mcp__krushr-clean-filesystem__list_directory_with_sizes', 'mcp__krushr-clean-filesystem__directory_tree',
    'mcp__krushr-clean-filesystem__move_file', 'mcp__krushr-clean-filesystem__search_files',
    'mcp__krushr-clean-filesystem__get_file_info', 'mcp__krushr-clean-filesystem__list_allowed_directories',
    
    # MCP Resource tools
    'ListMcpResourcesTool', 'ReadMcpResourceTool',
    
    # MCP Puppeteer tools
    'mcp__puppeteer__puppeteer_navigate', 'mcp__puppeteer__puppeteer_screenshot',
    'mcp__puppeteer__puppeteer_click', 'mcp__puppeteer__puppeteer_fill',
    'mcp__puppeteer__puppeteer_select', 'mcp__puppeteer__puppeteer_hover',
    'mcp__puppeteer__puppeteer_evaluate',
    
    # Task tool
    'Task'
]

def get_claude_config_path():
    """Get the path to Claude configuration file."""
    home = Path.home()
    return home / '.claude.json'

def backup_config(config_path):
    """Create a backup of the Claude configuration file."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = config_path.with_suffix(f'.json.backup.{timestamp}')
    shutil.copy2(config_path, backup_path)
    print(f"✅ Backup created: {backup_path}")
    return backup_path

def load_config(config_path):
    """Load and parse the Claude configuration file."""
    if not config_path.exists():
        print(f"❌ Error: Claude configuration file not found at {config_path}")
        print("💡 Tip: Run Claude Code once to create the configuration file")
        sys.exit(1)
    
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in configuration file: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error reading configuration file: {e}")
        sys.exit(1)

def save_config(config_path, config):
    """Save the updated configuration file."""
    try:
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        print(f"✅ Configuration updated: {config_path}")
    except Exception as e:
        print(f"❌ Error saving configuration file: {e}")
        sys.exit(1)

def update_project_permissions(config, project_path):
    """Update the allowedTools for the specified project."""
    if 'projects' not in config:
        config['projects'] = {}
    
    if project_path not in config['projects']:
        print(f"⚠️  Project not found in configuration: {project_path}")
        print("💡 Creating new project entry...")
        config['projects'][project_path] = {
            'allowedTools': [],
            'history': []
        }
    
    # Update allowedTools
    config['projects'][project_path]['allowedTools'] = ALL_TOOLS
    
    return len(ALL_TOOLS)

def main():
    """Main function to fix Claude Code auto-approve."""
    # Get project path from command line or use current directory
    if len(sys.argv) > 1:
        project_path = os.path.abspath(sys.argv[1])
    else:
        project_path = os.getcwd()
    
    print("🔧 Claude Code Auto-Approve Fix")
    print("=" * 40)
    print(f"Project path: {project_path}")
    
    # Get Claude configuration path
    config_path = get_claude_config_path()
    print(f"Config file: {config_path}")
    
    # Create backup
    backup_path = backup_config(config_path)
    
    # Load configuration
    print("📖 Loading configuration...")
    config = load_config(config_path)
    
    # Update project permissions
    print("🔄 Updating project permissions...")
    num_tools = update_project_permissions(config, project_path)
    
    # Save updated configuration
    print("💾 Saving configuration...")
    save_config(config_path, config)
    
    # Success message
    print("\n🎉 Auto-approve fix applied successfully!")
    print(f"✅ {num_tools} tools enabled for auto-approval")
    print(f"📁 Project: {project_path}")
    print(f"💾 Backup: {backup_path}")
    print("\n⚠️  IMPORTANT: Restart Cursor IDE completely for changes to take effect!")
    
    # List some of the enabled tools
    print(f"\n🛠️  Some enabled tools: {', '.join(ALL_TOOLS[:10])}...")
    print(f"   And {len(ALL_TOOLS) - 10} more tools")

if __name__ == '__main__':
    main()