from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import json
import asyncio
import uuid
from datetime import datetime
import os
from groq import Groq

# Import our new services
from services.agent_system.planning_agent import PlanningAgent
from services.agent_system.execution_agent import ExecutionAgent
from integrations.universal_integration import UniversalIntegration

app = FastAPI(title="Emergent AI Browser - Fellou Clone", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
planning_agent = PlanningAgent()
execution_agent = ExecutionAgent()
universal_integration = UniversalIntegration()

# In-memory storage (in production, use proper database)
active_sessions = {}
workflow_executions = {}
websocket_connections = {}


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    context: Optional[Dict] = None


class WorkflowRequest(BaseModel):
    instruction: str
    session_id: Optional[str] = None
    workflow_type: str = "general"


class BrowserNavigationRequest(BaseModel):
    url: str
    tab_id: Optional[str] = None


@app.get("/")
async def root():
    return {
        "message": "Emergent AI Browser - Fellou.ai Clone",
        "version": "1.0.0",
        "features": [
            "Multi-window browser grid",
            "Trinity Architecture (Browser + Workflow + Agent)",
            "Shadow workspace execution",
            "Cross-platform integrations (Twitter, LinkedIn, etc.)",
            "Timeline navigation",
            "Drag & drop workflow builder",
            "Deep search interface"
        ],
        "status": "active"
    }


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """Enhanced AI chat with agentic capabilities."""
    
    try:
        session_id = request.session_id or str(uuid.uuid4())
        
        # Store session if new
        if session_id not in active_sessions:
            active_sessions[session_id] = {
                "id": session_id,
                "created_at": datetime.now(),
                "messages": [],
                "context": {}
            }
        
        session = active_sessions[session_id]
        
        # Add user message to session
        user_message = {
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat()
        }
        session["messages"].append(user_message)
        
        # Check if this requires workflow creation
        if any(keyword in request.message.lower() for keyword in [
            "search", "find", "analyze", "create", "generate", "monitor", 
            "automate", "research", "report", "workflow", "task"
        ]):
            # Create and suggest workflow
            workflow_plan = await planning_agent.create_workflow_plan(
                request.message, 
                context=request.context
            )
            
            ai_response = f"""I'll help you with that! I've created a comprehensive workflow plan:

**{workflow_plan.get('title', 'Custom Workflow')}**
{workflow_plan.get('description', '')}

This workflow includes {len(workflow_plan.get('steps', []))} steps:
"""
            
            for i, step in enumerate(workflow_plan.get('steps', [])[:3], 1):
                ai_response += f"\n{i}. {step.get('description', 'Processing step')}"
            
            if len(workflow_plan.get('steps', [])) > 3:
                ai_response += f"\n... and {len(workflow_plan.get('steps', [])) - 3} more steps"
            
            ai_response += f"""

**Estimated time:** {workflow_plan.get('estimated_time_minutes', 5)} minutes
**Required platforms:** {', '.join(workflow_plan.get('required_platforms', ['Web']))}

Would you like me to execute this workflow? I'll run it in the shadow workspace so it won't disrupt your browsing."""
            
            # Store workflow plan for potential execution
            workflow_executions[session_id] = workflow_plan
            
        else:
            # Regular chat response
            try:
                completion = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": """You are Fellou AI, an advanced agentic browser assistant. You can:

- Execute complex workflows across 50+ platforms
- Perform research and generate comprehensive reports  
- Automate social media monitoring and engagement
- Handle cross-platform data analysis
- Create and manage multi-step automation tasks

You have access to Trinity Architecture: Browser + Workflow + Agent systems working together.

Be helpful, intelligent, and proactive in suggesting automation solutions."""
                        },
                        {
                            "role": "user", 
                            "content": request.message
                        }
                    ],
                    temperature=0.7,
                    max_tokens=1000
                )
                
                ai_response = completion.choices[0].message.content
                
            except Exception as e:
                ai_response = "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment."
        
        # Add AI response to session
        assistant_message = {
            "role": "assistant",
            "content": ai_response,
            "timestamp": datetime.now().isoformat()
        }
        session["messages"].append(assistant_message)
        
        return {
            "response": ai_response,
            "session_id": session_id,
            "context": session.get("context", {}),
            "has_workflow": session_id in workflow_executions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/workflow/create")
async def create_workflow(request: WorkflowRequest):
    """Create a new workflow using the planning agent."""
    
    try:
        session_id = request.session_id or str(uuid.uuid4())
        
        # Create workflow plan
        workflow_plan = await planning_agent.create_workflow_plan(
            request.instruction,
            context={"session_id": session_id}
        )
        
        # Store workflow
        workflow_executions[workflow_plan["workflow_id"]] = workflow_plan
        
        return {
            "workflow_id": workflow_plan["workflow_id"],
            "title": workflow_plan.get("title"),
            "description": workflow_plan.get("description"),
            "steps": len(workflow_plan.get("steps", [])),
            "estimated_time": workflow_plan.get("estimated_time_minutes"),
            "estimated_credits": workflow_plan.get("estimated_credits"),
            "required_platforms": workflow_plan.get("required_platforms"),
            "execution_strategy": workflow_plan.get("execution_strategy"),
            "created_at": workflow_plan.get("created_at")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/workflow/execute/{workflow_id}")
async def execute_workflow(workflow_id: str, background_tasks: BackgroundTasks):
    """Execute a workflow using the execution agent."""
    
    try:
        if workflow_id not in workflow_executions:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        workflow_plan = workflow_executions[workflow_id]
        
        # Start execution in background
        background_tasks.add_task(
            execute_workflow_background,
            workflow_plan,
            workflow_id
        )
        
        return {
            "workflow_id": workflow_id,
            "status": "started",
            "execution_strategy": workflow_plan.get("execution_strategy"),
            "estimated_time": workflow_plan.get("estimated_time_minutes"),
            "shadow_workspace": True,
            "started_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def execute_workflow_background(workflow_plan: Dict, workflow_id: str):
    """Background workflow execution."""
    
    try:
        # Execute workflow
        result = await execution_agent.execute_workflow(
            workflow_plan, 
            workflow_id,
            progress_callback=lambda progress, step_id, result: print(f"Progress: {progress}% - {step_id}")
        )
        
        # Update workflow status
        workflow_executions[workflow_id].update({
            "execution_result": result,
            "completed_at": datetime.now().isoformat(),
            "status": result.get("status", "completed")
        })
        
        print(f"Workflow {workflow_id} completed: {result.get('status')}")
        
    except Exception as e:
        print(f"Workflow execution error: {e}")
        workflow_executions[workflow_id].update({
            "status": "failed",
            "error": str(e),
            "failed_at": datetime.now().isoformat()
        })


@app.get("/api/workflow/{workflow_id}")
async def get_workflow(workflow_id: str):
    """Get workflow details and execution status."""
    
    if workflow_id not in workflow_executions:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    workflow = workflow_executions[workflow_id]
    
    return {
        "workflow_id": workflow_id,
        "title": workflow.get("title"),
        "description": workflow.get("description"),
        "status": workflow.get("status", "created"),
        "steps": workflow.get("steps", []),
        "execution_result": workflow.get("execution_result"),
        "created_at": workflow.get("created_at"),
        "completed_at": workflow.get("completed_at"),
        "shadow_workspace_status": execution_agent.get_shadow_workspace_status()
    }


@app.post("/api/browser/navigate")
async def navigate_browser(request: BrowserNavigationRequest):
    """Simulate browser navigation (in real implementation, this would use actual browser engine)."""
    
    try:
        url = request.url
        tab_id = request.tab_id or str(uuid.uuid4())
        
        # Simulate page loading
        await asyncio.sleep(0.5)
        
        # Extract title from URL (simplified)
        if "github.com" in url:
            title = "GitHub - Repository"
            content_preview = "<h1>GitHub Repository</h1><p>Open source project page.</p>"
        elif "linkedin.com" in url:
            title = "LinkedIn - Professional Network"
            content_preview = "<h1>LinkedIn Profile</h1><p>Professional networking page.</p>"
        elif "twitter.com" in url or "x.com" in url:
            title = "Twitter - Social Network"
            content_preview = "<h1>Twitter Feed</h1><p>Social media timeline.</p>"
        else:
            title = f"Page - {url}"
            content_preview = f"<h1>Web Page</h1><p>Content from {url}</p>"
        
        return {
            "tab_id": tab_id,
            "url": url,
            "title": title,
            "content_preview": content_preview,
            "loaded_at": datetime.now().isoformat(),
            "status": "loaded"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/integrations/execute")
async def execute_integration_workflow(workflow_config: Dict[str, Any]):
    """Execute cross-platform integration workflow."""
    
    try:
        result = await universal_integration.execute_cross_platform_workflow(workflow_config)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/integrations/platforms")
async def get_available_platforms():
    """Get list of available platform integrations."""
    
    platforms = universal_integration.get_available_platforms()
    capabilities = {}
    
    for platform in platforms:
        capabilities[platform] = universal_integration.get_platform_capabilities(platform)
    
    return {
        "available_platforms": platforms,
        "total_count": len(platforms),
        "capabilities": capabilities
    }


@app.post("/api/social/monitor")
async def monitor_social_media(keywords: List[str], platforms: List[str] = None):
    """Monitor social media mentions across platforms."""
    
    try:
        result = await universal_integration.social_media_monitoring(keywords, platforms)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/shadow-workspace/status")
async def get_shadow_workspace_status():
    """Get current shadow workspace status."""
    
    try:
        status = execution_agent.get_shadow_workspace_status()
        return status
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/api/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket connection for real-time updates."""
    
    await websocket.accept()
    websocket_connections[session_id] = websocket
    
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
            
    except WebSocketDisconnect:
        del websocket_connections[session_id]
        print(f"WebSocket disconnected: {session_id}")


# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "planning_agent": "active",
            "execution_agent": "active", 
            "universal_integration": "active",
            "groq_api": "connected" if groq_client else "disconnected"
        },
        "active_sessions": len(active_sessions),
        "active_workflows": len(workflow_executions),
        "websocket_connections": len(websocket_connections)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)