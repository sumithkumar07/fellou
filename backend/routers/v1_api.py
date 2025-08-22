"""
Complete API v1 Router with all endpoints
"""
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Query, Body, Request
from fastapi.responses import JSONResponse
import asyncio
import json
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime

# Import database and models
from database import db
from models import (
    Workflow, ExecutionHistory, ChatMessage, UserSession, 
    UserSettings, NavigationHistory, WorkflowStep
)

# Import middleware for logging
from middleware.enhanced_logging import enhanced_logger

# Create v1 router
router = APIRouter(prefix="/api/v1", tags=["API v1"])

# ==================== SETTINGS MANAGEMENT v1 ====================

@router.get("/settings/{session_id}")
async def get_user_settings_v1(session_id: str):
    """Get user settings for session v1"""
    try:
        settings = await db.get_user_settings(session_id)
        enhanced_logger.api_logger.info(f"Retrieved settings for session: {session_id}")
        
        return JSONResponse({
            "status": "success",
            "settings": settings.model_dump(),
            "session_id": session_id,
            "api_version": "v1"
        })
    except Exception as e:
        enhanced_logger.error_logger.error(f"Get settings error v1: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/settings/save")
async def save_user_settings_v1(request: Dict[str, Any]):
    """Save user settings v1"""
    try:
        session_id = request.get("session_id")
        section = request.get("section")
        settings_data = request.get("settings_data", {})
        
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id is required")
        
        # Get current settings
        current_settings = await db.get_user_settings(session_id)
        
        # Update specific section
        if section and hasattr(current_settings, section):
            setattr(current_settings, section, settings_data)
        else:
            # Update entire settings object
            for key, value in settings_data.items():
                if hasattr(current_settings, key):
                    setattr(current_settings, key, value)
        
        # Save updated settings
        await db.save_user_settings(current_settings)
        
        enhanced_logger.api_logger.info(f"Saved settings for session: {session_id}, section: {section}")
        
        return JSONResponse({
            "status": "success",
            "message": "Settings saved successfully",
            "updated_section": section,
            "session_id": session_id,
            "api_version": "v1"
        })
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"Save settings error v1: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== WORKFLOW MANAGEMENT v1 ====================

@router.get("/workflows/{session_id}")
async def get_workflows_v1(session_id: str, limit: int = 50):
    """Get workflows for a session v1"""
    try:
        workflows = await db.get_workflows(session_id, limit)
        
        enhanced_logger.api_logger.info(f"Retrieved {len(workflows)} workflows for session: {session_id}")
        
        return JSONResponse({
            "status": "success",
            "workflows": [w.model_dump(mode='json') for w in workflows],
            "total": len(workflows),
            "session_id": session_id,
            "api_version": "v1"
        })
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"Get workflows error v1: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{session_id}")
async def get_execution_history_v1(session_id: str, limit: int = 100):
    """Get execution history for a session v1"""
    try:
        history = await db.get_execution_history(session_id, limit)
        
        enhanced_logger.api_logger.info(f"Retrieved {len(history)} history records for session: {session_id}")
        
        return JSONResponse({
            "status": "success",
            "history": [h.model_dump(mode='json') for h in history],
            "total": len(history),
            "session_id": session_id,
            "api_version": "v1"
        })
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"Get execution history error v1: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workflow/create")
async def create_workflow_v1(request: Dict[str, Any]):
    """Create new workflow v1 with enhanced validation"""
    
    try:
        instruction = request.get("instruction", "").strip()
        session_id = request.get("session_id")
        workflow_type = request.get("workflow_type", "general")
        
        # Enhanced error handling
        if not instruction:
            raise HTTPException(
                status_code=400, 
                detail={
                    "error": "Instruction is required",
                    "message": "Please provide a valid instruction for workflow creation",
                    "required_fields": ["instruction"],
                    "api_version": "v1"
                }
            )
        
        # Get or create session
        user_session = await db.get_or_create_session(session_id)
        session_id = user_session.session_id
        
        # Import browser manager (we'll need this reference)
        from server_v2 import browser_manager, get_groq_client
        
        # Get user-specific Groq client
        client = await get_groq_client(session_id)
        if not client:
            raise HTTPException(status_code=500, detail="AI service not available")
        
        # Enhanced workflow planning
        workflow_prompt = f"""Create a detailed workflow plan for: {instruction}

Break this into specific, actionable steps that can be executed using a Native Chromium browser engine. Include:
1. Website navigation steps
2. Browser actions (click, type, scroll, extract)
3. Data processing steps
4. Report generation if needed

Return a structured plan with clear steps, estimated time, and required browser actions."""
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a workflow planning AI for an agentic browser with Native Chromium capabilities."},
                {"role": "user", "content": workflow_prompt}
            ],
            temperature=0.3,
            max_tokens=1200
        )
        
        # Create enhanced workflow structure
        workflow = Workflow(
            session_id=session_id,
            title=f"Workflow: {instruction[:50]}..." if len(instruction) > 50 else instruction,
            description=completion.choices[0].message.content,
            instruction=instruction,
            steps=[
                WorkflowStep(action="navigate", target="research_websites", description="Navigate to relevant websites"),
                WorkflowStep(action="extract_data", target="key_information", description="Extract required information"),
                WorkflowStep(action="process_data", target="analysis", description="Process and analyze data"),
                WorkflowStep(action="generate_report", target="final_output", description="Generate comprehensive report")
            ],
            estimated_time_minutes=10,
            estimated_credits=25,
            required_platforms=["web", "native_browser"],
            browser_actions=True,
            deep_action_enabled=True,
            status="created"
        )
        
        # Save workflow to database
        await db.save_workflow(workflow)
        
        # Update session counters
        await db.update_session(session_id, {"total_workflows": user_session.total_workflows + 1})
        
        enhanced_logger.api_logger.info(f"Created workflow for session: {session_id}")
        
        return JSONResponse({
            "status": "created",
            "workflow": workflow.model_dump(mode='json'),
            "message": "Enhanced workflow plan created with Native Browser integration v1",
            "api_version": "v1"
        })
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"Workflow creation error v1: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== BROWSER ENDPOINTS v1 ====================

@router.post("/browser/action")
async def execute_browser_action_v1(request: Dict[str, Any]):
    """Execute browser actions v1"""
    
    try:
        tab_id = request.get("tab_id")
        if not tab_id:
            raise HTTPException(status_code=400, detail="tab_id is required")
        
        # Import browser manager
        from server_v2 import browser_manager
        
        result = await browser_manager.execute_browser_action(tab_id, request)
        
        enhanced_logger.api_logger.info(f"Executed browser action: {request.get('action_type')} on tab: {tab_id}")
        
        return JSONResponse({
            **result,
            "api_version": "v1"
        })
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"Browser action error v1: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/browser/tabs")
async def get_browser_tabs_v1(session_id: str = Query(...)):
    """Get all browser tabs for a session v1"""
    
    try:
        # Import browser manager
        from server_v2 import browser_manager
        
        tabs_info = await browser_manager.get_tabs_info(session_id)
        
        enhanced_logger.api_logger.info(f"Retrieved {len(tabs_info)} tabs for session: {session_id}")
        
        return JSONResponse({
            "tabs": tabs_info,
            "session_id": session_id,
            "total_tabs": len(tabs_info),
            "engine": "Enhanced Native Chromium v2.0",
            "api_version": "v1"
        })
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"Get tabs error v1: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/browser/tab/{tab_id}")
async def close_browser_tab_v1(tab_id: str):
    """Close a specific browser tab v1"""
    
    try:
        # Import browser manager
        from server_v2 import browser_manager
        
        await browser_manager.close_tab(tab_id)
        
        enhanced_logger.api_logger.info(f"Closed tab: {tab_id}")
        
        return JSONResponse({
            "success": True,
            "message": f"Tab {tab_id} closed successfully",
            "timestamp": datetime.now().isoformat(),
            "api_version": "v1"
        })
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"Close tab error v1: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/browser/screenshot")
async def take_screenshot_v1(tab_id: str = Query(...)):
    """Take screenshot of current page v1"""
    
    try:
        # Import browser manager
        from server_v2 import browser_manager
        
        result = await browser_manager.execute_browser_action(tab_id, {
            "action_type": "screenshot"
        })
        
        enhanced_logger.api_logger.info(f"Took screenshot for tab: {tab_id}")
        
        return JSONResponse({
            **result,
            "api_version": "v1"
        })
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"Screenshot error v1: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== WEBSOCKET v1 ====================

@router.websocket("/ws/{session_id}")
async def websocket_endpoint_v1(websocket: WebSocket, session_id: str):
    """WebSocket for real-time communication v1"""
    
    await websocket.accept()
    
    # Import active_websockets
    from server_v2 import active_websockets, browser_manager
    
    active_websockets[session_id] = websocket
    
    enhanced_logger.api_logger.info(f"WebSocket connected for session: {session_id}")
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Process different message types
            message_type = message_data.get("type")
            
            if message_type == "ping":
                await websocket.send_text(json.dumps({
                    "type": "pong",
                    "api_version": "v1"
                }))
                
            elif message_type == "workflow_progress":
                # Send workflow progress updates
                await websocket.send_text(json.dumps({
                    "type": "workflow_progress",
                    "progress": 75,
                    "status": "executing_browser_actions",
                    "message": "Processing workflow with Enhanced Native Chromium v2.0...",
                    "engine": "Enhanced Native Chromium v2.0",
                    "api_version": "v1"
                }))
                
            elif message_type == "browser_action":
                # Handle real-time browser actions
                tab_id = message_data.get("tab_id")
                if tab_id:
                    try:
                        result = await browser_manager.execute_browser_action(tab_id, message_data)
                        await websocket.send_text(json.dumps({
                            "type": "browser_action_result",
                            "result": result,
                            "api_version": "v1"
                        }))
                    except Exception as e:
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": str(e),
                            "api_version": "v1"
                        }))
            
            else:
                # Echo other messages
                await websocket.send_text(json.dumps({
                    "type": "echo",
                    "message": f"Received: {message_data}",
                    "api_version": "v1"
                }))
            
    except WebSocketDisconnect:
        if session_id in active_websockets:
            del active_websockets[session_id]
        enhanced_logger.api_logger.info(f"WebSocket disconnected for session: {session_id}")
    except Exception as e:
        enhanced_logger.error_logger.error(f"WebSocket error v1: {str(e)}")
        if session_id in active_websockets:
            del active_websockets[session_id]

# ==================== SYSTEM CAPABILITIES v1 ====================

@router.get("/system/capabilities")
async def system_capabilities_v1():
    """Get detailed system capabilities v1"""
    
    enhanced_logger.api_logger.info("Retrieved system capabilities v1")
    
    return JSONResponse({
        "api_version": "v1",
        "fellou_clone": True,
        "agentic_browser": True,
        "native_chromium_engine": True,
        "enhancements": {
            "rate_limiting": True,
            "enhanced_logging": True,
            "structured_error_handling": True,
            "performance_monitoring": True,
            "api_versioning": True
        },
        "ai_integration": {
            "provider": "Groq",
            "model": "llama-3.3-70b-versatile",
            "chat_support": True,
            "workflow_planning": True,
            "deep_action_planning": True
        },
        "browser_capabilities": {
            "native_chromium": True,
            "full_page_navigation": True,
            "javascript_execution": True,
            "screenshot_capture": True,
            "data_extraction": True,
            "form_automation": True,
            "click_automation": True,
            "scroll_automation": True,
            "multi_tab_support": True,
            "session_isolation": True,
            "enhanced_performance": True
        },
        "automation_features": {
            "deep_action_technology": True,
            "workflow_execution": True,
            "multi_step_automation": True,
            "cross_platform_integration": True,
            "real_time_updates": True,
            "visual_feedback": True,
            "performance_tracking": True
        },
        "core_features": {
            "session_management": True,
            "workflow_creation": True,
            "real_time_communication": True,
            "ai_powered_responses": True,
            "browser_context_isolation": True,
            "enhanced_error_handling": True
        },
        "performance": {
            "fast_responses": True,
            "session_persistence": True,
            "error_handling": True,
            "logging": True,
            "native_performance": True,
            "scalable_architecture": True,
            "monitoring": True
        },
        "version_info": {
            "backend_version": "2.0.0",
            "api_version": "v1",
            "browser_engine": "Enhanced Native Chromium v2.0",
            "last_updated": datetime.now().isoformat()
        }
    })