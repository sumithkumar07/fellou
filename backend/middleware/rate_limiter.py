"""
Rate Limiting Middleware for Production API Protection
"""
import time
import asyncio
from typing import Dict, Optional
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """In-memory rate limiter with sliding window"""
    
    def __init__(self):
        self.requests: Dict[str, list] = {}
        self.cleanup_interval = 300  # 5 minutes
        self.last_cleanup = time.time()
    
    def _cleanup_old_requests(self):
        """Remove old request records to prevent memory bloat"""
        current_time = time.time()
        if current_time - self.last_cleanup < self.cleanup_interval:
            return
        
        for client_id, timestamps in list(self.requests.items()):
            # Remove timestamps older than 1 hour
            recent_timestamps = [t for t in timestamps if current_time - t < 3600]
            if recent_timestamps:
                self.requests[client_id] = recent_timestamps
            else:
                del self.requests[client_id]
        
        self.last_cleanup = current_time
    
    def is_allowed(self, client_id: str, limit: int, window: int) -> tuple[bool, Dict[str, int]]:
        """
        Check if request is allowed based on rate limit
        Returns (is_allowed, rate_info)
        """
        current_time = time.time()
        self._cleanup_old_requests()
        
        if client_id not in self.requests:
            self.requests[client_id] = []
        
        # Remove requests outside the window
        window_start = current_time - window
        self.requests[client_id] = [
            timestamp for timestamp in self.requests[client_id] 
            if timestamp > window_start
        ]
        
        current_count = len(self.requests[client_id])
        is_allowed = current_count < limit
        
        if is_allowed:
            self.requests[client_id].append(current_time)
        
        rate_info = {
            'limit': limit,
            'remaining': max(0, limit - current_count - (1 if is_allowed else 0)),
            'reset_time': int(window_start + window),
            'retry_after': max(0, int(window - (current_time - min(self.requests[client_id]) if self.requests[client_id] else current_time)))
        }
        
        return is_allowed, rate_info

# Global rate limiter instance
rate_limiter = RateLimiter()

class RateLimitMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware for rate limiting"""
    
    def __init__(self, app, default_limit: int = 100, window: int = 3600):
        super().__init__(app)
        self.default_limit = default_limit
        self.window = window
        
        # Different limits for different endpoint types
        self.endpoint_limits = {
            '/api/v1/chat': {'limit': 30, 'window': 3600},  # 30 requests per hour for AI chat
            '/api/v1/workflow/create': {'limit': 10, 'window': 3600},  # 10 workflow creations per hour
            '/api/v1/workflow/execute': {'limit': 20, 'window': 3600},  # 20 executions per hour
            '/api/v1/browser/navigate': {'limit': 60, 'window': 3600},  # 60 navigations per hour
            '/api/v1/browser/action': {'limit': 200, 'window': 3600},  # 200 actions per hour
            '/api/v1/browser/screenshot': {'limit': 50, 'window': 3600},  # 50 screenshots per hour
        }
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks and system endpoints
        if request.url.path in ['/health', '/api/v1/health', '/api/v1/system/status', '/api/v1/system/capabilities']:
            return await call_next(request)
        
        # Get client identifier (IP + session for better accuracy)
        client_ip = request.client.host if request.client else "unknown"
        session_id = request.headers.get('x-session-id', '')
        client_id = f"{client_ip}:{session_id}" if session_id else client_ip
        
        # Determine rate limit for this endpoint
        endpoint_config = self.endpoint_limits.get(request.url.path, {
            'limit': self.default_limit, 
            'window': self.window
        })
        
        is_allowed, rate_info = rate_limiter.is_allowed(
            client_id, 
            endpoint_config['limit'], 
            endpoint_config['window']
        )
        
        if not is_allowed:
            logger.warning(f"Rate limit exceeded for client {client_id} on {request.url.path}")
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Limit: {rate_info['limit']} per {endpoint_config['window']} seconds",
                    "rate_limit": rate_info,
                    "endpoint": request.url.path
                },
                headers={
                    "X-RateLimit-Limit": str(rate_info['limit']),
                    "X-RateLimit-Remaining": str(rate_info['remaining']),
                    "X-RateLimit-Reset": str(rate_info['reset_time']),
                    "Retry-After": str(rate_info['retry_after'])
                }
            )
        
        # Add rate limit headers to successful responses
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(rate_info['limit'])
        response.headers["X-RateLimit-Remaining"] = str(rate_info['remaining'])
        response.headers["X-RateLimit-Reset"] = str(rate_info['reset_time'])
        
        return response