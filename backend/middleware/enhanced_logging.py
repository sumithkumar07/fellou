"""
Enhanced Logging System with Performance Monitoring
"""
import logging
import time
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import asyncio

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record):
        log_entry = {
            "timestamp": datetime.fromtimestamp(record.created).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields if present
        if hasattr(record, 'extra_fields'):
            log_entry.update(record.extra_fields)
        
        return json.dumps(log_entry)

class EnhancedLogger:
    """Enhanced logger with performance metrics and structured logging"""
    
    def __init__(self):
        self.setup_logging()
        self.performance_metrics = {}
        self.error_counts = {}
        self.request_counts = {}
        
    def setup_logging(self):
        """Setup structured logging configuration"""
        # Configure root logger
        logging.basicConfig(level=logging.INFO)
        
        # Create specialized loggers
        self.api_logger = logging.getLogger("api")
        self.performance_logger = logging.getLogger("performance")
        self.error_logger = logging.getLogger("error")
        self.security_logger = logging.getLogger("security")
        
        # Create formatters
        json_formatter = JSONFormatter()
        console_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Console handler for development
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(console_formatter)
        
        # Add handlers to loggers
        self.api_logger.addHandler(console_handler)
        self.performance_logger.addHandler(console_handler)
        self.error_logger.addHandler(console_handler)
        self.security_logger.addHandler(console_handler)
        
        self.api_logger.setLevel(logging.INFO)
        self.performance_logger.setLevel(logging.INFO)
        self.error_logger.setLevel(logging.WARNING)
        self.security_logger.setLevel(logging.WARNING)
    
    def log_request(self, request: Request, response: Response, processing_time: float, request_id: str):
        """Log API request with performance metrics"""
        endpoint = request.url.path
        method = request.method
        status_code = response.status_code
        
        # Update request counts
        endpoint_key = f"{method} {endpoint}"
        self.request_counts[endpoint_key] = self.request_counts.get(endpoint_key, 0) + 1
        
        # Update performance metrics
        if endpoint_key not in self.performance_metrics:
            self.performance_metrics[endpoint_key] = {
                'total_requests': 0,
                'total_time': 0,
                'avg_time': 0,
                'min_time': float('inf'),
                'max_time': 0,
                'error_count': 0
            }
        
        metrics = self.performance_metrics[endpoint_key]
        metrics['total_requests'] += 1
        metrics['total_time'] += processing_time
        metrics['avg_time'] = metrics['total_time'] / metrics['total_requests']
        metrics['min_time'] = min(metrics['min_time'], processing_time)
        metrics['max_time'] = max(metrics['max_time'], processing_time)
        
        if status_code >= 400:
            metrics['error_count'] += 1
            self.error_counts[endpoint_key] = self.error_counts.get(endpoint_key, 0) + 1
        
        # Log the request
        log_data = {
            'request_id': request_id,
            'method': method,
            'endpoint': endpoint,
            'status_code': status_code,
            'processing_time_ms': round(processing_time * 1000, 2),
            'client_ip': request.client.host if request.client else "unknown",
            'user_agent': request.headers.get('user-agent', ''),
            'session_id': request.headers.get('x-session-id', ''),
            'request_size': request.headers.get('content-length', 0),
            'response_size': len(response.body) if hasattr(response, 'body') else 0
        }
        
        # Determine log level based on status code
        if status_code >= 500:
            self.error_logger.error("Server error", extra={'extra_fields': log_data})
        elif status_code >= 400:
            self.error_logger.warning("Client error", extra={'extra_fields': log_data})
        else:
            self.api_logger.info("API request", extra={'extra_fields': log_data})
    
    def log_performance_warning(self, endpoint: str, processing_time: float, threshold: float = 2.0):
        """Log performance warnings for slow requests"""
        if processing_time > threshold:
            self.performance_logger.warning(
                f"Slow request detected: {endpoint} took {processing_time:.2f}s (threshold: {threshold}s)",
                extra={'extra_fields': {
                    'endpoint': endpoint,
                    'processing_time': processing_time,
                    'threshold': threshold,
                    'severity': 'high' if processing_time > threshold * 2 else 'medium'
                }}
            )
    
    def log_security_event(self, event_type: str, details: Dict[str, Any]):
        """Log security-related events"""
        self.security_logger.warning(
            f"Security event: {event_type}",
            extra={'extra_fields': {
                'event_type': event_type,
                'timestamp': datetime.now().isoformat(),
                **details
            }}
        )
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary for monitoring"""
        return {
            'request_counts': self.request_counts,
            'performance_metrics': self.performance_metrics,
            'error_counts': self.error_counts,
            'summary': {
                'total_requests': sum(self.request_counts.values()),
                'total_errors': sum(self.error_counts.values()),
                'avg_response_time': sum(m['avg_time'] for m in self.performance_metrics.values()) / len(self.performance_metrics) if self.performance_metrics else 0,
                'slowest_endpoint': max(self.performance_metrics.items(), key=lambda x: x[1]['max_time']) if self.performance_metrics else None
            }
        }

# Global enhanced logger instance
enhanced_logger = EnhancedLogger()

class LoggingMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware for enhanced logging"""
    
    async def dispatch(self, request: Request, call_next):
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Record start time
        start_time = time.time()
        
        # Log incoming request
        enhanced_logger.api_logger.info(
            f"Incoming request: {request.method} {request.url.path}",
            extra={'extra_fields': {
                'request_id': request_id,
                'method': request.method,
                'path': request.url.path,
                'client_ip': request.client.host if request.client else "unknown"
            }}
        )
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            # Log request completion
            enhanced_logger.log_request(request, response, processing_time, request_id)
            
            # Check for performance issues
            enhanced_logger.log_performance_warning(request.url.path, processing_time)
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            processing_time = time.time() - start_time
            
            # Log the error
            enhanced_logger.error_logger.error(
                f"Request failed: {request.method} {request.url.path}",
                extra={'extra_fields': {
                    'request_id': request_id,
                    'error': str(e),
                    'error_type': type(e).__name__,
                    'processing_time': processing_time
                }},
                exc_info=True
            )
            
            # Re-raise the exception
            raise

def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with enhanced formatting"""
    return logging.getLogger(name)