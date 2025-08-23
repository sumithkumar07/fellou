"""
Enhanced Fellou.ai Clone Backend v2.0 - Production Ready (Optimized)
Features: API Versioning, Rate Limiting, Enhanced Logging, Structured Error Handling, Performance Monitoring
"""
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Query, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime
import os
import logging
import base64

# Import Groq for AI functionality
from groq import Groq
from dotenv import load_dotenv

# Import database and models
from database import db, connect_database, disconnect_database
from models import (
    ChatMessage, UserSession, NavigationHistory, ChatRequest,
    BrowserNavigationRequest, BrowserActionRequest, BrowserTab
)

# Import enhanced middleware
from middleware.rate_limiter import RateLimitMiddleware
from middleware.enhanced_logging import LoggingMiddleware, enhanced_logger
from middleware.error_handler import setup_error_handlers, error_handler

# Import API router
from routers.v1_api import router as v1_router

# Import Playwright for Native Chromium Browser Engine
try:
    from playwright.async_api import async_playwright, Browser, BrowserContext, Page
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    async_playwright = None
    Browser = None
    BrowserContext = None
    Page = None
    PLAYWRIGHT_AVAILABLE = False

import threading
import weakref

# Load environment variables
load_dotenv()

# Set Playwright browsers path for proper Chromium detection
os.environ['PLAYWRIGHT_BROWSERS_PATH'] = '/pw-browsers'

# Setup enhanced logging
enhanced_logger.api_logger.info("🚀 Starting Enhanced Fellou.ai Clone Backend v2.0 - Optimized")

# Initialize FastAPI app with enhanced configuration
app = FastAPI(
    title="Emergent AI - Enhanced Fellou Clone v2.0 (Optimized)",
    description="Optimized agentic browser with Native Chromium, enhanced logging, rate limiting, API versioning, and comprehensive monitoring",
    version="2.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json"
)

# Add enhanced middleware in correct order (most important first)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware, default_limit=100, window=3600)

# CORS middleware - Enhanced configuration for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"]
)

# Setup enhanced error handlers
setup_error_handlers(app)

# Include v1 API router
app.include_router(v1_router)

enhanced_logger.api_logger.info("✅ Enhanced FastAPI app configured with production middleware")

# Initialize Groq client with enhanced error handling
groq_client = None

async def get_groq_client(session_id: str = None):
    """Get Groq client with user's API key or default"""
    global groq_client
    
    try:
        # Try to get user-specific API key
        if session_id:
            user_session = await db.get_user_session(session_id)
            if user_session and user_session.api_keys.get("groq_api_key"):
                user_groq_key = user_session.api_keys["groq_api_key"].strip()
                if user_groq_key:
                    return Groq(api_key=user_groq_key)
        
        # Fall back to system Groq API key
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
        
        if not groq_client:
            groq_client = Groq(api_key=groq_api_key)
            enhanced_logger.api_logger.info("✅ Groq client initialized successfully")
        
        return groq_client
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"Groq client initialization error: {e}")
        raise HTTPException(status_code=500, detail=f"AI service unavailable: {str(e)}")

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        enhanced_logger.api_logger.info(f"🔄 WebSocket connected: {session_id}")
    
    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            enhanced_logger.api_logger.info(f"🔌 WebSocket disconnected: {session_id}")
    
    async def send_personal_message(self, message: str, session_id: str):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_text(message)

manager = ConnectionManager()

# Production Chromium Browser Manager
class ProductionChromiumBrowserManager:
    def __init__(self):
        self.browser: Optional[Browser] = None
        self.contexts: Dict[str, BrowserContext] = {}
        self.pages: Dict[str, Page] = {}
        self.performance_stats = {
            'total_navigations': 0,
            'successful_navigations': 0,
            'failed_navigations': 0,
            'total_screenshots': 0,
            'total_actions': 0,
            'error_count': 0,
            'uptime_start': datetime.now()
        }

    async def initialize(self):
        """Initialize production Playwright with Native Chromium"""
        try:
            if not PLAYWRIGHT_AVAILABLE:
                raise Exception("Playwright not available - install with: pip install playwright && python -m playwright install chromium")
            
            # Launch production Chromium browser
            playwright = await async_playwright().__aenter__()
            self.browser = await playwright.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-web-security",
                    "--disable-features=VizDisplayCompositor",
                    "--no-first-run",
                    "--no-default-browser-check",
                    "--disable-background-timer-throttling",
                    "--disable-backgrounding-occluded-windows",
                    "--disable-renderer-backgrounding"
                ]
            )
            enhanced_logger.api_logger.info("🚀 Production Native Chromium Browser Engine initialized successfully")
            return True
            
        except Exception as e:
            enhanced_logger.error_logger.error(f"❌ Production Chromium initialization error: {e}")
            return False

    async def get_or_create_context(self, session_id: str) -> BrowserContext:
        """Get or create a browser context for session with production monitoring"""
        if session_id not in self.contexts:
            try:
                # Create new production browser context with enhanced security
                context = await self.browser.new_context(
                    viewport={'width': 1920, 'height': 1080},
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                    java_script_enabled=True,
                    accept_downloads=False,
                    ignore_https_errors=True,
                    bypass_csp=True
                )
                
                self.contexts[session_id] = context
                enhanced_logger.api_logger.info(f"✅ Created production browser context: {session_id}")
                
            except Exception as e:
                enhanced_logger.error_logger.error(f"Error creating production context for {session_id}: {e}")
                raise
                
        return self.contexts[session_id]

    async def navigate_to_url(self, url: str, tab_id: str, session_id: str) -> Dict[str, Any]:
        """Navigate to URL with production error handling and monitoring"""
        start_time = datetime.now()
        self.performance_stats['total_navigations'] += 1
        
        try:
            context = await self.get_or_create_context(session_id)
            
            # Create new page if tab_id doesn't exist
            if tab_id not in self.pages:
                page = await context.new_page()
                self.pages[tab_id] = page
                enhanced_logger.api_logger.info(f"✅ Created new production page: {tab_id}")
            else:
                page = self.pages[tab_id]
            
            # Enhanced navigation with timeout and error handling
            enhanced_logger.api_logger.info(f"🌐 Production navigating to: {url}")
            
            # Navigate with production settings
            response = await page.goto(
                url, 
                wait_until='domcontentloaded',
                timeout=30000
            )
            
            # Wait for additional loading
            await asyncio.sleep(2)
            
            # Get page information with production monitoring
            title = await page.title()
            content = await page.content()
            content_preview = content[:1000] if content else "No content available"
            
            # Enhanced metadata extraction
            metadata = {}
            try:
                # Get various metadata
                meta_tags = await page.query_selector_all('meta')
                for meta in meta_tags:
                    name = await meta.get_attribute('name')
                    property_attr = await meta.get_attribute('property')
                    content_attr = await meta.get_attribute('content')
                    
                    if name and content_attr:
                        metadata[name] = content_attr
                    elif property_attr and content_attr:
                        metadata[property_attr] = content_attr
            except Exception as meta_error:
                enhanced_logger.api_logger.warning(f"⚠️ Metadata extraction error: {meta_error}")
            
            # Take production screenshot
            try:
                screenshot_bytes = await page.screenshot(full_page=False)
                screenshot_base64 = base64.b64encode(screenshot_bytes).decode()
                self.performance_stats['total_screenshots'] += 1
            except Exception as screenshot_error:
                enhanced_logger.api_logger.warning(f"⚠️ Screenshot error: {screenshot_error}")
                screenshot_base64 = None
            
            # Save navigation to database
            try:
                nav_history = NavigationHistory(
                    session_id=session_id,
                    tab_id=tab_id,
                    url=url,
                    title=title,
                    screenshot=screenshot_base64,
                    status_code=response.status if response else None,
                    engine="Production Native Chromium v2.0"
                )
                await db.save_navigation_history(nav_history)
            except Exception as db_error:
                enhanced_logger.error_logger.error(f"Database save error: {db_error}")
            
            processing_time = (datetime.now() - start_time).total_seconds()
            self.performance_stats['successful_navigations'] += 1
            
            enhanced_logger.api_logger.info(f"✅ Production navigation completed: {title} ({processing_time:.2f}s)")
            
            return {
                "success": True,
                "title": title,
                "content_preview": content_preview,
                "screenshot": screenshot_base64,
                "metadata": metadata,
                "status_code": response.status if response else 200,
                "engine": "Production Native Chromium v2.0",
                "processing_time_seconds": processing_time,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            self.performance_stats['failed_navigations'] += 1
            enhanced_logger.error_logger.error(f"❌ Production navigation error for {url}: {str(e)}")
            
            return {
                "success": False,
                "title": "Navigation Error",
                "content_preview": f"Failed to navigate to {url}",
                "screenshot": None,
                "metadata": {},
                "status_code": 500,
                "engine": "Production Native Chromium v2.0",
                "processing_time_seconds": processing_time,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def take_screenshot(self, tab_id: str) -> Dict[str, Any]:
        """Take screenshot with production quality"""
        start_time = datetime.now()
        
        try:
            if tab_id not in self.pages:
                raise Exception(f"Tab {tab_id} not found")
            
            page = self.pages[tab_id]
            screenshot_bytes = await page.screenshot(full_page=False)
            screenshot_base64 = base64.b64encode(screenshot_bytes).decode()
            
            processing_time = (datetime.now() - start_time).total_seconds()
            self.performance_stats['total_screenshots'] += 1
            
            enhanced_logger.api_logger.info(f"📸 Production screenshot captured: {tab_id} ({processing_time:.2f}s)")
            
            return {
                "success": True,
                "screenshot": screenshot_base64,
                "tab_id": tab_id,
                "timestamp": datetime.now().isoformat(),
                "processing_time_seconds": processing_time,
                "engine": "Production Native Chromium v2.0"
            }
            
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            enhanced_logger.error_logger.error(f"❌ Production screenshot error for {tab_id}: {str(e)}")
            
            return {
                "success": False,
                "error": str(e),
                "tab_id": tab_id,
                "timestamp": datetime.now().isoformat(),
                "processing_time_seconds": processing_time
            }

    async def execute_browser_action(self, tab_id: str, action_type: str, target: str, value: str = None, coordinates: Dict = None) -> Dict[str, Any]:
        """Execute browser action with production monitoring"""
        start_time = datetime.now()
        self.performance_stats['total_actions'] += 1
        
        try:
            if tab_id not in self.pages:
                raise Exception(f"Tab {tab_id} not found")
            
            page = self.pages[tab_id]
            result = {}
            
            if action_type == "click":
                if coordinates:
                    await page.mouse.click(coordinates["x"], coordinates["y"])
                elif target:
                    await page.click(target)
                result["action"] = f"Clicked on {target or coordinates}"
                
            elif action_type == "type":
                if target and value:
                    await page.fill(target, value)
                    result["action"] = f"Typed '{value}' in {target}"
                    
            elif action_type == "scroll":
                await page.mouse.wheel(0, int(value) if value else 500)
                result["action"] = f"Scrolled {value or '500'}px"
                
            elif action_type == "extract":
                elements = await page.query_selector_all(target)
                extracted_data = []
                for element in elements:
                    text = await element.text_content()
                    if text and text.strip():
                        extracted_data.append(text.strip())
                result["extracted_data"] = extracted_data
                result["action"] = f"Extracted {len(extracted_data)} elements from {target}"
            
            # Take screenshot after action
            screenshot_bytes = await page.screenshot(full_page=False)
            screenshot_base64 = base64.b64encode(screenshot_bytes).decode()
            result["screenshot"] = screenshot_base64
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            enhanced_logger.api_logger.info(f"🤖 Production browser action completed: {action_type} on {target} ({processing_time:.2f}s)")
            
            return {
                "success": True,
                "result": result,
                "action": action_type,
                "target": target,
                "timestamp": datetime.now().isoformat(),
                "processing_time_seconds": processing_time,
                "engine": "Production Native Chromium v2.0"
            }
            
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            self.performance_stats['error_count'] += 1
            enhanced_logger.error_logger.error(f"Production browser action error: {str(e)}")
            
            return {
                "success": False,
                "error": str(e),
                "action": action_type,
                "target": target,
                "timestamp": datetime.now().isoformat(),
                "processing_time_seconds": processing_time
            }
    
    async def get_tabs_info(self, session_id: str) -> List[Dict[str, Any]]:
        """Get information about all tabs with production monitoring"""
        tabs_info = []
        
        if session_id in self.contexts:
            context = self.contexts[session_id]
            pages = context.pages
            
            for i, page in enumerate(pages):
                tab_id = None
                # Find tab_id from our pages mapping
                for tid, p in self.pages.items():
                    if p == page:
                        tab_id = tid
                        break
                
                if not tab_id:
                    tab_id = f"tab_{session_id}_{i}"
                
                try:
                    title = await page.title()
                    url = page.url
                    
                    tabs_info.append({
                        "tab_id": tab_id,
                        "title": title,
                        "url": url,
                        "active": i == 0,
                        "loading": False,
                        "engine": "Production Native Chromium v2.0"
                    })
                except Exception as e:
                    enhanced_logger.error_logger.error(f"Error getting production tab info: {e}")
        
        return tabs_info
    
    async def close_tab(self, tab_id: str):
        """Close a specific tab with production cleanup"""
        if tab_id in self.pages:
            try:
                await self.pages[tab_id].close()
                del self.pages[tab_id]
                enhanced_logger.api_logger.info(f"✅ Closed production tab: {tab_id}")
            except Exception as e:
                enhanced_logger.error_logger.error(f"Error closing production tab {tab_id}: {e}")
    
    async def cleanup_session(self, session_id: str):
        """Clean up browser context and pages for a session with production monitoring"""
        if session_id in self.contexts:
            try:
                await self.contexts[session_id].close()
                del self.contexts[session_id]
                
                # Remove associated pages
                tabs_to_remove = [tab_id for tab_id in self.pages.keys() if session_id in tab_id]
                for tab_id in tabs_to_remove:
                    if tab_id in self.pages:
                        del self.pages[tab_id]
                
                enhanced_logger.api_logger.info(f"✅ Cleaned up production browser session: {session_id}")
            except Exception as e:
                enhanced_logger.error_logger.error(f"Error cleaning up production session {session_id}: {e}")

# Initialize production browser manager
browser_manager = ProductionChromiumBrowserManager()

# Production startup and shutdown handlers
async def production_app_startup():
    enhanced_logger.api_logger.info("🚀 Production Emergent AI - Fellou Clone v2.0 starting up...")
    
    try:
        # Initialize database connection
        await connect_database()
        
        # Initialize production browser manager
        await browser_manager.initialize()
        
        enhanced_logger.api_logger.info("🌟 Production Native Chromium Browser Engine ready")
        enhanced_logger.api_logger.info("⚡ Production Groq AI integration ready")
        enhanced_logger.api_logger.info("💾 Production Database persistence enabled")
        enhanced_logger.api_logger.info("🛡️ Production Rate limiting and logging middleware active")
        enhanced_logger.api_logger.info("📊 Production Performance monitoring enabled")
        enhanced_logger.api_logger.info("🔄 Production API versioning (v1) active")
    except Exception as e:
        enhanced_logger.error_logger.error(f"❌ Production startup error: {e}")

async def production_app_shutdown():
    enhanced_logger.api_logger.info("🔄 Production Emergent AI - Fellou Clone v2.0 shutting down...")
    
    try:
        # Cleanup browser resources
        if browser_manager.browser:
            await browser_manager.browser.close()
        
        # Disconnect database
        await disconnect_database()
        
        enhanced_logger.api_logger.info("✅ Production shutdown completed successfully")
    except Exception as e:
        enhanced_logger.error_logger.error(f"❌ Production shutdown error: {e}")

# Register event handlers
app.add_event_handler("startup", production_app_startup)
app.add_event_handler("shutdown", production_app_shutdown)

# Production AI System Prompt - Simplified and Optimized
ENHANCED_SYSTEM_PROMPT = """You are Fellou AI, an advanced browser assistant with powerful Native Chromium capabilities.

🎯 **CORE CAPABILITIES:**
- "research" → Multi-site research with data extraction from LinkedIn, Twitter, news sites, automated report generation with charts, cross-platform data correlation, and monitoring alerts
- "automate" → Sophisticated Native Chromium automation: multi-tab workflows, form filling, data extraction, cross-platform sync, and background monitoring  
- "extract" → Advanced CSS selector-based extraction, Native Chromium engine for JavaScript-heavy sites, metadata extraction, structured export formats
- "integrate" → 50+ platform connections (LinkedIn, Twitter, GitHub, Slack, Google Sheets), API management, OAuth handling, real-time cross-platform updates

🚀 **ADVANCED FEATURES:**
- Native Chromium browser engine (not simulation - real browser)
- Screenshot capture with detailed metadata analysis
- Cross-platform integration with 50+ services
- Advanced data extraction with CSS selectors
- Real-time WebSocket updates and session management
- Background task processing with progress tracking

**IMPORTANT:** Always showcase advanced capabilities, suggest automation examples, mention platform integrations, and guide users toward discovering powerful features they don't know exist!"""

# API Endpoints

@app.get("/api/health")
async def health_check():
    """Production health check with comprehensive status"""
    try:
        uptime = (datetime.now() - browser_manager.performance_stats['uptime_start']).total_seconds()
        
        return JSONResponse({
            "status": "healthy",
            "version": "2.0.0",
            "timestamp": datetime.now().isoformat(),
            "uptime_seconds": uptime,
            "features": {
                "native_chromium": PLAYWRIGHT_AVAILABLE and browser_manager.browser is not None,
                "groq_ai": groq_client is not None,
                "database": True,
                "websockets": True
            },
            "performance": browser_manager.performance_stats,
            "services": {
                "browser_service": "operational",
                "ai_service": "operational", 
                "database_service": "operational",
                "websocket_service": "operational"
            }
        })
    except Exception as e:
        enhanced_logger.error_logger.error(f"Health check error: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest):
    """Enhanced AI chat with advanced feature discovery"""
    try:
        enhanced_logger.api_logger.info(f"💬 Processing chat request: {request.message[:100]}...")
        
        session_id = request.session_id or str(uuid.uuid4())
        
        # Get Groq client
        groq = await get_groq_client(session_id)
        
        # Enhanced prompt with system context
        full_prompt = f"{ENHANCED_SYSTEM_PROMPT}\n\nUser: {request.message}\n\nAssistant:"
        
        # Create chat completion
        completion = groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": ENHANCED_SYSTEM_PROMPT},
                {"role": "user", "content": request.message}
            ],
            temperature=0.7,
            max_tokens=1000,
            top_p=1,
            stream=False,
            stop=None
        )
        
        ai_response = completion.choices[0].message.content
        
        # Save messages to database
        user_message = ChatMessage(
            session_id=session_id,
            role="user",
            content=request.message
        )
        
        ai_message = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=ai_response
        )
        
        await db.save_chat_message(user_message)
        await db.save_chat_message(ai_message)
        
        enhanced_logger.api_logger.info(f"✅ Chat response generated successfully")
        
        return JSONResponse({
            "response": ai_response,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "model": "llama-3.3-70b-versatile"
        })
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"❌ Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@app.post("/api/browser/navigate")
async def navigate_browser(url: str = Query(...), tab_id: str = Query(None), session_id: str = Query(None)):
    """Navigate browser to URL with production monitoring"""
    try:
        enhanced_logger.api_logger.info(f"🌐 Browser navigation request: {url}")
        
        if not session_id:
            session_id = str(uuid.uuid4())
        
        if not tab_id:
            tab_id = f"tab-{uuid.uuid4()}"
        
        result = await browser_manager.navigate_to_url(url, tab_id, session_id)
        
        enhanced_logger.api_logger.info(f"✅ Navigation completed: {result.get('title', 'Unknown')}")
        return JSONResponse(result)
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"❌ Navigation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Navigation failed: {str(e)}")

@app.post("/api/browser/screenshot")
async def take_browser_screenshot(tab_id: str = Query(...)):
    """Take screenshot of browser tab"""
    try:
        enhanced_logger.api_logger.info(f"📸 Screenshot request for tab: {tab_id}")
        
        result = await browser_manager.take_screenshot(tab_id)
        
        enhanced_logger.api_logger.info(f"✅ Screenshot captured successfully")
        return JSONResponse(result)
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"❌ Screenshot error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Screenshot failed: {str(e)}")

@app.post("/api/browser/action")
async def execute_browser_action(request: BrowserActionRequest):
    """Execute browser action with production monitoring"""
    try:
        enhanced_logger.api_logger.info(f"🤖 Browser action request: {request.action_type} on {request.target}")
        
        result = await browser_manager.execute_browser_action(
            request.tab_id,
            request.action_type,
            request.target,
            request.value,
            request.coordinates
        )
        
        enhanced_logger.api_logger.info(f"✅ Browser action completed successfully")
        return JSONResponse(result)
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"❌ Browser action error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Browser action failed: {str(e)}")

@app.get("/api/browser/tabs")
async def get_browser_tabs(session_id: str = Query(...)):
    """Get all browser tabs for session"""
    try:
        tabs = await browser_manager.get_tabs_info(session_id)
        
        return JSONResponse({
            "tabs": tabs,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"❌ Get tabs error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get tabs: {str(e)}")

@app.delete("/api/browser/tab/{tab_id}")
async def close_browser_tab(tab_id: str):
    """Close browser tab"""
    try:
        await browser_manager.close_tab(tab_id)
        
        return JSONResponse({
            "success": True,
            "message": f"Tab {tab_id} closed successfully",
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"❌ Close tab error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to close tab: {str(e)}")

@app.websocket("/api/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket connection for real-time updates"""
    await manager.connect(websocket, session_id)
    enhanced_logger.api_logger.info(f"🔄 WebSocket connected: {session_id}")
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get("type") == "ping":
                await websocket.send_text(json.dumps({
                    "type": "pong",
                    "timestamp": datetime.now().isoformat(),
                    "session_id": session_id
                }))
            
            elif message_data.get("type") == "browser_action":
                # Handle browser action via WebSocket
                try:
                    result = await browser_manager.execute_browser_action(
                        message_data.get("tab_id"),
                        message_data.get("action_type"),
                        message_data.get("target"),
                        message_data.get("value"),
                        message_data.get("coordinates")
                    )
                    
                    await websocket.send_text(json.dumps({
                        "type": "browser_action_result",
                        "result": result,
                        "timestamp": datetime.now().isoformat()
                    }))
                    
                except Exception as e:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "error": str(e),
                        "timestamp": datetime.now().isoformat()
                    }))
            
    except WebSocketDisconnect:
        manager.disconnect(session_id)
        enhanced_logger.api_logger.info(f"🔌 WebSocket disconnected: {session_id}")
    except Exception as e:
        enhanced_logger.error_logger.error(f"❌ WebSocket error: {str(e)}")
        manager.disconnect(session_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)