#!/usr/bin/env python3
"""
Cached WebFetch - HTTP response caching for Claude Code
Extends cache system to handle HTTP requests with intelligent caching
"""

import sys
import os
import time
import hashlib
import json
import urllib.request
import urllib.parse
from datetime import datetime, timedelta

# Add project root to path
project_root = '/Users/justindoff/Cursor Projects/krushr-clean'
sys.path.insert(0, project_root)

class CachedWebFetch:
    def __init__(self):
        try:
            from claude_cache import ClaudeCache
            self.cache = ClaudeCache()
            self.cache_available = True
            print("🚀 HTTP Cache system loaded")
        except Exception as e:
            self.cache = None
            self.cache_available = False
            print(f"⚠️ Cache system not available: {e}")
        
        # HTTP cache settings
        self.default_ttl = 3600  # 1 hour default TTL
        self.max_size = 10 * 1024 * 1024  # 10MB max response size
    
    def _get_cache_key(self, url, headers=None):
        """Generate cache key for URL + headers"""
        key_data = url
        if headers:
            key_data += str(sorted(headers.items()))
        return f"http_cache:{hashlib.md5(key_data.encode()).hexdigest()}"
    
    def _is_cache_valid(self, cached_data):
        """Check if cached data is still valid"""
        if not cached_data or 'timestamp' not in cached_data:
            return False
        
        cache_time = datetime.fromisoformat(cached_data['timestamp'])
        ttl = cached_data.get('ttl', self.default_ttl)
        expiry = cache_time + timedelta(seconds=ttl)
        
        return datetime.now() < expiry
    
    def fetch(self, url, prompt=None, ttl=None, force_refresh=False):
        """
        Cached HTTP fetch with intelligent caching
        
        Args:
            url: URL to fetch
            prompt: AI prompt to process content (optional)
            ttl: Cache time-to-live in seconds (default: 3600)
            force_refresh: Skip cache and fetch fresh (default: False)
        """
        start_time = time.time()
        cache_key = self._get_cache_key(url)
        ttl = ttl or self.default_ttl
        
        # Try cache first (unless force refresh)
        if self.cache_available and not force_refresh:
            try:
                cached_response = self.cache.get_file(cache_key)
                if cached_response:
                    cached_data = json.loads(cached_response)
                    if self._is_cache_valid(cached_data):
                        end_time = time.time()
                        print(f"✅ Cache hit: {len(cached_data['content'])} bytes in {end_time-start_time:.4f}s")
                        
                        if prompt:
                            return self._process_with_prompt(cached_data['content'], prompt)
                        return cached_data['content']
                    else:
                        print("🔄 Cache expired, fetching fresh...")
            except Exception as e:
                print(f"⚠️ Cache read error: {e}")
        
        # Fetch from HTTP
        try:
            print(f"🌐 Fetching: {url}")
            
            # Set up request with user agent
            headers = {
                'User-Agent': 'Claude-Code-Cached-WebFetch/1.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
            }
            
            req = urllib.request.Request(url, headers=headers)
            
            with urllib.request.urlopen(req, timeout=30) as response:
                content = response.read()
                
                # Handle encoding
                if isinstance(content, bytes):
                    encoding = response.headers.get_content_charset() or 'utf-8'
                    content = content.decode(encoding, errors='replace')
                
                # Check size limit
                if len(content) > self.max_size:
                    print(f"⚠️ Response too large: {len(content)} bytes (max: {self.max_size})")
                    content = content[:self.max_size] + "\n... [Content truncated due to size limit]"
                
                end_time = time.time()
                print(f"📄 HTTP fetch: {len(content)} bytes in {end_time-start_time:.4f}s")
                
                # Cache the response
                if self.cache_available:
                    try:
                        cache_data = {
                            'url': url,
                            'content': content,
                            'timestamp': datetime.now().isoformat(),
                            'ttl': ttl,
                            'size': len(content),
                            'headers': dict(response.headers)
                        }
                        
                        cache_content = json.dumps(cache_data, ensure_ascii=False)
                        # Store in cache using file-like interface
                        cache_file_path = f"/tmp/http_cache_{hashlib.md5(cache_key.encode()).hexdigest()}.json"
                        with open(cache_file_path, 'w', encoding='utf-8') as f:
                            f.write(cache_content)
                        
                        # Try to add to cache system
                        self.cache.add_file(cache_key, cache_file_path)
                        print(f"💾 Cached response (TTL: {ttl}s)")
                        
                    except Exception as e:
                        print(f"⚠️ Cache write error: {e}")
                
                # Process with prompt if provided
                if prompt:
                    return self._process_with_prompt(content, prompt)
                
                return content
                
        except Exception as e:
            return f"❌ HTTP fetch error: {e}"
    
    def _process_with_prompt(self, content, prompt):
        """Process content with AI prompt (simplified version)"""
        # For now, just return content with prompt context
        # In a full implementation, this would use an AI model
        return f"PROMPT: {prompt}\n\nCONTENT:\n{content}"
    
    def clear_cache(self, url_pattern=None):
        """Clear HTTP cache entries"""
        if not self.cache_available:
            return "Cache not available"
        
        # This would need cache system support for pattern-based clearing
        print("🧹 Cache clearing not yet implemented")
        return "Cache clearing feature needs implementation"
    
    def get_cache_stats(self):
        """Get HTTP cache statistics"""
        if not self.cache_available:
            return {"cache": "not available"}
        
        try:
            stats = self.cache.get_stats()
            return {
                'http_cache_enabled': True,
                'total_cached_items': stats.total_files,
                'cache_size_mb': round(stats.cache_size / 1024 / 1024, 2),
                'hit_rate': f"{stats.hit_rate:.1%}",
                'default_ttl': f"{self.default_ttl}s",
                'max_response_size': f"{self.max_size / 1024 / 1024:.1f}MB"
            }
        except Exception as e:
            return {"error": str(e)}

# Global instance
cached_webfetch = CachedWebFetch()

def cached_fetch(url, prompt=None, ttl=3600, force_refresh=False):
    """Drop-in replacement for WebFetch with caching"""
    return cached_webfetch.fetch(url, prompt, ttl, force_refresh)

if __name__ == "__main__":
    # CLI usage
    if len(sys.argv) < 2:
        print("Usage: python cached-webfetch.py <url> [prompt] [ttl] [--force]")
        print("       python cached-webfetch.py --stats")
        print("       python cached-webfetch.py --clear")
        sys.exit(1)
    
    if sys.argv[1] == "--stats":
        stats = cached_webfetch.get_cache_stats()
        print("📊 HTTP Cache Statistics:")
        for key, value in stats.items():
            print(f"   {key}: {value}")
    elif sys.argv[1] == "--clear":
        result = cached_webfetch.clear_cache()
        print(result)
    else:
        url = sys.argv[1]
        prompt = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else None
        ttl = int(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3].isdigit() else 3600
        force_refresh = '--force' in sys.argv
        
        result = cached_fetch(url, prompt, ttl, force_refresh)
        print(result)