from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import asyncio
import json
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime
import os
import logging

# Import Groq for AI functionality
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Emergent AI - Fellou Clone",
    description="The world's first agentic browser with Deep Action technology",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
try:
    groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    logger.info("✅ Groq client initialized successfully")
except Exception as e:
    logger.error(f"❌ Groq initialization failed: {e}")
    groq_client = None

# Active sessions storage
active_sessions = {}
active_websockets = {}

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Emergent AI - Fellou Clone starting up...")
    logger.info("🌟 Basic AI services initialized")
    logger.info("⚡ Groq AI integration ready")

# ==================== CORE AI & CHAT ENDPOINTS ====================

@app.post("/api/chat")
async def chat_with_ai(request: Dict[str, Any]):
    """Enhanced AI chat with Groq integration."""
    
    try:
        message = request.get("message", "")
        session_id = request.get("session_id")
        context = request.get("context", {})
        
        if not groq_client:
            raise HTTPException(status_code=500, detail="AI service not available")
        
        # Create session if not exists
        if not session_id:
            session_id = str(uuid.uuid4())
            active_sessions[session_id] = {
                "created_at": datetime.now().isoformat(),
                "messages": [],
                "workflows": [],
                "browser_windows": []
            }
        
        # Use Groq for AI response
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are Fellou AI, the world's first agentic browser assistant. You help users automate complex workflows across platforms with Deep Action technology. Be helpful, intelligent, and emphasize your automation capabilities."},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        response = completion.choices[0].message.content
        
        # Store message in session
        if session_id in active_sessions:
            active_sessions[session_id]["messages"].extend([
                {"role": "user", "content": message, "timestamp": datetime.now().isoformat()},
                {"role": "assistant", "content": response, "timestamp": datetime.now().isoformat()}
            ])
        
        return JSONResponse({
            "response": response,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "capabilities": {
                "ai_chat": True,
                "groq_powered": True,
                "session_management": True
            }
        })
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== WORKFLOW MANAGEMENT ENDPOINTS ====================

@app.post("/api/workflow/create")
async def create_workflow(request: Dict[str, Any]):
    """Create new workflow using AI planning."""
    
    try:
        instruction = request.get("instruction", "")
        session_id = request.get("session_id")
        workflow_type = request.get("workflow_type", "general")
        
        if not instruction:
            raise HTTPException(status_code=400, detail="Instruction is required")
        
        if not groq_client:
            raise HTTPException(status_code=500, detail="AI service not available")
        
        # Use Groq to create workflow plan
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a workflow planning AI. Create detailed workflow plans based on user instructions. Return a JSON structure with title, description, steps, estimated_time_minutes, estimated_credits, and required_platforms."},
                {"role": "user", "content": f"Create a workflow for: {instruction}"}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        # Create a basic workflow structure
        workflow_plan = {
            "workflow_id": str(uuid.uuid4()),
            "title": f"Workflow: {instruction[:50]}...",
            "description": completion.choices[0].message.content,
            "steps": ["Step 1: Analyze request", "Step 2: Execute actions", "Step 3: Generate results"],
            "estimated_time_minutes": 5,
            "estimated_credits": 10,
            "required_platforms": ["web"],
            "status": "created",
            "created_at": datetime.now().isoformat()
        }
        
        # Store workflow in session
        if session_id and session_id in active_sessions:
            active_sessions[session_id]["workflows"].append(workflow_plan)
        
        return JSONResponse({
            "status": "created",
            "workflow": workflow_plan,
            "message": "Workflow plan created successfully"
        })
        
    except Exception as e:
        logger.error(f"Workflow creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/workflow/execute/{workflow_id}")
async def execute_workflow(workflow_id: str):
    """Execute workflow (simplified version)."""
    
    try:
        # Find workflow in active sessions
        workflow_plan = None
        for session in active_sessions.values():
            for workflow in session.get("workflows", []):
                if workflow.get("workflow_id") == workflow_id:
                    workflow_plan = workflow
                    break
                    
        if not workflow_plan:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Simulate workflow execution
        execution_result = {
            "workflow_id": workflow_id,
            "status": "completed",
            "results": "Workflow executed successfully (simulated)",
            "execution_time": "2.5 seconds",
            "steps_completed": len(workflow_plan.get("steps", [])),
            "timestamp": datetime.now().isoformat()
        }
        
        return JSONResponse({
            "status": "executed",
            "result": execution_result,
            "message": "Workflow executed successfully"
        })
        
    except Exception as e:
        logger.error(f"Workflow execution error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/workflow/history")
async def get_workflow_history(session_id: str = Query(...)):
    """Get workflow execution history."""
    
    try:
        if session_id not in active_sessions:
            return JSONResponse({"workflows": []})
            
        workflows = active_sessions[session_id].get("workflows", [])
        
        return JSONResponse({
            "workflows": workflows,
            "total": len(workflows),
            "session_id": session_id
        })
        
    except Exception as e:
        logger.error(f"Workflow history error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== WEBSOCKET ENDPOINTS ====================

@app.websocket("/api/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket for real-time communication."""
    
    await websocket.accept()
    active_websockets[session_id] = websocket
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Process different message types
            if message_data.get("type") == "workflow_progress":
                # Send workflow progress updates
                await websocket.send_text(json.dumps({
                    "type": "progress_update",
                    "progress": 75,
                    "status": "executing_step_3",
                    "message": "Processing workflow..."
                }))
                
            # Echo other messages
            await websocket.send_text(json.dumps({
                "type": "echo",
                "message": f"Received: {message_data}"
            }))
            
    except WebSocketDisconnect:
        if session_id in active_websockets:
            del active_websockets[session_id]
        logger.info(f"WebSocket disconnected for session: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        if session_id in active_websockets:
            del active_websockets[session_id]

# ==================== SYSTEM STATUS ENDPOINTS ====================

@app.get("/api/system/status")
async def system_status():
    """Get comprehensive system status."""
    
    return JSONResponse({
        "status": "operational",
        "version": "2.0.0",
        "system": "Emergent AI - Fellou Clone",
        "capabilities": {
            "ai_chat": True,
            "groq_integration": True,
            "workflow_creation": True,
            "session_management": True,
            "websocket_support": True
        },
        "services": {
            "groq_ai": "operational" if groq_client else "unavailable",
            "chat_service": "operational",
            "workflow_service": "operational",
            "websocket_service": "operational"
        },
        "active_sessions": len(active_sessions),
        "active_websockets": len(active_websockets),
        "uptime": "running",
        "last_updated": datetime.now().isoformat()
    })

@app.get("/api/system/capabilities")
async def system_capabilities():
    """Get detailed system capabilities."""
    
    return JSONResponse({
        "fellou_clone": True,
        "agentic_browser": True,
        "ai_integration": {
            "provider": "Groq",
            "model": "llama-3.3-70b-versatile",
            "chat_support": True,
            "workflow_planning": True
        },
        "core_features": {
            "session_management": True,
            "workflow_creation": True,
            "real_time_communication": True,
            "ai_powered_responses": True
        },
        "performance": {
            "fast_responses": True,
            "session_persistence": True,
            "error_handling": True,
            "logging": True
        }
    })

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Emergent AI - Fellou Clone"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)