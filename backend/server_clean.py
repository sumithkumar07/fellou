"""
Clean FastAPI server for debugging middleware issue
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Emergent AI - Fellou Clone (Clean)",
    description="Clean version for debugging",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/api/health")
async def health_check():
    """Simple health check"""
    return JSONResponse({
        "status": "healthy",
        "version": "2.0.0-clean",
        "timestamp": datetime.now().isoformat(),
        "message": "Clean server working"
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)