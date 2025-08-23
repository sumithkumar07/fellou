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
from typing import Optional, Dict, Any

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

# Groq AI client
groq_client = None
# Temporarily disable Groq to test website opening logic
try:
    import groq
    if False and os.getenv('GROQ_API_KEY'):  # Temporarily disabled
        groq_client = groq.Groq(api_key=os.getenv('GROQ_API_KEY'))
        print("✅ Groq client initialized")
except Exception as e:
    print(f"⚠️ Groq initialization failed: {e}")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0", 
        "timestamp": datetime.now().isoformat(),
        "browser_ready": True,
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
        
        # For now, return a simple response with URL info
        # In a full implementation, this would use Playwright to capture screenshots
        return {
            "success": True,
            "title": f"Website: {url}",
            "content_preview": f"Navigated to {url}",
            "screenshot": None,  # Would contain base64 screenshot in full implementation
            "metadata": {
                "og:title": f"Page: {url}",
                "og:description": f"Content from {url}"
            },
            "status_code": 200,
            "engine": "Native Chromium",
            "url": url,
            "tab_id": tab_id,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Browser navigation error: {e}")
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
                            "content": """You are Kairo AI, an AI assistant with browser automation capabilities. You can open websites in the user's browser when they ask. Popular sites you can open: YouTube, Google, Gmail, Facebook, Twitter, Instagram, LinkedIn, GitHub, Netflix, Amazon, Reddit, etc. Be helpful and mention your browser opening abilities."""
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
                print("✅ AI response generated")
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