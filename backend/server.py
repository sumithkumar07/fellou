#!/usr/bin/env python3
"""
Ultra-simple FastAPI server for testing 
"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Create simple app
app = FastAPI(title="Kairo AI", version="1.0.0")

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0", 
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    message = request.message
    
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