#!/usr/bin/env python3
"""
Simplified Kairo AI Backend - Focus on Website Opening
"""
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Create app without middleware initially
app = FastAPI(title="Kairo AI", version="1.0.0")

# Simple request models
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

# Website URL mapping
WEBSITE_URLS = {
    "youtube": "https://www.youtube.com",
    "google": "https://www.google.com", 
    "facebook": "https://www.facebook.com",
    "twitter": "https://www.twitter.com",
    "linkedin": "https://www.linkedin.com",
    "instagram": "https://www.instagram.com",
    "github": "https://www.github.com",
    "reddit": "https://www.reddit.com",
    "amazon": "https://www.amazon.com",
    "netflix": "https://www.netflix.com"
}

def detect_website_opening_command(message: str):
    """Detect if user wants to open a website"""
    message_lower = message.lower().strip()
    
    if message_lower.startswith("open "):
        website_name = message_lower[5:].strip()
        
        # Direct match
        if website_name in WEBSITE_URLS:
            return True, website_name, WEBSITE_URLS[website_name]
        
        # Partial match
        for site, url in WEBSITE_URLS.items():
            if website_name in site or site in website_name:
                return True, site, url
        
        # Fallback - construct URL
        if website_name and not website_name.startswith("http"):
            fallback_url = f"https://www.{website_name}.com"
            return True, website_name, fallback_url
    
    return False, "", ""

@app.get("/api/health")
async def health_check():
    return JSONResponse({
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "features": {
            "website_opening": True,
            "ai_chat": True
        }
    })

@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        print(f"💬 Chat request: {request.message}")
        
        session_id = request.session_id or f"session-{int(datetime.now().timestamp())}"
        
        # Check for website opening command
        is_website_cmd, website_name, website_url = detect_website_opening_command(request.message)
        
        if is_website_cmd:
            print(f"🌐 Website command detected: {website_name} -> {website_url}")
            
            ai_response = f"✅ **{website_name.title()} is opening in your browser!**\n\n🌐 **URL:** {website_url}\n🚀 **Action:** Navigating your browser now\n⚡ **Status:** Opening in real browser\n\n💡 **Your browser should be navigating to the website now!**"
            
            return JSONResponse({
                "response": ai_response,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "website_opened": True,
                "website_name": website_name,
                "website_url": website_url
            })
        else:
            # Regular chat response
            ai_response = f"I received your message: '{request.message}'. I can help you open websites by saying 'open [website name]' (e.g., 'open youtube', 'open google')."
            
            return JSONResponse({
                "response": ai_response,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat()
            })
            
    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

# Add CORS after app creation
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)