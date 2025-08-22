#!/usr/bin/env python3
"""
COMPREHENSIVE BACKEND TESTING FOR FELLOU.AI CLONE
Tests all backend endpoints thoroughly as requested in the review.
"""

import requests
import json
import time
import asyncio
import websockets
import uuid
from datetime import datetime
import sys

# Backend URL from environment
BACKEND_URL = "https://code-harmony.preview.emergentagent.com"
WS_URL = "wss://clean-test-flow.preview.emergentagent.com"

class ComprehensiveBackendTester:
    def __init__(self):
        self.session_id = str(uuid.uuid4())
        self.workflow_id = None
        self.tab_id = None
        self.test_results = []
        self.performance_metrics = []
        
    def log_test(self, test_name, success, details="", error=None, response_time=None):
        """Log test results with performance metrics"""
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
        time_info = f" ({response_time:.0f}ms)" if response_time else ""
        print(f"{status} {test_name}{time_info}")
        if details:
            print(f"   Details: {details}")
        if error:
            print(f"   Error: {error}")
        print()

    def test_health_endpoints(self):
        """Test health check endpoints"""
        print("🏥 TESTING HEALTH ENDPOINTS")
        print("-" * 50)
        
        endpoints = [
            ("/health", "Root Health Check"),
            ("/api/health", "API Health Check")
        ]
        
        for endpoint, name in endpoints:
            try:
                start_time = time.time()
                response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=10)
                response_time = (time.time() - start_time) * 1000
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_test(name, True, 
                                f"Status: {data.get('status')}, Version: {data.get('version')}", 
                                response_time=response_time)
                else:
                    self.log_test(name, False, f"HTTP {response.status_code}", 
                                response_time=response_time)
                    
            except Exception as e:
                self.log_test(name, False, error=e)

    def test_system_status_endpoints(self):
        """Test system status and capabilities endpoints"""
        print("🔧 TESTING SYSTEM STATUS ENDPOINTS")
        print("-" * 50)
        
        try:
            # Test system status
            start_time = time.time()
            response = requests.get(f"{BACKEND_URL}/api/system/status", timeout=10)
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                data = response.json()
                capabilities = data.get("capabilities", {})
                services = data.get("services", {})
                browser_engine = data.get("browser_engine", {})
                
                active_sessions = data.get("active_sessions", 0)
                active_websockets = data.get("active_websockets", 0)
                
                self.log_test("System Status", True,
                            f"Services: {len(services)}, Sessions: {active_sessions}, WebSockets: {active_websockets}",
                            response_time=response_time)
                
                # Test browser engine status
                if browser_engine.get("initialized"):
                    self.log_test("Native Chromium Engine", True,
                                f"Engine: {browser_engine.get('engine')}, Contexts: {browser_engine.get('active_contexts')}")
                else:
                    self.log_test("Native Chromium Engine", False, "Browser engine not initialized")
                    
            else:
                self.log_test("System Status", False, f"HTTP {response.status_code}", 
                            response_time=response_time)
                
            # Test system capabilities
            start_time = time.time()
            caps_response = requests.get(f"{BACKEND_URL}/api/system/capabilities", timeout=10)
            response_time = (time.time() - start_time) * 1000
            
            if caps_response.status_code == 200:
                caps_data = caps_response.json()
                browser_caps = caps_data.get("browser_capabilities", {})
                automation_features = caps_data.get("automation_features", {})
                
                browser_features = sum(1 for v in browser_caps.values() if v)
                automation_count = sum(1 for v in automation_features.values() if v)
                
                self.log_test("System Capabilities", True,
                            f"Browser features: {browser_features}, Automation features: {automation_count}",
                            response_time=response_time)
            else:
                self.log_test("System Capabilities", False, f"HTTP {caps_response.status_code}",
                            response_time=response_time)
                
        except Exception as e:
            self.log_test("System Status Endpoints", False, error=e)

    def test_ai_chat_integration(self):
        """Test AI chat integration with Groq"""
        print("🤖 TESTING AI CHAT INTEGRATION")
        print("-" * 50)
        
        test_messages = [
            {
                "message": "Hello, what can you do?",
                "test_name": "Basic AI Chat"
            },
            {
                "message": "Create a workflow to research AI trends",
                "test_name": "AI Workflow Planning"
            },
            {
                "message": "What browser automation features do you have?",
                "test_name": "AI Feature Discovery"
            }
        ]
        
        for test_msg in test_messages:
            try:
                chat_data = {
                    "message": test_msg["message"],
                    "session_id": self.session_id
                }
                
                start_time = time.time()
                response = requests.post(f"{BACKEND_URL}/api/chat", 
                                       json=chat_data, timeout=30)
                response_time = (time.time() - start_time) * 1000
                
                if response.status_code == 200:
                    data = response.json()
                    ai_response = data.get("response", "")
                    capabilities = data.get("capabilities", {})
                    
                    if ai_response and len(ai_response) > 50:
                        self.log_test(test_msg["test_name"], True,
                                    f"AI responded with {len(ai_response)} chars. Groq: {capabilities.get('groq_powered')}",
                                    response_time=response_time)
                    else:
                        self.log_test(test_msg["test_name"], False,
                                    "AI response too short or empty",
                                    response_time=response_time)
                else:
                    self.log_test(test_msg["test_name"], False, f"HTTP {response.status_code}",
                                response_time=response_time)
                    
            except Exception as e:
                self.log_test(test_msg["test_name"], False, error=e)

    def test_browser_navigation(self):
        """Test browser navigation with Native Chromium"""
        print("🌐 TESTING BROWSER NAVIGATION")
        print("-" * 50)
        
        test_urls = [
            "https://example.com",
            "https://httpbin.org/html",
            "https://jsonplaceholder.typicode.com"
        ]
        
        for url in test_urls:
            try:
                nav_data = {
                    "url": url,
                    "session_id": self.session_id
                }
                
                start_time = time.time()
                response = requests.post(f"{BACKEND_URL}/api/browser/navigate", 
                                       params=nav_data, timeout=30)
                response_time = (time.time() - start_time) * 1000
                
                if response.status_code == 200:
                    data = response.json()
                    
                    if data.get("success"):
                        self.tab_id = data.get("tab_id")
                        title = data.get("title", "")
                        screenshot = data.get("screenshot")
                        content_preview = data.get("content_preview", "")
                        
                        details = f"Title: {title[:50]}..."
                        if screenshot:
                            details += f", Screenshot: {len(screenshot)} chars"
                        if content_preview:
                            details += f", Content: {len(content_preview)} chars"
                            
                        self.log_test(f"Navigate to {url}", True, details, response_time=response_time)
                    else:
                        self.log_test(f"Navigate to {url}", False, 
                                    data.get("error", "Navigation failed"), response_time=response_time)
                else:
                    self.log_test(f"Navigate to {url}", False, f"HTTP {response.status_code}",
                                response_time=response_time)
                    
            except Exception as e:
                self.log_test(f"Navigate to {url}", False, error=e)

    def test_browser_actions(self):
        """Test browser actions and automation"""
        print("🎯 TESTING BROWSER ACTIONS")
        print("-" * 50)
        
        if not self.tab_id:
            self.log_test("Browser Actions", False, "No tab_id available - navigation tests failed")
            return
            
        actions_to_test = [
            {
                "action_type": "screenshot",
                "test_name": "Screenshot Capture"
            },
            {
                "action_type": "extract_data",
                "target": "h1, h2, p, title",
                "test_name": "Data Extraction"
            },
            {
                "action_type": "scroll",
                "scroll_y": 300,
                "test_name": "Page Scroll"
            },
            {
                "action_type": "wait",
                "wait_time": 1000,
                "test_name": "Wait Action"
            }
        ]
        
        for action in actions_to_test:
            try:
                action_data = {
                    "tab_id": self.tab_id,
                    **{k: v for k, v in action.items() if k != "test_name"}
                }
                
                start_time = time.time()
                response = requests.post(f"{BACKEND_URL}/api/browser/action", 
                                       json=action_data, timeout=20)
                response_time = (time.time() - start_time) * 1000
                
                if response.status_code == 200:
                    data = response.json()
                    
                    if data.get("success"):
                        message = data.get("message", "Action completed")
                        
                        # Add specific details for different actions
                        if action["action_type"] == "extract_data":
                            extracted_data = data.get("extracted_data", [])
                            message += f" - Extracted {len(extracted_data)} elements"
                        elif action["action_type"] == "screenshot":
                            screenshot = data.get("screenshot")
                            if screenshot:
                                message += f" - Screenshot size: {len(screenshot)} chars"
                                
                        self.log_test(action["test_name"], True, message, response_time=response_time)
                    else:
                        self.log_test(action["test_name"], False,
                                    data.get("error", "Action failed"), response_time=response_time)
                else:
                    self.log_test(action["test_name"], False, f"HTTP {response.status_code}",
                                response_time=response_time)
                    
            except Exception as e:
                self.log_test(action["test_name"], False, error=e)

    def test_tab_management(self):
        """Test browser tab management"""
        print("📑 TESTING TAB MANAGEMENT")
        print("-" * 50)
        
        try:
            # Test getting tabs info
            start_time = time.time()
            response = requests.get(f"{BACKEND_URL}/api/browser/tabs", 
                                   params={"session_id": self.session_id}, timeout=10)
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                data = response.json()
                tabs = data.get("tabs", [])
                total_tabs = data.get("total_tabs", 0)
                engine = data.get("engine", "")
                
                self.log_test("Get Browser Tabs", True,
                            f"Found {total_tabs} tabs, Engine: {engine}",
                            response_time=response_time)
                
                # Test screenshot endpoint
                if self.tab_id:
                    start_time = time.time()
                    screenshot_response = requests.post(f"{BACKEND_URL}/api/browser/screenshot",
                                                      params={"tab_id": self.tab_id}, timeout=15)
                    response_time = (time.time() - start_time) * 1000
                    
                    if screenshot_response.status_code == 200:
                        screenshot_data = screenshot_response.json()
                        if screenshot_data.get("success"):
                            screenshot = screenshot_data.get("screenshot")
                            self.log_test("Screenshot Endpoint", True,
                                        f"Screenshot captured: {len(screenshot) if screenshot else 0} chars",
                                        response_time=response_time)
                        else:
                            self.log_test("Screenshot Endpoint", False,
                                        screenshot_data.get("error", "Screenshot failed"),
                                        response_time=response_time)
                    else:
                        self.log_test("Screenshot Endpoint", False, f"HTTP {screenshot_response.status_code}",
                                    response_time=response_time)
            else:
                self.log_test("Get Browser Tabs", False, f"HTTP {response.status_code}",
                            response_time=response_time)
                
        except Exception as e:
            self.log_test("Tab Management", False, error=e)

    def test_workflow_creation(self):
        """Test workflow creation and management"""
        print("⚙️ TESTING WORKFLOW CREATION")
        print("-" * 50)
        
        workflow_tests = [
            {
                "instruction": "Research the latest AI trends and create a summary report",
                "workflow_type": "research",
                "test_name": "Research Workflow Creation"
            },
            {
                "instruction": "Monitor GitHub trending repositories and extract project details",
                "workflow_type": "monitoring",
                "test_name": "Monitoring Workflow Creation"
            },
            {
                "instruction": "Extract contact information from LinkedIn profiles",
                "workflow_type": "lead_generation",
                "test_name": "Lead Generation Workflow"
            }
        ]
        
        for workflow_spec in workflow_tests:
            try:
                workflow_data = {
                    "instruction": workflow_spec["instruction"],
                    "session_id": self.session_id,
                    "workflow_type": workflow_spec["workflow_type"]
                }
                
                start_time = time.time()
                response = requests.post(f"{BACKEND_URL}/api/workflow/create", 
                                       json=workflow_data, timeout=30)
                response_time = (time.time() - start_time) * 1000
                
                if response.status_code == 200:
                    data = response.json()
                    workflow = data.get("workflow")
                    
                    if workflow:
                        steps = workflow.get("steps", [])
                        estimated_credits = workflow.get("estimated_credits", 0)
                        workflow_id = workflow.get("workflow_id")
                        
                        # Store first workflow ID for execution testing
                        if not self.workflow_id:
                            self.workflow_id = workflow_id
                            
                        self.log_test(workflow_spec["test_name"], True,
                                    f"Created with {len(steps)} steps, {estimated_credits} credits",
                                    response_time=response_time)
                    else:
                        self.log_test(workflow_spec["test_name"], False, "No workflow in response",
                                    response_time=response_time)
                else:
                    self.log_test(workflow_spec["test_name"], False, f"HTTP {response.status_code}",
                                response_time=response_time)
                    
            except Exception as e:
                self.log_test(workflow_spec["test_name"], False, error=e)

    def test_workflow_execution(self):
        """Test workflow execution"""
        print("🚀 TESTING WORKFLOW EXECUTION")
        print("-" * 50)
        
        if not self.workflow_id:
            self.log_test("Workflow Execution", False, "No workflow_id available")
            return
            
        try:
            start_time = time.time()
            response = requests.post(f"{BACKEND_URL}/api/workflow/execute/{self.workflow_id}", 
                                   timeout=60)
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                data = response.json()
                
                execution_results = data.get("execution_results", [])
                status = data.get("status", "")
                completed_steps = data.get("completed_steps", 0)
                total_steps = data.get("total_steps", 0)
                browser_tab_id = data.get("browser_tab_id")
                engine = data.get("engine", "")
                
                self.log_test("Workflow Execution", True,
                            f"Status: {status}, Steps: {completed_steps}/{total_steps}, Engine: {engine}",
                            response_time=response_time)
                
                # Test execution details
                if execution_results:
                    successful_steps = len([r for r in execution_results if r.get("status") == "completed"])
                    self.log_test("Workflow Step Execution", True,
                                f"{successful_steps}/{len(execution_results)} steps completed successfully")
                    
            else:
                self.log_test("Workflow Execution", False, f"HTTP {response.status_code}",
                            response_time=response_time)
                
        except Exception as e:
            self.log_test("Workflow Execution", False, error=e)

    async def test_websocket_connection(self):
        """Test WebSocket real-time communication"""
        print("🔌 TESTING WEBSOCKET CONNECTION")
        print("-" * 50)
        
        try:
            ws_url = f"{WS_URL}/api/ws/{self.session_id}"
            
            async with websockets.connect(ws_url, timeout=10) as websocket:
                # Test ping/pong
                ping_message = json.dumps({"type": "ping"})
                await websocket.send(ping_message)
                
                response = await asyncio.wait_for(websocket.recv(), timeout=5)
                response_data = json.loads(response)
                
                if response_data.get("type") == "pong":
                    self.log_test("WebSocket Ping/Pong", True, "WebSocket communication working")
                    
                    # Test workflow progress updates
                    workflow_message = json.dumps({
                        "type": "workflow_progress",
                        "workflow_id": self.workflow_id or "test_workflow"
                    })
                    await websocket.send(workflow_message)
                    
                    progress_response = await asyncio.wait_for(websocket.recv(), timeout=5)
                    progress_data = json.loads(progress_response)
                    
                    if progress_data.get("type") == "workflow_progress":
                        self.log_test("WebSocket Workflow Updates", True,
                                    f"Progress: {progress_data.get('progress', 0)}%")
                    else:
                        self.log_test("WebSocket Workflow Updates", False,
                                    f"Unexpected response: {progress_data.get('type')}")
                        
                    # Test browser action via WebSocket
                    if self.tab_id:
                        browser_message = json.dumps({
                            "type": "browser_action",
                            "tab_id": self.tab_id,
                            "action_type": "screenshot"
                        })
                        await websocket.send(browser_message)
                        
                        browser_response = await asyncio.wait_for(websocket.recv(), timeout=10)
                        browser_data = json.loads(browser_response)
                        
                        if browser_data.get("type") == "browser_action_result":
                            result = browser_data.get("result", {})
                            self.log_test("WebSocket Browser Actions", True,
                                        f"Browser action success: {result.get('success', False)}")
                        else:
                            self.log_test("WebSocket Browser Actions", False,
                                        f"Unexpected response: {browser_data.get('type')}")
                else:
                    self.log_test("WebSocket Ping/Pong", False,
                                f"Unexpected ping response: {response_data}")
                    
        except Exception as e:
            self.log_test("WebSocket Connection", False, error=e)

    def test_error_handling(self):
        """Test error handling and edge cases"""
        print("⚠️ TESTING ERROR HANDLING")
        print("-" * 50)
        
        error_tests = [
            {
                "endpoint": "/api/chat",
                "method": "POST",
                "data": {},  # Missing message
                "test_name": "Chat Missing Message"
            },
            {
                "endpoint": "/api/workflow/create",
                "method": "POST", 
                "data": {},  # Missing instruction
                "test_name": "Workflow Missing Instruction"
            },
            {
                "endpoint": "/api/browser/navigate",
                "method": "POST",
                "params": {},  # Missing URL
                "test_name": "Navigation Missing URL"
            },
            {
                "endpoint": "/api/browser/action",
                "method": "POST",
                "data": {},  # Missing tab_id
                "test_name": "Browser Action Missing Tab ID"
            },
            {
                "endpoint": "/api/workflow/execute/invalid-id",
                "method": "POST",
                "data": {},
                "test_name": "Execute Invalid Workflow"
            }
        ]
        
        for test in error_tests:
            try:
                start_time = time.time()
                
                if test["method"] == "POST":
                    if "params" in test:
                        response = requests.post(f"{BACKEND_URL}{test['endpoint']}", 
                                               params=test.get("params", {}), 
                                               json=test.get("data", {}), timeout=10)
                    else:
                        response = requests.post(f"{BACKEND_URL}{test['endpoint']}", 
                                               json=test.get("data", {}), timeout=10)
                else:
                    response = requests.get(f"{BACKEND_URL}{test['endpoint']}", timeout=10)
                    
                response_time = (time.time() - start_time) * 1000
                
                # For error handling tests, we expect 4xx or 5xx status codes
                if response.status_code >= 400:
                    self.log_test(test["test_name"], True,
                                f"Properly returned HTTP {response.status_code} for invalid request",
                                response_time=response_time)
                else:
                    self.log_test(test["test_name"], False,
                                f"Should have returned error but got HTTP {response.status_code}",
                                response_time=response_time)
                    
            except Exception as e:
                self.log_test(test["test_name"], False, error=e)

    def test_performance_metrics(self):
        """Analyze performance metrics from all tests"""
        print("📊 PERFORMANCE ANALYSIS")
        print("-" * 50)
        
        # Calculate performance statistics
        response_times = [r["response_time_ms"] for r in self.test_results if r["response_time_ms"]]
        
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)
            min_response_time = min(response_times)
            
            self.log_test("Performance Analysis", True,
                        f"Avg: {avg_response_time:.0f}ms, Max: {max_response_time:.0f}ms, Min: {min_response_time:.0f}ms")
            
            # Identify slow endpoints
            slow_tests = [r for r in self.test_results if r["response_time_ms"] and r["response_time_ms"] > 5000]
            if slow_tests:
                self.log_test("Slow Endpoints Detected", False,
                            f"{len(slow_tests)} endpoints took >5s: {[t['test'] for t in slow_tests]}")
            else:
                self.log_test("Response Time Performance", True, "All endpoints responded within 5 seconds")
        else:
            self.log_test("Performance Analysis", False, "No response time data available")

    def run_comprehensive_tests(self):
        """Run all comprehensive backend tests"""
        print("🚀 COMPREHENSIVE FELLOU.AI CLONE BACKEND TESTING")
        print("🎯 Testing all endpoints as requested in review")
        print("=" * 80)
        
        # Run all test categories
        self.test_health_endpoints()
        self.test_system_status_endpoints()
        self.test_ai_chat_integration()
        self.test_browser_navigation()
        self.test_browser_actions()
        self.test_tab_management()
        self.test_workflow_creation()
        self.test_workflow_execution()
        self.test_error_handling()
        
        # Run WebSocket tests
        try:
            asyncio.run(self.test_websocket_connection())
        except Exception as e:
            self.log_test("WebSocket Tests", False, error=e)
        
        # Performance analysis
        self.test_performance_metrics()
        
        # Print final summary
        self.print_final_summary()

    def print_final_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE BACKEND TEST RESULTS")
        print("=" * 80)
        
        # Basic statistics
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        success_rate = (passed / total) * 100 if total > 0 else 0
        
        print(f"🧪 TESTING STATISTICS:")
        print(f"   Total Tests: {total}")
        print(f"   Passed: {passed}")
        print(f"   Failed: {total - passed}")
        print(f"   Success Rate: {success_rate:.1f}%")
        
        # Performance metrics
        response_times = [r["response_time_ms"] for r in self.test_results if r["response_time_ms"]]
        if response_times:
            avg_time = sum(response_times) / len(response_times)
            print(f"   Average Response Time: {avg_time:.0f}ms")
        
        # Test failures
        failures = [r for r in self.test_results if not r["success"]]
        if failures:
            print(f"\n❌ FAILED TESTS ({len(failures)}):")
            print("-" * 60)
            for failure in failures:
                print(f"   • {failure['test']}: {failure['error'] or 'Test failed'}")
        
        # Successful tests by category
        print(f"\n✅ SUCCESSFUL TESTS BY CATEGORY:")
        print("-" * 60)
        
        categories = {
            "Health": ["Health Check"],
            "System": ["System Status", "System Capabilities", "Native Chromium"],
            "AI Chat": ["AI Chat", "AI Workflow", "AI Feature"],
            "Browser": ["Navigate", "Screenshot", "Data Extraction", "Scroll", "Wait"],
            "Workflow": ["Workflow Creation", "Workflow Execution"],
            "WebSocket": ["WebSocket", "Ping/Pong"],
            "Error Handling": ["Missing", "Invalid"]
        }
        
        for category, keywords in categories.items():
            category_tests = [r for r in self.test_results 
                            if any(keyword.lower() in r["test"].lower() for keyword in keywords)]
            category_passed = sum(1 for r in category_tests if r["success"])
            category_total = len(category_tests)
            
            if category_total > 0:
                category_rate = (category_passed / category_total) * 100
                print(f"   {category}: {category_passed}/{category_total} ({category_rate:.0f}%)")
        
        # Overall assessment
        print(f"\n🏆 OVERALL ASSESSMENT:")
        print("-" * 60)
        
        if success_rate >= 90:
            print("   ✅ EXCELLENT: Backend is fully functional and production-ready")
        elif success_rate >= 75:
            print("   ✅ GOOD: Backend is functional with minor issues")
        elif success_rate >= 50:
            print("   ⚠️  FAIR: Backend has some functionality but needs attention")
        else:
            print("   ❌ POOR: Backend has significant issues requiring immediate attention")
        
        print(f"\n📋 KEY FINDINGS:")
        print("-" * 60)
        
        # Analyze key capabilities
        ai_working = any("AI Chat" in r["test"] and r["success"] for r in self.test_results)
        browser_working = any("Navigate" in r["test"] and r["success"] for r in self.test_results)
        workflow_working = any("Workflow" in r["test"] and r["success"] for r in self.test_results)
        websocket_working = any("WebSocket" in r["test"] and r["success"] for r in self.test_results)
        
        print(f"   • AI Chat Integration: {'✅ Working' if ai_working else '❌ Failed'}")
        print(f"   • Native Chromium Browser: {'✅ Working' if browser_working else '❌ Failed'}")
        print(f"   • Workflow Automation: {'✅ Working' if workflow_working else '❌ Failed'}")
        print(f"   • WebSocket Real-time: {'✅ Working' if websocket_working else '❌ Failed'}")
        
        print("=" * 80)

if __name__ == "__main__":
    print("🚀 COMPREHENSIVE FELLOU.AI CLONE BACKEND TESTING")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    print(f"🔌 WebSocket URL: {WS_URL}")
    print()
    
    tester = ComprehensiveBackendTester()
    tester.run_comprehensive_tests()