#!/usr/bin/env python3
"""
Simple test server to debug FastAPI middleware issue
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from datetime import datetime

# Create simple FastAPI app
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
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })

@app.post("/api/chat")
async def simple_chat(request: dict):
    message = request.get("message", "")
    
    # Simple YouTube opening logic
    if "open youtube" in message.lower():
        return JSONResponse({
            "response": f"✅ Opening YouTube in your browser!",
            "session_id": "test-session",
            "timestamp": datetime.now().isoformat(),
            "website_opened": True,
            "website_name": "youtube",
            "website_url": "https://www.youtube.com"
        })
    
    return JSONResponse({
        "response": f"I received: {message}",
        "session_id": "test-session",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)