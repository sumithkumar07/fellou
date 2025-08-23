import os
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import IndexModel
import logging
from models import (
    ChatMessage, UserSession, BrowserTab, NavigationHistory
)

logger = logging.getLogger(__name__)

class DatabaseManager:
    """MongoDB Database Manager for Fellou.ai Clone"""
    
    def __init__(self):
        self.client: AsyncIOMotorClient = None
        self.database: AsyncIOMotorDatabase = None
        
    async def connect(self):
        """Connect to MongoDB and setup collections"""
        try:
            mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017/emergent_browser")
            self.client = AsyncIOMotorClient(mongo_url)
            
            # Get database name from URL or use default
            db_name = mongo_url.split("/")[-1] if "/" in mongo_url else "emergent_browser"
            self.database = self.client[db_name]
            
            # Test connection
            await self.client.admin.command('ping')
            logger.info(f"✅ Connected to MongoDB: {db_name}")
            
            # Create indexes for better performance
            await self._create_indexes()
            
        except Exception as e:
            logger.error(f"❌ MongoDB connection failed: {e}")
            # Fallback to in-memory storage
            self.client = None
            self.database = None
    
    async def _create_indexes(self):
        """Create database indexes for optimal performance"""
        try:
            # Session indexes
            await self.database.sessions.create_index("session_id", unique=True)
            await self.database.sessions.create_index("last_activity")
            
            # Chat message indexes  
            await self.database.chat_messages.create_index("session_id")
            await self.database.chat_messages.create_index("timestamp")
            
            # Browser tab indexes
            await self.database.browser_tabs.create_index("session_id")
            await self.database.browser_tabs.create_index("tab_id")
            
            # Navigation history indexes
            await self.database.navigation_history.create_index("session_id")
            await self.database.navigation_history.create_index("timestamp")
            
            logger.info("✅ Database indexes created successfully")
            
        except Exception as e:
            logger.error(f"❌ Error creating database indexes: {e}")
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logger.info("✅ Disconnected from MongoDB")
    
    # Session Management
    async def get_user_session(self, session_id: str) -> Optional[UserSession]:
        """Get user session by ID"""
        if self.database is None:
            return None
            
        try:
            session_data = await self.database.sessions.find_one({"session_id": session_id})
            if session_data:
                return UserSession(**session_data)
        except Exception as e:
            logger.error(f"Error getting user session: {e}")
        
        return None
    
    async def save_user_session(self, session: UserSession):
        """Save or update user session"""
        if self.database is None:
            return
            
        try:
            await self.database.sessions.update_one(
                {"session_id": session.session_id},
                {"$set": session.model_dump()},
                upsert=True
            )
        except Exception as e:
            logger.error(f"Error saving user session: {e}")
    
    # Chat Messages
    async def save_chat_message(self, message: ChatMessage):
        """Save chat message to database"""
        if self.database is None:
            return
            
        try:
            await self.database.chat_messages.insert_one(message.model_dump())
        except Exception as e:
            logger.error(f"Error saving chat message: {e}")
    
    async def get_chat_history(self, session_id: str, limit: int = 50) -> List[ChatMessage]:
        """Get chat history for session"""
        if self.database is None:
            return []
            
        try:
            cursor = self.database.chat_messages.find(
                {"session_id": session_id}
            ).sort("timestamp", -1).limit(limit)
            
            messages = []
            async for doc in cursor:
                messages.append(ChatMessage(**doc))
            
            return list(reversed(messages))  # Return in chronological order
        except Exception as e:
            logger.error(f"Error getting chat history: {e}")
            return []
    
    # Browser Tabs
    async def save_browser_tab(self, tab: BrowserTab):
        """Save browser tab to database"""
        if self.database is None:
            return
            
        try:
            await self.database.browser_tabs.update_one(
                {"tab_id": tab.tab_id},
                {"$set": tab.model_dump()},
                upsert=True
            )
        except Exception as e:
            logger.error(f"Error saving browser tab: {e}")
    
    async def get_browser_tabs(self, session_id: str) -> List[BrowserTab]:
        """Get browser tabs for session"""
        if self.database is None:
            return []
            
        try:
            cursor = self.database.browser_tabs.find({"session_id": session_id})
            tabs = []
            async for doc in cursor:
                tabs.append(BrowserTab(**doc))
            return tabs
        except Exception as e:
            logger.error(f"Error getting browser tabs: {e}")
            return []
    
    async def delete_browser_tab(self, tab_id: str):
        """Delete browser tab from database"""
        if self.database is None:
            return
            
        try:
            await self.database.browser_tabs.delete_one({"tab_id": tab_id})
        except Exception as e:
            logger.error(f"Error deleting browser tab: {e}")
    
    # Navigation History
    async def save_navigation_history(self, nav_history: NavigationHistory):
        """Save navigation history to database"""
        if self.database is None:
            return
            
        try:
            await self.database.navigation_history.insert_one(nav_history.model_dump())
        except Exception as e:
            logger.error(f"Error saving navigation history: {e}")
    
    async def get_navigation_history(self, session_id: str, limit: int = 100) -> List[NavigationHistory]:
        """Get navigation history for session"""
        if not self.database:
            return []
            
        try:
            cursor = self.database.navigation_history.find(
                {"session_id": session_id}
            ).sort("timestamp", -1).limit(limit)
            
            history = []
            async for doc in cursor:
                history.append(NavigationHistory(**doc))
            return history
        except Exception as e:
            logger.error(f"Error getting navigation history: {e}")
            return []

# Global database instance
db = DatabaseManager()

# Connection helpers
async def connect_database():
    """Connect to database"""
    await db.connect()

async def disconnect_database():
    """Disconnect from database"""
    await db.disconnect()