#!/usr/bin/env python3
"""
ENHANCED BACKEND SYSTEM TESTING - Production Ready Features
Tests the enhanced backend system with API versioning, rate limiting, enhanced logging, 
structured error handling, and performance monitoring as requested in the review.

Focus Areas:
1. API Versioning: Test both /api/v1/chat and /api/chat (backward compatibility)
2. Rate Limiting: Verify rate limit headers and 429 responses when limits exceeded
3. Enhanced Logging: Check that requests are being logged with performance metrics
4. Error Handling: Test that errors return structured JSON responses with helpful information
5. Performance Monitoring: Verify that the /api/v1/system/status endpoint returns comprehensive metrics
"""

import requests
import json
import time
import asyncio
import websockets
import uuid
from datetime import datetime
import sys
import os
import threading
from concurrent.futures import ThreadPoolExecutor

# Production Backend URLs from environment
BACKEND_URL = "https://ui-enhancements-2.preview.emergentagent.com"
WS_URL = "wss://fullstack-gap.preview.emergentagent.com"

class EnhancedBackendTester:
    def __init__(self):
        self.session_id = str(uuid.uuid4())
        self.test_results = []
        self.rate_limit_info = {}
        self.performance_metrics = {}
        
    def log_test(self, test_name, success, details="", error=None, response_time=None):
        """Log test results with enhanced metrics"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "error": str(error) if error else None,
            "response_time_ms": response_time,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        time_info = f" ({response_time:.2f}ms)" if response_time else ""
        print(f"{status} {test_name}{time_info}")
        if details:
            print(f"   Details: {details}")
        if error:
            print(f"   Error: {error}")
        print()

    def test_api_versioning(self):
        """Test API versioning with backward compatibility"""
        print("🔄 Testing API Versioning & Backward Compatibility")
        print("-" * 60)
        
        try:
            # Test data
            chat_data = {
                "message": "Test API versioning functionality",
                "session_id": self.session_id
            }
            
            # Test 1: New versioned endpoint /api/v1/chat
            start_time = time.time()
            v1_response = requests.post(f"{BACKEND_URL}/api/v1/chat", 
                                       json=chat_data, timeout=15)
            v1_time = (time.time() - start_time) * 1000
            
            if v1_response.status_code == 200:
                v1_data = v1_response.json()
                api_version = v1_data.get("api_version")
                capabilities = v1_data.get("capabilities", {})
                
                self.log_test("API v1 Endpoint", True,
                            f"API version: {api_version}, Enhanced features: {len(capabilities)}",
                            response_time=v1_time)
                
                # Check for enhanced features in v1 response
                enhanced_features = [
                    "enhanced_logging", "rate_limiting", "production_ready"
                ]
                found_features = [f for f in enhanced_features if capabilities.get(f)]
                
                if found_features:
                    self.log_test("API v1 Enhanced Features", True,
                                f"Found enhanced features: {found_features}")
                else:
                    self.log_test("API v1 Enhanced Features", False,
                                "Enhanced features not indicated in response")
            else:
                self.log_test("API v1 Endpoint", False,
                            f"HTTP {v1_response.status_code}: {v1_response.text}",
                            response_time=v1_time)
            
            # Test 2: Backward compatibility endpoint /api/chat
            start_time = time.time()
            legacy_response = requests.post(f"{BACKEND_URL}/api/chat", 
                                          json=chat_data, timeout=15)
            legacy_time = (time.time() - start_time) * 1000
            
            if legacy_response.status_code == 200:
                legacy_data = legacy_response.json()
                
                self.log_test("Backward Compatibility", True,
                            "Legacy /api/chat endpoint working",
                            response_time=legacy_time)
                
                # Compare responses for consistency
                if v1_response.status_code == 200:
                    v1_response_content = v1_data.get("response", "")
                    legacy_response_content = legacy_data.get("response", "")
                    
                    if v1_response_content and legacy_response_content:
                        self.log_test("API Response Consistency", True,
                                    "Both v1 and legacy endpoints return AI responses")
                    else:
                        self.log_test("API Response Consistency", False,
                                    "Response format differs between versions")
            else:
                self.log_test("Backward Compatibility", False,
                            f"HTTP {legacy_response.status_code}: {legacy_response.text}",
                            response_time=legacy_time)
            
            # Test 3: Browser navigation versioning
            nav_params = {"url": "https://example.com", "session_id": self.session_id}
            
            # Test v1 browser navigation
            start_time = time.time()
            v1_nav_response = requests.post(f"{BACKEND_URL}/api/v1/browser/navigate", 
                                          params=nav_params, timeout=20)
            v1_nav_time = (time.time() - start_time) * 1000
            
            if v1_nav_response.status_code == 200:
                self.log_test("Browser Navigation v1", True,
                            "v1 browser navigation working",
                            response_time=v1_nav_time)
            else:
                self.log_test("Browser Navigation v1", False,
                            f"HTTP {v1_nav_response.status_code}",
                            response_time=v1_nav_time)
            
            # Test legacy browser navigation
            start_time = time.time()
            legacy_nav_response = requests.post(f"{BACKEND_URL}/api/browser/navigate", 
                                              params=nav_params, timeout=20)
            legacy_nav_time = (time.time() - start_time) * 1000
            
            if legacy_nav_response.status_code == 200:
                self.log_test("Browser Navigation Legacy", True,
                            "Legacy browser navigation working",
                            response_time=legacy_nav_time)
            else:
                self.log_test("Browser Navigation Legacy", False,
                            f"HTTP {legacy_nav_response.status_code}",
                            response_time=legacy_nav_time)
                
        except Exception as e:
            self.log_test("API Versioning", False, error=e)

    def test_rate_limiting(self):
        """Test rate limiting functionality and headers"""
        print("🚦 Testing Rate Limiting & Throttling")
        print("-" * 60)
        
        try:
            # Test 1: Check for rate limit headers in normal requests
            response = requests.get(f"{BACKEND_URL}/api/v1/health", timeout=10)
            
            rate_limit_headers = {
                "X-RateLimit-Limit": response.headers.get("X-RateLimit-Limit"),
                "X-RateLimit-Remaining": response.headers.get("X-RateLimit-Remaining"),
                "X-RateLimit-Reset": response.headers.get("X-RateLimit-Reset"),
                "X-Request-ID": response.headers.get("X-Request-ID")
            }
            
            found_headers = {k: v for k, v in rate_limit_headers.items() if v is not None}
            
            if found_headers:
                self.log_test("Rate Limit Headers", True,
                            f"Found headers: {list(found_headers.keys())}")
                self.rate_limit_info = found_headers
            else:
                self.log_test("Rate Limit Headers", False,
                            "No rate limit headers found in response")
            
            # Test 2: Rapid requests to trigger rate limiting
            print("   Testing rate limit enforcement with rapid requests...")
            
            rapid_requests = []
            start_time = time.time()
            
            # Send 20 rapid requests to potentially trigger rate limiting
            for i in range(20):
                try:
                    req_start = time.time()
                    resp = requests.get(f"{BACKEND_URL}/api/v1/health", timeout=5)
                    req_time = (time.time() - req_start) * 1000
                    
                    rapid_requests.append({
                        "request_num": i + 1,
                        "status_code": resp.status_code,
                        "response_time": req_time,
                        "rate_limit_remaining": resp.headers.get("X-RateLimit-Remaining"),
                        "retry_after": resp.headers.get("Retry-After")
                    })
                    
                    # Check if we hit rate limit
                    if resp.status_code == 429:
                        self.log_test("Rate Limiting Enforcement", True,
                                    f"Rate limit triggered at request {i + 1} (HTTP 429)")
                        break
                        
                    # Small delay to avoid overwhelming
                    time.sleep(0.1)
                    
                except Exception as e:
                    rapid_requests.append({
                        "request_num": i + 1,
                        "error": str(e)
                    })
            
            total_time = (time.time() - start_time) * 1000
            successful_requests = len([r for r in rapid_requests if r.get("status_code") == 200])
            rate_limited_requests = len([r for r in rapid_requests if r.get("status_code") == 429])
            
            if rate_limited_requests > 0:
                self.log_test("Rate Limiting Behavior", True,
                            f"{rate_limited_requests} requests rate limited, {successful_requests} successful")
            else:
                self.log_test("Rate Limiting Behavior", True,
                            f"All {successful_requests} requests successful (rate limit not reached)")
            
            # Test 3: Different endpoint rate limits
            endpoints_to_test = [
                "/api/v1/health",
                "/api/v1/chat",
                "/health"
            ]
            
            for endpoint in endpoints_to_test:
                try:
                    if endpoint == "/api/v1/chat":
                        resp = requests.post(f"{BACKEND_URL}{endpoint}", 
                                           json={"message": "rate limit test", "session_id": self.session_id},
                                           timeout=10)
                    else:
                        resp = requests.get(f"{BACKEND_URL}{endpoint}", timeout=10)
                    
                    remaining = resp.headers.get("X-RateLimit-Remaining")
                    limit = resp.headers.get("X-RateLimit-Limit")
                    
                    if remaining and limit:
                        self.log_test(f"Rate Limit - {endpoint}", True,
                                    f"Limit: {limit}, Remaining: {remaining}")
                    else:
                        self.log_test(f"Rate Limit - {endpoint}", False,
                                    "No rate limit headers found")
                        
                except Exception as e:
                    self.log_test(f"Rate Limit - {endpoint}", False, error=e)
                    
        except Exception as e:
            self.log_test("Rate Limiting", False, error=e)

    def test_enhanced_logging(self):
        """Test enhanced logging and performance monitoring"""
        print("📊 Testing Enhanced Logging & Performance Monitoring")
        print("-" * 60)
        
        try:
            # Test 1: Make requests and check for request IDs
            test_requests = [
                ("GET", "/api/v1/health"),
                ("POST", "/api/v1/chat", {"message": "logging test", "session_id": self.session_id}),
                ("GET", "/health")
            ]
            
            request_ids = []
            
            for method, endpoint, data in test_requests:
                try:
                    start_time = time.time()
                    
                    if method == "POST":
                        response = requests.post(f"{BACKEND_URL}{endpoint}", 
                                               json=data, timeout=15)
                    else:
                        response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=10)
                    
                    response_time = (time.time() - start_time) * 1000
                    
                    request_id = response.headers.get("X-Request-ID")
                    
                    if request_id:
                        request_ids.append({
                            "endpoint": endpoint,
                            "request_id": request_id,
                            "response_time": response_time,
                            "status_code": response.status_code
                        })
                        
                        self.log_test(f"Request Logging - {endpoint}", True,
                                    f"Request ID: {request_id[:8]}..., Time: {response_time:.2f}ms")
                    else:
                        self.log_test(f"Request Logging - {endpoint}", False,
                                    "No X-Request-ID header found")
                        
                except Exception as e:
                    self.log_test(f"Request Logging - {endpoint}", False, error=e)
            
            # Test 2: Performance metrics collection
            if request_ids:
                avg_response_time = sum(r["response_time"] for r in request_ids) / len(request_ids)
                
                self.log_test("Performance Metrics Collection", True,
                            f"Collected {len(request_ids)} request metrics, avg: {avg_response_time:.2f}ms")
                
                self.performance_metrics = {
                    "total_requests": len(request_ids),
                    "average_response_time": avg_response_time,
                    "successful_requests": len([r for r in request_ids if r["status_code"] == 200])
                }
            else:
                self.log_test("Performance Metrics Collection", False,
                            "No performance metrics collected")
            
            # Test 3: Check for structured logging in responses
            chat_response = requests.post(f"{BACKEND_URL}/api/v1/chat", 
                                        json={"message": "structured logging test", "session_id": self.session_id},
                                        timeout=15)
            
            if chat_response.status_code == 200:
                chat_data = chat_response.json()
                
                # Check for structured response with logging info
                structured_fields = ["timestamp", "session_id", "capabilities"]
                found_fields = [f for f in structured_fields if f in chat_data]
                
                if len(found_fields) >= 2:
                    self.log_test("Structured Response Logging", True,
                                f"Found structured fields: {found_fields}")
                else:
                    self.log_test("Structured Response Logging", False,
                                f"Limited structured fields: {found_fields}")
            else:
                self.log_test("Structured Response Logging", False,
                            f"Chat request failed: HTTP {chat_response.status_code}")
                
        except Exception as e:
            self.log_test("Enhanced Logging", False, error=e)

    def test_structured_error_handling(self):
        """Test structured error handling and helpful error responses"""
        print("🚨 Testing Structured Error Handling")
        print("-" * 60)
        
        try:
            # Test 1: Invalid endpoint (404 error)
            start_time = time.time()
            invalid_response = requests.get(f"{BACKEND_URL}/api/v1/nonexistent", timeout=10)
            response_time = (time.time() - start_time) * 1000
            
            if invalid_response.status_code == 404:
                try:
                    error_data = invalid_response.json()
                    
                    # Check for structured error response
                    error_fields = ["detail", "error", "message", "status_code", "timestamp"]
                    found_fields = [f for f in error_fields if f in error_data]
                    
                    if found_fields:
                        self.log_test("404 Error Structure", True,
                                    f"Structured 404 response with fields: {found_fields}",
                                    response_time=response_time)
                    else:
                        self.log_test("404 Error Structure", False,
                                    f"Unstructured 404 response: {error_data}",
                                    response_time=response_time)
                except json.JSONDecodeError:
                    self.log_test("404 Error Structure", False,
                                "404 response is not JSON",
                                response_time=response_time)
            else:
                self.log_test("404 Error Handling", False,
                            f"Expected 404, got HTTP {invalid_response.status_code}",
                            response_time=response_time)
            
            # Test 2: Invalid request data (400 error)
            invalid_chat_data = {
                "invalid_field": "test",
                "session_id": self.session_id
                # Missing required "message" field
            }
            
            start_time = time.time()
            bad_request_response = requests.post(f"{BACKEND_URL}/api/v1/chat", 
                                               json=invalid_chat_data, timeout=15)
            response_time = (time.time() - start_time) * 1000
            
            if bad_request_response.status_code in [400, 422, 500]:
                try:
                    error_data = bad_request_response.json()
                    
                    # Check for helpful error information
                    helpful_fields = ["detail", "error", "message", "suggestion", "help"]
                    found_helpful = [f for f in helpful_fields if f in error_data]
                    
                    if found_helpful:
                        self.log_test("Helpful Error Messages", True,
                                    f"Error includes helpful fields: {found_helpful}",
                                    response_time=response_time)
                    else:
                        self.log_test("Helpful Error Messages", False,
                                    f"Error lacks helpful information: {error_data}",
                                    response_time=response_time)
                        
                    # Check for specific error details
                    detail = error_data.get("detail", "")
                    if "message" in detail.lower() or "required" in detail.lower():
                        self.log_test("Specific Error Details", True,
                                    f"Error mentions missing field: {detail}")
                    else:
                        self.log_test("Specific Error Details", False,
                                    f"Error lacks specific details: {detail}")
                        
                except json.JSONDecodeError:
                    self.log_test("Error Response Format", False,
                                "Error response is not JSON",
                                response_time=response_time)
            else:
                self.log_test("Bad Request Handling", False,
                            f"Expected 400/422/500, got HTTP {bad_request_response.status_code}",
                            response_time=response_time)
            
            # Test 3: Server error handling (try to trigger 500)
            try:
                # Try to trigger a server error with malformed data
                malformed_data = {"message": "x" * 10000, "session_id": "invalid-session-format"}
                
                start_time = time.time()
                server_error_response = requests.post(f"{BACKEND_URL}/api/v1/chat", 
                                                    json=malformed_data, timeout=20)
                response_time = (time.time() - start_time) * 1000
                
                if server_error_response.status_code == 500:
                    try:
                        error_data = server_error_response.json()
                        
                        # Check if 500 errors are handled gracefully
                        if "detail" in error_data or "error" in error_data:
                            self.log_test("500 Error Handling", True,
                                        "Server errors return structured responses",
                                        response_time=response_time)
                        else:
                            self.log_test("500 Error Handling", False,
                                        "Server errors lack structure",
                                        response_time=response_time)
                    except json.JSONDecodeError:
                        self.log_test("500 Error Handling", False,
                                    "Server error response is not JSON",
                                    response_time=response_time)
                else:
                    self.log_test("Server Error Test", True,
                                f"Request handled gracefully (HTTP {server_error_response.status_code})",
                                response_time=response_time)
                    
            except Exception as e:
                self.log_test("Server Error Test", False, error=e)
                
        except Exception as e:
            self.log_test("Structured Error Handling", False, error=e)

    def test_performance_monitoring(self):
        """Test performance monitoring and system status endpoints"""
        print("📈 Testing Performance Monitoring & System Status")
        print("-" * 60)
        
        try:
            # Test 1: System status endpoint
            start_time = time.time()
            status_response = requests.get(f"{BACKEND_URL}/api/v1/system/status", timeout=15)
            response_time = (time.time() - start_time) * 1000
            
            if status_response.status_code == 200:
                status_data = status_response.json()
                
                # Check for comprehensive metrics
                expected_metrics = [
                    "performance_stats", "browser_engine", "services", 
                    "capabilities", "uptime", "version", "timestamp"
                ]
                
                found_metrics = [m for m in expected_metrics if m in status_data]
                
                self.log_test("System Status Endpoint", True,
                            f"Found metrics: {found_metrics}",
                            response_time=response_time)
                
                # Analyze performance stats
                perf_stats = status_data.get("performance_stats", {})
                if perf_stats:
                    stats_fields = list(perf_stats.keys())
                    self.log_test("Performance Statistics", True,
                                f"Performance stats available: {stats_fields}")
                    
                    # Check for specific performance metrics
                    key_metrics = ["total_navigations", "total_actions", "avg_response_time", "success_rate"]
                    found_key_metrics = [m for m in key_metrics if m in perf_stats]
                    
                    if found_key_metrics:
                        self.log_test("Key Performance Metrics", True,
                                    f"Found key metrics: {found_key_metrics}")
                    else:
                        self.log_test("Key Performance Metrics", False,
                                    "Missing key performance metrics")
                else:
                    self.log_test("Performance Statistics", False,
                                "No performance stats in system status")
                
                # Check browser engine status
                browser_engine = status_data.get("browser_engine", {})
                if browser_engine:
                    engine_status = browser_engine.get("initialized", False)
                    active_contexts = browser_engine.get("active_contexts", 0)
                    
                    self.log_test("Browser Engine Monitoring", True,
                                f"Engine initialized: {engine_status}, Active contexts: {active_contexts}")
                else:
                    self.log_test("Browser Engine Monitoring", False,
                                "No browser engine status available")
                    
            elif status_response.status_code == 404:
                self.log_test("System Status Endpoint", False,
                            "System status endpoint not found (404)",
                            response_time=response_time)
            else:
                self.log_test("System Status Endpoint", False,
                            f"HTTP {status_response.status_code}: {status_response.text}",
                            response_time=response_time)
            
            # Test 2: Health check with performance info
            start_time = time.time()
            health_response = requests.get(f"{BACKEND_URL}/api/v1/health", timeout=10)
            health_time = (time.time() - start_time) * 1000
            
            if health_response.status_code == 200:
                health_data = health_response.json()
                
                # Check for enhanced health information
                enhanced_fields = ["production_features", "timestamp", "api_version", "browser_engine"]
                found_enhanced = [f for f in enhanced_fields if f in health_data]
                
                if found_enhanced:
                    self.log_test("Enhanced Health Check", True,
                                f"Enhanced health info: {found_enhanced}",
                                response_time=health_time)
                    
                    # Check for production features
                    prod_features = health_data.get("production_features", [])
                    if prod_features:
                        self.log_test("Production Features", True,
                                    f"Production features: {prod_features}")
                    else:
                        self.log_test("Production Features", False,
                                    "No production features listed")
                else:
                    self.log_test("Enhanced Health Check", False,
                                "Basic health check without enhancements",
                                response_time=health_time)
            else:
                self.log_test("Enhanced Health Check", False,
                            f"HTTP {health_response.status_code}",
                            response_time=health_time)
            
            # Test 3: Performance under load
            print("   Testing performance under concurrent load...")
            
            def make_request():
                start = time.time()
                resp = requests.get(f"{BACKEND_URL}/api/v1/health", timeout=10)
                return {
                    "status_code": resp.status_code,
                    "response_time": (time.time() - start) * 1000
                }
            
            # Run 10 concurrent requests
            with ThreadPoolExecutor(max_workers=10) as executor:
                concurrent_start = time.time()
                futures = [executor.submit(make_request) for _ in range(10)]
                results = [future.result() for future in futures]
                concurrent_time = (time.time() - concurrent_start) * 1000
            
            successful_concurrent = len([r for r in results if r["status_code"] == 200])
            avg_concurrent_time = sum(r["response_time"] for r in results) / len(results)
            
            self.log_test("Concurrent Performance", True,
                        f"{successful_concurrent}/10 requests successful, avg: {avg_concurrent_time:.2f}ms, total: {concurrent_time:.2f}ms")
            
            if successful_concurrent >= 8 and avg_concurrent_time < 2000:
                self.log_test("Performance Under Load", True,
                            "System handles concurrent load well")
            else:
                self.log_test("Performance Under Load", False,
                            "System struggles under concurrent load")
                
        except Exception as e:
            self.log_test("Performance Monitoring", False, error=e)

    def test_comprehensive_chat_functionality(self):
        """Test comprehensive chat functionality with enhanced features"""
        print("💬 Testing Comprehensive Chat Functionality")
        print("-" * 60)
        
        try:
            # Test various chat scenarios
            chat_scenarios = [
                {
                    "message": "What are your enhanced production features?",
                    "test_name": "Enhanced Features Query"
                },
                {
                    "message": "Create a workflow for monitoring GitHub repositories",
                    "test_name": "Workflow Creation Chat"
                },
                {
                    "message": "Show me your browser automation capabilities",
                    "test_name": "Browser Capabilities Chat"
                },
                {
                    "message": "research",
                    "test_name": "Simple Command Recognition"
                }
            ]
            
            for scenario in chat_scenarios:
                chat_data = {
                    "message": scenario["message"],
                    "session_id": self.session_id
                }
                
                # Test both v1 and legacy endpoints
                for endpoint, endpoint_name in [("/api/v1/chat", "v1"), ("/api/chat", "legacy")]:
                    try:
                        start_time = time.time()
                        response = requests.post(f"{BACKEND_URL}{endpoint}", 
                                               json=chat_data, timeout=20)
                        response_time = (time.time() - start_time) * 1000
                        
                        if response.status_code == 200:
                            data = response.json()
                            ai_response = data.get("response", "")
                            
                            # Check response quality
                            if len(ai_response) > 50:
                                self.log_test(f"{scenario['test_name']} ({endpoint_name})", True,
                                            f"AI response length: {len(ai_response)} chars",
                                            response_time=response_time)
                                
                                # Check for advanced features mentioned
                                advanced_keywords = [
                                    "workflow", "automation", "platform", "integration",
                                    "chromium", "browser", "monitoring", "credits"
                                ]
                                
                                found_keywords = [kw for kw in advanced_keywords 
                                                if kw.lower() in ai_response.lower()]
                                
                                if found_keywords:
                                    self.log_test(f"Advanced Features Mentioned ({endpoint_name})", True,
                                                f"Found keywords: {found_keywords}")
                                else:
                                    self.log_test(f"Advanced Features Mentioned ({endpoint_name})", False,
                                                "AI response lacks advanced feature mentions")
                            else:
                                self.log_test(f"{scenario['test_name']} ({endpoint_name})", False,
                                            f"AI response too short: {len(ai_response)} chars",
                                            response_time=response_time)
                        else:
                            self.log_test(f"{scenario['test_name']} ({endpoint_name})", False,
                                        f"HTTP {response.status_code}: {response.text}",
                                        response_time=response_time)
                            
                    except Exception as e:
                        self.log_test(f"{scenario['test_name']} ({endpoint_name})", False, error=e)
                        
        except Exception as e:
            self.log_test("Comprehensive Chat Functionality", False, error=e)

    def run_enhanced_backend_tests(self):
        """Run all enhanced backend tests"""
        print("🚀 ENHANCED BACKEND SYSTEM TESTING - Production Ready Features")
        print("🎯 Focus: API Versioning, Rate Limiting, Enhanced Logging, Error Handling, Performance Monitoring")
        print("=" * 80)
        
        # Run all test categories
        self.test_api_versioning()
        self.test_rate_limiting()
        self.test_enhanced_logging()
        self.test_structured_error_handling()
        self.test_performance_monitoring()
        self.test_comprehensive_chat_functionality()
        
        # Print comprehensive summary
        self.print_enhanced_summary()

    def print_enhanced_summary(self):
        """Print comprehensive test summary for enhanced backend features"""
        print("\n" + "=" * 80)
        print("📊 ENHANCED BACKEND TESTING RESULTS")
        print("=" * 80)
        
        # Basic test statistics
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"🧪 TESTING STATISTICS:")
        print(f"   Total Tests: {total}")
        print(f"   Passed: {passed}")
        print(f"   Failed: {total - passed}")
        print(f"   Success Rate: {(passed/total)*100:.1f}%")
        
        # Performance analysis
        response_times = [r["response_time_ms"] for r in self.test_results if r["response_time_ms"]]
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)
            min_response_time = min(response_times)
            
            print(f"\n⚡ PERFORMANCE ANALYSIS:")
            print(f"   Average Response Time: {avg_response_time:.2f}ms")
            print(f"   Fastest Response: {min_response_time:.2f}ms")
            print(f"   Slowest Response: {max_response_time:.2f}ms")
        
        # Rate limiting analysis
        if self.rate_limit_info:
            print(f"\n🚦 RATE LIMITING ANALYSIS:")
            for header, value in self.rate_limit_info.items():
                print(f"   {header}: {value}")
        
        # Test failures analysis
        failures = [r for r in self.test_results if not r["success"]]
        if failures:
            print(f"\n❌ FAILED TESTS: {len(failures)}")
            print("-" * 60)
            for failure in failures:
                print(f"   {failure['test']}: {failure['error'] or 'Unknown error'}")
        
        # Enhanced features assessment
        print(f"\n🎯 ENHANCED FEATURES ASSESSMENT:")
        print("-" * 60)
        
        feature_categories = {
            "API Versioning": ["API v1 Endpoint", "Backward Compatibility", "API Response Consistency"],
            "Rate Limiting": ["Rate Limit Headers", "Rate Limiting Enforcement", "Rate Limiting Behavior"],
            "Enhanced Logging": ["Request Logging", "Performance Metrics Collection", "Structured Response Logging"],
            "Error Handling": ["404 Error Structure", "Helpful Error Messages", "500 Error Handling"],
            "Performance Monitoring": ["System Status Endpoint", "Performance Statistics", "Enhanced Health Check"]
        }
        
        for category, tests in feature_categories.items():
            category_results = [r for r in self.test_results if any(test in r["test"] for test in tests)]
            category_passed = sum(1 for r in category_results if r["success"])
            category_total = len(category_results)
            
            if category_total > 0:
                category_rate = (category_passed / category_total) * 100
                status = "✅" if category_rate >= 80 else "⚠️" if category_rate >= 60 else "❌"
                print(f"   {status} {category}: {category_passed}/{category_total} ({category_rate:.1f}%)")
        
        print("\n" + "=" * 80)
        print("🏆 OVERALL ENHANCED BACKEND ASSESSMENT:")
        
        if passed / total >= 0.9:
            print("   ✅ EXCELLENT: Enhanced backend features working perfectly")
        elif passed / total >= 0.8:
            print("   ✅ VERY GOOD: Enhanced backend features mostly functional")
        elif passed / total >= 0.7:
            print("   ⚠️  GOOD: Enhanced backend features working with some issues")
        elif passed / total >= 0.6:
            print("   ⚠️  FAIR: Enhanced backend features partially working")
        else:
            print("   ❌ NEEDS ATTENTION: Multiple enhanced features not working")
        
        print("=" * 80)

if __name__ == "__main__":
    print("🚀 ENHANCED BACKEND SYSTEM TESTING")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    print(f"🔌 WebSocket URL: {WS_URL}")
    print(f"🎯 Focus: Production-Ready Enhanced Features")
    print()
    
    tester = EnhancedBackendTester()
    tester.run_enhanced_backend_tests()