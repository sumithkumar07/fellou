import os
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import IndexModel
import logging
from models import (
    Workflow, ExecutionHistory, ChatMessage, UserSession, 
    BrowserTab, NavigationHistory, UserSettings
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
            
            # Workflow indexes
            await self.database.workflows.create_index([("session_id", 1), ("created_at", -1)])
            await self.database.workflows.create_index("workflow_id", unique=True)
            
            # Execution history indexes
            await self.database.execution_history.create_index([("session_id", 1), ("start_time", -1)])
            await self.database.execution_history.create_index("workflow_id")
            
            # Chat message indexes
            await self.database.chat_messages.create_index([("session_id", 1), ("timestamp", -1)])
            
            # Browser tab indexes
            await self.database.browser_tabs.create_index([("session_id", 1), ("active", -1)])
            
            logger.info("✅ Database indexes created successfully")
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")
    
    async def disconnect(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            logger.info("💤 MongoDB connection closed")
    
    # ==================== SESSION MANAGEMENT ====================
    
    async def get_or_create_session(self, session_id: str = None) -> UserSession:
        """Get existing session or create new one"""
        if self.database is None:
            # Fallback to in-memory session
            return UserSession(session_id=session_id or f"session-{datetime.now().timestamp()}")
        
        try:
            if session_id:
                # Try to find existing session
                session_doc = await self.database.sessions.find_one({"session_id": session_id})
                if session_doc:
                    # Update last activity
                    await self.database.sessions.update_one(
                        {"session_id": session_id},
                        {"$set": {"last_activity": datetime.now()}}
                    )
                    return UserSession(**session_doc)
            
            # Create new session
            new_session = UserSession()
            await self.database.sessions.insert_one(new_session.model_dump())
            logger.info(f"✅ Created new session: {new_session.session_id}")
            return new_session
            
        except Exception as e:
            logger.error(f"Session management error: {e}")
            return UserSession()
    
    async def update_session(self, session_id: str, update_data: Dict[str, Any]):
        """Update session data"""
        if self.database is None:
            return
        
        try:
            await self.database.sessions.update_one(
                {"session_id": session_id},
                {"$set": {**update_data, "last_activity": datetime.now()}}
            )
        except Exception as e:
            logger.error(f"Session update error: {e}")
    
    # ==================== WORKFLOW MANAGEMENT ====================
    
    async def save_workflow(self, workflow: Workflow) -> bool:
        """Save workflow to database"""
        if self.database is None:
            return False
        
        try:
            workflow.updated_at = datetime.now()
            await self.database.workflows.replace_one(
                {"workflow_id": workflow.workflow_id},
                workflow.model_dump(),
                upsert=True
            )
            logger.info(f"✅ Saved workflow: {workflow.workflow_id}")
            return True
        except Exception as e:
            logger.error(f"Workflow save error: {e}")
            return False
    
    async def get_workflows(self, session_id: str, limit: int = 50) -> List[Workflow]:
        """Get workflows for a session"""
        if self.database is None:
            return []
        
        try:
            cursor = self.database.workflows.find(
                {"session_id": session_id}
            ).sort("created_at", -1).limit(limit)
            
            workflows = []
            async for doc in cursor:
                workflows.append(Workflow(**doc))
            
            return workflows
        except Exception as e:
            logger.error(f"Get workflows error: {e}")
            return []
    
    async def get_workflow(self, workflow_id: str) -> Optional[Workflow]:
        """Get specific workflow by ID"""
        if self.database is None:
            return None
        
        try:
            doc = await self.database.workflows.find_one({"workflow_id": workflow_id})
            return Workflow(**doc) if doc else None
        except Exception as e:
            logger.error(f"Get workflow error: {e}")
            return None
    
    async def update_workflow_execution(self, workflow_id: str, execution_data: Dict[str, Any]):
        """Update workflow execution stats"""
        if self.database is None:
            return
        
        try:
            await self.database.workflows.update_one(
                {"workflow_id": workflow_id},
                {
                    "$set": {
                        "last_execution": datetime.now(),
                        "updated_at": datetime.now()
                    },
                    "$inc": {"total_executions": 1},
                    "$push": {"execution_results": execution_data}
                }
            )
        except Exception as e:
            logger.error(f"Workflow execution update error: {e}")
    
    # ==================== EXECUTION HISTORY ====================
    
    async def save_execution_history(self, execution: ExecutionHistory) -> bool:
        """Save execution history"""
        if self.database is None:
            return False
        
        try:
            await self.database.execution_history.insert_one(execution.model_dump())
            logger.info(f"✅ Saved execution history: {execution.execution_id}")
            return True
        except Exception as e:
            logger.error(f"Execution history save error: {e}")
            return False
    
    async def get_execution_history(self, session_id: str, limit: int = 100) -> List[ExecutionHistory]:
        """Get execution history for session"""
        if self.database is None:
            return []
        
        try:
            cursor = self.database.execution_history.find(
                {"session_id": session_id}
            ).sort("start_time", -1).limit(limit)
            
            history = []
            async for doc in cursor:
                history.append(ExecutionHistory(**doc))
            
            return history
        except Exception as e:
            logger.error(f"Get execution history error: {e}")
            return []
    
    async def update_execution_status(self, execution_id: str, status: str, results: Dict[str, Any] = None):
        """Update execution status and results"""
        if self.database is None:
            return
        
        try:
            update_data = {
                "status": status,
                "updated_at": datetime.now()
            }
            
            if status in ["completed", "failed"]:
                update_data["end_time"] = datetime.now()
            
            if results:
                update_data.update(results)
            
            await self.database.execution_history.update_one(
                {"execution_id": execution_id},
                {"$set": update_data}
            )
        except Exception as e:
            logger.error(f"Execution status update error: {e}")
    
    # ==================== CHAT MESSAGES ====================
    
    async def save_chat_message(self, message: ChatMessage) -> bool:
        """Save chat message"""
        if self.database is None:
            return False
        
        try:
            await self.database.chat_messages.insert_one(message.model_dump())
            return True
        except Exception as e:
            logger.error(f"Chat message save error: {e}")
            return False
    
    async def get_chat_messages(self, session_id: str, limit: int = 50) -> List[ChatMessage]:
        """Get chat messages for session"""
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
            logger.error(f"Get chat messages error: {e}")
            return []
    
    # ==================== USER SETTINGS ====================
    
    async def save_user_settings(self, settings: UserSettings) -> bool:
        """Save user settings"""
        if self.database is None:
            return False
        
        try:
            settings.updated_at = datetime.now()
            await self.database.user_settings.replace_one(
                {"session_id": settings.session_id},
                settings.model_dump(),
                upsert=True
            )
            logger.info(f"✅ Saved settings for session: {settings.session_id}")
            return True
        except Exception as e:
            logger.error(f"Settings save error: {e}")
            return False
    
    async def get_user_settings(self, session_id: str) -> UserSettings:
        """Get user settings for session"""
        if self.database is None:
            return UserSettings(session_id=session_id)
        
        try:
            doc = await self.database.user_settings.find_one({"session_id": session_id})
            return UserSettings(**doc) if doc else UserSettings(session_id=session_id)
        except Exception as e:
            logger.error(f"Get settings error: {e}")
            return UserSettings(session_id=session_id)
    
    # ==================== BROWSER DATA ====================
    
    async def save_navigation_history(self, nav_history: NavigationHistory) -> bool:
        """Save navigation history"""
        if self.database is None:
            return False
        
        try:
            await self.database.navigation_history.insert_one(nav_history.model_dump())
            return True
        except Exception as e:
            logger.error(f"Navigation history save error: {e}")
            return False
    
    async def get_navigation_history(self, session_id: str, limit: int = 100) -> List[NavigationHistory]:
        """Get navigation history for session"""
        if self.database is None:
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
            logger.error(f"Get navigation history error: {e}")
            return []

# Global database manager instance
db = DatabaseManager()

# Database connection functions
async def connect_database():
    """Initialize database connection"""
    await db.connect()

async def disconnect_database():
    """Close database connection"""
    await db.disconnect()

async def get_database() -> DatabaseManager:
    """Get database manager instance"""
    return db