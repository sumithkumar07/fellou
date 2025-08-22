"""
Complete API v1 Router with core endpoints (Optimized)
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
    ChatMessage, UserSession, NavigationHistory, BrowserTab
)

# Import middleware for logging
from middleware.enhanced_logging import enhanced_logger

# Create v1 router
router = APIRouter(prefix="/api/v1", tags=["API v1"])

# ==================== CHAT MANAGEMENT v1 ====================

@router.get("/chat/history/{session_id}")
async def get_chat_history_v1(session_id: str, limit: int = Query(50, ge=1, le=100)):
    """Get chat history for session v1"""
    try:
        messages = await db.get_chat_history(session_id, limit)
        enhanced_logger.api_logger.info(f"Retrieved {len(messages)} chat messages for session: {session_id}")
        
        return JSONResponse({
            "status": "success",
            "messages": [msg.model_dump() for msg in messages],
            "session_id": session_id,
            "count": len(messages),
            "api_version": "v1"
        })
    except Exception as e:
        enhanced_logger.error_logger.error(f"Get chat history error v1: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== BROWSER MANAGEMENT v1 ====================

@router.get("/browser/tabs/{session_id}")
async def get_browser_tabs_v1(session_id: str):
    """Get browser tabs for session v1"""
    try:
        tabs = await db.get_browser_tabs(session_id)
        enhanced_logger.api_logger.info(f"Retrieved {len(tabs)} browser tabs for session: {session_id}")
        
        return JSONResponse({
            "status": "success",
            "tabs": [tab.model_dump() for tab in tabs],
            "session_id": session_id,
            "count": len(tabs),
            "api_version": "v1"
        })
    except Exception as e:
        enhanced_logger.error_logger.error(f"Get browser tabs error v1: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/navigation/history/{session_id}")
async def get_navigation_history_v1(session_id: str, limit: int = Query(50, ge=1, le=100)):
    """Get navigation history for session v1"""
    try:
        history = await db.get_navigation_history(session_id, limit)
        enhanced_logger.api_logger.info(f"Retrieved {len(history)} navigation entries for session: {session_id}")
        
        return JSONResponse({
            "status": "success",
            "history": [entry.model_dump() for entry in history],
            "session_id": session_id,
            "count": len(history),
            "api_version": "v1"
        })
    except Exception as e:
        enhanced_logger.error_logger.error(f"Get navigation history error v1: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== SESSION MANAGEMENT v1 ====================

@router.get("/session/{session_id}")
async def get_session_info_v1(session_id: str):
    """Get session information v1"""
    try:
        session = await db.get_user_session(session_id)
        if not session:
            # Create new session
            session = UserSession(session_id=session_id)
            await db.save_user_session(session)
        
        enhanced_logger.api_logger.info(f"Retrieved session info: {session_id}")
        
        return JSONResponse({
            "status": "success",
            "session": session.model_dump(),
            "api_version": "v1"
        })
    except Exception as e:
        enhanced_logger.error_logger.error(f"Get session error v1: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/session/update")
async def update_session_v1(request: Dict[str, Any]):
    """Update session information v1"""
    try:
        session_id = request.get("session_id")
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id is required")
        
        session = await db.get_user_session(session_id)
        if not session:
            session = UserSession(session_id=session_id)
        
        # Update session data
        if "settings" in request:
            session.settings.update(request["settings"])
        if "api_keys" in request:
            session.api_keys.update(request["api_keys"])
        
        session.last_activity = datetime.now()
        await db.save_user_session(session)
        
        enhanced_logger.api_logger.info(f"Updated session: {session_id}")
        
        return JSONResponse({
            "status": "success",
            "message": "Session updated successfully",
            "session_id": session_id,
            "api_version": "v1"
        })
    except Exception as e:
        enhanced_logger.error_logger.error(f"Update session error v1: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== SYSTEM INFO v1 ====================

@router.get("/system/info")
async def get_system_info_v1():
    """Get system information v1"""
    try:
        return JSONResponse({
            "status": "healthy",
            "api_version": "v1",
            "timestamp": datetime.now().isoformat(),
            "features": {
                "chat": True,
                "browser": True,
                "navigation_history": True,
                "sessions": True
            },
            "endpoints": {
                "chat_history": "/api/v1/chat/history/{session_id}",
                "browser_tabs": "/api/v1/browser/tabs/{session_id}",
                "navigation_history": "/api/v1/navigation/history/{session_id}",
                "session_info": "/api/v1/session/{session_id}",
                "session_update": "/api/v1/session/update",
                "system_info": "/api/v1/system/info"
            }
        })
    except Exception as e:
        enhanced_logger.error_logger.error(f"System info error v1: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))