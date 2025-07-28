#!/usr/bin/env python3
"""
Cache important Krushr project files for faster Claude Code operations
"""

import os
import sys
from pathlib import Path

# Add cache system to path
cache_dir = Path(__file__).parent / "Github-CC-Research" / "claude-cache-system"
sys.path.insert(0, str(cache_dir))

try:
    from claude_cache import ClaudeCache
except ImportError:
    print("❌ Error: Could not import claude_cache. Make sure dependencies are installed.")
    sys.exit(1)

# Important directories and file patterns to cache
CACHE_TARGETS = [
    # API files
    "api/src/**/*.ts",
    "api/prisma/schema.prisma",
    "api/package.json",
    "api/tsconfig.json",
    "api/vitest.config.ts",
    
    # Frontend files
    "frontend/src/**/*.tsx",
    "frontend/src/**/*.ts",
    "frontend/src/**/*.css",
    "frontend/public/*.html",
    "frontend/public/*.css",
    "frontend/public/*.js",
    "frontend/package.json",
    "frontend/tailwind.config.js",
    "frontend/tsconfig.json",
    "frontend/eslint.config.js",
    "frontend/vitest.config.ts",
    
    # Shared files
    "shared/**/*.ts",
    "shared/package.json",
    
    # Configuration and docs
    "CLAUDE.md",
    "GEMINI-INTEGRATION.md",
    "README.md",
    "README-SHORTCUTS.md",
    "docker-compose.yml",
    "package.json",
    ".claude/commands/*.md",
    ".claude/guides/*.md",
    ".claude/patterns/*.md",
    ".claude/preferences/*.md",
    
    # Build and scripts
    "frontend/scripts/*.mjs",
    "scripts/*.js",
    "scripts/*.sh",
    "backup-system.js",
    
    # Test files
    "frontend/test-*.js",
    "frontend/test-*.cjs",
    "api/test-*.js",
    "api/scripts/*.js",
    
    # Launch scripts
    "launch-krushr.sh",
    "claude-yolo",
    "claude-auto",
    "claude-auto-wrapper.sh",
    "install-auto-approval.sh",
    "start-claude-automation.sh",
    "stop-claude-automation.sh",
    
    # Key dependencies (selective - not entire node_modules)
    "api/node_modules/@prisma/client/index.d.ts",
    "api/node_modules/@trpc/server/dist/index.d.ts",
    "frontend/node_modules/@types/react/index.d.ts",
    "frontend/node_modules/tailwindcss/types/index.d.ts",
]

def cache_files():
    """Cache all important project files"""
    base_dir = Path(__file__).parent
    cache = ClaudeCache()
    
    print("🚀 Caching Krushr project files...")
    
    # Track statistics
    total_files = 0
    cached_files = 0
    errors = 0
    
    # Cache each target pattern
    for pattern in CACHE_TARGETS:
        print(f"\n📁 Processing: {pattern}")
        
        # Use glob to find matching files
        if "**" in pattern:
            # Recursive pattern
            parts = pattern.split("**")
            base_pattern = Path(parts[0])
            file_pattern = parts[1].lstrip("/")
            
            search_dir = base_dir / base_pattern
            if search_dir.exists():
                for file_path in search_dir.rglob(file_pattern):
                    if file_path.is_file():
                        total_files += 1
                        # Cache the file
                        try:
                            content = cache.get_file(str(file_path))
                            if content:
                                cached_files += 1
                                print(f"  ✅ Cached: {file_path.relative_to(base_dir)}")
                        except Exception as e:
                            errors += 1
                            print(f"  ❌ Error caching {file_path.relative_to(base_dir)}: {e}")
        else:
            # Direct file pattern
            file_path = base_dir / pattern
            if file_path.exists() and file_path.is_file():
                total_files += 1
                try:
                    content = cache.get_file(str(file_path))
                    if content:
                        cached_files += 1
                        print(f"  ✅ Cached: {pattern}")
                except Exception as e:
                    errors += 1
                    print(f"  ❌ Error caching {pattern}: {e}")
    
    # Show results
    print(f"\n📊 Caching Summary:")
    print(f"  Total files processed: {total_files}")
    print(f"  Successfully cached: {cached_files}")
    print(f"  Errors: {errors}")
    
    # Show cache stats
    stats = cache.get_stats()
    print(f"\n🗄️  Cache Statistics:")
    print(f"  Hit rate: {stats.hit_rate:.2%}")
    print(f"  Total cached files: {stats.total_files}")
    print(f"  Cache size: {stats.cache_size / 1024 / 1024:.2f} MB")
    print(f"  Cache hits: {stats.hit_count}")
    print(f"  Cache misses: {stats.miss_count}")
    
    # Show memory stats
    mem_stats = cache.get_memory_stats()
    print(f"\n💾 Memory Statistics:")
    print(f"  Process memory: {mem_stats.process_memory_mb:.1f} MB")
    print(f"  Memory limit: {mem_stats.memory_limit_mb:.1f} MB")
    print(f"  Memory usage: {mem_stats.memory_usage_percent:.1f}%")
    print(f"  Status: {'⚠️ Over limit!' if mem_stats.is_over_limit else '✅ Within limits'}")

if __name__ == "__main__":
    cache_files()