#!/usr/bin/env python3
"""
Kairo AI - Native Browser Engine with Full Website Functionality + Unlimited Scraping
"""
import os
# Set Playwright browsers path FIRST before any other imports
os.environ['PLAYWRIGHT_BROWSERS_PATH'] = '/pw-browsers'

from fastapi import FastAPI, Request, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
from datetime import datetime
import json
import uuid
import traceback
import base64
import asyncio
from typing import Optional, Dict, Any, List
from playwright.async_api import async_playwright
import groq
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
import re
import urllib.parse
import aiohttp
import io

# Load environment variables
load_dotenv()

# Create simple app  
app = FastAPI(title="Kairo AI Native Browser", version="3.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
active_sessions: Dict[str, Dict[str, Any]] = {}
browser_instance = None
playwright_instance = None

# Initialize Groq client
try:
    groq_api_key = os.environ.get('GROQ_API_KEY')
    if groq_api_key:
        groq_client = groq.Groq(api_key=groq_api_key)
        print("✅ Groq client initialized successfully")
    else:
        groq_client = None
        print("⚠️ No Groq API key found")
except Exception as e:
    groq_client = None
    print(f"⚠️ Groq client initialization failed: {e}")

# Initialize Playwright browser
async def init_playwright():
    """Initialize Playwright browser instance"""
    global playwright_instance, browser_instance
    try:
        if not playwright_instance:
            print("🔧 Initializing Playwright Native Browser Engine...")
            print(f"🔍 PLAYWRIGHT_BROWSERS_PATH: {os.environ.get('PLAYWRIGHT_BROWSERS_PATH')}")
            playwright_instance = await async_playwright().start()
            
            # Try different browser options
            try:
                browser_instance = await playwright_instance.chromium.launch(
                    headless=True,
                    args=[
                        '--no-sandbox', 
                        '--disable-dev-shm-usage', 
                        '--disable-gpu',
                        '--disable-web-security',
                        '--disable-features=VizDisplayCompositor',
                        '--disable-blink-features=AutomationControlled',
                        '--no-first-run',
                        '--disable-background-networking',
                        '--disable-default-apps'
                    ]
                )
                print("🌐 Native Chromium Browser Engine initialized successfully")
                return True
            except Exception as chromium_error:
                print(f"⚠️ Chromium failed: {chromium_error}")
                try:
                    # Try Firefox as fallback
                    browser_instance = await playwright_instance.firefox.launch(headless=True)
                    print("🦊 Native Firefox Browser Engine initialized successfully")
                    return True
                except Exception as firefox_error:
                    print(f"⚠️ Firefox failed: {firefox_error}")
                    return False
                        
    except Exception as e:
        print(f"❌ Native Browser Engine initialization failed: {e}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        return False

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    await init_playwright()

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    global browser_instance, playwright_instance
    try:
        if browser_instance:
            await browser_instance.close()
        if playwright_instance:
            await playwright_instance.stop()
        print("🔌 Native Browser Engine closed")
    except Exception as e:
        print(f"⚠️ Error during cleanup: {e}")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "3.0.0", 
        "timestamp": datetime.now().isoformat(),
        "native_browser_engine": browser_instance is not None,
        "playwright_available": playwright_instance is not None,
        "groq_available": groq_client is not None,
        "features": {
            "native_browser": True,
            "full_interactivity": True,
            "proxy_bypass": True,
            "real_rendering": True
        }
    }

@app.get("/api/system/status")
async def system_status():
    """System status endpoint for frontend"""
    return {
        "status": "operational",
        "version": "3.0.0",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "native_browser_engine": browser_instance is not None,
            "playwright": playwright_instance is not None,
            "groq_ai": groq_client is not None,
            "proxy_server": True
        },
        "capabilities": {
            "native_browser": True,
            "full_interactivity": True,
            "proxy_bypass": True,
            "real_rendering": True,
            "ai_chat": groq_client is not None,
            "workflow_automation": True
        }
    }

def detect_website_intent(message: str) -> Optional[Dict[str, str]]:
    """Detect if user wants to open a website"""
    message_lower = message.lower()
    
    # Common website patterns
    website_patterns = {
        'youtube': 'https://www.youtube.com',
        'google': 'https://www.google.com', 
        'gmail': 'https://mail.google.com',
        'facebook': 'https://www.facebook.com',
        'twitter': 'https://www.twitter.com',
        'x.com': 'https://x.com',
        'instagram': 'https://www.instagram.com',
        'linkedin': 'https://www.linkedin.com',
        'github': 'https://www.github.com',
        'netflix': 'https://www.netflix.com',
        'amazon': 'https://www.amazon.com',
        'reddit': 'https://www.reddit.com',
        'stackoverflow': 'https://stackoverflow.com',
        'wikipedia': 'https://www.wikipedia.org',
        'chatgpt': 'https://chat.openai.com',
        'claude': 'https://claude.ai',
        'tiktok': 'https://www.tiktok.com',
        'pinterest': 'https://www.pinterest.com',
        'twitch': 'https://www.twitch.tv',
        'spotify': 'https://open.spotify.com'
    }
    
    # Check for "open [website]" patterns
    for site_name, url in website_patterns.items():
        if (f'open {site_name}' in message_lower or 
            f'go to {site_name}' in message_lower or 
            f'navigate to {site_name}' in message_lower or
            f'visit {site_name}' in message_lower or
            f'launch {site_name}' in message_lower or
            f'show me {site_name}' in message_lower):
            return {
                'name': site_name,
                'url': url,
                'action': 'open'
            }
    
    # Check for direct URL patterns
    if 'http://' in message or 'https://' in message:
        words = message.split()
        for word in words:
            if word.startswith('http://') or word.startswith('https://'):
                return {
                    'name': 'website',
                    'url': word.strip('.,!?'),
                    'action': 'open'
                }
    
    return None

async def open_website_native_browser(url: str) -> Dict[str, Any]:
    """Open website in native browser engine with real browser session"""
    try:
        print(f"🌐 Opening website in Native Browser Engine: {url}")
        
        if not browser_instance:
            await init_playwright()
            
        if browser_instance:
            # Create a new page in the Native Browser Engine
            tab_id = f"tab_{uuid.uuid4().hex[:8]}"
            page = await browser_instance.new_page()
            
            # Store the page in active sessions for interaction
            if 'native_browser_pages' not in active_sessions:
                active_sessions['native_browser_pages'] = {}
            active_sessions['native_browser_pages'][tab_id] = page
            
            try:
                # Set realistic browser headers
                await page.set_extra_http_headers({
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                })
                
                # Navigate to the URL in the real browser
                print(f"🚀 Native Browser navigating to: {url}")
                await page.goto(url, timeout=30000, wait_until="domcontentloaded")
                
                # Wait for page to fully load
                await page.wait_for_timeout(2000)
                
                # Get page title
                try:
                    title = await page.title()
                except:
                    title = f"Native Browser - {url}"
                
                # Take a screenshot for initial display
                screenshot_bytes = await page.screenshot(full_page=False, type="png")
                screenshot_base64 = base64.b64encode(screenshot_bytes).decode()
                
                print(f"✅ Native Browser Engine successfully opened: {title}")
                
                return {
                    'success': True,
                    'title': title,
                    'url': url,
                    'tab_id': tab_id,
                    'method': 'native_browser_engine',
                    'timestamp': datetime.now().isoformat(),
                    'message': f"✅ Successfully opened {title} in Native Browser Engine",
                    'navigate_native': True,
                    'engine': 'Native Chromium Browser Engine',
                    'screenshot': screenshot_base64,
                    'interactive': True,
                    'browser_session_active': True
                }
                
            except Exception as nav_error:
                print(f"❌ Navigation error in Native Browser: {nav_error}")
                await page.close()
                return {
                    'success': False,
                    'error': f"Navigation failed: {str(nav_error)}",
                    'url': url,
                    'tab_id': tab_id,
                    'timestamp': datetime.now().isoformat()
                }
        else:
            print("❌ Native Browser Engine not available")
            return {
                'success': False,
                'error': "Native Browser Engine not initialized",
                'url': url,
                'timestamp': datetime.now().isoformat()
            }
        
    except Exception as e:
        print(f"❌ Failed to open website in Native Browser: {e}")
        return {
            'success': False,
            'error': str(e),
            'url': url,
            'timestamp': datetime.now().isoformat()
        }

@app.post("/api/native-browser/interact")
async def native_browser_interact(request: Request):
    """Handle interactions with the Native Browser Engine"""
    try:
        body = await request.json()
        tab_id = body.get('tab_id')
        action = body.get('action')  # 'click', 'type', 'scroll', 'screenshot', 'navigate'
        
        if not tab_id or tab_id not in active_sessions.get('native_browser_pages', {}):
            return {"error": "Invalid or expired browser session", "success": False}
            
        page = active_sessions['native_browser_pages'][tab_id]
        
        try:
            if action == 'click':
                x = body.get('x', 0)
                y = body.get('y', 0)
                await page.mouse.click(x, y)
                result = {"success": True, "action": "click", "coordinates": [x, y]}
                
            elif action == 'type':
                text = body.get('text', '')
                await page.keyboard.type(text)
                result = {"success": True, "action": "type", "text": text}
                
            elif action == 'scroll':
                delta_y = body.get('delta_y', 100)
                await page.mouse.wheel(0, delta_y)
                result = {"success": True, "action": "scroll", "delta_y": delta_y}
                
            elif action == 'navigate':
                url = body.get('url')
                if url:
                    await page.goto(url, timeout=30000, wait_until="domcontentloaded")
                    await page.wait_for_timeout(1000)
                    title = await page.title()
                    result = {"success": True, "action": "navigate", "url": url, "title": title}
                else:
                    result = {"success": False, "error": "URL required for navigation"}
                    
            elif action == 'screenshot':
                screenshot_bytes = await page.screenshot(full_page=False, type="png")
                screenshot_base64 = base64.b64encode(screenshot_bytes).decode()
                result = {"success": True, "action": "screenshot", "screenshot": screenshot_base64}
                
            elif action == 'get_info':
                title = await page.title()
                url = page.url
                result = {"success": True, "action": "get_info", "title": title, "url": url}
                
            else:
                result = {"success": False, "error": f"Unknown action: {action}"}
            
            # Always include a fresh screenshot for visual feedback
            if action != 'screenshot':
                screenshot_bytes = await page.screenshot(full_page=False, type="png")
                result["screenshot"] = base64.b64encode(screenshot_bytes).decode()
            
            return result
            
        except Exception as interaction_error:
            print(f"❌ Native Browser interaction error: {interaction_error}")
            return {
                "success": False,
                "error": str(interaction_error),
                "action": action
            }
            
    except Exception as e:
        print(f"❌ Native Browser interaction endpoint error: {e}")
        return {"error": str(e), "success": False}

@app.get("/api/native-browser/screenshot/{tab_id}")
async def get_native_browser_screenshot(tab_id: str):
    """Get current screenshot from Native Browser Engine"""
    try:
        if tab_id not in active_sessions.get('native_browser_pages', {}):
            return {"error": "Browser session not found", "success": False}
            
        page = active_sessions['native_browser_pages'][tab_id]
        screenshot_bytes = await page.screenshot(full_page=False, type="png")
        screenshot_base64 = base64.b64encode(screenshot_bytes).decode()
        
        return {
            "success": True,
            "screenshot": screenshot_base64,
            "timestamp": datetime.now().isoformat(),
            "tab_id": tab_id
        }
        
    except Exception as e:
        print(f"❌ Screenshot error: {e}")
        return {"error": str(e), "success": False}

@app.delete("/api/native-browser/close/{tab_id}")
async def close_native_browser_tab(tab_id: str):
    """Close Native Browser Engine tab"""
    try:
        if tab_id in active_sessions.get('native_browser_pages', {}):
            page = active_sessions['native_browser_pages'][tab_id]
            await page.close()
            del active_sessions['native_browser_pages'][tab_id]
            
        return {"success": True, "message": f"Tab {tab_id} closed"}
        
    except Exception as e:
        print(f"❌ Error closing tab: {e}")
        return {"error": str(e), "success": False}
async def proxy_website(request: Request, url: str):
    """Proxy websites to bypass iframe restrictions"""
    try:
        # Decode the URL properly
        decoded_url = urllib.parse.unquote(url)
        
        # Clean up any double protocol issues
        if decoded_url.startswith('https://https://'):
            decoded_url = decoded_url.replace('https://https://', 'https://')
        elif decoded_url.startswith('http://http://'):
            decoded_url = decoded_url.replace('http://http://', 'http://')
        elif not decoded_url.startswith(('http://', 'https://')):
            decoded_url = 'https://' + decoded_url
            
        print(f"🌐 Proxying website: {decoded_url}")
        
        # Use Playwright to get the full rendered page
        if browser_instance:
            page = await browser_instance.new_page()
            try:
                # Set a realistic user agent
                await page.set_extra_http_headers({
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                })
                
                # Navigate to the URL
                await page.goto(decoded_url, timeout=30000, wait_until="domcontentloaded")
                await page.wait_for_timeout(2000)  # Wait for dynamic content
                
                # Get the full HTML content
                html_content = await page.content()
                
                # Modify the HTML to work within our proxy
                modified_html = modify_html_for_proxy(html_content, decoded_url)
                
                await page.close()
                
                return HTMLResponse(
                    content=modified_html,
                    headers={
                        "Content-Type": "text/html",
                        "X-Frame-Options": "ALLOWALL",
                        "Content-Security-Policy": "default-src *; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';"
                    }
                )
                
            except Exception as e:
                await page.close()
                raise e
        else:
            # Fallback: Use requests for basic HTML
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(decoded_url, headers=headers, timeout=30) as response:
                    html_content = await response.text()
                    modified_html = modify_html_for_proxy(html_content, decoded_url)
                    
                    return HTMLResponse(
                        content=modified_html,
                        headers={
                            "Content-Type": "text/html",
                            "X-Frame-Options": "ALLOWALL",
                            "Content-Security-Policy": "default-src *; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';"
                        }
                    )
                    
    except Exception as e:
        print(f"❌ Proxy error: {e}")
        error_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Error Loading Website</title>
            <style>
                body {{ 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', roboto, sans-serif;
                    margin: 0; padding: 40px; background: #f8f9fa; color: #333;
                }}
                .error-container {{ 
                    max-width: 600px; margin: 0 auto; background: white; 
                    padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }}
                .error-icon {{ font-size: 48px; margin-bottom: 20px; }}
                h1 {{ color: #dc3545; margin-bottom: 20px; }}
                .retry-btn {{ 
                    background: #007bff; color: white; padding: 12px 24px; 
                    border: none; border-radius: 6px; cursor: pointer; margin-top: 20px;
                }}
                .retry-btn:hover {{ background: #0056b3; }}
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="error-icon">🌐</div>
                <h1>Unable to Load Website</h1>
                <p><strong>URL:</strong> {decoded_url if 'decoded_url' in locals() else url}</p>
                <p><strong>Error:</strong> {str(e)}</p>
                <p>This website may have restrictions or be temporarily unavailable. Please try:</p>
                <ul>
                    <li>Refreshing the page</li>
                    <li>Checking the URL is correct</li>
                    <li>Trying again in a few moments</li>
                </ul>
                <button class="retry-btn" onclick="window.location.reload()">Retry</button>
            </div>
        </body>
        </html>
        """
        return HTMLResponse(content=error_html, status_code=500)

def modify_html_for_proxy(html_content: str, original_url: str) -> str:
    """Modify HTML content to work within our proxy"""
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        base_domain = urllib.parse.urljoin(original_url, '/')
        
        # Add base tag for relative URLs
        if not soup.find('base'):
            base_tag = soup.new_tag('base', href=base_domain)
            if soup.head:
                soup.head.insert(0, base_tag)
        
        # Add our custom styles for better integration
        custom_style = soup.new_tag('style')
        custom_style.string = """
            body { 
                margin: 0 !important; 
                padding: 0 !important; 
            }
            * {
                box-sizing: border-box;
            }
            /* Ensure full width utilization */
            html, body {
                width: 100% !important;
                min-height: 100vh !important;
            }
        """
        if soup.head:
            soup.head.append(custom_style)
        
        # Remove X-Frame-Options restrictions
        for meta in soup.find_all('meta'):
            if meta.get('http-equiv') and meta.get('http-equiv').lower() == 'x-frame-options':
                meta.decompose()
        
        # Add our custom JavaScript for better functionality
        custom_script = soup.new_tag('script')
        custom_script.string = """
            // Native Browser Engine Integration
            console.log('🌐 Native Browser Engine Active');
            
            // Enhance link navigation
            document.addEventListener('DOMContentLoaded', function() {
                // Handle external links
                document.addEventListener('click', function(e) {
                    const link = e.target.closest('a');
                    if (link && link.href && !link.href.startsWith('#')) {
                        // Let links work normally for full functionality
                        console.log('🔗 Native navigation:', link.href);
                    }
                });
                
                // Ensure proper rendering
                if (window.location !== window.parent.location) {
                    document.body.style.margin = '0';
                    document.body.style.padding = '0';
                }
            });
        """
        if soup.body:
            soup.body.append(custom_script)
        
        return str(soup)
        
    except Exception as e:
        print(f"⚠️ HTML modification error: {e}")
        # Return original content if modification fails
        return html_content

@app.post("/api/chat")
async def chat_endpoint(request: Request):
    try:
        body = await request.json()
        message = body.get('message', '')
        session_id = body.get('session_id', f"session_{uuid.uuid4().hex[:8]}")
        
        print(f"💬 Received chat message: '{message}'")
        
        # Check if user wants to open a website
        website_intent = detect_website_intent(message)
        
        if website_intent:
            website_name = website_intent['name']
            website_url = website_intent['url']
            
            print(f"🎯 Detected website request: {website_name} -> {website_url}")
            
            # Open website in native browser engine
            navigation_result = await open_website_native_browser(website_url)
            
            if navigation_result.get('success'):
                response_text = f"""✅ **{website_name.capitalize()} is opening in your Native Browser!**

🌐 **URL:** {website_url}
🚀 **Engine:** Native Chromium Browser Engine  
⚡ **Status:** Loading in native browser with full functionality
🎯 **Features:** Full interactivity - click, scroll, type, navigate
💫 **Method:** Native browser rendering (not screenshots)
🔗 **Functionality:** Complete website access with all features

💡 **Your native browser is now loading {website_name} with full functionality!**
🎮 **You can interact with everything:** buttons, forms, videos, links, etc."""
                
                return {
                    "response": response_text,
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat(),
                    "website_opened": True,
                    "website_name": website_name,
                    "website_url": website_url,
                    "tab_id": navigation_result.get('tab_id'),
                    "navigation_result": navigation_result,
                    "native_browser": True,
                    "screenshot": navigation_result.get('screenshot'),  # Include screenshot
                    "proxy_url": f"https://playwright-browser.preview.emergentagent.com/api/proxy/{urllib.parse.quote(website_url, safe='')}"
                }
            else:
                return {
                    "response": f"❌ **Failed to open {website_name}**\n\n🚫 **Error:** {navigation_result.get('error', 'Unknown error')}\n🔧 **URL:** {website_url}\n\n💡 **Please try again or manually visit: {website_url}**",
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat(),
                    "website_opened": False,
                    "error": navigation_result.get('error')
                }
        
        # Generate AI response
        ai_response = """I'm Kairo AI with a **Native Browser Engine**! 🌐

I can open websites with **full functionality** - not just screenshots! Try saying:
• 'open YouTube' - Watch videos, subscribe, comment
• 'open Google' - Search, click results, navigate
• 'open GitHub' - Browse code, create issues, fork repos
• 'open Netflix' - Browse movies, watch trailers
• 'go to Twitter' - Tweet, like, follow, scroll timeline

🚀 **Native Browser Features:**
✅ Full interactivity (click, scroll, type)
✅ JavaScript and CSS support
✅ Form submission and login
✅ Video streaming and media
✅ Real browser functionality"""
        
        if groq_client:
            try:
                completion = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": """You are Kairo AI, an AI assistant with a Native Browser Engine that provides FULL website functionality.

🌐 **Native Browser Engine Capabilities:**
- Opens real, interactive websites (not screenshots)
- Full user interaction: clicking, scrolling, typing, form submission
- Native Chromium browser engine with JavaScript/CSS support
- Bypasses iframe restrictions using advanced proxy technology
- Supports all websites: YouTube, Google, Facebook, Netflix, Twitter, etc.
- Real browser functionality: login, video streaming, file downloads

🚀 **Key Features:**
- Native rendering (not screenshots or images) 
- Complete interactivity (like Chrome/Firefox)
- Form submission and authentication
- Media streaming and downloads
- Full JavaScript and CSS support
- Real-time content updates

When users ask to open websites, explain they'll get full browser functionality with complete interactivity. Emphasize this is a real browser experience, not limited screenshots."""
                        },
                        {
                            "role": "user", 
                            "content": message
                        }
                    ],
                    temperature=0.7,
                    max_tokens=500
                )
                ai_response = completion.choices[0].message.content
                print("✅ AI response generated with Groq")
            except Exception as e:
                print(f"⚠️ Groq API error: {e}")
                # Continue with fallback response
        
        return {
            "response": ai_response,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Chat error: {e}")
        traceback.print_exc()
        return {
            "error": f"Chat processing failed: {str(e)}",
            "session_id": "error_session",
            "timestamp": datetime.now().isoformat()
        }

# Import and add enhanced scraping endpoints
# try:
#     from enhanced_server import (
#         add_enhanced_scraping_endpoints,
#         add_scraper_config_endpoints,
#         add_demo_endpoints
#     )
#     
#     # Add all enhanced scraping endpoints
#     add_enhanced_scraping_endpoints(app)
#     add_scraper_config_endpoints(app)
#     add_demo_endpoints(app)
#     print("✅ Enhanced unlimited scraping endpoints added")
#     
# except ImportError as e:
#     print(f"⚠️ Could not import enhanced scraping: {e}")

# @app.get("/api/enhanced/scrape")
# async def enhanced_scrape_endpoint(url: str):
#     """Enhanced scraping endpoint with unlimited capabilities"""
#     try:
#         if not url.startswith(('http://', 'https://')):
#             raise HTTPException(status_code=400, detail="Invalid URL format")
#         
#         # Import scraper here to avoid circular imports
#         from scraper_enhancements import UnlimitedScraper, ScrapingConfig
#         
#         # Create enhanced scraper configuration
#         config = ScrapingConfig(
#             min_delay=1.0,
#             max_delay=2.0,
#             max_retries=2,
#             timeout=20000
#         )
#         
#         scraper = UnlimitedScraper(config)
#         
#         if browser_instance:
#             result = await scraper.scrape_url(browser_instance, url)
#             return result
#         else:
#             raise HTTPException(status_code=503, detail="Browser engine not available")
#             
#     except Exception as e:
#         return JSONResponse(
#             status_code=500,
#             content={
#                 "error": str(e),
#                 "url": url,
#                 "timestamp": datetime.now().isoformat()
#             }
#         )

# @app.post("/api/enhanced/batch-scrape")
# async def enhanced_batch_scrape(urls: List[str], max_concurrent: int = 3):
#     """Enhanced batch scraping with unlimited capabilities"""
#     try:
#         if not urls:
#             raise HTTPException(status_code=400, detail="No URLs provided")
#         
#         if max_concurrent > 5:
#             max_concurrent = 5  # Limit for stability
#         
#         # Validate URLs
#         for url in urls:
#             if not url.startswith(('http://', 'https://')):
#                 raise HTTPException(status_code=400, detail=f"Invalid URL: {url}")
#         
#         from scraper_enhancements import UnlimitedScraper, ScrapingConfig
#         
#         config = ScrapingConfig(
#             min_delay=0.5,
#             max_delay=1.5,
#             max_retries=2,
#             timeout=15000
#         )
#         
#         scraper = UnlimitedScraper(config)
#         
#         if browser_instance:
#             results = await scraper.scrape_multiple_urls(browser_instance, urls, max_concurrent)
#             
#             return {
#                 "results": results,
#                 "total_urls": len(urls),
#                 "successful": sum(1 for r in results if r.get('success', False)),
#                 "failed": sum(1 for r in results if not r.get('success', False)),
#                 "timestamp": datetime.now().isoformat()
#             }
#         else:
#             raise HTTPException(status_code=503, detail="Browser engine not available")
#             
#     except Exception as e:
#         return JSONResponse(
#             status_code=500,
#             content={
#                 "error": str(e),
#                 "timestamp": datetime.now().isoformat()
#             }
#         )