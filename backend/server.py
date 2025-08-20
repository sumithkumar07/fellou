from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
import json
import uuid
from groq import Groq
import httpx
from bs4 import BeautifulSoup
import motor.motor_asyncio

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="Emergent AI Browser", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/emergent_browser")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.emergent_browser

# Groq AI client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Pydantic models
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[datetime] = None

class AIRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class WorkflowRequest(BaseModel):
    instruction: str
    session_id: str
    workflow_type: Optional[str] = "general"

class BrowserAction(BaseModel):
    action_type: str  # navigate, click, type, scroll, screenshot
    target: Optional[str] = None
    value: Optional[str] = None
    coordinates: Optional[Dict[str, int]] = None

class TabInfo(BaseModel):
    tab_id: str
    url: str
    title: str
    favicon: Optional[str] = None
    active: bool = False

# Global storage for active sessions and tabs
active_sessions: Dict[str, List[ChatMessage]] = {}
active_tabs: Dict[str, TabInfo] = {}
active_workflows: Dict[str, Dict[str, Any]] = {}

# AI Chat endpoints
@app.post("/api/chat")
async def chat_with_ai(request: AIRequest):
    """Process AI chat messages with Groq"""
    try:
        session_id = request.session_id or str(uuid.uuid4())
        
        # Initialize session if not exists
        if session_id not in active_sessions:
            active_sessions[session_id] = []
        
        # Add user message
        user_message = ChatMessage(
            role="user", 
            content=request.message,
            timestamp=datetime.now()
        )
        active_sessions[session_id].append(user_message)
        
        # Prepare context for AI
        conversation_history = [
            {"role": msg.role, "content": msg.content} 
            for msg in active_sessions[session_id][-10:]  # Last 10 messages
        ]
        
        # Add system prompt for Fellou-like behavior
        system_prompt = {
            "role": "system",
            "content": """You are Fellou, the world's first agentic browser AI assistant. You help users with:
            
            1. Deep Action workflows - automating complex multi-step tasks across websites
            2. Research and report generation - analyzing data from multiple sources
            3. Cross-platform integration - working with 50+ platforms like Twitter, LinkedIn, Reddit
            4. Browser automation - navigating, clicking, typing, and extracting information
            5. Workflow creation - building drag-and-drop automation sequences
            
            Key capabilities:
            - Execute tasks in shadow windows without disrupting user workflow
            - Generate comprehensive reports with visual insights
            - Automate social media, data collection, and research tasks
            - Cross-platform data synchronization
            - Timeline management for multi-tasking
            
            Always be helpful, intelligent, and action-oriented. When users ask for automation or workflows, break down the steps and offer to execute them."""
        }
        
        messages = [system_prompt] + conversation_history
        
        # Get AI response from Groq
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Updated Groq model
            messages=messages,
            temperature=0.7,
            max_tokens=2000
        )
        
        ai_response_content = response.choices[0].message.content
        
        # Add AI response to session
        ai_message = ChatMessage(
            role="assistant",
            content=ai_response_content,
            timestamp=datetime.now()
        )
        active_sessions[session_id].append(ai_message)
        
        # Store conversation in database
        await db.conversations.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "session_id": session_id,
                    "messages": [msg.dict() for msg in active_sessions[session_id]],
                    "updated_at": datetime.now()
                }
            },
            upsert=True
        )
        
        return {
            "response": ai_response_content,
            "session_id": session_id,
            "timestamp": ai_message.timestamp
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat error: {str(e)}")

# Browser simulation endpoints
@app.post("/api/browser/navigate")
async def navigate_to_url(url: str, tab_id: Optional[str] = None):
    """Navigate to a URL"""
    try:
        if not tab_id:
            tab_id = str(uuid.uuid4())
        
        # Basic URL validation
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Fetch page content
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            content = response.text
            
        # Parse with BeautifulSoup for title extraction
        soup = BeautifulSoup(content, 'html.parser')
        title = soup.find('title').get_text() if soup.find('title') else url
        
        # Create/update tab info
        tab_info = TabInfo(
            tab_id=tab_id,
            url=url,
            title=title,
            active=True
        )
        active_tabs[tab_id] = tab_info
        
        return {
            "success": True,
            "tab_id": tab_id,
            "url": url,
            "title": title,
            "content_preview": content[:500] + "..." if len(content) > 500 else content
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Navigation error: {str(e)}")

@app.get("/api/browser/tabs")
async def get_active_tabs():
    """Get all active browser tabs"""
    return {"tabs": list(active_tabs.values())}

@app.post("/api/browser/action")
async def execute_browser_action(action: BrowserAction):
    """Execute browser actions (click, type, scroll, etc.)"""
    try:
        # This would integrate with actual browser automation
        # For now, we'll simulate the action
        result = {
            "success": True,
            "action": action.action_type,
            "target": action.target,
            "timestamp": datetime.now()
        }
        
        # Log action for workflow building
        await db.browser_actions.insert_one({
            "action_type": action.action_type,
            "target": action.target,
            "value": action.value,
            "coordinates": action.coordinates,
            "timestamp": datetime.now()
        })
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Browser action error: {str(e)}")

# Workflow endpoints
@app.post("/api/workflow/create")
async def create_workflow(request: WorkflowRequest):
    """Create a workflow from natural language instruction"""
    try:
        # Use AI to break down instruction into actionable steps
        workflow_prompt = f"""
        Break down this instruction into a step-by-step workflow:
        "{request.instruction}"
        
        Return a JSON structure with:
        - workflow_id: unique identifier
        - title: short workflow name
        - steps: array of steps with action_type, target, value
        - estimated_credits: cost estimate
        
        Example format:
        {{
            "workflow_id": "wf_123",
            "title": "Search LinkedIn Engineers",
            "steps": [
                {{"action_type": "navigate", "target": "https://linkedin.com", "value": null}},
                {{"action_type": "type", "target": "#search-input", "value": "browser engineers"}},
                {{"action_type": "click", "target": ".search-button", "value": null}}
            ],
            "estimated_credits": 100
        }}
        """
        
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": workflow_prompt}],
            temperature=0.3
        )
        
        # Parse AI response as JSON
        workflow_data = json.loads(response.choices[0].message.content)
        workflow_id = workflow_data["workflow_id"]
        
        # Store workflow
        active_workflows[workflow_id] = {
            **workflow_data,
            "session_id": request.session_id,
            "status": "created",
            "created_at": datetime.now()
        }
        
        await db.workflows.insert_one(active_workflows[workflow_id])
        
        return workflow_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workflow creation error: {str(e)}")

@app.post("/api/workflow/execute/{workflow_id}")
async def execute_workflow(workflow_id: str):
    """Execute a created workflow"""
    try:
        if workflow_id not in active_workflows:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        workflow = active_workflows[workflow_id]
        workflow["status"] = "running"
        
        results = []
        for step in workflow["steps"]:
            # Execute each step (this would use actual browser automation)
            step_result = {
                "step": step,
                "status": "completed",
                "timestamp": datetime.now(),
                "result": f"Executed {step['action_type']} on {step['target']}"
            }
            results.append(step_result)
            
            # Simulate processing time
            await asyncio.sleep(0.5)
        
        workflow["status"] = "completed"
        workflow["results"] = results
        
        return {
            "workflow_id": workflow_id,
            "status": "completed",
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workflow execution error: {str(e)}")

# WebSocket for real-time updates
@app.websocket("/api/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket connection for real-time browser and AI updates"""
    await websocket.accept()
    
    try:
        while True:
            # Listen for messages
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data["type"] == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            
            elif message_data["type"] == "workflow_update":
                # Send workflow progress updates
                await websocket.send_text(json.dumps({
                    "type": "workflow_progress",
                    "workflow_id": message_data.get("workflow_id"),
                    "progress": message_data.get("progress", 0)
                }))
            
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session: {session_id}")

# Health check
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "version": "1.0.0",
        "features": {
            "ai_chat": True,
            "browser_automation": True,
            "workflow_creation": True,
            "cross_platform": False  # TODO: implement
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)