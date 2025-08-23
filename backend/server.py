#!/usr/bin/env python3
"""
Kairo AI - FastAPI server with browser automation capabilities
"""
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import asyncio
import json
import uuid
import os
from typing import Optional, Dict, Any
import base64
import traceback

# Browser automation imports
from playwright.async_api import async_playwright, Browser, BrowserContext, Page
import groq

# Create app  
app = FastAPI(title="Kairo AI", version="2.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global browser instance
browser: Optional[Browser] = None
browser_context: Optional[BrowserContext] = None
active_sessions: Dict[str, Dict[str, Any]] = {}
active_tabs: Dict[str, Page] = {}

# Groq AI client
groq_client = None
if os.getenv('GROQ_API_KEY'):
    groq_client = groq.Groq(api_key=os.getenv('GROQ_API_KEY'))

async def initialize_browser():
    """Initialize the Playwright browser"""
    global browser, browser_context
    try:
        if not browser:
            playwright = await async_playwright().start()
            browser = await playwright.chromium.launch(
                headless=False,  # Set to True for production
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            )
            browser_context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            print("🌐 Browser initialized successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize browser: {e}")
        return False

@app.on_event("startup")
async def startup_event():
    """Initialize browser on startup"""
    await initialize_browser()

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up browser on shutdown"""
    global browser, browser_context
    if browser_context:
        await browser_context.close()
    if browser:
        await browser.close()

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0", 
        "timestamp": datetime.now().isoformat(),
        "browser_ready": browser is not None,
        "active_sessions": len(active_sessions),
        "active_tabs": len(active_tabs)
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
        'instagram': 'https://www.instagram.com',
        'linkedin': 'https://www.linkedin.com',
        'github': 'https://www.github.com',
        'netflix': 'https://www.netflix.com',
        'amazon': 'https://www.amazon.com',
        'reddit': 'https://www.reddit.com',
        'stackoverflow': 'https://stackoverflow.com'
    }
    
    # Check for "open [website]" patterns
    for site_name, url in website_patterns.items():
        if f'open {site_name}' in message_lower or f'go to {site_name}' in message_lower or f'navigate to {site_name}' in message_lower:
            return {
                'name': site_name,
                'url': url,
                'action': 'open'
            }
    
    # Check for direct URL patterns
    if 'http://' in message or 'https://' in message:
        # Extract URL
        words = message.split()
        for word in words:
            if word.startswith('http://') or word.startswith('https://'):
                return {
                    'name': 'website',
                    'url': word,
                    'action': 'open'
                }
    
    return None

async def navigate_to_website(url: str, session_id: str) -> Dict[str, Any]:
    """Navigate browser to a website"""
    try:
        if not browser_context:
            await initialize_browser()
            
        if not browser_context:
            raise Exception("Browser not available")
        
        # Create new page or reuse existing one
        tab_id = f"tab_{session_id}_{datetime.now().timestamp()}"
        page = await browser_context.new_page()
        active_tabs[tab_id] = page
        
        print(f"🌐 Navigating to: {url}")
        
        # Navigate to the URL
        response = await page.goto(url, wait_until='domcontentloaded', timeout=30000)
        
        # Get page title
        title = await page.title()
        
        # Take screenshot
        screenshot_bytes = await page.screenshot(full_page=False, quality=80)
        screenshot_base64 = base64.b64encode(screenshot_bytes).decode('utf-8')
        
        # Get basic metadata
        try:
            # Get page description
            description_element = await page.query_selector('meta[name="description"]')
            description = await description_element.get_attribute('content') if description_element else ""
            
            # Get og:title
            og_title_element = await page.query_selector('meta[property="og:title"]')
            og_title = await og_title_element.get_attribute('content') if og_title_element else ""
            
            metadata = {
                'title': title,
                'description': description,
                'og:title': og_title,
                'url': url
            }
        except:
            metadata = {'title': title, 'url': url}
        
        result = {
            'success': True,
            'title': title,
            'url': url,
            'tab_id': tab_id,
            'screenshot': screenshot_base64,
            'metadata': metadata,
            'status_code': response.status if response else 200,
            'timestamp': datetime.now().isoformat()
        }
        
        print(f"✅ Navigation successful: {title}")
        return result
        
    except Exception as e:
        print(f"❌ Navigation error: {e}")
        traceback.print_exc()
        return {
            'success': False,
            'error': str(e),
            'url': url,
            'timestamp': datetime.now().isoformat()
        }

@app.post("/api/chat")
async def chat_endpoint(request: Request):
    try:
        body = await request.json()
        message = body.get('message', '')
        session_id = body.get('session_id', f"session_{uuid.uuid4().hex[:8]}")
        
        # Check if user wants to open a website
        website_intent = detect_website_intent(message)
        
        if website_intent:
            website_name = website_intent['name']
            website_url = website_intent['url']
            
            print(f"🎯 Detected website intent: {website_name} -> {website_url}")
            
            # Actually navigate to the website
            navigation_result = await navigate_to_website(website_url, session_id)
            
            if navigation_result.get('success'):
                return {
                    "response": f"✅ **{website_name.capitalize()} opened successfully!**\n\n🌐 **URL:** {website_url}\n🚀 **Action:** Browser navigated successfully\n⚡ **Status:** Website is now open in your browser\n📱 **Page Title:** {navigation_result.get('title', 'Loading...')}\n\n💡 **Your browser tab should now show {website_name}!**",
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
                    "response": f"❌ **Failed to open {website_name}**\n\n🚫 **Error:** {navigation_result.get('error', 'Unknown error')}\n🔧 **URL:** {website_url}\n\n💡 **Please try again or check if the website is accessible.**",
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat(),
                    "website_opened": False,
                    "error": navigation_result.get('error')
                }
        
        # Generate AI response using Groq
        ai_response = "I received your message. I can help you navigate to websites, take screenshots, and automate browser tasks. Try saying 'open youtube' or 'open google' to see browser automation in action!"
        
        if groq_client:
            try:
                completion = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": """You are Kairo AI, an advanced AI assistant with real browser automation capabilities. You have:

1. **Native Chromium Browser Engine** - You can actually open websites, take screenshots, and interact with pages
2. **Real Website Navigation** - When users ask you to open websites, you actually navigate their browser
3. **Advanced Automation** - You can click buttons, fill forms, extract data, and take screenshots
4. **Cross-Platform Integration** - You can work with 50+ platforms and services

Be helpful, intelligent, and mention your real browser automation capabilities. When users ask about opening websites, explain that you'll actually open them in their browser."""
                        },
                        {
                            "role": "user",
                            "content": message
                        }
                    ],
                    temperature=0.7,
                    max_tokens=1000
                )
                ai_response = completion.choices[0].message.content
            except Exception as e:
                print(f"Groq API error: {e}")
        
        return {
            "response": ai_response,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Chat error: {e}")
        traceback.print_exc()
        return {"error": str(e)}

@app.post("/api/browser/navigate")
async def browser_navigate(
    request: Request,
    url: str = Query(...),
    tab_id: Optional[str] = Query(None),
    session_id: Optional[str] = Query(None)
):
    """Navigate browser to a specific URL"""
    try:
        session_id = session_id or f"session_{uuid.uuid4().hex[:8]}"
        result = await navigate_to_website(url, session_id)
        return result
    except Exception as e:
        print(f"Navigation error: {e}")
        return {"error": str(e), "success": False}

@app.post("/api/browser/screenshot")
async def take_screenshot(
    request: Request,
    tab_id: str = Query(...)
):
    """Take screenshot of a specific tab"""
    try:
        if tab_id in active_tabs:
            page = active_tabs[tab_id]
            screenshot_bytes = await page.screenshot(full_page=False, quality=80)
            screenshot_base64 = base64.b64encode(screenshot_bytes).decode('utf-8')
            
            return {
                "success": True,
                "screenshot": screenshot_base64,
                "tab_id": tab_id,
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {"error": "Tab not found", "success": False}
    except Exception as e:
        print(f"Screenshot error: {e}")
        return {"error": str(e), "success": False}

@app.websocket("/api/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time communication"""
    await websocket.accept()
    active_sessions[session_id] = {"websocket": websocket, "connected_at": datetime.now()}
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get('type') == 'ping':
                await websocket.send_text(json.dumps({
                    "type": "pong",
                    "timestamp": datetime.now().isoformat(),
                    "session_id": session_id
                }))
            elif message_data.get('type') == 'browser_action':
                # Handle browser actions via WebSocket
                tab_id = message_data.get('tab_id')
                action_type = message_data.get('action_type')
                
                if tab_id in active_tabs:
                    page = active_tabs[tab_id]
                    
                    if action_type == 'screenshot':
                        screenshot_bytes = await page.screenshot()
                        screenshot_base64 = base64.b64encode(screenshot_bytes).decode('utf-8')
                        
                        await websocket.send_text(json.dumps({
                            "type": "browser_action_result",
                            "result": {
                                "screenshot": screenshot_base64,
                                "message": "Screenshot captured successfully"
                            }
                        }))
                        
    except WebSocketDisconnect:
        if session_id in active_sessions:
            del active_sessions[session_id]
    except Exception as e:
        print(f"WebSocket error: {e}")
        if session_id in active_sessions:
            del active_sessions[session_id]