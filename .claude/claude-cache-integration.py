#!/usr/bin/env python3
"""
Claude Code Cache Integration
Patches Claude Code file operations to use the cache system
"""

import os
import sys
import json
from pathlib import Path

# Add cache system to path
sys.path.insert(0, '/Users/justindoff/Cursor Projects/krushr-clean')

try:
    from claude_cache import ClaudeCache
    cache = ClaudeCache()
    
    def cached_read_file(file_path):
        """Enhanced file reading through cache"""
        try:
            content = cache.get_file(str(file_path))
            if content:
                return content
        except Exception as e:
            print(f"Cache miss for {file_path}: {e}")
        
        # Fallback to direct read
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            return f"Error reading {file_path}: {e}"
    
    def cached_glob_search(pattern, base_path="."):
        """Enhanced glob search through cache"""
        try:
            import glob
            matches = glob.glob(os.path.join(base_path, pattern), recursive=True)
            
            results = []
            for match in matches:
                if os.path.isfile(match):
                    # Try to get from cache first
                    try:
                        content = cache.get_file(match)
                        if content:
                            results.append({
                                'path': match,
                                'cached': True,
                                'size': len(content)
                            })
                        else:
                            results.append({
                                'path': match,
                                'cached': False,
                                'size': os.path.getsize(match) if os.path.exists(match) else 0
                            })
                    except:
                        results.append({
                            'path': match,
                            'cached': False,
                            'size': os.path.getsize(match) if os.path.exists(match) else 0
                        })
            
            return results
        except Exception as e:
            return f"Error in cached glob: {e}"
    
    # Export functions for Claude Code
    __all__ = ['cached_read_file', 'cached_glob_search', 'cache']
    
except ImportError as e:
    print(f"Cache system not available: {e}")
    
    def cached_read_file(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def cached_glob_search(pattern, base_path="."):
        import glob
        return glob.glob(os.path.join(base_path, pattern), recursive=True)

if __name__ == "__main__":
    # Test the integration
    test_file = "/Users/justindoff/Cursor Projects/krushr-clean/api/src/trpc/router.ts"
    print("Testing cache integration...")
    
    import time
    start = time.time()
    content = cached_read_file(test_file)
    end = time.time()
    
    print(f"Read {len(content)} bytes in {end-start:.4f}s")
    print(f"Cache status: {cache.get_stats() if 'cache' in globals() else 'Not available'}")