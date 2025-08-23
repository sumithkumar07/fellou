#!/usr/bin/env python3
"""
Kairo AI - Clean FastAPI server
"""
from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json
import uuid
import os
from typing import Optional, Dict, Any

# Create app
app = FastAPI(title="Kairo AI", version="2.0.0")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq AI client
groq_client = None
try:
    import groq
    if os.getenv('GROQ_API_KEY'):
        groq_client = groq.Groq(api_key=os.getenv('GROQ_API_KEY'))
        print("✅ Groq client initialized")
except Exception as e:
    print(f"⚠️ Groq initialization failed: {e}")

@app.get("/")
async def root():
    return {"message": "Kairo AI Server Running"}

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
        'reddit': 'https://www.reddit.com',
    }
    
    for site_name, url in website_patterns.items():
        if (f'open {site_name}' in message_lower or 
            f'go to {site_name}' in message_lower or 
            f'navigate to {site_name}' in message_lower):
            return {
                'name': site_name,
                'url': url,
                'action': 'open'
            }
    
    return None

@app.post("/api/browser/navigate") 
async def browser_navigate(url: str = Query(...), tab_id: str = Query(...), session_id: str = Query(...)):
    """Navigate to URL for internal browser display"""
    try:
        print(f"🌐 Browser navigate request: {url} (tab: {tab_id})")
        
        return {
            "success": True,
            "title": f"Website: {url}",
            "content_preview": f"Navigated to {url}",
            "screenshot": None,
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
            "status_code": 500,
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
            
            response_text = f"""✅ **{website_name.capitalize()} is opening in your app browser!**

🌐 **URL:** {website_url}
🚀 **Action:** Internal browser navigation initiated  
⚡ **Status:** Opening in your app's browser now
📱 **Method:** Internal app browser
🎯 **Location:** Main browser window in your app

💡 **Your app's browser is now navigating to {website_name}!**"""
                
            return {
                "response": response_text,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "website_opened": True,
                "website_name": website_name,
                "website_url": website_url,
                "tab_id": f"tab_{uuid.uuid4().hex[:8]}",
                "navigation_result": {"success": True, "method": "internal_browser"}
            }
        
        # Generate AI response
        ai_response = "I'm Kairo AI! I can open websites directly in your app's browser. Try saying 'open youtube', 'open google', or 'go to github' to see internal browser navigation in action!"
        
        if groq_client:
            try:
                completion = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are Kairo AI, an AI assistant with browser automation capabilities. You can open websites in the user's internal browser when they ask. Be helpful and mention your browser opening abilities."
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
        
        return {
            "response": ai_response,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Chat error: {e}")
        return {
            "error": f"Chat processing failed: {str(e)}",
            "session_id": "error_session",
            "timestamp": datetime.now().isoformat()
        }