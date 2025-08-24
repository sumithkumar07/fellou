#!/usr/bin/env python3
"""
Comprehensive Backend API Feature Testing for AI Assistant
Testing all backend APIs to verify which AI assistant features actually execute vs. just describe functionality.
"""

import asyncio
import aiohttp
import json
import uuid
import time
import websockets
import base64
from datetime import datetime
from typing import Dict, List, Any, Optional

# Configuration
BASE_URL = "https://youtube-navigator.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"
WS_BASE = "wss://ai-status-checker.preview.emergentagent.com/api/ws"

class BackendAPITester:
    def __init__(self):
        self.session_id = str(uuid.uuid4())
        self.tab_id = f"tab-{uuid.uuid4()}"
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
    async def log_test_result(self, test_name: str, success: bool, details: str, response_data: Any = None):
        """Log test result with details"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            self.failed_tests += 1
            status = "❌ FAIL"
            
        result = {
            "test_name": test_name,
            "status": status,
            "success": success,
            "details": details,
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        }
        
        self.test_results.append(result)
        print(f"{status} - {test_name}: {details}")
        
    async def test_health_endpoints(self):
        """Test health and system status endpoints - INCLUDING NEWLY IMPLEMENTED"""
        print("\n🏥 TESTING HEALTH & SYSTEM STATUS ENDPOINTS - INCLUDING NEW APIS")
        print("=" * 60)
        
        async with aiohttp.ClientSession() as session:
            # Test 1: Health Check
            try:
                async with session.get(f"{API_BASE}/health") as response:
                    if response.status == 200:
                        data = await response.json()
                        await self.log_test_result(
                            "Health Check Endpoint",
                            True,
                            f"Health endpoint working - Status: {data.get('status', 'unknown')}, Version: {data.get('version')}",
                            data
                        )
                    else:
                        await self.log_test_result(
                            "Health Check Endpoint",
                            False,
                            f"Health endpoint returned {response.status}",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "Health Check Endpoint",
                    False,
                    f"Health endpoint error: {str(e)}"
                )
            
            # Test 2: System Status - NEWLY IMPLEMENTED
            try:
                async with session.get(f"{API_BASE}/system/status") as response:
                    if response.status == 200:
                        data = await response.json()
                        system_health = data.get('system_health', {})
                        platform_integrations = data.get('platform_integrations', [])
                        await self.log_test_result(
                            "System Status API - NEW",
                            True,
                            f"✅ FIXED: System status endpoint working (404→200). Status: {data.get('status')}, Platforms: {len(platform_integrations)}, Browser: {system_health.get('browser_engine', 'unknown')}",
                            {"status": data.get('status'), "platform_count": len(platform_integrations), "capabilities": data.get('capabilities')}
                        )
                    else:
                        await self.log_test_result(
                            "System Status API - NEW",
                            False,
                            f"❌ STILL FAILING: System status endpoint returned {response.status} (expected 200)",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "System Status API - NEW",
                    False,
                    f"System status endpoint error: {str(e)}"
                )
            
            # Test 3: System Capabilities - NEWLY IMPLEMENTED
            try:
                async with session.get(f"{API_BASE}/system/capabilities") as response:
                    if response.status == 200:
                        data = await response.json()
                        capabilities = data.get('capabilities', {})
                        browser_automation = capabilities.get('browser_automation', {})
                        platform_integrations = capabilities.get('platform_integrations', {})
                        await self.log_test_result(
                            "System Capabilities API - NEW",
                            True,
                            f"✅ FIXED: System capabilities endpoint working (404→200). Browser Engine: {browser_automation.get('engine')}, Integration Categories: {len(platform_integrations)}",
                            {"browser_engine": browser_automation.get('engine'), "ai_provider": capabilities.get('ai_integration', {}).get('provider'), "integration_categories": list(platform_integrations.keys())}
                        )
                    else:
                        await self.log_test_result(
                            "System Capabilities API - NEW",
                            False,
                            f"❌ STILL FAILING: System capabilities endpoint returned {response.status} (expected 200)",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "System Capabilities API - NEW",
                    False,
                    f"System capabilities endpoint error: {str(e)}"
                )

    async def test_ai_chat_functionality(self):
        """Test AI chat and session management"""
        print("\n🤖 TESTING AI CHAT & SESSION MANAGEMENT")
        print("=" * 60)
        
        async with aiohttp.ClientSession() as session:
            # Test 1: Basic AI Chat
            try:
                chat_payload = {
                    "message": "Hello, what are your capabilities?",
                    "session_id": self.session_id
                }
                
                async with session.post(f"{API_BASE}/chat", json=chat_payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        ai_response = data.get('response', '')
                        if ai_response and len(ai_response) > 10:
                            await self.log_test_result(
                                "AI Chat Basic Functionality",
                                True,
                                f"AI responded with {len(ai_response)} characters",
                                {"response_preview": ai_response[:200] + "..." if len(ai_response) > 200 else ai_response}
                            )
                        else:
                            await self.log_test_result(
                                "AI Chat Basic Functionality",
                                False,
                                "AI response too short or empty"
                            )
                    else:
                        await self.log_test_result(
                            "AI Chat Basic Functionality",
                            False,
                            f"Chat endpoint returned {response.status}",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "AI Chat Basic Functionality",
                    False,
                    f"Chat endpoint error: {str(e)}"
                )
            
            # Test 2: AI Advanced Feature Discovery
            try:
                advanced_queries = [
                    "What are your most advanced and hidden features?",
                    "Can you automate browser tasks?",
                    "What platforms can you integrate with?",
                    "Can you extract data from websites?"
                ]
                
                advanced_features_found = 0
                for query in advanced_queries:
                    chat_payload = {
                        "message": query,
                        "session_id": self.session_id
                    }
                    
                    async with session.post(f"{API_BASE}/chat", json=chat_payload) as response:
                        if response.status == 200:
                            data = await response.json()
                            ai_response = data.get('response', '').lower()
                            
                            # Check for advanced feature mentions
                            advanced_keywords = [
                                'chromium', 'playwright', 'automation', 'screenshot', 
                                'extract', 'workflow', 'integration', 'platform',
                                'linkedin', 'twitter', 'github', 'css selector'
                            ]
                            
                            found_keywords = [kw for kw in advanced_keywords if kw in ai_response]
                            if len(found_keywords) >= 3:
                                advanced_features_found += 1
                
                if advanced_features_found >= 2:
                    await self.log_test_result(
                        "AI Advanced Feature Discovery",
                        True,
                        f"AI demonstrates knowledge of advanced features in {advanced_features_found}/{len(advanced_queries)} queries"
                    )
                else:
                    await self.log_test_result(
                        "AI Advanced Feature Discovery",
                        False,
                        f"AI shows limited advanced feature knowledge ({advanced_features_found}/{len(advanced_queries)} queries)"
                    )
                    
            except Exception as e:
                await self.log_test_result(
                    "AI Advanced Feature Discovery",
                    False,
                    f"Advanced feature testing error: {str(e)}"
                )

    async def test_browser_navigation_automation(self):
        """Test browser navigation and automation capabilities"""
        print("\n🌐 TESTING BROWSER NAVIGATION & AUTOMATION")
        print("=" * 60)
        
        async with aiohttp.ClientSession() as session:
            # Test 1: Browser Navigation to Real URL
            try:
                test_url = "https://httpbin.org/html"
                params = {
                    "url": test_url,
                    "tab_id": self.tab_id,
                    "session_id": self.session_id
                }
                
                async with session.post(f"{API_BASE}/browser/navigate", params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('success') and data.get('status_code') == 200:
                            await self.log_test_result(
                                "Browser Navigation to Real URL",
                                True,
                                f"Successfully navigated to {test_url}, status: {data.get('status_code')}, engine: {data.get('engine')}",
                                {"url": test_url, "title": data.get('title'), "engine": data.get('engine'), "has_content": bool(data.get('content_preview'))}
                            )
                        else:
                            await self.log_test_result(
                                "Browser Navigation to Real URL",
                                False,
                                f"Navigation failed or incomplete response",
                                data
                            )
                    else:
                        await self.log_test_result(
                            "Browser Navigation to Real URL",
                            False,
                            f"Navigation endpoint returned {response.status}",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "Browser Navigation to Real URL",
                    False,
                    f"Navigation error: {str(e)}"
                )
            
            # Test 2: Screenshot Capture
            try:
                params = {"tab_id": self.tab_id}
                
                async with session.post(f"{API_BASE}/browser/screenshot", params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('success') and data.get('screenshot'):
                            screenshot_data = data.get('screenshot')
                            # Verify it's valid base64
                            try:
                                base64.b64decode(screenshot_data)
                                await self.log_test_result(
                                    "Browser Screenshot Capture",
                                    True,
                                    f"Screenshot captured successfully ({len(screenshot_data)} chars base64)",
                                    {"screenshot_size": len(screenshot_data), "engine": data.get('engine')}
                                )
                            except:
                                await self.log_test_result(
                                    "Browser Screenshot Capture",
                                    False,
                                    "Screenshot data is not valid base64"
                                )
                        else:
                            await self.log_test_result(
                                "Browser Screenshot Capture",
                                False,
                                "Screenshot capture failed or no data returned",
                                data
                            )
                    else:
                        await self.log_test_result(
                            "Browser Screenshot Capture",
                            False,
                            f"Screenshot endpoint returned {response.status}",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "Browser Screenshot Capture",
                    False,
                    f"Screenshot error: {str(e)}"
                )
            
            # Test 3: Browser Actions (Click, Type, Scroll)
            try:
                action_payload = {
                    "tab_id": self.tab_id,
                    "action_type": "extract",
                    "target": "h1",
                    "value": None,
                    "coordinates": None
                }
                
                async with session.post(f"{API_BASE}/browser/action", json=action_payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('success'):
                            await self.log_test_result(
                                "Browser Action Execution",
                                True,
                                f"Browser action '{action_payload['action_type']}' executed successfully",
                                {"action": action_payload['action_type'], "result": data.get('result')}
                            )
                        else:
                            await self.log_test_result(
                                "Browser Action Execution",
                                False,
                                f"Browser action failed: {data.get('error', 'Unknown error')}",
                                data
                            )
                    else:
                        await self.log_test_result(
                            "Browser Action Execution",
                            False,
                            f"Browser action endpoint returned {response.status}",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "Browser Action Execution",
                    False,
                    f"Browser action error: {str(e)}"
                )
            
            # Test 4: Tab Management
            try:
                params = {"session_id": self.session_id}
                
                async with session.get(f"{API_BASE}/browser/tabs", params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        tabs = data.get('tabs', [])
                        if isinstance(tabs, list):
                            await self.log_test_result(
                                "Browser Tab Management",
                                True,
                                f"Tab management working - {len(tabs)} tabs found",
                                {"tab_count": len(tabs), "tabs": tabs}
                            )
                        else:
                            await self.log_test_result(
                                "Browser Tab Management",
                                False,
                                "Tab management returned invalid data format"
                            )
                    else:
                        await self.log_test_result(
                            "Browser Tab Management",
                            False,
                            f"Tab management endpoint returned {response.status}",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "Browser Tab Management",
                    False,
                    f"Tab management error: {str(e)}"
                )

    async def test_data_extraction_capabilities(self):
        """Test data extraction from real websites"""
        print("\n📊 TESTING DATA EXTRACTION CAPABILITIES")
        print("=" * 60)
        
        async with aiohttp.ClientSession() as session:
            # Test 1: Navigate to a data-rich site
            try:
                test_url = "https://httpbin.org/json"
                params = {
                    "url": test_url,
                    "tab_id": f"extract-tab-{uuid.uuid4()}",
                    "session_id": self.session_id
                }
                
                async with session.post(f"{API_BASE}/browser/navigate", params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('success'):
                            # Test data extraction
                            extract_payload = {
                                "tab_id": params["tab_id"],
                                "action_type": "extract",
                                "target": "pre",  # JSON data is usually in <pre> tags
                                "value": None,
                                "coordinates": None
                            }
                            
                            async with session.post(f"{API_BASE}/browser/action", json=extract_payload) as extract_response:
                                if extract_response.status == 200:
                                    extract_data = await extract_response.json()
                                    if extract_data.get('success') and extract_data.get('result', {}).get('extracted_data'):
                                        extracted = extract_data['result']['extracted_data']
                                        await self.log_test_result(
                                            "Data Extraction from Live Site",
                                            True,
                                            f"Successfully extracted {len(extracted)} data elements from {test_url}",
                                            {"extracted_count": len(extracted), "sample": extracted[:2] if extracted else []}
                                        )
                                    else:
                                        await self.log_test_result(
                                            "Data Extraction from Live Site",
                                            False,
                                            "Data extraction returned no results",
                                            extract_data
                                        )
                                else:
                                    await self.log_test_result(
                                        "Data Extraction from Live Site",
                                        False,
                                        f"Data extraction failed with status {extract_response.status}"
                                    )
                        else:
                            await self.log_test_result(
                                "Data Extraction from Live Site",
                                False,
                                "Failed to navigate to test site for data extraction"
                            )
                    else:
                        await self.log_test_result(
                            "Data Extraction from Live Site",
                            False,
                            f"Navigation for data extraction failed with status {response.status}"
                        )
            except Exception as e:
                await self.log_test_result(
                    "Data Extraction from Live Site",
                    False,
                    f"Data extraction test error: {str(e)}"
                )

    async def test_websocket_communication(self):
        """Test WebSocket real-time communication"""
        print("\n🔄 TESTING WEBSOCKET REAL-TIME COMMUNICATION")
        print("=" * 60)
        
        try:
            ws_url = f"{WS_BASE}/{self.session_id}"
            
            async with websockets.connect(ws_url) as websocket:
                # Test 1: Ping/Pong
                ping_message = {
                    "type": "ping",
                    "timestamp": datetime.now().isoformat()
                }
                
                await websocket.send(json.dumps(ping_message))
                
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    response_data = json.loads(response)
                    
                    if response_data.get("type") == "pong":
                        await self.log_test_result(
                            "WebSocket Ping/Pong Communication",
                            True,
                            "WebSocket ping/pong working correctly",
                            response_data
                        )
                    else:
                        await self.log_test_result(
                            "WebSocket Ping/Pong Communication",
                            False,
                            f"Unexpected WebSocket response: {response_data.get('type')}"
                        )
                except asyncio.TimeoutError:
                    await self.log_test_result(
                        "WebSocket Ping/Pong Communication",
                        False,
                        "WebSocket ping/pong timeout - no response received"
                    )
                
                # Test 2: Browser Action via WebSocket
                browser_action_message = {
                    "type": "browser_action",
                    "tab_id": self.tab_id,
                    "action_type": "scroll",
                    "target": None,
                    "value": "100",
                    "coordinates": None
                }
                
                await websocket.send(json.dumps(browser_action_message))
                
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    response_data = json.loads(response)
                    
                    if response_data.get("type") == "browser_action_result":
                        await self.log_test_result(
                            "WebSocket Browser Action",
                            True,
                            "WebSocket browser action executed successfully",
                            response_data
                        )
                    else:
                        await self.log_test_result(
                            "WebSocket Browser Action",
                            False,
                            f"WebSocket browser action failed: {response_data.get('type')}"
                        )
                except asyncio.TimeoutError:
                    await self.log_test_result(
                        "WebSocket Browser Action",
                        False,
                        "WebSocket browser action timeout"
                    )
                    
        except Exception as e:
            await self.log_test_result(
                "WebSocket Connection",
                False,
                f"WebSocket connection error: {str(e)}"
            )

    async def test_workflow_apis(self):
        """Test workflow creation and execution APIs - NEWLY IMPLEMENTED"""
        print("\n⚙️ TESTING WORKFLOW APIs - NEWLY IMPLEMENTED")
        print("=" * 60)
        
        async with aiohttp.ClientSession() as session:
            # Test 1: Workflow Creation - SPECIFIC TEST FOR NEW IMPLEMENTATION
            try:
                workflow_payload = {
                    "instruction": "Monitor Twitter for mentions of my brand",
                    "session_id": self.session_id
                }
                
                async with session.post(f"{API_BASE}/workflow/create", json=workflow_payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        workflow = data.get('workflow')
                        if workflow and workflow.get('workflow_id'):
                            workflow_id = workflow['workflow_id']
                            await self.log_test_result(
                                "Workflow Creation API - NEW",
                                True,
                                f"✅ FIXED: Workflow created successfully (404→200). ID: {workflow_id}, Steps: {len(workflow.get('steps', []))}, Credits: {workflow.get('estimated_credits')}",
                                {"workflow_id": workflow_id, "title": workflow.get('title'), "steps_count": len(workflow.get('steps', [])), "estimated_credits": workflow.get('estimated_credits')}
                            )
                            
                            # Test 2: Workflow Execution - UPDATED ENDPOINT
                            try:
                                exec_payload = {
                                    "workflow_id": workflow_id,
                                    "session_id": self.session_id
                                }
                                async with session.post(f"{API_BASE}/workflow/execute", json=exec_payload) as exec_response:
                                    if exec_response.status == 200:
                                        exec_data = await exec_response.json()
                                        execution = exec_data.get('execution', {})
                                        await self.log_test_result(
                                            "Workflow Execution API - NEW",
                                            True,
                                            f"✅ FIXED: Workflow executed successfully (404→200). Status: {execution.get('status')}, Credits: {execution.get('credits_used')}, Time: {execution.get('time_elapsed_seconds')}s",
                                            {"execution_id": execution.get('execution_id'), "status": execution.get('status'), "results": execution.get('results')}
                                        )
                                    else:
                                        await self.log_test_result(
                                            "Workflow Execution API - NEW",
                                            False,
                                            f"Workflow execution returned {exec_response.status}",
                                            await exec_response.text()
                                        )
                            except Exception as e:
                                await self.log_test_result(
                                    "Workflow Execution API - NEW",
                                    False,
                                    f"Workflow execution error: {str(e)}"
                                )
                            
                            # Test 3: Workflow List - NEW ENDPOINT
                            try:
                                params = {"session_id": self.session_id}
                                async with session.get(f"{API_BASE}/workflow/list", params=params) as list_response:
                                    if list_response.status == 200:
                                        list_data = await list_response.json()
                                        workflows = list_data.get('workflows', [])
                                        await self.log_test_result(
                                            "Workflow List API - NEW",
                                            True,
                                            f"✅ FIXED: Workflow list retrieved successfully (404→200). Found {len(workflows)} workflows",
                                            {"workflow_count": len(workflows), "workflows": [w.get('title') for w in workflows[:3]]}
                                        )
                                    else:
                                        await self.log_test_result(
                                            "Workflow List API - NEW",
                                            False,
                                            f"Workflow list returned {list_response.status}"
                                        )
                            except Exception as e:
                                await self.log_test_result(
                                    "Workflow List API - NEW",
                                    False,
                                    f"Workflow list error: {str(e)}"
                                )
                        else:
                            await self.log_test_result(
                                "Workflow Creation API - NEW",
                                False,
                                "Workflow creation returned no workflow data",
                                data
                            )
                    else:
                        await self.log_test_result(
                            "Workflow Creation API - NEW",
                            False,
                            f"❌ STILL FAILING: Workflow creation returned {response.status} (expected 200)",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "Workflow Creation API - NEW",
                    False,
                    f"Workflow creation error: {str(e)}"
                )

    async def run_comprehensive_tests(self):
        """Run all comprehensive backend API tests"""
        print("🚀 COMPREHENSIVE BACKEND API FEATURE TESTING")
        print("=" * 80)
        print(f"Session ID: {self.session_id}")
        print(f"Tab ID: {self.tab_id}")
        print(f"API Base URL: {API_BASE}")
        print(f"WebSocket URL: {WS_BASE}")
        print("=" * 80)
        
        start_time = time.time()
        
        # Run all test suites
        await self.test_health_endpoints()
        await self.test_ai_chat_functionality()
        await self.test_browser_navigation_automation()
        await self.test_data_extraction_capabilities()
        await self.test_websocket_communication()
        await self.test_workflow_apis()
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Generate comprehensive report
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TEST RESULTS SUMMARY")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests} ✅")
        print(f"Failed: {self.failed_tests} ❌")
        print(f"Success Rate: {success_rate:.1f}%")
        print(f"Total Testing Time: {total_time:.2f} seconds")
        
        print("\n🎯 CRITICAL QUESTIONS ANSWERED:")
        print("-" * 50)
        
        # Analyze results to answer critical questions
        browser_nav_working = any(r['success'] and 'navigation' in r['test_name'].lower() for r in self.test_results)
        screenshot_working = any(r['success'] and 'screenshot' in r['test_name'].lower() for r in self.test_results)
        data_extraction_working = any(r['success'] and 'extraction' in r['test_name'].lower() for r in self.test_results)
        websocket_working = any(r['success'] and 'websocket' in r['test_name'].lower() for r in self.test_results)
        workflow_working = any(r['success'] and 'workflow' in r['test_name'].lower() for r in self.test_results)
        
        print(f"1. Can browser navigate to real websites? {'✅ YES' if browser_nav_working else '❌ NO'}")
        print(f"2. Can it take screenshots of live pages? {'✅ YES' if screenshot_working else '❌ NO'}")
        print(f"3. Can it extract real data from websites? {'✅ YES' if data_extraction_working else '❌ NO'}")
        print(f"4. Can it execute multi-step workflows? {'✅ YES' if workflow_working else '❌ NO/NOT IMPLEMENTED'}")
        print(f"5. Does WebSocket provide real-time updates? {'✅ YES' if websocket_working else '❌ NO'}")
        
        print("\n📋 DETAILED TEST RESULTS:")
        print("-" * 50)
        
        for result in self.test_results:
            print(f"{result['status']} {result['test_name']}")
            print(f"   Details: {result['details']}")
            if not result['success'] and result.get('response_data'):
                print(f"   Error Data: {str(result['response_data'])[:100]}...")
            print()
        
        return {
            "total_tests": self.total_tests,
            "passed_tests": self.passed_tests,
            "failed_tests": self.failed_tests,
            "success_rate": success_rate,
            "testing_time": total_time,
            "detailed_results": self.test_results,
            "critical_capabilities": {
                "browser_navigation": browser_nav_working,
                "screenshot_capture": screenshot_working,
                "data_extraction": data_extraction_working,
                "workflow_execution": workflow_working,
                "websocket_communication": websocket_working
            }
        }

async def main():
    """Main test execution function"""
    tester = BackendAPITester()
    results = await tester.run_comprehensive_tests()
    
    # Save results to file
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n💾 Test results saved to: /app/backend_test_results.json")
    
    return results

if __name__ == "__main__":
    asyncio.run(main())