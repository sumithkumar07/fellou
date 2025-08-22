from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict
import uuid
import json

# Custom JSON encoder for datetime objects
def datetime_serializer(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError("Object of type '%s' is not JSON serializable" % type(obj).__name__)

# MongoDB Document Models for Data Persistence

class ChatMessage(BaseModel):
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # user, assistant
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)
    context: Optional[Dict[str, Any]] = None
    # Enhanced message tracking
    message_type: Optional[str] = None  # chat, screenshot
    screenshot: Optional[str] = None

class UserSession(BaseModel):
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.now)
    last_activity: datetime = Field(default_factory=datetime.now)
    # User preferences and settings
    settings: Dict[str, Any] = {}
    api_keys: Dict[str, str] = {}
    # Browser data
    browser_tabs: List[Dict[str, Any]] = []
    # Counters
    total_messages: int = 0

class BrowserTab(BaseModel):
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
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
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    history_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    tab_id: str
    url: str
    title: str
    timestamp: datetime = Field(default_factory=datetime.now)
    screenshot: Optional[str] = None
    status_code: Optional[int] = None
    engine: str = "Native Chromium"

# Request/Response Models
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

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