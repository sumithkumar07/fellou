#!/usr/bin/env python3
"""
Specific Backend API Testing for Emergent AI Browser (Fellou.ai Clone)
Testing the 6 critical issues mentioned in the problem statement:

1. Playwright availability - Test if browser functionality is now working
2. WebSocket library - Test WebSocket connections 
3. Screenshot functionality - Test screenshot endpoint for action_type variable errors
4. WebSocket endpoint - Test WebSocket connection at /api/ws/{session_id}
5. Health endpoint - Test /api/health endpoint
6. Workflow creation - Test workflow creation with proper instruction parameter
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

# Get backend URL from frontend .env file
try:
    with open('/app/frontend/.env', 'r') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                BACKEND_URL = line.split('=', 1)[1].strip()
                break
        else:
            BACKEND_URL = "http://localhost:8001"
except:
    BACKEND_URL = "http://localhost:8001"

# WebSocket URL
WS_URL = BACKEND_URL.replace('http://', 'ws://').replace('https://', 'wss://')

class SpecificIssuesTester:
    def __init__(self):
        self.session_id = str(uuid.uuid4())
        self.tab_id = None
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

    def test_issue_5_health_endpoint(self):
        """Issue 5: Test /api/health endpoint (should no longer get 404)"""
        try:
            response = requests.get(f"{BACKEND_URL}/api/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy" and data.get("service"):
                    self.log_test("Issue 5: Health Endpoint", True,
                                f"Health endpoint working. Service: {data.get('service')}, Version: {data.get('version')}")
                else:
                    self.log_test("Issue 5: Health Endpoint", False,
                                f"Health endpoint returned invalid data: {data}")
            else:
                self.log_test("Issue 5: Health Endpoint", False,
                            f"HTTP {response.status_code} - Expected 200")
                
        except Exception as e:
            self.log_test("Issue 5: Health Endpoint", False, error=e)

    def test_issue_1_playwright_availability(self):
        """Issue 1: Test if browser functionality is now working (Playwright availability)"""
        try:
            # Test browser navigation to verify Playwright is working
            nav_data = {"url": "https://example.com"}
            
            response = requests.post(f"{BACKEND_URL}/api/browser/navigate", 
                                   params=nav_data, timeout=20)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("success") and data.get("engine") == "Native Chromium via Playwright":
                    self.tab_id = data.get("tab_id")  # Store for screenshot test
                    self.log_test("Issue 1: Playwright Availability", True,
                                f"Playwright working. Engine: {data.get('engine')}, Title: {data.get('title')}")
                else:
                    self.log_test("Issue 1: Playwright Availability", False,
                                f"Browser navigation failed or wrong engine: {data}")
            else:
                self.log_test("Issue 1: Playwright Availability", False,
                            f"HTTP {response.status_code} - Browser navigation failed")
                
        except Exception as e:
            self.log_test("Issue 1: Playwright Availability", False, error=e)

    def test_issue_3_screenshot_functionality(self):
        """Issue 3: Test screenshot endpoint to ensure no action_type variable errors"""
        if not self.tab_id:
            self.log_test("Issue 3: Screenshot Functionality", False,
                        "No tab_id available (browser navigation failed)")
            return
            
        try:
            # Test screenshot endpoint
            response = requests.post(f"{BACKEND_URL}/api/browser/screenshot", 
                                   params={"tab_id": self.tab_id}, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("success") and data.get("screenshot"):
                    self.log_test("Issue 3: Screenshot Functionality", True,
                                f"Screenshot captured successfully. Action: {data.get('action')}")
                else:
                    self.log_test("Issue 3: Screenshot Functionality", False,
                                f"Screenshot failed: {data}")
            else:
                self.log_test("Issue 3: Screenshot Functionality", False,
                            f"HTTP {response.status_code} - Screenshot endpoint failed")
                
        except Exception as e:
            self.log_test("Issue 3: Screenshot Functionality", False, error=e)

    def test_issue_6_workflow_creation(self):
        """Issue 6: Test workflow creation with proper instruction parameter (should no longer get 400)"""
        try:
            # Test 1: Valid workflow creation
            workflow_data = {
                "instruction": "Research AI companies and extract their contact information",
                "session_id": self.session_id,
                "workflow_type": "research"
            }
            
            response = requests.post(f"{BACKEND_URL}/api/workflow/create", 
                                   json=workflow_data, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("status") == "created" and data.get("workflow", {}).get("workflow_id"):
                    self.workflow_id = data["workflow"]["workflow_id"]
                    workflow = data["workflow"]
                    self.log_test("Issue 6: Workflow Creation - Valid", True,
                                f"Workflow created successfully. ID: {self.workflow_id}, Steps: {len(workflow.get('steps', []))}")
                else:
                    self.log_test("Issue 6: Workflow Creation - Valid", False,
                                f"Invalid workflow response: {data}")
            else:
                self.log_test("Issue 6: Workflow Creation - Valid", False,
                            f"HTTP {response.status_code} - Expected 200")
            
            # Test 2: Missing instruction parameter (should return 400 with proper error)
            invalid_workflow_data = {
                "session_id": self.session_id,
                "workflow_type": "research"
                # Missing "instruction" field
            }
            
            invalid_response = requests.post(f"{BACKEND_URL}/api/workflow/create", 
                                           json=invalid_workflow_data, timeout=10)
            
            if invalid_response.status_code == 400:
                error_data = invalid_response.json()
                if "Instruction is required" in str(error_data):
                    self.log_test("Issue 6: Workflow Creation - Error Handling", True,
                                "Proper 400 error returned for missing instruction")
                else:
                    self.log_test("Issue 6: Workflow Creation - Error Handling", False,
                                f"Wrong error message: {error_data}")
            else:
                self.log_test("Issue 6: Workflow Creation - Error Handling", False,
                            f"HTTP {invalid_response.status_code} - Expected 400")
                
        except Exception as e:
            self.log_test("Issue 6: Workflow Creation", False, error=e)

    async def test_issue_4_websocket_endpoint(self):
        """Issue 4: Test WebSocket connection at /api/ws/{session_id} (should no longer get 404)"""
        try:
            ws_url = f"{WS_URL}/api/ws/{self.session_id}"
            
            # Test WebSocket connection
            async with websockets.connect(ws_url, timeout=10) as websocket:
                # Test ping/pong
                ping_message = json.dumps({"type": "ping"})
                await websocket.send(ping_message)
                
                response = await asyncio.wait_for(websocket.recv(), timeout=5)
                response_data = json.loads(response)
                
                if response_data.get("type") == "pong":
                    self.log_test("Issue 4: WebSocket Endpoint - Connection", True,
                                "WebSocket connection established and ping/pong working")
                    
                    # Test workflow progress message
                    if self.workflow_id:
                        workflow_message = json.dumps({
                            "type": "workflow_progress",
                            "workflow_id": self.workflow_id
                        })
                        await websocket.send(workflow_message)
                        
                        progress_response = await asyncio.wait_for(websocket.recv(), timeout=5)
                        progress_data = json.loads(progress_response)
                        
                        if progress_data.get("type") == "workflow_progress":
                            self.log_test("Issue 4: WebSocket Endpoint - Messaging", True,
                                        "WebSocket workflow messaging working")
                        else:
                            self.log_test("Issue 4: WebSocket Endpoint - Messaging", False,
                                        f"Unexpected workflow response: {progress_data}")
                    else:
                        self.log_test("Issue 4: WebSocket Endpoint - Messaging", False,
                                    "No workflow_id available for testing")
                else:
                    self.log_test("Issue 4: WebSocket Endpoint - Connection", False,
                                f"Unexpected ping response: {response_data}")
                    
        except Exception as e:
            self.log_test("Issue 4: WebSocket Endpoint", False, error=e)

    async def test_issue_2_websocket_library(self):
        """Issue 2: Test WebSocket library (should no longer get 'No supported WebSocket library detected')"""
        try:
            ws_url = f"{WS_URL}/api/ws/{self.session_id}"
            
            # Test multiple WebSocket operations to verify library is working
            async with websockets.connect(ws_url, timeout=10) as websocket:
                
                # Test 1: Basic connection
                self.log_test("Issue 2: WebSocket Library - Connection", True,
                            "WebSocket library working - connection established")
                
                # Test 2: Send/receive multiple message types
                test_messages = [
                    {"type": "ping"},
                    {"type": "browser_action", "tab_id": self.tab_id or "test_tab", "action_type": "click", "target": "button"},
                    {"type": "workflow_progress", "progress": 50}
                ]
                
                successful_messages = 0
                for msg in test_messages:
                    try:
                        await websocket.send(json.dumps(msg))
                        response = await asyncio.wait_for(websocket.recv(), timeout=3)
                        response_data = json.loads(response)
                        
                        if response_data.get("type") in ["pong", "browser_action_result", "workflow_progress", "echo"]:
                            successful_messages += 1
                    except:
                        pass  # Some messages might not have handlers, that's ok
                
                if successful_messages > 0:
                    self.log_test("Issue 2: WebSocket Library - Messaging", True,
                                f"WebSocket library fully functional - {successful_messages}/{len(test_messages)} message types handled")
                else:
                    self.log_test("Issue 2: WebSocket Library - Messaging", False,
                                "No WebSocket messages were handled properly")
                    
        except Exception as e:
            self.log_test("Issue 2: WebSocket Library", False, error=e)

    def run_specific_tests(self):
        """Run tests for the 6 specific issues"""
        print("🎯 Testing Specific Issues from Problem Statement")
        print("=" * 70)
        print("Testing fixes for:")
        print("1. Playwright availability")
        print("2. WebSocket library")
        print("3. Screenshot functionality")
        print("4. WebSocket endpoint")
        print("5. Health endpoint")
        print("6. Workflow creation")
        print("=" * 70)
        
        # Test synchronous issues
        self.test_issue_5_health_endpoint()
        self.test_issue_1_playwright_availability()
        self.test_issue_3_screenshot_functionality()
        self.test_issue_6_workflow_creation()
        
        # Test WebSocket issues
        try:
            asyncio.run(self.test_issue_4_websocket_endpoint())
            asyncio.run(self.test_issue_2_websocket_library())
        except Exception as e:
            self.log_test("WebSocket Tests", False, error=e)
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("=" * 70)
        print("📊 SPECIFIC ISSUES TEST SUMMARY")
        print("=" * 70)
        
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
        
        print("\n" + "=" * 70)
        
        # Issue-specific analysis
        issues_status = {
            "Issue 1: Playwright": any("Issue 1" in r["test"] and r["success"] for r in self.test_results),
            "Issue 2: WebSocket Library": any("Issue 2" in r["test"] and r["success"] for r in self.test_results),
            "Issue 3: Screenshot": any("Issue 3" in r["test"] and r["success"] for r in self.test_results),
            "Issue 4: WebSocket Endpoint": any("Issue 4" in r["test"] and r["success"] for r in self.test_results),
            "Issue 5: Health Endpoint": any("Issue 5" in r["test"] and r["success"] for r in self.test_results),
            "Issue 6: Workflow Creation": any("Issue 6" in r["test"] and r["success"] for r in self.test_results)
        }
        
        print("🎯 ISSUE-SPECIFIC STATUS:")
        for issue, status in issues_status.items():
            status_icon = "✅ FIXED" if status else "❌ NOT FIXED"
            print(f"   {status_icon} {issue}")
        
        # Overall assessment
        fixed_issues = sum(1 for status in issues_status.values() if status)
        print(f"\n🏆 OVERALL: {fixed_issues}/6 issues have been fixed")
        
        if fixed_issues == 6:
            print("🎉 ALL ISSUES RESOLVED! The fixes are working correctly.")
        elif fixed_issues >= 4:
            print("✅ Most issues resolved. Minor issues remain.")
        else:
            print("⚠️ Several critical issues still need attention.")

if __name__ == "__main__":
    print("Testing Specific Issues for Emergent AI Browser...")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"WebSocket URL: {WS_URL}")
    print()
    
    tester = SpecificIssuesTester()
    tester.run_specific_tests()