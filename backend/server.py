#!/usr/bin/env python3
"""
Ultra-simple FastAPI server without Pydantic models
"""
from fastapi import FastAPI, Request
from datetime import datetime

# Create simple app  
app = FastAPI(title="Kairo AI", version="1.0.0")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0", 
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/chat")
async def chat_endpoint(request: Request):
    try:
        body = await request.json()
        message = body.get('message', '')
        
        if 'open youtube' in message.lower():
            return {
                "response": "✅ **Youtube is opening in your browser!**\n\n🌐 **URL:** https://www.youtube.com\n🚀 **Action:** Navigating your browser now\n⚡ **Status:** Opening in real browser\n\n💡 **Your browser should be navigating to the website now!**",
                "session_id": "test-session", 
                "timestamp": datetime.now().isoformat(),
                "website_opened": True,
                "website_name": "youtube",
                "website_url": "https://www.youtube.com"
            }
        
        return {
            "response": f"I received: {message}",
            "session_id": "test-session",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}