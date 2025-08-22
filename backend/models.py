from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import uuid

# MongoDB Document Models for Data Persistence

class WorkflowStep(BaseModel):
    action: str
    target: str
    description: str
    value: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None

class Workflow(BaseModel):
    workflow_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    title: str
    description: str
    instruction: str
    steps: List[WorkflowStep] = []
    estimated_time_minutes: int = 10
    estimated_credits: int = 25
    required_platforms: List[str] = ["web", "native_browser"]
    browser_actions: bool = True
    deep_action_enabled: bool = True
    status: str = "created"  # created, running, completed, failed
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    # Execution tracking
    total_executions: int = 0
    last_execution: Optional[datetime] = None
    execution_results: List[Dict[str, Any]] = []

class ExecutionHistory(BaseModel):
    execution_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workflow_id: str
    session_id: str
    workflow_name: str
    status: str  # running, completed, failed
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    total_steps: int = 0
    completed_steps: int = 0
    execution_results: List[Dict[str, Any]] = []
    error_message: Optional[str] = None
    browser_tab_id: Optional[str] = None
    engine: str = "Native Chromium"
    created_at: datetime = Field(default_factory=datetime.now)

class ChatMessage(BaseModel):
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # user, assistant
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)
    context: Optional[Dict[str, Any]] = None
    # Enhanced message tracking
    message_type: Optional[str] = None  # chat, workflow, progress, screenshot
    workflow_id: Optional[str] = None
    screenshot: Optional[str] = None

class UserSession(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.now)
    last_activity: datetime = Field(default_factory=datetime.now)
    # User preferences and settings
    settings: Dict[str, Any] = {}
    api_keys: Dict[str, str] = {}
    # Browser data
    browser_tabs: List[Dict[str, Any]] = []
    # Counters
    total_workflows: int = 0
    total_executions: int = 0
    total_messages: int = 0

class BrowserTab(BaseModel):
    tab_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    title: str = "New Tab"
    url: str = "emergent://welcome"
    active: bool = False
    loading: bool = False
    favicon: Optional[str] = None
    screenshot: Optional[str] = None
    content_preview: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    status_code: Optional[int] = None
    engine: str = "Native Chromium"
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class NavigationHistory(BaseModel):
    history_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    tab_id: str
    url: str
    title: str
    timestamp: datetime = Field(default_factory=datetime.now)
    screenshot: Optional[str] = None
    status_code: Optional[int] = None
    engine: str = "Native Chromium"

class UserSettings(BaseModel):
    session_id: str
    # Profile settings
    profile: Dict[str, Any] = {
        "name": "Anonymous User",
        "email": "",
        "avatar": None
    }
    # Appearance settings
    appearance: Dict[str, Any] = {
        "theme": "dark",
        "sidebar_position": "left",
        "compact_mode": False
    }
    # Notification settings
    notifications: Dict[str, Any] = {
        "workflow_complete": True,
        "workflow_failed": True,
        "weekly_report": False,
        "email_notifications": False
    }
    # Privacy settings
    privacy: Dict[str, Any] = {
        "analytics_enabled": True,
        "crash_reporting": True,
        "data_sharing": False
    }
    # API Keys and integrations
    integrations: Dict[str, str] = {
        "groq_api_key": "",
        "openai_api_key": "",
        "anthropic_api_key": ""
    }
    updated_at: datetime = Field(default_factory=datetime.now)

# Request/Response Models
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class WorkflowRequest(BaseModel):
    instruction: str
    session_id: Optional[str] = None
    workflow_type: str = "general"

class SettingsRequest(BaseModel):
    session_id: str
    section: str
    settings_data: Dict[str, Any]

class BrowserNavigationRequest(BaseModel):
    url: str
    tab_id: Optional[str] = None
    session_id: Optional[str] = None

class BrowserActionRequest(BaseModel):
    tab_id: str
    action_type: str
    target: str
    value: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None