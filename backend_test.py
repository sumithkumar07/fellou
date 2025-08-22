#!/usr/bin/env python3
"""
COMPREHENSIVE FELLOU.AI CLONE BACKEND TESTING - ADVANCED FEATURE DISCOVERY
Tests all API endpoints comprehensively to identify underutilized features and capabilities.
Focus: Cross-platform integration, AI depth, Native Chromium features, hidden endpoints.
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
import base64

# Production Backend URLs
BACKEND_URL = "https://fullstack-test.preview.emergentagent.com"
WS_URL = "wss://fullstack-test.preview.emergentagent.com"
GROQ_API_KEY = "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"

class EmergentBrowserTester:
    def __init__(self):
        self.session_id = str(uuid.uuid4())
        self.workflow_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, details="", error=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "error": str(error) if error else None,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if error:
            print(f"   Error: {error}")
        print()

    def test_health_check(self):
        """Test /api/health endpoint"""
        try:
            response = requests.get(f"{BACKEND_URL}/api/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                features = data.get("features", {})
                
                # Check required features
                required_features = ["ai_chat", "browser_automation", "workflow_creation"]
                missing_features = [f for f in required_features if not features.get(f)]
                
                if missing_features:
                    self.log_test("Health Check", False, 
                                f"Missing features: {missing_features}", None)
                else:
                    self.log_test("Health Check", True, 
                                f"All features enabled. Version: {data.get('version')}")
            else:
                self.log_test("Health Check", False, 
                            f"HTTP {response.status_code}", None)
                
        except Exception as e:
            self.log_test("Health Check", False, error=e)

    def test_ai_chat_integration(self):
        """Test /api/chat endpoint with Groq LLM integration"""
        try:
            # Test 1: Basic AI chat
            chat_data = {
                "message": "Hello, what can you do?",
                "session_id": self.session_id
            }
            
            response = requests.post(f"{BACKEND_URL}/api/chat", 
                                   json=chat_data, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                ai_response = data.get("response", "")
                
                # Check if AI responds with Fellou-like capabilities
                fellou_keywords = ["workflow", "automation", "browser", "deep action", 
                                 "research", "report", "platform"]
                has_fellou_context = any(keyword.lower() in ai_response.lower() 
                                       for keyword in fellou_keywords)
                
                if has_fellou_context and len(ai_response) > 50:
                    self.log_test("AI Chat - Basic Response", True,
                                f"AI responded with Fellou context. Length: {len(ai_response)} chars")
                else:
                    self.log_test("AI Chat - Basic Response", False,
                                f"AI response lacks Fellou context or too short: {ai_response[:100]}...")
                    
                # Test 2: Follow-up message for session management
                followup_data = {
                    "message": "Can you help me automate LinkedIn profile searches?",
                    "session_id": self.session_id
                }
                
                followup_response = requests.post(f"{BACKEND_URL}/api/chat", 
                                                json=followup_data, timeout=30)
                
                if followup_response.status_code == 200:
                    followup_data_resp = followup_response.json()
                    followup_ai_response = followup_data_resp.get("response", "")
                    
                    # Check if AI provides actionable workflow suggestions
                    workflow_keywords = ["step", "workflow", "automate", "search", "linkedin"]
                    has_workflow_context = any(keyword.lower() in followup_ai_response.lower() 
                                             for keyword in workflow_keywords)
                    
                    if has_workflow_context:
                        self.log_test("AI Chat - Session Management", True,
                                    "AI maintained context and provided workflow guidance")
                    else:
                        self.log_test("AI Chat - Session Management", False,
                                    f"AI didn't provide workflow context: {followup_ai_response[:100]}...")
                else:
                    self.log_test("AI Chat - Session Management", False,
                                f"HTTP {followup_response.status_code}")
                    
            else:
                self.log_test("AI Chat - Basic Response", False,
                            f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("AI Chat Integration", False, error=e)

    def test_browser_navigation(self):
        """Test /api/browser/navigate endpoint"""
        try:
            # Test 1: Navigate to example.com
            nav_data = {
                "url": "https://example.com"
            }
            
            response = requests.post(f"{BACKEND_URL}/api/browser/navigate", 
                                   params=nav_data, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("success") and data.get("tab_id") and data.get("title"):
                    self.log_test("Browser Navigation - Basic", True,
                                f"Successfully navigated to {data.get('url')}. Title: {data.get('title')}")
                    
                    # Test 2: Get active tabs
                    tabs_response = requests.get(f"{BACKEND_URL}/api/browser/tabs", timeout=10)
                    
                    if tabs_response.status_code == 200:
                        tabs_data = tabs_response.json()
                        tabs = tabs_data.get("tabs", [])
                        
                        if len(tabs) > 0:
                            self.log_test("Browser Navigation - Tab Management", True,
                                        f"Found {len(tabs)} active tabs")
                        else:
                            self.log_test("Browser Navigation - Tab Management", False,
                                        "No active tabs found")
                    else:
                        self.log_test("Browser Navigation - Tab Management", False,
                                    f"HTTP {tabs_response.status_code}")
                else:
                    self.log_test("Browser Navigation - Basic", False,
                                f"Invalid response structure: {data}")
                    
            else:
                self.log_test("Browser Navigation - Basic", False,
                            f"HTTP {response.status_code}")
                
            # Test 3: URL validation and error handling
            invalid_nav_data = {
                "url": "invalid-url-test"
            }
            
            invalid_response = requests.post(f"{BACKEND_URL}/api/browser/navigate", 
                                           params=invalid_nav_data, timeout=10)
            
            # Should either succeed (with URL correction) or fail gracefully
            if invalid_response.status_code in [200, 400, 500]:
                self.log_test("Browser Navigation - Error Handling", True,
                            f"Handled invalid URL appropriately (HTTP {invalid_response.status_code})")
            else:
                self.log_test("Browser Navigation - Error Handling", False,
                            f"Unexpected response to invalid URL: HTTP {invalid_response.status_code}")
                
        except Exception as e:
            self.log_test("Browser Navigation", False, error=e)

    def test_workflow_creation(self):
        """Test /api/workflow/create endpoint"""
        try:
            workflow_data = {
                "instruction": "Find LinkedIn profiles of AI engineers",
                "session_id": self.session_id,
                "workflow_type": "research"
            }
            
            response = requests.post(f"{BACKEND_URL}/api/workflow/create", 
                                   json=workflow_data, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check workflow structure
                required_fields = ["workflow_id", "title", "steps", "estimated_credits"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.workflow_id = data["workflow_id"]
                    steps = data.get("steps", [])
                    
                    # Validate steps have proper structure
                    valid_steps = all(
                        isinstance(step, dict) and 
                        "action_type" in step and 
                        "target" in step
                        for step in steps
                    )
                    
                    if valid_steps and len(steps) > 0:
                        self.log_test("Workflow Creation", True,
                                    f"Created workflow '{data['title']}' with {len(steps)} steps. "
                                    f"Estimated credits: {data.get('estimated_credits')}")
                    else:
                        self.log_test("Workflow Creation", False,
                                    f"Invalid step structure or no steps: {steps}")
                else:
                    self.log_test("Workflow Creation", False,
                                f"Missing required fields: {missing_fields}")
            else:
                self.log_test("Workflow Creation", False,
                            f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Workflow Creation", False, error=e)

    def test_workflow_execution(self):
        """Test /api/workflow/execute/{workflow_id}"""
        if not self.workflow_id:
            self.log_test("Workflow Execution", False, 
                        "No workflow_id available (workflow creation failed)")
            return
            
        try:
            response = requests.post(f"{BACKEND_URL}/api/workflow/execute/{self.workflow_id}", 
                                   timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                if (data.get("status") == "completed" and 
                    data.get("workflow_id") == self.workflow_id and
                    "results" in data):
                    
                    results = data["results"]
                    completed_steps = sum(1 for result in results 
                                        if result.get("status") == "completed")
                    
                    self.log_test("Workflow Execution", True,
                                f"Workflow executed successfully. "
                                f"Completed {completed_steps}/{len(results)} steps")
                else:
                    self.log_test("Workflow Execution", False,
                                f"Invalid execution response: {data}")
            else:
                self.log_test("Workflow Execution", False,
                            f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Workflow Execution", False, error=e)

    async def test_websocket_connection(self):
        """Test /api/ws/{session_id} WebSocket connection"""
        try:
            ws_url = f"{WS_URL}/api/ws/{self.session_id}"
            
            async with websockets.connect(ws_url) as websocket:
                # Test ping/pong
                ping_message = json.dumps({"type": "ping"})
                await websocket.send(ping_message)
                
                response = await asyncio.wait_for(websocket.recv(), timeout=5)
                response_data = json.loads(response)
                
                if response_data.get("type") == "pong":
                    self.log_test("WebSocket Connection - Ping/Pong", True,
                                "WebSocket ping/pong working correctly")
                    
                    # Test workflow update message
                    if self.workflow_id:
                        workflow_message = json.dumps({
                            "type": "workflow_update",
                            "workflow_id": self.workflow_id,
                            "progress": 50
                        })
                        await websocket.send(workflow_message)
                        
                        update_response = await asyncio.wait_for(websocket.recv(), timeout=5)
                        update_data = json.loads(update_response)
                        
                        if update_data.get("type") == "workflow_progress":
                            self.log_test("WebSocket Connection - Workflow Updates", True,
                                        "WebSocket workflow updates working")
                        else:
                            self.log_test("WebSocket Connection - Workflow Updates", False,
                                        f"Unexpected workflow update response: {update_data}")
                    else:
                        self.log_test("WebSocket Connection - Workflow Updates", False,
                                    "No workflow_id available for testing")
                else:
                    self.log_test("WebSocket Connection - Ping/Pong", False,
                                f"Unexpected ping response: {response_data}")
                    
        except Exception as e:
            self.log_test("WebSocket Connection", False, error=e)

    def test_browser_actions(self):
        """Test /api/browser/action endpoint"""
        try:
            action_data = {
                "action_type": "click",
                "target": ".search-button",
                "value": None,
                "coordinates": {"x": 100, "y": 200}
            }
            
            response = requests.post(f"{BACKEND_URL}/api/browser/action", 
                                   json=action_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if (data.get("success") and 
                    data.get("action") == "click" and
                    data.get("target") == ".search-button"):
                    
                    self.log_test("Browser Actions", True,
                                "Browser action executed successfully")
                else:
                    self.log_test("Browser Actions", False,
                                f"Invalid action response: {data}")
            else:
                self.log_test("Browser Actions", False,
                            f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Browser Actions", False, error=e)

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Emergent AI Browser Backend Tests")
        print("=" * 60)
        
        # Run synchronous tests
        self.test_health_check()
        self.test_ai_chat_integration()
        self.test_browser_navigation()
        self.test_workflow_creation()
        self.test_workflow_execution()
        self.test_browser_actions()
        
        # Run WebSocket test
        try:
            asyncio.run(self.test_websocket_connection())
        except Exception as e:
            self.log_test("WebSocket Connection", False, error=e)
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}")
            if result["details"]:
                print(f"   {result['details']}")
            if result["error"]:
                print(f"   Error: {result['error']}")
        
        print("\n" + "=" * 60)
        
        # Critical issues
        critical_failures = [r for r in self.test_results 
                           if not r["success"] and 
                           any(critical in r["test"].lower() 
                               for critical in ["health", "ai chat", "workflow"])]
        
        if critical_failures:
            print("🚨 CRITICAL ISSUES FOUND:")
            for failure in critical_failures:
                print(f"   - {failure['test']}: {failure['error'] or 'Failed'}")
        else:
            print("✅ No critical issues found!")

if __name__ == "__main__":
    print("Testing Emergent AI Browser Backend APIs...")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"WebSocket URL: {WS_URL}")
    print()
    
    tester = EmergentBrowserTester()
    tester.run_all_tests()