#!/usr/bin/env python3
"""
Enhanced Server with Unlimited Scraping Capabilities
Integrates all scraping enhancements into the main server
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
import asyncio
from typing import List, Dict, Any, Optional
import json
from datetime import datetime
import uuid

# Import our scraping enhancements
from scraper_enhancements import (
    UnlimitedScraper,
    ScrapingConfig,
    ProxyConfig,
    create_example_config,
    create_example_proxies
)

# Global scraper instance
unlimited_scraper = None

def initialize_unlimited_scraper():
    """Initialize the unlimited scraper with configuration"""
    global unlimited_scraper
    
    # Create configuration
    config = ScrapingConfig(
        min_delay=1.0,
        max_delay=3.0,
        max_retries=2,
        timeout=20000,
        captcha_service_key=None  # Add your captcha service key
    )
    
    # Create proxy list (add your proxies here)
    proxies = [
        # Example proxy configurations - add real ones for production
        # ProxyConfig("http://proxy1.example.com:8080", "user", "pass"),
        # ProxyConfig("http://proxy2.example.com:8080", "user", "pass"),
    ]
    
    unlimited_scraper = UnlimitedScraper(config, proxies)
    print("✅ Unlimited Scraper initialized")

# Enhanced API endpoints for unlimited scraping
async def enhanced_scrape_single_url(browser, url: str) -> Dict[str, Any]:
    """Enhanced single URL scraping with all features"""
    global unlimited_scraper
    
    if not unlimited_scraper:
        initialize_unlimited_scraper()
    
    try:
        result = await unlimited_scraper.scrape_url(browser, url)
        return result
    except Exception as e:
        return {
            'url': url,
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }

async def enhanced_scrape_multiple_urls(browser, urls: List[str], max_concurrent: int = 2) -> List[Dict[str, Any]]:
    """Enhanced multiple URL scraping"""
    global unlimited_scraper
    
    if not unlimited_scraper:
        initialize_unlimited_scraper()
    
    try:
        results = await unlimited_scraper.scrape_multiple_urls(browser, urls, max_concurrent)
        return results
    except Exception as e:
        return [{
            'url': url,
            'success': False,
            'error': str(e)
        } for url in urls]

# New API endpoints to add to your main server
def add_enhanced_scraping_endpoints(app: FastAPI):
    """Add enhanced scraping endpoints to FastAPI app"""
    
    @app.get("/api/scraper/status")
    async def scraper_status():
        """Get scraper status and configuration"""
        global unlimited_scraper
        
        return {
            "status": "active" if unlimited_scraper else "inactive",
            "features": {
                "proxy_rotation": True,
                "rate_limiting": True,
                "user_agent_rotation": True,
                "captcha_handling": True,
                "enhanced_data_extraction": True
            },
            "timestamp": datetime.now().isoformat()
        }
    
    @app.post("/api/scraper/enhanced/single")
    async def enhanced_scrape_single(url: str):
        """Enhanced scraping of single URL"""
        if not url.startswith(('http://', 'https://')):
            raise HTTPException(status_code=400, detail="Invalid URL format")
        
        # Use the browser instance from your main server
        from server import browser_instance
        
        if not browser_instance:
            raise HTTPException(status_code=503, detail="Browser engine not available")
        
        result = await enhanced_scrape_single_url(browser_instance, url)
        return result
    
    @app.post("/api/scraper/enhanced/multiple")
    async def enhanced_scrape_multiple(urls: List[str], max_concurrent: int = 2):
        """Enhanced scraping of multiple URLs"""
        if not urls:
            raise HTTPException(status_code=400, detail="No URLs provided")
        
        if max_concurrent > 5:
            max_concurrent = 5  # Limit concurrency
        
        # Validate URLs
        for url in urls:
            if not url.startswith(('http://', 'https://')):
                raise HTTPException(status_code=400, detail=f"Invalid URL format: {url}")
        
        from server import browser_instance
        
        if not browser_instance:
            raise HTTPException(status_code=503, detail="Browser engine not available")
        
        results = await enhanced_scrape_multiple_urls(browser_instance, urls, max_concurrent)
        return {
            "results": results,
            "total_urls": len(urls),
            "successful": sum(1 for r in results if r.get('success', False)),
            "failed": sum(1 for r in results if not r.get('success', False)),
            "timestamp": datetime.now().isoformat()
        }
    
    @app.get("/api/scraper/enhanced/extract")
    async def enhanced_extract_data(url: str, extract_type: str = "full"):
        """Enhanced data extraction from URL"""
        if not url.startswith(('http://', 'https://')):
            raise HTTPException(status_code=400, detail="Invalid URL format")
        
        from server import browser_instance
        
        if not browser_instance:
            raise HTTPException(status_code=503, detail="Browser engine not available")
        
        result = await enhanced_scrape_single_url(browser_instance, url)
        
        if extract_type == "titles":
            return {
                "url": url,
                "title": result.get('title'),
                "headings": result.get('headings', [])
            }
        elif extract_type == "links":
            return {
                "url": url,
                "links": result.get('links', [])
            }
        elif extract_type == "images":
            return {
                "url": url,
                "images": result.get('images', [])
            }
        elif extract_type == "text":
            return {
                "url": url,
                "text_content": result.get('text_content', '')
            }
        else:
            return result
    
    @app.get("/api/scraper/enhanced/search")
    async def enhanced_search_scrape(query: str, max_results: int = 10):
        """Enhanced search result scraping"""
        if not query.strip():
            raise HTTPException(status_code=400, detail="Empty search query")
        
        # Create search URLs for multiple search engines
        search_urls = [
            f"https://www.google.com/search?q={query.replace(' ', '+')}",
            f"https://www.bing.com/search?q={query.replace(' ', '+')}",
            f"https://duckduckgo.com/?q={query.replace(' ', '+')}",
        ]
        
        from server import browser_instance
        
        if not browser_instance:
            raise HTTPException(status_code=503, detail="Browser engine not available")
        
        results = await enhanced_scrape_multiple_urls(browser_instance, search_urls[:max_results], 2)
        
        return {
            "query": query,
            "search_engines": len(search_urls),
            "results": results,
            "timestamp": datetime.now().isoformat()
        }

# Configuration endpoints
def add_scraper_config_endpoints(app: FastAPI):
    """Add scraper configuration endpoints"""
    
    @app.post("/api/scraper/config/proxy/add")
    async def add_proxy(server: str, username: Optional[str] = None, password: Optional[str] = None):
        """Add a new proxy to the rotation"""
        global unlimited_scraper
        
        if not unlimited_scraper:
            initialize_unlimited_scraper()
        
        proxy = ProxyConfig(server, username, password)
        unlimited_scraper.proxy_rotator.proxies.append(proxy)
        
        return {
            "status": "success",
            "message": f"Proxy {server} added",
            "total_proxies": len(unlimited_scraper.proxy_rotator.proxies)
        }
    
    @app.get("/api/scraper/config/proxies")
    async def list_proxies():
        """List all configured proxies"""
        global unlimited_scraper
        
        if not unlimited_scraper:
            initialize_unlimited_scraper()
        
        proxies = []
        for i, proxy in enumerate(unlimited_scraper.proxy_rotator.proxies):
            proxies.append({
                "index": i,
                "server": proxy.server,
                "has_auth": bool(proxy.username),
                "failed": i in unlimited_scraper.proxy_rotator.failed_proxies
            })
        
        return {
            "proxies": proxies,
            "total": len(proxies),
            "failed": len(unlimited_scraper.proxy_rotator.failed_proxies)
        }
    
    @app.post("/api/scraper/config/rate-limit")
    async def update_rate_limit(min_delay: float = 2.0, max_delay: float = 8.0):
        """Update rate limiting configuration"""
        global unlimited_scraper
        
        if not unlimited_scraper:
            initialize_unlimited_scraper()
        
        unlimited_scraper.rate_limiter.config.min_delay = min_delay
        unlimited_scraper.rate_limiter.config.max_delay = max_delay
        
        return {
            "status": "success",
            "min_delay": min_delay,
            "max_delay": max_delay
        }

# Example data for testing
EXAMPLE_URLS = [
    "https://httpbin.org/html",
    "https://example.com",
    "https://www.google.com",
]

def add_demo_endpoints(app: FastAPI):
    """Add demo endpoints for testing"""
    
    @app.get("/api/scraper/demo/single")
    async def demo_single():
        """Demo single URL scraping"""
        url = "https://httpbin.org/html"
        
        # Get browser instance from main server globals
        import server
        browser_instance = getattr(server, 'browser_instance', None)
        
        if not browser_instance:
            return {"error": "Browser engine not available"}
            
        result = await enhanced_scrape_single_url(browser_instance, url)
        return result
    
    @app.get("/api/scraper/demo/multiple")
    async def demo_multiple():
        """Demo multiple URL scraping"""
        urls = EXAMPLE_URLS
        
        # Get browser instance from main server globals
        import server
        browser_instance = getattr(server, 'browser_instance', None)
        
        if not browser_instance:
            return {"error": "Browser engine not available"}
            
        results = await enhanced_scrape_multiple_urls(browser_instance, urls, 2)
        return {
            "demo": True,
            "urls_scraped": len(urls),
            "results": results
        }
    
    @app.get("/api/scraper/demo/search")
    async def demo_search():
        """Demo search scraping"""
        query = "web scraping 2025"
        search_urls = [
            f"https://www.google.com/search?q={query.replace(' ', '+')}",
            f"https://duckduckgo.com/?q={query.replace(' ', '+')}"
        ]
        
        # Get browser instance from main server globals
        import server
        browser_instance = getattr(server, 'browser_instance', None)
        
        if not browser_instance:
            return {"error": "Browser engine not available"}
            
        results = await enhanced_scrape_multiple_urls(browser_instance, search_urls, 2)
        
        return {
            "demo": True,
            "query": query,
            "results": results
        }

# Initialize on module import
initialize_unlimited_scraper()

# Export functions to integrate with main server
__all__ = [
    'add_enhanced_scraping_endpoints',
    'add_scraper_config_endpoints', 
    'add_demo_endpoints',
    'enhanced_scrape_single_url',
    'enhanced_scrape_multiple_urls',
    'initialize_unlimited_scraper'
]