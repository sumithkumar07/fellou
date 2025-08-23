"""
Clean Fellou.ai Clone Backend - Fixed Version
"""
from fastapi import FastAPI, HTTPException
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

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Emergent AI - Fellou Clone v2.0",
    description="Agentic browser with Native Chromium and AI integration",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Initialize Groq client
groq_client = None

async def get_groq_client(session_id: str = None):
    """Get Groq client"""
    global groq_client
    
    try:
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
        
        if not groq_client:
            groq_client = Groq(api_key=groq_api_key)
            logger.info("✅ Groq client initialized successfully")
        
        return groq_client
        
    except Exception as e:
        logger.error(f"Groq client initialization error: {e}")
        raise HTTPException(status_code=500, detail=f"AI service unavailable: {str(e)}")

# Browser Manager
class BrowserManager:
    def __init__(self):
        self.browser: Optional[Browser] = None
        self.contexts: Dict[str, BrowserContext] = {}
        self.pages: Dict[str, Page] = {}
        self.performance_stats = {
            'total_navigations': 0,
            'successful_navigations': 0,
            'failed_navigations': 0,
            'uptime_start': datetime.now()
        }

    async def initialize(self):
        """Initialize Playwright"""
        try:
            if not PLAYWRIGHT_AVAILABLE:
                raise Exception("Playwright not available")
            
            playwright = await async_playwright().__aenter__()
            self.browser = await playwright.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage"
                ]
            )
            logger.info("🚀 Chromium Browser Engine initialized")
            return True
            
        except Exception as e:
            logger.error(f"❌ Browser initialization error: {e}")
            return False

    async def get_or_create_context(self, session_id: str) -> BrowserContext:
        """Get or create browser context"""
        if session_id not in self.contexts:
            try:
                context = await self.browser.new_context(
                    viewport={'width': 1920, 'height': 1080}
                )
                self.contexts[session_id] = context
                logger.info(f"✅ Created browser context: {session_id}")
            except Exception as e:
                logger.error(f"Error creating context for {session_id}: {e}")
                raise
        return self.contexts[session_id]

    async def navigate_to_url(self, url: str, tab_id: str, session_id: str) -> Dict[str, Any]:
        """Navigate to URL"""
        start_time = datetime.now()
        self.performance_stats['total_navigations'] += 1
        
        try:
            context = await self.get_or_create_context(session_id)
            
            if tab_id not in self.pages:
                page = await context.new_page()
                self.pages[tab_id] = page
                logger.info(f"✅ Created new page: {tab_id}")
            else:
                page = self.pages[tab_id]
            
            logger.info(f"🌐 Navigating to: {url}")
            
            response = await page.goto(url, wait_until='domcontentloaded', timeout=30000)
            await asyncio.sleep(2)
            
            title = await page.title()
            content = await page.content()
            content_preview = content[:1000] if content else "No content available"
            
            # Take screenshot
            try:
                screenshot_bytes = await page.screenshot(full_page=False)
                screenshot_base64 = base64.b64encode(screenshot_bytes).decode()
            except Exception:
                screenshot_base64 = None
            
            processing_time = (datetime.now() - start_time).total_seconds()
            self.performance_stats['successful_navigations'] += 1
            
            logger.info(f"✅ Navigation completed: {title} ({processing_time:.2f}s)")
            
            return {
                "success": True,
                "title": title,
                "content_preview": content_preview,
                "screenshot": screenshot_base64,
                "metadata": {},
                "status_code": response.status if response else 200,
                "engine": "Native Chromium v2.0",
                "processing_time_seconds": processing_time,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            self.performance_stats['failed_navigations'] += 1
            logger.error(f"❌ Navigation error for {url}: {str(e)}")
            
            return {
                "success": False,
                "title": "Navigation Error",
                "content_preview": f"Failed to navigate to {url}",
                "screenshot": None,
                "metadata": {},
                "status_code": 500,
                "engine": "Native Chromium v2.0",
                "processing_time_seconds": processing_time,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

# Initialize browser manager
browser_manager = BrowserManager()

# Startup and shutdown handlers
async def app_startup():
    logger.info("🚀 Starting Emergent AI - Fellou Clone...")
    
    try:
        await connect_database()
        await browser_manager.initialize()
        logger.info("✅ Application ready")
    except Exception as e:
        logger.error(f"❌ Startup error: {e}")

async def app_shutdown():
    logger.info("🔄 Shutting down...")
    
    try:
        if browser_manager.browser:
            await browser_manager.browser.close()
        await disconnect_database()
        logger.info("✅ Shutdown completed")
    except Exception as e:
        logger.error(f"❌ Shutdown error: {e}")

app.add_event_handler("startup", app_startup)
app.add_event_handler("shutdown", app_shutdown)

# System prompt and website URLs
ENHANCED_SYSTEM_PROMPT = """You are Fellou AI, an advanced browser assistant with powerful Native Chromium capabilities and direct website opening abilities.

🎯 **CORE CAPABILITIES:**
- "open [website]" → DIRECTLY opens websites (YouTube, Google, Facebook, etc.) in the browser automatically
- Real browser automation with Native Chromium engine
- Screenshot capture and data extraction
- Cross-platform integration capabilities

🌐 **WEBSITE OPENING COMMANDS:**
When users say "open YouTube", "open Google", etc., I can ACTUALLY open these websites directly in the browser.

**IMPORTANT:** When users request website opening (e.g., "open YouTube"), acknowledge that I'm opening it and confirm successful navigation."""

WEBSITE_URLS = {
    "youtube": "https://www.youtube.com",
    "google": "https://www.google.com", 
    "facebook": "https://www.facebook.com",
    "twitter": "https://www.twitter.com",
    "linkedin": "https://www.linkedin.com",
    "instagram": "https://www.instagram.com",
    "github": "https://www.github.com",
    "reddit": "https://www.reddit.com"
}

def detect_website_opening_command(message: str) -> tuple[bool, str, str]:
    """Detect if user wants to open a website"""
    message_lower = message.lower().strip()
    
    if message_lower.startswith("open "):
        website_name = message_lower[5:].strip()
        
        # Direct match
        if website_name in WEBSITE_URLS:
            return True, website_name, WEBSITE_URLS[website_name]
        
        # Partial match
        for site, url in WEBSITE_URLS.items():
            if website_name in site or site in website_name:
                return True, site, url
        
        # Fallback
        if website_name and not website_name.startswith("http"):
            fallback_url = f"https://www.{website_name}.com"
            return True, website_name, fallback_url
    
    return False, "", ""

# API Endpoints

@app.get("/api/health")
async def health_check():
    """Health check"""
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
                "database": True
            }
        })
    except Exception as e:
        logger.error(f"Health check error: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest):
    """AI chat with website opening capabilities"""
    try:
        logger.info(f"💬 Processing chat request: {request.message[:100]}...")
        
        session_id = request.session_id or str(uuid.uuid4())
        
        # Check if user wants to open a website
        is_website_cmd, website_name, website_url = detect_website_opening_command(request.message)
        
        if is_website_cmd:
            logger.info(f"🌐 Website opening command detected: {website_name} -> {website_url}")
            
            try:
                # Create a tab for this session
                tab_id = f"tab-{session_id}-{int(datetime.now().timestamp())}"
                
                # Navigate to the website
                navigation_result = await browser_manager.navigate_to_url(website_url, tab_id, session_id)
                
                if navigation_result["success"]:
                    ai_response = f"✅ **{website_name.title()} opened successfully!**\n\n🌐 **Navigated to:** {website_url}\n📄 **Page Title:** {navigation_result.get('title', 'Loading...')}\n⏱️ **Load Time:** {navigation_result.get('processing_time_seconds', 0):.2f}s\n🔧 **Engine:** {navigation_result.get('engine', 'Native Chromium')}\n\n🚀 **What would you like to do next?**\n- Take a screenshot of the page\n- Extract specific data\n- Automate actions on this site\n- Open additional websites"
                    
                    response_data = {
                        "response": ai_response,
                        "session_id": session_id,
                        "timestamp": datetime.now().isoformat(),
                        "model": "llama-3.3-70b-versatile",
                        "website_opened": True,
                        "website_name": website_name,
                        "website_url": website_url,
                        "tab_id": tab_id,
                        "navigation_result": navigation_result
                    }
                else:
                    ai_response = f"❌ **Failed to open {website_name.title()}**\n\n🔧 **Error:** {navigation_result.get('error', 'Unknown error')}\n📍 **Attempted URL:** {website_url}"
                    
                    response_data = {
                        "response": ai_response,
                        "session_id": session_id,
                        "timestamp": datetime.now().isoformat(),
                        "model": "llama-3.3-70b-versatile",
                        "website_opened": False,
                        "error": navigation_result.get('error', 'Navigation failed')
                    }
                
            except Exception as nav_error:
                logger.error(f"❌ Navigation error: {str(nav_error)}")
                ai_response = f"❌ **Error opening {website_name.title()}**\n\n🔧 **Technical Issue:** {str(nav_error)}"
                
                response_data = {
                    "response": ai_response,
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat(),
                    "model": "llama-3.3-70b-versatile",
                    "website_opened": False,
                    "error": str(nav_error)
                }
        
        else:
            # Regular AI chat
            groq = await get_groq_client(session_id)
            
            completion = groq.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": ENHANCED_SYSTEM_PROMPT},
                    {"role": "user", "content": request.message}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            ai_response = completion.choices[0].message.content
            
            response_data = {
                "response": ai_response,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "model": "llama-3.3-70b-versatile"
            }
        
        # Save messages to database
        try:
            user_message = ChatMessage(
                session_id=session_id,
                role="user",
                content=request.message
            )
            
            ai_message = ChatMessage(
                session_id=session_id,
                role="assistant",
                content=response_data["response"]
            )
            
            await db.save_chat_message(user_message)
            await db.save_chat_message(ai_message)
        except Exception as db_error:
            logger.warning(f"Database save error: {db_error}")
        
        logger.info(f"✅ Chat response generated successfully")
        
        return JSONResponse(response_data)
        
    except Exception as e:
        logger.error(f"❌ Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@app.post("/api/browser/navigate")
async def navigate_browser(url: str, tab_id: str = None, session_id: str = None):
    """Navigate browser to URL"""
    try:
        logger.info(f"🌐 Browser navigation request: {url}")
        
        if not session_id:
            session_id = str(uuid.uuid4())
        
        if not tab_id:
            tab_id = f"tab-{uuid.uuid4()}"
        
        result = await browser_manager.navigate_to_url(url, tab_id, session_id)
        
        logger.info(f"✅ Navigation completed: {result.get('title', 'Unknown')}")
        return JSONResponse(result)
        
    except Exception as e:
        logger.error(f"❌ Navigation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Navigation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)