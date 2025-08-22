"""
Enhanced Error Handling with Structured Responses
"""
import traceback
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import Request, HTTPException
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

class ErrorHandler:
    """Enhanced error handler with structured error responses"""
    
    def __init__(self):
        self.error_tracking = {}
        self.error_patterns = {}
    
    def create_error_response(
        self, 
        status_code: int, 
        error_type: str, 
        message: str, 
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        suggestions: Optional[list] = None
    ) -> Dict[str, Any]:
        """Create standardized error response"""
        
        error_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        error_response = {
            "error": {
                "id": error_id,
                "type": error_type,
                "message": message,
                "status_code": status_code,
                "timestamp": timestamp,
                "request_id": request_id
            }
        }
        
        if details:
            error_response["error"]["details"] = details
        
        if suggestions:
            error_response["error"]["suggestions"] = suggestions
        
        # Add helpful information based on error type
        if status_code == 400:
            error_response["error"]["help"] = "Check your request parameters and try again"
        elif status_code == 401:
            error_response["error"]["help"] = "Please provide valid authentication credentials"
        elif status_code == 403:
            error_response["error"]["help"] = "You don't have permission to access this resource"
        elif status_code == 404:
            error_response["error"]["help"] = "The requested resource was not found"
        elif status_code == 429:
            error_response["error"]["help"] = "You're making requests too quickly. Please slow down"
        elif status_code >= 500:
            error_response["error"]["help"] = "Server error occurred. Please try again later or contact support"
        
        # Track error for monitoring
        self._track_error(error_type, status_code, message)
        
        return error_response
    
    def _track_error(self, error_type: str, status_code: int, message: str):
        """Track error patterns for monitoring"""
        error_key = f"{error_type}_{status_code}"
        
        if error_key not in self.error_tracking:
            self.error_tracking[error_key] = {
                'count': 0,
                'first_seen': datetime.now().isoformat(),
                'last_seen': datetime.now().isoformat(),
                'messages': []
            }
        
        self.error_tracking[error_key]['count'] += 1
        self.error_tracking[error_key]['last_seen'] = datetime.now().isoformat()
        
        # Keep last 10 error messages for pattern analysis
        if len(self.error_tracking[error_key]['messages']) < 10:
            self.error_tracking[error_key]['messages'].append(message)
    
    def get_error_statistics(self) -> Dict[str, Any]:
        """Get error statistics for monitoring"""
        total_errors = sum(data['count'] for data in self.error_tracking.values())
        
        return {
            "total_errors": total_errors,
            "error_types": len(self.error_tracking),
            "error_details": self.error_tracking,
            "most_common": max(
                self.error_tracking.items(), 
                key=lambda x: x[1]['count']
            ) if self.error_tracking else None
        }

# Global error handler instance
error_handler = ErrorHandler()

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors"""
    request_id = getattr(request.state, 'request_id', str(uuid.uuid4()))
    
    # Extract validation errors
    validation_errors = []
    for error in exc.errors():
        validation_errors.append({
            "field": " -> ".join(str(x) for x in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
            "input": error.get("input")
        })
    
    suggestions = [
        "Check the required fields in your request",
        "Ensure all fields have correct data types",
        "Refer to the API documentation for proper request format"
    ]
    
    error_response = error_handler.create_error_response(
        status_code=422,
        error_type="ValidationError",
        message="Request validation failed",
        details={
            "validation_errors": validation_errors,
            "error_count": len(validation_errors)
        },
        request_id=request_id,
        suggestions=suggestions
    )
    
    logger.warning(f"Validation error: {validation_errors}")
    return JSONResponse(status_code=422, content=error_response)

async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with enhanced responses"""
    request_id = getattr(request.state, 'request_id', str(uuid.uuid4()))
    
    # Determine error type based on status code
    error_types = {
        400: "BadRequest",
        401: "Unauthorized", 
        403: "Forbidden",
        404: "NotFound",
        405: "MethodNotAllowed",
        409: "Conflict",
        429: "RateLimitExceeded",
        500: "InternalServerError",
        501: "NotImplemented",
        502: "BadGateway",
        503: "ServiceUnavailable"
    }
    
    error_type = error_types.get(exc.status_code, "HTTPException")
    
    # Handle different types of detail (string or dict)
    if isinstance(exc.detail, dict):
        message = exc.detail.get("message", str(exc.detail))
        details = exc.detail
    else:
        message = str(exc.detail)
        details = None
    
    # Add context-specific suggestions
    suggestions = []
    if exc.status_code == 404:
        suggestions = [
            "Check the URL path and parameters",
            "Ensure the resource exists",
            "Verify your session ID if required"
        ]
    elif exc.status_code == 400:
        suggestions = [
            "Review your request parameters",
            "Check required fields",
            "Ensure proper data formats"
        ]
    elif exc.status_code == 500:
        suggestions = [
            "Try again in a few moments",
            "Contact support if the problem persists",
            "Check service status page"
        ]
    
    error_response = error_handler.create_error_response(
        status_code=exc.status_code,
        error_type=error_type,
        message=message,
        details=details,
        request_id=request_id,
        suggestions=suggestions
    )
    
    # Add rate limit headers if applicable
    headers = {}
    if hasattr(exc, 'headers') and exc.headers:
        headers.update(exc.headers)
    
    logger.error(f"HTTP Exception: {exc.status_code} - {message}")
    return JSONResponse(status_code=exc.status_code, content=error_response, headers=headers)

async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    request_id = getattr(request.state, 'request_id', str(uuid.uuid4()))
    
    # Get exception details
    exception_type = type(exc).__name__
    exception_message = str(exc)
    stack_trace = traceback.format_exc()
    
    # Log the full error for debugging
    logger.error(
        f"Unhandled exception: {exception_type} - {exception_message}",
        extra={'extra_fields': {
            'request_id': request_id,
            'exception_type': exception_type,
            'stack_trace': stack_trace,
            'request_path': request.url.path,
            'request_method': request.method
        }}
    )
    
    # Don't expose internal error details in production
    error_response = error_handler.create_error_response(
        status_code=500,
        error_type="InternalServerError",
        message="An unexpected error occurred",
        details={
            "error_type": exception_type,
            "tracking_id": request_id
        },
        request_id=request_id,
        suggestions=[
            "Try your request again",
            "Contact support with the tracking ID if the problem persists",
            "Check our status page for any ongoing issues"
        ]
    )
    
    return JSONResponse(status_code=500, content=error_response)

def setup_error_handlers(app):
    """Setup all error handlers for the FastAPI app"""
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
    
    logger.info("✅ Enhanced error handlers configured")