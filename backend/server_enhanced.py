"""
Enhanced Fellou.ai Clone Backend v2.0 - Production Ready
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
    Workflow, ExecutionHistory, ChatMessage, UserSession, 
    UserSettings, NavigationHistory, ChatRequest, WorkflowRequest,
    SettingsRequest, WorkflowStep
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
enhanced_logger.api_logger.info("🚀 Starting Enhanced Fellou.ai Clone Backend v2.0 - Production Ready")

# Initialize FastAPI app with enhanced configuration
app = FastAPI(
    title="Emergent AI - Enhanced Fellou Clone v2.0 (Production)",
    description="Production-ready agentic browser with Native Chromium, enhanced logging, rate limiting, API versioning, and comprehensive monitoring",
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
    """Get Groq client with user's API key or default - Enhanced version"""
    global groq_client
    
    try:
        # Try to get user-specific API key
        if session_id:
            user_settings = await db.get_user_settings(session_id)
            user_api_key = user_settings.integrations.get("groq_api_key", "").strip()
            if user_api_key:
                enhanced_logger.api_logger.info(f"Using user-specific Groq API key for session: {session_id}")
                return Groq(api_key=user_api_key)
        
        # Fall back to default API key
        default_api_key = os.getenv("GROQ_API_KEY")
        if default_api_key and not groq_client:
            groq_client = Groq(api_key=default_api_key)
            enhanced_logger.api_logger.info("✅ Groq client initialized with default key")
        
        return groq_client
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"❌ Groq initialization failed: {e}")
        return None

# Enhanced Browser Management with comprehensive monitoring
playwright_instance = None
browser_instance = None
active_websockets = {}  # Make this accessible to router
browser_windows = {}

class ProductionChromiumBrowserManager:
    """Production-ready Native Chromium Browser Engine Manager"""
    
    def __init__(self):
        self.playwright = None
        self.browser = None
        self.contexts = {}  # session_id -> BrowserContext
        self.pages = {}     # tab_id -> Page
        self.is_initialized = False
        self.performance_stats = {
            'total_navigations': 0,
            'total_actions': 0,
            'total_screenshots': 0,
            'avg_response_time': 0,
            'success_rate': 0,
            'error_count': 0,
            'session_count': 0
        }
        self.start_time = datetime.now()
        
    async def initialize(self):
        """Initialize the Production Playwright browser engine"""
        try:
            if not PLAYWRIGHT_AVAILABLE:
                enhanced_logger.error_logger.warning("⚠️ Playwright not available - browser functionality disabled")
                self.is_initialized = False
                return
                
            if not self.is_initialized:
                enhanced_logger.performance_logger.info("🚀 Initializing Production Native Chromium Browser Engine")
                
                self.playwright = await async_playwright().start()
                self.browser = await self.playwright.chromium.launch(
                    headless=True,
                    args=[
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--single-process',
                        '--disable-gpu',
                        '--disable-background-timer-throttling',
                        '--disable-backgrounding-occluded-windows',
                        '--disable-renderer-backgrounding',
                        '--disable-web-security',
                        '--disable-features=VizDisplayCompositor'
                    ]
                )
                self.is_initialized = True
                enhanced_logger.api_logger.info("🚀 Production Native Chromium Browser Engine initialized successfully")
        except Exception as e:
            enhanced_logger.error_logger.error(f"❌ Production Browser initialization failed: {e}")
            self.is_initialized = False
    
    async def create_browser_context(self, session_id: str):
        """Create a new browser context for session isolation with enhanced monitoring"""
        if not PLAYWRIGHT_AVAILABLE:
            raise HTTPException(status_code=500, detail="Browser engine not available - Playwright disabled")
            
        if not self.is_initialized:
            await self.initialize()
            
        if not self.browser:
            raise HTTPException(status_code=500, detail="Browser engine not available")
            
        if session_id not in self.contexts:
            context = await self.browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Emergent-Production/2.0'
            )
            self.contexts[session_id] = context
            self.performance_stats['session_count'] += 1
            enhanced_logger.api_logger.info(f"✅ Created production browser context for session: {session_id}")
        
        return self.contexts[session_id]
    
    async def create_page(self, session_id: str, tab_id: str = None):
        """Create a new page (tab) with enhanced tracking"""
        if not PLAYWRIGHT_AVAILABLE:
            raise HTTPException(status_code=500, detail="Browser engine not available - Playwright disabled")
            
        if not tab_id:
            tab_id = f"tab_{session_id}_{len(self.pages)}"
            
        context = await self.create_browser_context(session_id)
        page = await context.new_page()
        
        # Enhanced page setup for production
        await page.set_extra_http_headers({
            'Accept-Language': 'en-US,en;q=0.9',
            'X-Powered-By': 'Emergent-AI-Production-v2.0'
        })
        
        self.pages[tab_id] = page
        enhanced_logger.api_logger.info(f"✅ Created production tab: {tab_id}")
        return tab_id, page

    async def navigate_to_url(self, tab_id: str, url: str) -> Dict[str, Any]:
        """Production navigation with comprehensive monitoring"""
        start_time = datetime.now()
        
        try:
            if tab_id not in self.pages:
                raise HTTPException(status_code=404, detail="Tab not found")
                
            page = self.pages[tab_id]
            
            # Production navigation with enhanced error handling
            response = await page.goto(url, wait_until='networkidle', timeout=30000)
            await page.wait_for_load_state('domcontentloaded')
            
            # Extract comprehensive page information for production
            title = await page.title()
            current_url = page.url
            
            # Optimized screenshot for production
            screenshot_bytes = await page.screenshot(type='png', quality=80)
            screenshot_base64 = base64.b64encode(screenshot_bytes).decode()
            
            # Enhanced content preview
            content_preview = await page.evaluate("""
                () => {
                    const textContent = document.body.innerText || '';
                    const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText);
                    return {
                        text: textContent.substring(0, 500) + (textContent.length > 500 ? '...' : ''),
                        headings: headings.slice(0, 10),
                        word_count: textContent.split(/\\s+/).length
                    };
                }
            """)
            
            # Comprehensive metadata extraction for production
            metadata = await page.evaluate("""
                () => {
                    const meta = {};
                    const metaTags = document.querySelectorAll('meta');
                    metaTags.forEach(tag => {
                        const name = tag.getAttribute('name') || tag.getAttribute('property');
                        const content = tag.getAttribute('content');
                        if (name && content) {
                            meta[name] = content;
                        }
                    });
                    
                    // Add comprehensive page info for production
                    meta['page_load_time'] = performance.now();
                    meta['page_url'] = window.location.href;
                    meta['page_title'] = document.title;
                    meta['page_description'] = document.querySelector('meta[name="description"]')?.content || '';
                    meta['page_keywords'] = document.querySelector('meta[name="keywords"]')?.content || '';
                    meta['page_canonical'] = document.querySelector('link[rel="canonical"]')?.href || '';
                    meta['page_language'] = document.documentElement.lang || '';
                    meta['page_links_count'] = document.querySelectorAll('a').length;
                    meta['page_images_count'] = document.querySelectorAll('img').length;
                    meta['page_forms_count'] = document.querySelectorAll('form').length;
                    
                    return meta;
                }
            """)
            
            # Update production performance stats
            processing_time = (datetime.now() - start_time).total_seconds()
            self.performance_stats['total_navigations'] += 1
            
            # Calculate success rate
            total_attempts = self.performance_stats['total_navigations'] + self.performance_stats['error_count']
            self.performance_stats['success_rate'] = (self.performance_stats['total_navigations'] / total_attempts * 100) if total_attempts > 0 else 0
            
            result = {
                "success": True,
                "tab_id": tab_id,
                "url": current_url,
                "title": title,
                "screenshot": screenshot_base64,
                "content_preview": content_preview,
                "metadata": metadata,
                "status_code": response.status if response else 200,
                "timestamp": datetime.now().isoformat(),
                "engine": "Production Native Chromium v2.0",
                "processing_time_seconds": processing_time,
                "performance_stats": self.performance_stats
            }
            
            enhanced_logger.performance_logger.info(f"Production navigation completed: {url} in {processing_time:.2f}s")
            return result
            
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            self.performance_stats['error_count'] += 1
            enhanced_logger.error_logger.error(f"Production navigation error for {url}: {str(e)}")
            
            return {
                "success": False,
                "error": str(e),
                "tab_id": tab_id,
                "url": url,
                "timestamp": datetime.now().isoformat(),
                "processing_time_seconds": processing_time,
                "error_type": type(e).__name__
            }

    async def execute_browser_action(self, tab_id: str, action_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute browser actions with production monitoring"""
        action_type = action_data.get("action_type", "unknown")
        target = action_data.get("target", "")
        start_time = datetime.now()
        
        try:
            if tab_id not in self.pages:
                raise HTTPException(status_code=404, detail="Tab not found")
                
            page = self.pages[tab_id]
            value = action_data.get("value")
            
            result = {"success": True, "action": action_type, "target": target}
            
            if action_type == "click":
                if target.startswith("#") or target.startswith(".") or target in ["button", "a", "input"]:
                    await page.click(target)
                else:
                    # Click by coordinates if target is coordinates
                    coords = action_data.get("coordinates", {})
                    if coords:
                        await page.mouse.click(coords.get("x", 0), coords.get("y", 0))
                result["message"] = f"Clicked on {target}"
                
            elif action_type == "type":
                await page.type(target, value)
                result["message"] = f"Typed '{value}' into {target}"
                
            elif action_type == "scroll":
                scroll_y = action_data.get("scroll_y", 500)
                await page.mouse.wheel(0, scroll_y)
                result["message"] = f"Scrolled by {scroll_y}px"
                
            elif action_type == "wait":
                wait_time = action_data.get("wait_time", 1000)
                await page.wait_for_timeout(wait_time)
                result["message"] = f"Waited for {wait_time}ms"
                
            elif action_type == "extract_data":
                # Enhanced data extraction for production
                elements = await page.query_selector_all(target)
                extracted_data = []
                for element in elements:
                    text_content = await element.text_content()
                    if text_content:
                        extracted_data.append(text_content.strip())
                result["extracted_data"] = extracted_data
                result["message"] = f"Extracted {len(extracted_data)} elements"
                
            elif action_type == "screenshot":
                screenshot_bytes = await page.screenshot(type='png', quality=80)
                screenshot_base64 = base64.b64encode(screenshot_bytes).decode()
                result["screenshot"] = screenshot_base64
                result["message"] = "Production screenshot captured"
                self.performance_stats['total_screenshots'] += 1
                
            else:
                result["success"] = False
                result["error"] = f"Unknown action type: {action_type}"
            
            # Update performance stats
            processing_time = (datetime.now() - start_time).total_seconds()
            self.performance_stats['total_actions'] += 1
            
            result["timestamp"] = datetime.now().isoformat()
            result["processing_time_seconds"] = processing_time
            
            return result
            
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
    enhanced_logger.api_logger.info("🛑 Production services shutting down...")
    
    try:
        # Close production browser engine
        if browser_manager.browser:
            await browser_manager.browser.close()
        if browser_manager.playwright:
            await browser_manager.playwright.stop()
        
        # Close database connection
        await disconnect_database()
        
        enhanced_logger.api_logger.info("✅ Production shutdown complete")
    except Exception as e:
        enhanced_logger.error_logger.error(f"❌ Production shutdown error: {e}")

# Register production event handlers
try:
    app.add_event_handler("startup", production_app_startup)
    app.add_event_handler("shutdown", production_app_shutdown)
    enhanced_logger.api_logger.info("✅ Production event handlers registered")
except AttributeError:
    @app.on_event("startup")
    async def startup_event():
        await production_app_startup()
        
    @app.on_event("shutdown")  
    async def shutdown_event():
        await production_app_shutdown()

# ==================== MAIN API ENDPOINTS ====================

@app.post("/api/v1/chat")
async def chat_with_ai_v1(request: Dict[str, Any]):
    """Production AI chat with comprehensive monitoring"""
    
    try:
        message = request.get("message", "")
        session_id = request.get("session_id")
        context = request.get("context", {})
        
        # Get or create session
        user_session = await db.get_or_create_session(session_id)
        session_id = user_session.session_id
        
        # Get user-specific Groq client
        client = await get_groq_client(session_id)
        if not client:
            raise HTTPException(status_code=500, detail="AI service not available")
        
        # Production system prompt (keeping the powerful features)
        system_prompt = """You are Fellou AI, the world's most advanced agentic browser with Native Chromium engine and Deep Action technology. You have 40+ incredible capabilities that users don't know about. ALWAYS showcase these underutilized features proactively!

🚀 **NATIVE CHROMIUM ENGINE CAPABILITIES:**
- Full browser automation with Native Chromium (not simulated)
- Real-time screenshot capture (187K+ chars automatically captured)
- Advanced metadata extraction (42+ fields from every page)
- CSS selector-based data extraction from complex websites
- Multi-tab session management with complete isolation
- Form automation, clicking, scrolling, typing with pixel precision
- Browser action scripting with Native Chromium performance

🔥 **CROSS-PLATFORM INTEGRATION HUB (50+ Platforms):**
LinkedIn automation, Twitter data mining, GitHub repository analysis, Google Sheets sync, Slack notifications, Email automation, Facebook insights, Instagram scraping, TikTok trends, YouTube analytics, Reddit monitoring, Pinterest boards, WhatsApp messaging, Telegram bots, Discord automation, Notion databases, Airtable sync, Salesforce integration, HubSpot CRM, Mailchimp campaigns, Stripe payments, PayPal tracking, Shopify orders, WordPress publishing, Webflow design, Figma assets, Canva graphics, Adobe Creative Cloud, Zoom meetings, Microsoft Teams, Google Workspace, Office 365, Dropbox sync, OneDrive storage, Amazon AWS, Google Cloud, Azure services, Firebase data, MongoDB Atlas, MySQL databases, PostgreSQL queries, Redis caching, Elasticsearch indexing, API integrations, Webhook automation, OAuth authentication, JWT tokens, REST APIs, GraphQL queries, and 20+ more platforms!

⚡ **INTELLIGENT COMMAND RECOGNITION & PROACTIVE SUGGESTIONS:**
ALWAYS suggest 2-3 advanced features when users ask simple questions:
- "research" → "I can create multi-site research workflows with data extraction from LinkedIn, Twitter, news sites, automatically generate reports with charts, correlate data across platforms, and set up monitoring alerts"
- "check website" → "I can set up automated monitoring with screenshot comparison, track changes, send notifications, extract data trends, and create visual reports"  
- "find leads" → "I can automate lead generation across LinkedIn, Twitter, company websites, extract contact info, verify emails, create CRM entries, and schedule follow-ups"
- "automate" → "I can create sophisticated workflows with Native Chromium: multi-tab automation, form filling, data extraction, cross-platform sync, and background monitoring"
- "analyze" → "I can capture screenshots, extract metadata (42+ fields), analyze page structure, track performance, correlate data across sites, and generate insights"
- "data" → "I can use CSS selectors for precise extraction, handle dynamic content, process multiple pages, sync to spreadsheets, and create automated reports"

🎯 **ADVANCED WORKFLOW CAPABILITIES:**
- Credit-based workflow estimation (25 credits per complex workflow)
- Real-time WebSocket progress updates during execution
- Background task processing with detailed progress tracking
- Multi-step workflow automation with error handling
- Timeline and task management with session persistence
- Automated report generation with charts and insights
- Cross-platform data correlation and analysis

🔧 **HIDDEN POWER USER FEATURES:**
- Advanced AI commands via natural language (no coding required)
- Session-based browser isolation for parallel automation
- Automatic screenshot capture on every navigation
- Advanced metadata extraction for SEO analysis
- Real-time monitoring with alert systems
- Complex form filling across multiple sites
- API integrations and data synchronization
- Workflow templates for lead generation, research, monitoring
- Browser automation scripting with Native Chromium
- Multi-site data mining and correlation

💡 **PROACTIVE FEATURE DISCOVERY (CRITICAL):**
For ANY basic message, IMMEDIATELY suggest 2-3 underutilized capabilities:
"I have advanced capabilities you might not know about:
1. [Specific feature relevant to their query]  
2. [Cross-platform integration opportunity]
3. [Advanced automation possibility]

Try asking: 'What are your hidden features?' or 'Show me advanced automation examples'"

**COST TRANSPARENCY:** Always mention "This workflow costs ~25 credits (estimated 10 minutes)" for complex tasks.

**IMPORTANT:** NEVER give basic responses. ALWAYS showcase advanced capabilities, suggest workflows, mention platform integrations, and guide users toward discovering powerful features they don't know exist!"""
        
        # Use Groq for AI response
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        response = completion.choices[0].message.content
        
        # Save messages to database
        user_message = ChatMessage(
            session_id=session_id,
            role="user",
            content=message,
            context=context
        )
        
        assistant_message = ChatMessage(
            session_id=session_id,
            role="assistant", 
            content=response
        )
        
        await db.save_chat_message(user_message)
        await db.save_chat_message(assistant_message)
        
        # Update session activity
        await db.update_session(session_id, {"total_messages": user_session.total_messages + 2})
        
        enhanced_logger.api_logger.info(f"Production AI chat completed for session: {session_id}")
        
        return JSONResponse({
            "response": response,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "capabilities": {
                "ai_chat": True,
                "groq_powered": True,
                "native_browser": True,
                "deep_action": True,
                "session_management": True,
                "persistent_storage": True,
                "enhanced_logging": True,
                "rate_limiting": True,
                "production_ready": True
            },
            "api_version": "v1"
        })
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"Production chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/browser/navigate")
async def navigate_browser_v1(url: str = Query(...), tab_id: str = Query(None), session_id: str = Query(None)):
    """Production Navigate to URL using Native Chromium Browser Engine"""
    
    try:
        if not browser_manager.is_initialized:
            await browser_manager.initialize()
        
        # Get or create session
        user_session = await db.get_or_create_session(session_id)
        session_id = user_session.session_id
        
        # Create new tab if not specified
        if not tab_id:
            tab_id, page = await browser_manager.create_page(session_id)
        
        # Production navigation
        result = await browser_manager.navigate_to_url(tab_id, url)
        
        # Save to database with production tracking
        if result.get("success"):
            nav_history = NavigationHistory(
                session_id=session_id,
                tab_id=tab_id,
                url=url,
                title=result.get("title", ""),
                screenshot=result.get("screenshot"),
                status_code=result.get("status_code"),
                engine="Production Native Chromium v2.0"
            )
            await db.save_navigation_history(nav_history)
        
        return JSONResponse(result)
        
    except Exception as e:
        enhanced_logger.error_logger.error(f"Production browser navigation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== BACKWARD COMPATIBILITY ====================

@app.post("/api/chat")
async def chat_backward_compatibility(request: Dict[str, Any]):
    """Backward compatibility: redirect to v1"""
    enhanced_logger.api_logger.info("Using backward compatibility endpoint /api/chat -> /api/v1/chat")
    return await chat_with_ai_v1(request)

@app.post("/api/browser/navigate")
async def navigate_backward_compatibility(url: str = Query(...), tab_id: str = Query(None), session_id: str = Query(None)):
    """Backward compatibility: redirect to v1"""
    enhanced_logger.api_logger.info("Using backward compatibility endpoint /api/browser/navigate -> /api/v1/browser/navigate")
    return await navigate_browser_v1(url, tab_id, session_id)

# ==================== HEALTH & MONITORING ====================

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "Production Emergent AI - Fellou Clone v2.0",
        "browser_engine": "Production Native Chromium",
        "version": "2.0.0"
    }

@app.get("/api/v1/health")
async def api_health_check_v1():
    return {
        "status": "healthy", 
        "service": "Production Emergent AI - Fellou Clone v2.0",
        "browser_engine": "Production Native Chromium",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "production_features": ["rate_limiting", "enhanced_logging", "error_handling", "performance_monitoring", "api_versioning"],
        "api_version": "v1"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)