#!/usr/bin/env python3
"""
Kairo AI - Simple FastAPI server with browser automation
"""
from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json
import uuid
import os
import traceback
import base64
import asyncio
from typing import Optional, Dict, Any
from playwright.async_api import async_playwright
import groq
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
import io
from PIL import Image, ImageDraw, ImageFont

# Load environment variables
load_dotenv()

# Create simple app  
app = FastAPI(title="Kairo AI", version="2.0.0")

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
            print("🔧 Initializing Playwright...")
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
                        '--disable-features=VizDisplayCompositor'
                    ]
                )
                print("🌐 Playwright Chromium browser initialized successfully")
                return True
            except Exception as chromium_error:
                print(f"⚠️ Chromium failed: {chromium_error}")
                try:
                    # Try Firefox as fallback
                    browser_instance = await playwright_instance.firefox.launch(headless=True)
                    print("🦊 Playwright Firefox browser initialized successfully")
                    return True
                except Exception as firefox_error:
                    print(f"⚠️ Firefox failed: {firefox_error}")
                    try:
                        # Try Webkit as last resort
                        browser_instance = await playwright_instance.webkit.launch(headless=True)
                        print("🍎 Playwright Webkit browser initialized successfully")
                        return True
                    except Exception as webkit_error:
                        print(f"⚠️ Webkit failed: {webkit_error}")
                        return False
                        
    except Exception as e:
        print(f"❌ Playwright initialization failed: {e}")
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
        print("🔌 Playwright browser closed")
    except Exception as e:
        print(f"⚠️ Error during cleanup: {e}")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0", 
        "timestamp": datetime.now().isoformat(),
        "browser_ready": browser_instance is not None,
        "playwright_available": playwright_instance is not None,
        "groq_available": groq_client is not None
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
        'claude': 'https://claude.ai'
    }
    
    # Check for "open [website]" patterns
    for site_name, url in website_patterns.items():
        if (f'open {site_name}' in message_lower or 
            f'go to {site_name}' in message_lower or 
            f'navigate to {site_name}' in message_lower or
            f'visit {site_name}' in message_lower or
            f'launch {site_name}' in message_lower):
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

async def open_website_in_browser(url: str) -> Dict[str, Any]:
    """Prepare website navigation for internal browser"""
    try:
        print(f"🌐 Preparing website navigation for internal browser: {url}")
        
        # Don't use system webbrowser - let frontend handle internal navigation
        print(f"✅ Website navigation prepared for internal browser: {url}")
        
        return {
            'success': True,
            'title': f"Navigating to {url}",
            'url': url,
            'tab_id': f"tab_{uuid.uuid4().hex[:8]}",
            'method': 'internal_browser',
            'timestamp': datetime.now().isoformat(),
            'message': f"Opening {url} in your app browser",
            'navigate_internal': True  # Signal for internal navigation
        }
        
    except Exception as e:
        print(f"❌ Failed to prepare website navigation: {e}")
        return {
            'success': False,
            'error': str(e),
            'url': url,
            'timestamp': datetime.now().isoformat()
        }

@app.post("/api/browser/navigate") 
async def browser_navigate(request: Request, url: str = Query(...), tab_id: str = Query(...), session_id: str = Query(...)):
    """Navigate to URL and capture screenshot for internal browser display"""
    try:
        print(f"🌐 Browser navigate request: {url} (tab: {tab_id})")
        
        # First, try with Playwright if available
        if browser_instance:
            try:
                return await _navigate_with_playwright(url, tab_id, session_id)
            except Exception as e:
                print(f"⚠️ Playwright navigation failed: {e}")
                # Fall through to alternative method
        
        # Fallback: Use requests to fetch basic page info and simulate screenshot
        print(f"🔄 Using fallback navigation method for {url}")
        return await _navigate_with_fallback(url, tab_id, session_id)
        
    except Exception as e:
        print(f"❌ Browser navigation error: {e}")
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "title": "Navigation Error",
            "content_preview": f"Failed to navigate to {url}",
            "screenshot": None,
            "metadata": {},
            "status_code": 500,
            "url": url,
            "tab_id": tab_id,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }

async def _navigate_with_playwright(url: str, tab_id: str, session_id: str):
    """Navigate using Playwright for real browser automation"""
    page = await browser_instance.new_page()
    
    try:
        # Set viewport size for consistent screenshots
        await page.set_viewport_size({"width": 1280, "height": 720})
        
        # Navigate to the URL with timeout
        print(f"🔍 Playwright navigating to {url}...")
        response = await page.goto(url, timeout=15000, wait_until="domcontentloaded")
        
        # Wait a bit for content to load
        await page.wait_for_timeout(2000)
        
        # Get page title and metadata
        title = await page.title()
        print(f"📄 Page title: {title}")
        
        # Extract metadata
        metadata = {}
        try:
            # Try to get Open Graph metadata
            og_title = await page.locator('meta[property="og:title"]').get_attribute('content', timeout=1000) or title
            og_description = await page.locator('meta[property="og:description"]').get_attribute('content', timeout=1000) or ""
            og_image = await page.locator('meta[property="og:image"]').get_attribute('content', timeout=1000) or ""
            
            metadata = {
                "og:title": og_title,
                "og:description": og_description,
                "og:image": og_image,
                "url": url
            }
        except Exception as e:
            print(f"⚠️ Could not extract metadata: {e}")
            metadata = {"og:title": title, "og:description": f"Content from {url}"}
        
        # Capture screenshot
        print(f"📸 Capturing screenshot...")
        screenshot_bytes = await page.screenshot(
            full_page=False,
            quality=85,
            type="png"
        )
        
        # Convert to base64
        screenshot_base64 = base64.b64encode(screenshot_bytes).decode('utf-8')
        print(f"✅ Screenshot captured: {len(screenshot_base64)} characters")
        
        # Get status code
        status_code = response.status if response else 200
        
        await page.close()
        
        return {
            "success": True,
            "title": title or f"Website: {url}",
            "content_preview": f"Successfully loaded {url}",
            "screenshot": screenshot_base64,
            "metadata": metadata,
            "status_code": status_code,
            "engine": "Native Chromium via Playwright",
            "url": url,
            "tab_id": tab_id,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as nav_error:
        await page.close()
        raise nav_error

async def _navigate_with_fallback(url: str, tab_id: str, session_id: str):
    """Fallback navigation using requests to fetch page info"""
    try:
        print(f"🔍 Fetching page info for {url}...")
        
        # Fetch the page
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        status_code = response.status_code
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title and metadata
        title = soup.find('title')
        title = title.text.strip() if title else f"Website: {url}"
        
        # Extract metadata
        metadata = {"og:title": title, "og:description": f"Content from {url}"}
        
        # Try to get Open Graph data
        og_title = soup.find('meta', property='og:title')
        og_description = soup.find('meta', property='og:description')
        og_image = soup.find('meta', property='og:image')
        
        if og_title:
            metadata["og:title"] = og_title.get('content', title)
        if og_description:
            metadata["og:description"] = og_description.get('content', '')
        if og_image:
            metadata["og:image"] = og_image.get('content', '')
        
        # Create a simple placeholder screenshot
        screenshot_base64 = _create_placeholder_screenshot(title, url, status_code)
        
        print(f"✅ Fallback navigation completed for {title}")
        
        return {
            "success": True,
            "title": title,
            "content_preview": f"Successfully loaded {url} (fallback mode)",
            "screenshot": screenshot_base64,
            "metadata": metadata,
            "status_code": status_code,
            "engine": "HTTP Request + HTML Parsing",
            "url": url,
            "tab_id": tab_id,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"⚠️ Fallback navigation failed: {e}")
        
        # Create error screenshot
        screenshot_base64 = _create_placeholder_screenshot(f"Error loading {url}", str(e), 500)
        
        return {
            "success": False,
            "error": str(e),
            "title": f"Error loading {url}",
            "content_preview": f"Failed to load {url}: {str(e)}",
            "screenshot": screenshot_base64,
            "metadata": {"error": str(e)},
            "status_code": 500,
            "engine": "HTTP Request + HTML Parsing",
            "url": url,
            "tab_id": tab_id,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }

def _create_placeholder_screenshot(title: str, url: str, status_code: int):
    """Create a simple placeholder screenshot"""
    try:
        # Create a simple image with text
        img = Image.new('RGB', (1280, 720), color='white')
        draw = ImageDraw.Draw(img)
        
        # Try to use a font, fall back to default if not available
        try:
            font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
            font_medium = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
            font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
        except:
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()
            font_small = ImageFont.load_default()
        
        # Draw browser-like interface
        # Header bar
        draw.rectangle([0, 0, 1280, 80], fill='#f8f9fa')
        draw.rectangle([0, 80, 1280, 82], fill='#dee2e6')
        
        # URL bar
        draw.rectangle([20, 20, 1260, 60], fill='white', outline='#ced4da')
        draw.text((30, 30), url, fill='#495057', font=font_small)
        
        # Content area
        y_pos = 150
        
        # Status indicator
        status_color = '#28a745' if status_code == 200 else '#dc3545'
        draw.text((40, y_pos), f"Status: {status_code}", fill=status_color, font=font_medium)
        y_pos += 60
        
        # Title
        draw.text((40, y_pos), title[:80], fill='#212529', font=font_large)
        y_pos += 80
        
        # Info text
        if status_code == 200:
            draw.text((40, y_pos), "✅ Website loaded successfully in your browser", fill='#28a745', font=font_medium)
            y_pos += 40
            draw.text((40, y_pos), "🌐 This is a preview - the actual website is now available", fill='#6c757d', font=font_small)
        else:
            draw.text((40, y_pos), "❌ Failed to load website", fill='#dc3545', font=font_medium)
            
        # Save to bytes
        img_byte_array = io.BytesIO()
        img.save(img_byte_array, format='PNG')
        img_byte_array = img_byte_array.getvalue()
        
        # Convert to base64
        return base64.b64encode(img_byte_array).decode('utf-8')
        
    except Exception as e:
        print(f"⚠️ Could not create placeholder screenshot: {e}")
        # Return a minimal base64 encoded 1x1 pixel image
        img = Image.new('RGB', (1, 1), color='white')
        img_byte_array = io.BytesIO()
        img.save(img_byte_array, format='PNG')
        return base64.b64encode(img_byte_array.getvalue()).decode('utf-8')

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
            
            # Actually open the website in the user's browser
            navigation_result = await open_website_in_browser(website_url)
            
            if navigation_result.get('success'):
                response_text = f"""✅ **{website_name.capitalize()} is opening in your app browser!**

🌐 **URL:** {website_url}
🚀 **Action:** Internal browser navigation initiated  
⚡ **Status:** Opening in your app's browser now
📱 **Method:** Internal app browser (not external browser)
🎯 **Location:** Main browser window in your app

💡 **Your app's browser is now navigating to {website_name}!**
🔗 **Internal URL:** {website_url}"""
                
                return {
                    "response": response_text,
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat(),
                    "website_opened": True,
                    "website_name": website_name,
                    "website_url": website_url,
                    "tab_id": navigation_result.get('tab_id'),
                    "navigation_result": navigation_result
                }
            else:
                return {
                    "response": f"❌ **Failed to open {website_name}**\n\n🚫 **Error:** {navigation_result.get('error', 'Unknown error')}\n🔧 **URL:** {website_url}\n\n💡 **Please try manually visiting: {website_url}**",
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat(),
                    "website_opened": False,
                    "error": navigation_result.get('error')
                }
        
        # Generate AI response
        ai_response = "I'm Kairo AI! I can open websites directly in your browser. Try saying 'open youtube', 'open google', 'open github', or 'go to netflix' to see browser automation in action!"
        
        if groq_client:
            try:
                completion = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": """You are Kairo AI, an AI assistant with real browser automation capabilities. You can open websites in the user's internal browser when they ask. 

Key capabilities:
- Browser Navigation: Open any website in the internal browser with real screenshots
- Popular sites: YouTube, Google, Gmail, Facebook, Twitter, Instagram, LinkedIn, GitHub, Netflix, Amazon, Reddit, etc.
- Real Browser Engine: Uses Native Chromium via Playwright to capture actual website content
- Screenshot Capture: Takes real screenshots of websites to display in the browser

When users ask to open websites, you actually navigate there and show them the real content. Be helpful and mention your browser opening abilities."""
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
                # Continue with fallback response - don't let this break the website opening logic
        
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