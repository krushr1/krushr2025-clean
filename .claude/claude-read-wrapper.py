#!/usr/bin/env python3
"""
Enhanced Read tool wrapper that uses cache system
Drop-in replacement for standard file reading in Claude Code
"""

import sys
import os
import time
from pathlib import Path

# Add project root to path
project_root = '/Users/justindoff/Cursor Projects/krushr-clean'
sys.path.insert(0, project_root)

class CachedFileReader:
    def __init__(self):
        try:
            from claude_cache import ClaudeCache
            self.cache = ClaudeCache()
            self.cache_available = True
            print("🚀 Cache system loaded successfully")
        except Exception as e:
            self.cache = None
            self.cache_available = False
            print(f"⚠️ Cache system not available: {e}")
    
    def read_file(self, file_path, offset=None, limit=None):
        """Enhanced file reading with cache support"""
        start_time = time.time()
        
        # Convert to absolute path if relative
        if not os.path.isabs(file_path):
            file_path = os.path.join(project_root, file_path)
        
        try:
            if self.cache_available and offset is None and limit is None:
                # Try cache first for full file reads
                content = self.cache.get_file(file_path)
                if content:
                    end_time = time.time()
                    print(f"✅ Cache hit: {len(content)} bytes in {end_time-start_time:.4f}s")
                    return self._format_with_line_numbers(content, offset, limit)
            
            # Fallback to direct file read
            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                if offset:
                    # Skip to offset line
                    for _ in range(offset - 1):
                        f.readline()
                
                if limit:
                    lines = []
                    for i in range(limit):
                        line = f.readline()
                        if not line:
                            break
                        lines.append(line.rstrip('\n\r'))
                    content = '\n'.join(lines)
                else:
                    content = f.read()
            
            end_time = time.time()
            cache_status = "cache miss" if self.cache_available else "direct read"
            print(f"📄 {cache_status}: {len(content)} bytes in {end_time-start_time:.4f}s")
            
            return self._format_with_line_numbers(content, offset, limit)
            
        except Exception as e:
            return f"Error reading {file_path}: {e}"
    
    def _format_with_line_numbers(self, content, offset=None, limit=None):
        """Format content with line numbers like cat -n"""
        lines = content.split('\n')
        start_line = offset if offset else 1
        
        formatted_lines = []
        for i, line in enumerate(lines):
            line_num = start_line + i
            formatted_lines.append(f"{line_num:6d}→{line}")
        
        return '\n'.join(formatted_lines)
    
    def get_cache_stats(self):
        """Get current cache statistics"""
        if self.cache_available:
            try:
                stats = self.cache.get_stats()
                return {
                    'hit_rate': f"{stats.hit_rate:.1%}",
                    'total_files': stats.total_files,
                    'cache_size_mb': round(stats.cache_size / 1024 / 1024, 2),
                    'memory_usage_mb': round(stats.memory_usage / 1024 / 1024, 2)
                }
            except:
                return {'error': 'Could not get cache stats'}
        return {'cache': 'not available'}

# Global instance
cached_reader = CachedFileReader()

def enhanced_read(file_path, offset=None, limit=None):
    """Drop-in replacement for file reading"""
    return cached_reader.read_file(file_path, offset, limit)

def cache_stats():
    """Get cache statistics"""
    return cached_reader.get_cache_stats()

if __name__ == "__main__":
    # CLI usage
    if len(sys.argv) < 2:
        print("Usage: python claude-read-wrapper.py <file-path> [offset] [limit]")
        print("       python claude-read-wrapper.py --stats")
        sys.exit(1)
    
    if sys.argv[1] == "--stats":
        stats = cache_stats()
        print("📊 Cache Statistics:")
        for key, value in stats.items():
            print(f"   {key}: {value}")
    else:
        file_path = sys.argv[1]
        offset = int(sys.argv[2]) if len(sys.argv) > 2 else None
        limit = int(sys.argv[3]) if len(sys.argv) > 3 else None
        
        result = enhanced_read(file_path, offset, limit)
        print(result)