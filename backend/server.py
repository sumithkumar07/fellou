#!/usr/bin/env python3

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import os
from groq import Groq

# Create FastAPI app
app = FastAPI(title="Test Server", version="1.0.0")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/api/health")
async def health_check():
    return JSONResponse({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "groq_key_configured": bool(os.getenv("GROQ_API_KEY"))
    })

@app.post("/api/chat")
async def test_chat(request: dict):
    try:
        message = request.get("message", "")
        
        # Test website opening detection
        if message.lower().startswith("open "):
            website = message.lower()[5:].strip()
            return JSONResponse({
                "response": f"✅ **{website.title()} opened successfully!**\n\n🌐 **Navigated to:** https://www.{website}.com\n📄 **Page Title:** {website.title()} - Home\n⏱️ **Load Time:** 2.1s\n🔧 **Engine:** Native Chromium\n\n🚀 **What would you like to do next?**\n- Take a screenshot of the page\n- Extract specific data\n- Automate actions on this site",
                "session_id": "test-session-123",
                "timestamp": datetime.now().isoformat(),
                "model": "llama-3.3-70b-versatile",
                "website_opened": True,
                "website_name": website,
                "website_url": f"https://www.{website}.com",
                "tab_id": "test-tab-123"
            })
        
        # Regular response 
        return JSONResponse({
            "response": f"I received your message: {message}. This is a test response from the minimal server.",
            "session_id": "test-session-123",
            "timestamp": datetime.now().isoformat(),
            "model": "test-model"
        })
        
    except Exception as e:
        return JSONResponse({
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)