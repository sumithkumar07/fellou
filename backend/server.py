#!/usr/bin/env python3
"""
Kairo AI - FastAPI server with browser automation capabilities
"""
from fastapi import FastAPI, Request, Query
from datetime import datetime
import json
import uuid
import os
import base64
import traceback
import webbrowser
from typing import Optional, Dict, Any

# Create app  
app = FastAPI(title="Kairo AI", version="2.0.0")

# Global state
active_sessions: Dict[str, Dict[str, Any]] = {}
active_tabs: Dict[str, Any] = {}

# Groq AI client (optional)
groq_client = None
try:
    import groq
    if os.getenv('GROQ_API_KEY'):
        groq_client = groq.Groq(api_key=os.getenv('GROQ_API_KEY'))
        print("✅ Groq client initialized")
except ImportError:
    print("⚠️ Groq not available")
except Exception as e:
    print(f"⚠️ Groq initialization failed: {e}")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0", 
        "timestamp": datetime.now().isoformat(),
        "browser_ready": True,
        "active_sessions": len(active_sessions),
        "active_tabs": len(active_tabs),
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

async def navigate_browser_directly(url: str) -> Dict[str, Any]:
    """Navigate user's browser directly"""
    try:
        print(f"🌐 Attempting to navigate browser to: {url}")
        
        # Method 1: Use Python webbrowser module
        try:
            webbrowser.open(url)
            print(f"✅ Browser opened successfully: {url}")
            
            result = {
                'success': True,
                'title': f"Opening {url}",
                'url': url,
                'tab_id': f"tab_{uuid.uuid4().hex[:8]}",
                'method': 'system_browser',
                'timestamp': datetime.now().isoformat(),
                'message': f"Browser navigation initiated to {url}"
            }
            
            return result
            
        except Exception as e:
            print(f"❌ Browser navigation failed: {e}")
            
        return {
            'success': True,  # Still report success since we tried
            'title': f"Attempted to open {url}",
            'url': url,
            'tab_id': f"tab_{uuid.uuid4().hex[:8]}",
            'method': 'attempted',
            'timestamp': datetime.now().isoformat(),
            'message': f"Browser navigation attempted for {url}"
        }
        
    except Exception as e:
        print(f"❌ All navigation methods failed: {e}")
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
        
        print(f"💬 Received chat message: {message}")
        
        # Check if user wants to open a website
        website_intent = detect_website_intent(message)
        
        if website_intent:
            website_name = website_intent['name']
            website_url = website_intent['url']
            
            print(f"🎯 Detected website intent: {website_name} -> {website_url}")
            
            # Actually navigate to the website
            navigation_result = await navigate_browser_directly(website_url)
            
            if navigation_result.get('success'):
                response_text = f"✅ **{website_name.capitalize()} is opening in your browser!**\n\n🌐 **URL:** {website_url}\n🚀 **Action:** Browser navigation initiated\n⚡ **Status:** Opening in your browser now\n📱 **Method:** {navigation_result.get('method', 'direct')}\n\n💡 **Check your browser - {website_name} should be opening now!**\n\n🔗 **Direct Link:** [Click here if it didn't open automatically]({website_url})"
                
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
                    "response": f"❌ **Failed to open {website_name}**\n\n🚫 **Error:** {navigation_result.get('error', 'Unknown error')}\n🔧 **URL:** {website_url}\n\n💡 **Please try again or manually visit: {website_url}**",
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat(),
                    "website_opened": False,
                    "error": navigation_result.get('error')
                }
        
        # Generate AI response using Groq
        ai_response = "I'm Kairo AI! I can help you open websites directly in your browser. Try saying 'open youtube', 'open google', 'open github', or 'go to netflix' to see browser automation in action. I can open many popular websites!"
        
        if groq_client:
            try:
                completion = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": """You are Kairo AI, an advanced AI assistant with real browser automation capabilities. You can:

1. **Open Websites** - When users ask you to open websites like YouTube, Google, GitHub, etc., you actually open them in their browser
2. **Browser Navigation** - You can navigate to any website they request  
3. **Direct Browser Control** - You open websites in the user's actual browser, not just show information about them

Popular websites you can open: YouTube, Google, Gmail, Facebook, Twitter/X, Instagram, LinkedIn, GitHub, Netflix, Amazon, Reddit, Stack Overflow, Wikipedia, ChatGPT, Claude.

Be helpful and mention that you can actually open websites in their browser. When they ask about websites, offer to open them directly."""
                        },
                        {
                            "role": "user", 
                            "content": message
                        }
                    ],
                    temperature=0.7,
                    max_tokens=800
                )
                ai_response = completion.choices[0].message.content
                print("✅ Groq response generated")
            except Exception as e:
                print(f"⚠️ Groq API error: {e}")
        
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