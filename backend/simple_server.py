#!/usr/bin/env python3
"""
Minimal FastAPI server for debugging middleware issue
"""
from fastapi import FastAPI
from datetime import datetime

# Create minimal app  
app = FastAPI(title="Kairo AI Debug", version="1.0.0")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0", 
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/chat")
async def chat_endpoint(request: dict):
    return {
        "response": "Debug response - backend is working!",
        "session_id": "debug_session",
        "timestamp": datetime.now().isoformat(),
        "website_opened": True,
        "website_url": "https://www.youtube.com",
        "website_name": "youtube"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)