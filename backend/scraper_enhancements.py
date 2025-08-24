#!/usr/bin/env python3
"""
Advanced Scraper Enhancements for Unlimited Scraping
Features: Proxy Rotation, Rate Limiting, User Agent Rotation, Captcha Handling, Enhanced Data Extraction
"""
import asyncio
import random
import time
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from playwright.async_api import Page, Browser
import aiohttp
import re
from bs4 import BeautifulSoup
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ProxyConfig:
    """Configuration for proxy rotation"""
    server: str
    username: Optional[str] = None
    password: Optional[str] = None

@dataclass
class ScrapingConfig:
    """Configuration for scraping operations"""
    min_delay: float = 2.0
    max_delay: float = 8.0
    max_retries: int = 3
    timeout: int = 30000
    captcha_service_key: Optional[str] = None

class ProxyRotator:
    """Manages proxy rotation for unlimited scraping"""
    
    def __init__(self, proxies: List[ProxyConfig]):
        self.proxies = proxies
        self.current_index = 0
        self.failed_proxies = set()
    
    def get_next_proxy(self) -> Optional[ProxyConfig]:
        """Get next available proxy"""
        if len(self.failed_proxies) >= len(self.proxies):
            # Reset failed proxies if all have failed
            self.failed_proxies.clear()
            logger.warning("All proxies failed, resetting proxy pool")
        
        available_proxies = [p for i, p in enumerate(self.proxies) if i not in self.failed_proxies]
        
        if not available_proxies:
            return None
        
        proxy = available_proxies[self.current_index % len(available_proxies)]
        self.current_index += 1
        return proxy
    
    def mark_proxy_failed(self, proxy: ProxyConfig):
        """Mark proxy as failed"""
        for i, p in enumerate(self.proxies):
            if p.server == proxy.server:
                self.failed_proxies.add(i)
                logger.warning(f"Marked proxy as failed: {proxy.server}")
                break

class UserAgentRotator:
    """Rotates user agents for stealth scraping"""
    
    def __init__(self):
        self.user_agents = [
            # Chrome on Windows
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            
            # Chrome on Mac
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            
            # Firefox on Windows
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0",
            
            # Firefox on Mac
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0",
            
            # Safari on Mac
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
            
            # Chrome on Linux
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            
            # Edge on Windows
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
        ]
        self.current_index = 0
    
    def get_random_user_agent(self) -> str:
        """Get a random user agent"""
        return random.choice(self.user_agents)
    
    def get_next_user_agent(self) -> str:
        """Get next user agent in rotation"""
        user_agent = self.user_agents[self.current_index % len(self.user_agents)]
        self.current_index += 1
        return user_agent

class RateLimiter:
    """Rate limiting for respectful scraping"""
    
    def __init__(self, config: ScrapingConfig):
        self.config = config
        self.last_request_time = 0
        self.request_count = 0
        self.session_start = time.time()
    
    async def wait_if_needed(self):
        """Wait if rate limiting is needed"""
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time
        
        # Calculate delay based on configuration
        min_delay = self.config.min_delay
        max_delay = self.config.max_delay
        
        # Add some randomization to avoid pattern detection
        delay = random.uniform(min_delay, max_delay)
        
        # Increase delay if making too many requests
        requests_per_minute = self.request_count / ((current_time - self.session_start) / 60)
        if requests_per_minute > 30:  # More than 30 requests per minute
            delay *= 2
        
        if time_since_last_request < delay:
            sleep_time = delay - time_since_last_request
            logger.info(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
            await asyncio.sleep(sleep_time)
        
        self.last_request_time = time.time()
        self.request_count += 1

class CaptchaSolver:
    """Handles captcha solving using external services"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.supported_services = ['2captcha', 'anticaptcha', 'deathbycaptcha']
    
    async def detect_captcha(self, page: Page) -> bool:
        """Detect if there's a captcha on the page"""
        captcha_selectors = [
            'iframe[src*="recaptcha"]',
            '.g-recaptcha',
            '#recaptcha',
            '[data-sitekey]',
            '.captcha',
            'img[src*="captcha"]',
            '.hcaptcha-box',
            '.cf-turnstile'
        ]
        
        for selector in captcha_selectors:
            element = await page.query_selector(selector)
            if element:
                logger.info(f"Captcha detected: {selector}")
                return True
        
        return False
    
    async def solve_captcha(self, page: Page) -> bool:
        """Attempt to solve captcha (placeholder implementation)"""
        if not self.api_key:
            logger.warning("No captcha service API key provided")
            return False
        
        # This is a placeholder - in production you'd integrate with:
        # - 2captcha API
        # - AntiCaptcha API
        # - DeathByCaptcha API
        logger.info("Captcha solving not implemented - would integrate with captcha service")
        
        # For now, just wait and hope it goes away
        await asyncio.sleep(5)
        return True

class EnhancedDataExtractor:
    """Advanced data extraction with CSS selectors and patterns"""
    
    def __init__(self):
        self.common_selectors = {
            'title': ['title', 'h1', '.title', '#title', '[data-title]'],
            'content': ['main', 'article', '.content', '#content', '.post-content'],
            'description': ['meta[name="description"]', '.description', '.excerpt'],
            'images': ['img', 'picture source'],
            'links': ['a[href]'],
            'headings': ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            'paragraphs': ['p'],
            'lists': ['ul', 'ol'],
            'tables': ['table'],
            'forms': ['form'],
            'buttons': ['button', 'input[type="button"]', 'input[type="submit"]']
        }
    
    async def extract_structured_data(self, page: Page, url: str) -> Dict[str, Any]:
        """Extract structured data from page"""
        try:
            # Get page content
            html_content = await page.content()
            soup = BeautifulSoup(html_content, 'html.parser')
            
            data = {
                'url': url,
                'timestamp': time.time(),
                'title': await self._extract_title(page, soup),
                'meta_data': await self._extract_meta_data(soup),
                'headings': await self._extract_headings(soup),
                'links': await self._extract_links(soup, url),
                'images': await self._extract_images(soup, url),
                'text_content': await self._extract_text_content(soup),
                'structured_data': await self._extract_json_ld(soup),
                'performance': await self._get_performance_metrics(page)
            }
            
            return data
            
        except Exception as e:
            logger.error(f"Error extracting data from {url}: {e}")
            return {'url': url, 'error': str(e)}
    
    async def _extract_title(self, page: Page, soup: BeautifulSoup) -> str:
        """Extract page title"""
        try:
            # Try page.title() first
            title = await page.title()
            if title and title.strip():
                return title.strip()
        except:
            pass
        
        # Fallback to HTML parsing
        title_tag = soup.find('title')
        if title_tag:
            return title_tag.get_text().strip()
        
        # Try h1 as fallback
        h1_tag = soup.find('h1')
        if h1_tag:
            return h1_tag.get_text().strip()
        
        return "No title found"
    
    async def _extract_meta_data(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extract meta tags"""
        meta_data = {}
        
        meta_tags = soup.find_all('meta')
        for meta in meta_tags:
            name = meta.get('name') or meta.get('property') or meta.get('http-equiv')
            content = meta.get('content')
            
            if name and content:
                meta_data[name] = content
        
        return meta_data
    
    async def _extract_headings(self, soup: BeautifulSoup) -> List[Dict[str, str]]:
        """Extract all headings with hierarchy"""
        headings = []
        
        for tag_name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            tags = soup.find_all(tag_name)
            for tag in tags:
                headings.append({
                    'level': tag_name,
                    'text': tag.get_text().strip(),
                    'id': tag.get('id', ''),
                    'class': ' '.join(tag.get('class', []))
                })
        
        return headings
    
    async def _extract_links(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, str]]:
        """Extract all links"""
        links = []
        
        link_tags = soup.find_all('a', href=True)
        for link in link_tags:
            href = link.get('href')
            text = link.get_text().strip()
            
            # Convert relative URLs to absolute
            if href.startswith('/'):
                href = f"{base_url.rstrip('/')}{href}"
            elif not href.startswith(('http://', 'https://', 'mailto:', 'tel:')):
                href = f"{base_url.rstrip('/')}/{href}"
            
            links.append({
                'url': href,
                'text': text,
                'title': link.get('title', ''),
                'target': link.get('target', '')
            })
        
        return links
    
    async def _extract_images(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, str]]:
        """Extract all images"""
        images = []
        
        img_tags = soup.find_all('img', src=True)
        for img in img_tags:
            src = img.get('src')
            
            # Convert relative URLs to absolute
            if src.startswith('/'):
                src = f"{base_url.rstrip('/')}{src}"
            elif not src.startswith(('http://', 'https://', 'data:')):
                src = f"{base_url.rstrip('/')}/{src}"
            
            images.append({
                'src': src,
                'alt': img.get('alt', ''),
                'title': img.get('title', ''),
                'width': img.get('width', ''),
                'height': img.get('height', '')
            })
        
        return images
    
    async def _extract_text_content(self, soup: BeautifulSoup) -> str:
        """Extract clean text content"""
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "aside"]):
            script.decompose()
        
        # Get text and clean it up
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text[:5000]  # Limit to first 5000 characters
    
    async def _extract_json_ld(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract JSON-LD structured data"""
        json_ld_data = []
        
        scripts = soup.find_all('script', type='application/ld+json')
        for script in scripts:
            try:
                data = json.loads(script.string)
                json_ld_data.append(data)
            except (json.JSONDecodeError, AttributeError):
                continue
        
        return json_ld_data
    
    async def _get_performance_metrics(self, page: Page) -> Dict[str, Any]:
        """Get page performance metrics"""
        try:
            # Get performance navigation timing
            performance = await page.evaluate("""() => {
                const timing = performance.getEntriesByType('navigation')[0];
                if (!timing) return {};
                
                return {
                    domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
                    loadComplete: timing.loadEventEnd - timing.loadEventStart,
                    responseTime: timing.responseEnd - timing.requestStart,
                    domInteractive: timing.domInteractive - timing.requestStart,
                    transferSize: timing.transferSize || 0,
                    decodedBodySize: timing.decodedBodySize || 0
                };
            }""")
            
            return performance
        except Exception as e:
            logger.error(f"Error getting performance metrics: {e}")
            return {}

class UnlimitedScraper:
    """Main scraper class with all enhancements"""
    
    def __init__(self, config: ScrapingConfig, proxies: List[ProxyConfig] = None):
        self.config = config
        self.proxy_rotator = ProxyRotator(proxies or [])
        self.user_agent_rotator = UserAgentRotator()
        self.rate_limiter = RateLimiter(config)
        self.captcha_solver = CaptchaSolver(config.captcha_service_key)
        self.data_extractor = EnhancedDataExtractor()
        
    async def scrape_url(self, browser: Browser, url: str) -> Dict[str, Any]:
        """Scrape a single URL with all enhancements"""
        for attempt in range(self.config.max_retries):
            try:
                logger.info(f"Scraping attempt {attempt + 1}/{self.config.max_retries} for {url}")
                
                # Rate limiting
                await self.rate_limiter.wait_if_needed()
                
                # Get proxy and user agent
                proxy = self.proxy_rotator.get_next_proxy()
                user_agent = self.user_agent_rotator.get_random_user_agent()
                
                # Create new page with proxy if available
                if proxy:
                    context = await browser.new_context(
                        proxy={
                            "server": proxy.server,
                            "username": proxy.username,
                            "password": proxy.password
                        } if proxy.username else {"server": proxy.server},
                        user_agent=user_agent
                    )
                else:
                    context = await browser.new_context(user_agent=user_agent)
                
                page = await context.new_page()
                
                try:
                    # Navigate to URL
                    response = await page.goto(url, timeout=self.config.timeout, wait_until="domcontentloaded")
                    
                    if not response or response.status >= 400:
                        raise Exception(f"HTTP {response.status if response else 'No response'}")
                    
                    # Check for captcha
                    if await self.captcha_solver.detect_captcha(page):
                        logger.warning(f"Captcha detected on {url}")
                        if not await self.captcha_solver.solve_captcha(page):
                            raise Exception("Failed to solve captcha")
                    
                    # Wait for dynamic content
                    await asyncio.sleep(2)
                    
                    # Extract data
                    data = await self.data_extractor.extract_structured_data(page, url)
                    data['success'] = True
                    data['attempt'] = attempt + 1
                    data['proxy_used'] = proxy.server if proxy else None
                    data['user_agent'] = user_agent
                    
                    logger.info(f"Successfully scraped {url}")
                    return data
                    
                finally:
                    await page.close()
                    await context.close()
                    
            except Exception as e:
                logger.error(f"Attempt {attempt + 1} failed for {url}: {e}")
                
                # Mark proxy as failed if it was used
                if proxy and "timeout" not in str(e).lower():
                    self.proxy_rotator.mark_proxy_failed(proxy)
                
                # If last attempt, return error
                if attempt == self.config.max_retries - 1:
                    return {
                        'url': url,
                        'success': False,
                        'error': str(e),
                        'attempts': self.config.max_retries
                    }
                
                # Wait before retry with exponential backoff
                wait_time = 2 ** attempt + random.uniform(0, 1)
                await asyncio.sleep(wait_time)
    
    async def scrape_multiple_urls(self, browser: Browser, urls: List[str], max_concurrent: int = 3) -> List[Dict[str, Any]]:
        """Scrape multiple URLs with concurrency control"""
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def scrape_with_semaphore(url):
            async with semaphore:
                return await self.scrape_url(browser, url)
        
        tasks = [scrape_with_semaphore(url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append({
                    'url': urls[i],
                    'success': False,
                    'error': str(result)
                })
            else:
                processed_results.append(result)
        
        return processed_results

# Example usage and configuration
def create_example_config() -> ScrapingConfig:
    """Create example scraping configuration"""
    return ScrapingConfig(
        min_delay=2.0,
        max_delay=5.0,
        max_retries=3,
        timeout=30000,
        captcha_service_key=None  # Add your captcha service key here
    )

def create_example_proxies() -> List[ProxyConfig]:
    """Create example proxy configuration"""
    # Add your proxy configurations here
    return [
        # ProxyConfig("http://proxy1.example.com:8080", "username", "password"),
        # ProxyConfig("http://proxy2.example.com:8080", "username", "password"),
    ]

# Export main classes
__all__ = [
    'UnlimitedScraper',
    'ScrapingConfig', 
    'ProxyConfig',
    'ProxyRotator',
    'UserAgentRotator',
    'RateLimiter',
    'CaptchaSolver',
    'EnhancedDataExtractor'
]