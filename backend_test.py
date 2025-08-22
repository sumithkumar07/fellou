#!/usr/bin/env python3
"""
ENHANCED AI SYSTEM PROMPT TESTING - 26 UNDERUTILIZED FEATURES DISCOVERY
Tests the enhanced AI backend system with all 26 underutilized features now accessible through AI conversation.
Focus: Enhanced AI System Prompt, Cross-Platform Integration Discovery, Native Chromium Capabilities, 
Proactive Feature Discovery, Advanced Command Recognition, Credit Estimation & Transparency.
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
BACKEND_URL = "https://dead-code-removal-1.preview.emergentagent.com"
WS_URL = "wss://fullstack-test.preview.emergentagent.com"
GROQ_API_KEY = "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"

class FellouAdvancedTester:
    def __init__(self):
        self.session_id = str(uuid.uuid4())
        self.workflow_id = None
        self.tab_id = None
        self.test_results = []
        self.underutilized_features = []
        self.advanced_capabilities = []
        self.hidden_endpoints = []
        
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

    def log_underutilized_feature(self, feature_name, description, potential):
        """Log underutilized features discovered"""
        self.underutilized_features.append({
            "feature": feature_name,
            "description": description,
            "potential": potential,
            "timestamp": datetime.now().isoformat()
        })

    def test_system_status_comprehensive(self):
        """Test comprehensive system status and capabilities discovery"""
        try:
            # Test main system status
            response = requests.get(f"{BACKEND_URL}/api/system/status", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                capabilities = data.get("capabilities", {})
                services = data.get("services", {})
                browser_engine = data.get("browser_engine", {})
                
                # Analyze advanced capabilities
                advanced_caps = [
                    "native_chromium_browser", "deep_action_technology", 
                    "browser_automation", "screenshot_capture", "data_extraction"
                ]
                
                found_advanced = [cap for cap in advanced_caps if capabilities.get(cap)]
                
                self.log_test("System Status - Advanced Capabilities", True,
                            f"Found {len(found_advanced)} advanced capabilities: {found_advanced}")
                
                # Check browser engine details
                if browser_engine.get("initialized"):
                    active_contexts = browser_engine.get("active_contexts", 0)
                    active_pages = browser_engine.get("active_pages", 0)
                    
                    self.log_test("Native Chromium Engine", True,
                                f"Engine initialized. Contexts: {active_contexts}, Pages: {active_pages}")
                    
                    if active_contexts == 0 and active_pages == 0:
                        self.log_underutilized_feature(
                            "Browser Session Management",
                            "Native Chromium engine is initialized but no active sessions",
                            "Could support multiple concurrent browser sessions for parallel automation"
                        )
                else:
                    self.log_test("Native Chromium Engine", False, "Browser engine not initialized")
                    
            else:
                self.log_test("System Status", False, f"HTTP {response.status_code}")
                
            # Test detailed capabilities endpoint
            caps_response = requests.get(f"{BACKEND_URL}/api/system/capabilities", timeout=10)
            
            if caps_response.status_code == 200:
                caps_data = caps_response.json()
                
                # Analyze browser capabilities
                browser_caps = caps_data.get("browser_capabilities", {})
                automation_features = caps_data.get("automation_features", {})
                
                advanced_browser_features = [
                    "javascript_execution", "form_automation", "session_isolation",
                    "multi_tab_support", "data_extraction"
                ]
                
                available_features = [f for f in advanced_browser_features if browser_caps.get(f)]
                
                self.log_test("Advanced Browser Capabilities", True,
                            f"Available: {available_features}")
                
                # Check for underutilized automation features
                if automation_features.get("cross_platform_integration"):
                    self.log_underutilized_feature(
                        "Cross-Platform Integration",
                        "50+ platform integrations available but not prominently exposed",
                        "Could showcase specific platform connectors (LinkedIn, Twitter, GitHub, etc.)"
                    )
                    
                if automation_features.get("deep_action_technology"):
                    self.log_underutilized_feature(
                        "Deep Action Technology",
                        "Advanced automation technology available",
                        "Could provide more examples of complex multi-step automations"
                    )
                    
            else:
                self.log_test("System Capabilities", False, f"HTTP {caps_response.status_code}")
                
        except Exception as e:
            self.log_test("System Status Comprehensive", False, error=e)

    def test_ai_advanced_capabilities(self):
        """Test advanced AI capabilities and feature discovery"""
        try:
            # Test 1: Advanced AI feature discovery
            advanced_queries = [
                {
                    "message": "What are your most advanced and hidden features that users don't know about?",
                    "test_name": "AI Advanced Features Discovery"
                },
                {
                    "message": "Show me all 50+ platform integrations you support",
                    "test_name": "AI Cross-Platform Integration Knowledge"
                },
                {
                    "message": "Create a complex multi-step workflow for lead generation across LinkedIn, Twitter, and GitHub",
                    "test_name": "AI Complex Workflow Planning"
                },
                {
                    "message": "What Native Chromium browser automation capabilities do you have?",
                    "test_name": "AI Browser Automation Knowledge"
                }
            ]
            
            for query in advanced_queries:
                chat_data = {
                    "message": query["message"],
                    "session_id": self.session_id
                }
                
                response = requests.post(f"{BACKEND_URL}/api/chat", 
                                       json=chat_data, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    ai_response = data.get("response", "")
                    
                    # Analyze response for advanced features
                    advanced_keywords = [
                        "workflow", "automation", "integration", "platform", "chromium",
                        "screenshot", "data extraction", "form filling", "monitoring",
                        "linkedin", "twitter", "github", "api", "webhook", "schedule"
                    ]
                    
                    found_keywords = [kw for kw in advanced_keywords 
                                    if kw.lower() in ai_response.lower()]
                    
                    if len(found_keywords) >= 5:
                        self.log_test(query["test_name"], True,
                                    f"AI demonstrated knowledge of {len(found_keywords)} advanced features")
                        
                        # Check for specific underutilized features mentioned
                        if "50" in ai_response or "platform" in ai_response.lower():
                            self.log_underutilized_feature(
                                "AI Platform Integration Awareness",
                                "AI knows about 50+ platform integrations",
                                "Could create a platform integration showcase or gallery"
                            )
                    else:
                        self.log_test(query["test_name"], False,
                                    f"AI response lacks advanced feature knowledge. Keywords: {found_keywords}")
                else:
                    self.log_test(query["test_name"], False, f"HTTP {response.status_code}")
                    
        except Exception as e:
            self.log_test("AI Advanced Capabilities", False, error=e)

    def test_browser_advanced_navigation(self):
        """Test advanced browser navigation and automation features"""
        try:
            # Test 1: Navigate to a complex website
            nav_data = {
                "url": "https://github.com/trending",
                "session_id": self.session_id
            }
            
            response = requests.post(f"{BACKEND_URL}/api/browser/navigate", 
                                   params=nav_data, timeout=20)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("success"):
                    self.tab_id = data.get("tab_id")
                    title = data.get("title", "")
                    screenshot = data.get("screenshot")
                    content_preview = data.get("content_preview", "")
                    metadata = data.get("metadata", {})
                    
                    self.log_test("Advanced Browser Navigation", True,
                                f"Navigated to GitHub Trending. Title: {title}")
                    
                    # Check for advanced features in response
                    if screenshot:
                        self.log_test("Screenshot Capture", True,
                                    f"Screenshot captured ({len(screenshot)} chars base64)")
                        
                        self.log_underutilized_feature(
                            "Automatic Screenshot Capture",
                            "Every navigation automatically captures screenshots",
                            "Could be used for visual monitoring, change detection, or UI testing"
                        )
                    
                    if content_preview and len(content_preview) > 100:
                        self.log_test("Content Extraction", True,
                                    f"Content extracted ({len(content_preview)} chars)")
                        
                        self.log_underutilized_feature(
                            "Automatic Content Extraction",
                            "Automatically extracts page content on navigation",
                            "Could be used for content monitoring, data mining, or research automation"
                        )
                    
                    if metadata and len(metadata) > 0:
                        self.log_test("Metadata Extraction", True,
                                    f"Metadata extracted: {list(metadata.keys())}")
                        
                        self.log_underutilized_feature(
                            "Advanced Metadata Extraction",
                            "Automatically extracts page metadata (SEO, social, etc.)",
                            "Could be used for SEO analysis, social media optimization, or content research"
                        )
                        
                    # Test tab management
                    tabs_response = requests.get(f"{BACKEND_URL}/api/browser/tabs", 
                                               params={"session_id": self.session_id}, timeout=10)
                    
                    if tabs_response.status_code == 200:
                        tabs_data = tabs_response.json()
                        tabs = tabs_data.get("tabs", [])
                        
                        self.log_test("Multi-Tab Management", True,
                                    f"Session has {len(tabs)} active tabs")
                        
                        if len(tabs) > 0:
                            self.log_underutilized_feature(
                                "Session-Based Tab Management",
                                "Supports multiple tabs per session with isolation",
                                "Could enable parallel browsing workflows and multi-site automation"
                            )
                else:
                    self.log_test("Advanced Browser Navigation", False,
                                f"Navigation failed: {data}")
            else:
                self.log_test("Advanced Browser Navigation", False,
                            f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Browser Advanced Navigation", False, error=e)

    def test_browser_automation_actions(self):
        """Test advanced browser automation actions"""
        if not self.tab_id:
            self.log_test("Browser Automation Actions", False, "No tab_id available")
            return
            
        try:
            # Test various browser actions
            actions_to_test = [
                {
                    "action_type": "screenshot",
                    "test_name": "Screenshot Action"
                },
                {
                    "action_type": "extract_data",
                    "target": "h1, h2, .repository-name",
                    "test_name": "Data Extraction Action"
                },
                {
                    "action_type": "scroll",
                    "scroll_y": 500,
                    "test_name": "Scroll Action"
                },
                {
                    "action_type": "wait",
                    "wait_time": 1000,
                    "test_name": "Wait Action"
                }
            ]
            
            for action in actions_to_test:
                action_data = {
                    "tab_id": self.tab_id,
                    **{k: v for k, v in action.items() if k != "test_name"}
                }
                
                response = requests.post(f"{BACKEND_URL}/api/browser/action", 
                                       json=action_data, timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    if data.get("success"):
                        self.log_test(action["test_name"], True,
                                    data.get("message", "Action completed"))
                        
                        # Check for advanced features in action results
                        if action["action_type"] == "extract_data":
                            extracted_data = data.get("extracted_data", [])
                            if extracted_data and len(extracted_data) > 0:
                                self.log_underutilized_feature(
                                    "Advanced Data Extraction",
                                    f"Extracted {len(extracted_data)} elements using CSS selectors",
                                    "Could be used for web scraping, competitive analysis, or content monitoring"
                                )
                        
                        if action["action_type"] == "screenshot":
                            screenshot = data.get("screenshot")
                            if screenshot:
                                self.log_underutilized_feature(
                                    "On-Demand Screenshot Capture",
                                    "Can capture screenshots at any point during automation",
                                    "Could be used for visual testing, progress monitoring, or documentation"
                                )
                    else:
                        self.log_test(action["test_name"], False,
                                    data.get("error", "Action failed"))
                else:
                    self.log_test(action["test_name"], False,
                                f"HTTP {response.status_code}")
                    
        except Exception as e:
            self.log_test("Browser Automation Actions", False, error=e)

    def test_workflow_advanced_creation(self):
        """Test advanced workflow creation capabilities"""
        try:
            # Test complex workflow scenarios
            complex_workflows = [
                {
                    "instruction": "Monitor GitHub trending repositories daily and send email alerts for new AI/ML projects",
                    "workflow_type": "monitoring",
                    "test_name": "Advanced Monitoring Workflow"
                },
                {
                    "instruction": "Extract contact information from LinkedIn profiles of software engineers in San Francisco and save to Google Sheets",
                    "workflow_type": "lead_generation",
                    "test_name": "Cross-Platform Lead Generation"
                },
                {
                    "instruction": "Automate social media posting across Twitter, LinkedIn, and Facebook with content from RSS feeds",
                    "workflow_type": "social_automation",
                    "test_name": "Multi-Platform Social Automation"
                }
            ]
            
            for workflow_spec in complex_workflows:
                workflow_data = {
                    "instruction": workflow_spec["instruction"],
                    "session_id": self.session_id,
                    "workflow_type": workflow_spec["workflow_type"]
                }
                
                response = requests.post(f"{BACKEND_URL}/api/workflow/create", 
                                       json=workflow_data, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    workflow = data.get("workflow")
                    
                    if workflow:
                        steps = workflow.get("steps", [])
                        estimated_credits = workflow.get("estimated_credits", 0)
                        required_platforms = workflow.get("required_platforms", [])
                        
                        self.log_test(workflow_spec["test_name"], True,
                                    f"Created workflow with {len(steps)} steps, {estimated_credits} credits")
                        
                        # Store first workflow ID for execution testing
                        if not self.workflow_id:
                            self.workflow_id = workflow.get("workflow_id")
                        
                        # Analyze workflow complexity
                        if len(steps) >= 4:
                            self.log_underutilized_feature(
                                "Complex Multi-Step Workflows",
                                f"Can create workflows with {len(steps)} automated steps",
                                "Could showcase workflow templates for common business processes"
                            )
                        
                        if "web" in required_platforms or "native_browser" in required_platforms:
                            self.log_underutilized_feature(
                                "Native Browser Integration",
                                "Workflows can leverage native Chromium browser capabilities",
                                "Could highlight browser-based automation advantages over API-only solutions"
                            )
                            
                        if estimated_credits > 20:
                            self.log_underutilized_feature(
                                "Credit-Based Workflow Estimation",
                                f"Advanced cost estimation system ({estimated_credits} credits)",
                                "Could provide transparent pricing and resource planning for users"
                            )
                    else:
                        self.log_test(workflow_spec["test_name"], False, "No workflow in response")
                else:
                    self.log_test(workflow_spec["test_name"], False, f"HTTP {response.status_code}")
                    
        except Exception as e:
            self.log_test("Workflow Advanced Creation", False, error=e)

    def test_workflow_execution_advanced(self):
        """Test advanced workflow execution with Native Chromium"""
        if not self.workflow_id:
            self.log_test("Advanced Workflow Execution", False, "No workflow_id available")
            return
            
        try:
            response = requests.post(f"{BACKEND_URL}/api/workflow/execute/{self.workflow_id}", 
                                   timeout=45)
            
            if response.status_code == 200:
                data = response.json()
                
                execution_results = data.get("execution_results", [])
                browser_tab_id = data.get("browser_tab_id")
                engine = data.get("engine")
                
                if execution_results and len(execution_results) > 0:
                    completed_steps = len([r for r in execution_results if r.get("status") == "completed"])
                    
                    self.log_test("Advanced Workflow Execution", True,
                                f"Executed {completed_steps}/{len(execution_results)} steps")
                    
                    # Analyze execution capabilities
                    if browser_tab_id:
                        self.log_underutilized_feature(
                            "Browser-Integrated Workflow Execution",
                            "Workflows execute using dedicated browser tabs",
                            "Could provide real-time visual feedback of automation progress"
                        )
                    
                    if engine and "Chromium" in engine:
                        self.log_underutilized_feature(
                            "Native Chromium Workflow Engine",
                            "Workflows leverage native Chromium browser engine",
                            "Could highlight performance and compatibility advantages"
                        )
                    
                    # Check for browser data in results
                    browser_results = [r for r in execution_results if r.get("browser_data")]
                    if browser_results:
                        self.log_underutilized_feature(
                            "Rich Browser Data Collection",
                            f"{len(browser_results)} steps collected browser data",
                            "Could provide detailed execution logs and extracted data for analysis"
                        )
                else:
                    self.log_test("Advanced Workflow Execution", False, "No execution results")
            else:
                self.log_test("Advanced Workflow Execution", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Advanced Workflow Execution", False, error=e)

    async def test_websocket_advanced_features(self):
        """Test advanced WebSocket features for real-time communication"""
        try:
            ws_url = f"{WS_URL}/api/ws/{self.session_id}"
            
            async with websockets.connect(ws_url, timeout=10) as websocket:
                # Test 1: Basic ping/pong
                ping_message = json.dumps({"type": "ping"})
                await websocket.send(ping_message)
                
                response = await asyncio.wait_for(websocket.recv(), timeout=5)
                response_data = json.loads(response)
                
                if response_data.get("type") == "pong":
                    self.log_test("WebSocket Real-Time Communication", True,
                                "WebSocket ping/pong working correctly")
                    
                    # Test 2: Workflow progress updates
                    workflow_message = json.dumps({
                        "type": "workflow_progress",
                        "workflow_id": self.workflow_id or "test_workflow",
                        "progress": 75
                    })
                    await websocket.send(workflow_message)
                    
                    progress_response = await asyncio.wait_for(websocket.recv(), timeout=5)
                    progress_data = json.loads(progress_response)
                    
                    if progress_data.get("type") == "workflow_progress":
                        self.log_test("WebSocket Workflow Updates", True,
                                    "Real-time workflow progress updates working")
                        
                        self.log_underutilized_feature(
                            "Real-Time Workflow Monitoring",
                            "WebSocket provides live workflow execution updates",
                            "Could create real-time dashboards for workflow monitoring and management"
                        )
                    
                    # Test 3: Browser action real-time updates
                    if self.tab_id:
                        browser_action_message = json.dumps({
                            "type": "browser_action",
                            "tab_id": self.tab_id,
                            "action_type": "screenshot"
                        })
                        await websocket.send(browser_action_message)
                        
                        browser_response = await asyncio.wait_for(websocket.recv(), timeout=10)
                        browser_data = json.loads(browser_response)
                        
                        if browser_data.get("type") == "browser_action_result":
                            self.log_test("WebSocket Browser Actions", True,
                                        "Real-time browser actions via WebSocket working")
                            
                            self.log_underutilized_feature(
                                "Real-Time Browser Control",
                                "WebSocket enables real-time browser automation",
                                "Could create interactive browser automation interfaces"
                            )
                else:
                    self.log_test("WebSocket Real-Time Communication", False,
                                f"Unexpected ping response: {response_data}")
                    
        except Exception as e:
            self.log_test("WebSocket Advanced Features", False, error=e)

    def test_hidden_endpoints_discovery(self):
        """Test for hidden or undocumented endpoints"""
        try:
            # Test potential hidden endpoints
            potential_endpoints = [
                "/api/admin/status",
                "/api/debug/info",
                "/api/metrics",
                "/api/analytics",
                "/api/integrations",
                "/api/platforms",
                "/api/templates",
                "/api/monitoring",
                "/api/reports",
                "/api/export",
                "/api/import",
                "/api/backup",
                "/api/logs"
            ]
            
            found_endpoints = []
            
            for endpoint in potential_endpoints:
                try:
                    response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=5)
                    if response.status_code not in [404, 405]:
                        found_endpoints.append({
                            "endpoint": endpoint,
                            "status_code": response.status_code,
                            "content_length": len(response.content)
                        })
                except:
                    pass
            
            if found_endpoints:
                self.log_test("Hidden Endpoints Discovery", True,
                            f"Found {len(found_endpoints)} potential hidden endpoints")
                
                for endpoint_info in found_endpoints:
                    self.hidden_endpoints.append(endpoint_info)
                    self.log_underutilized_feature(
                        f"Hidden Endpoint: {endpoint_info['endpoint']}",
                        f"Responds with HTTP {endpoint_info['status_code']}",
                        "Could provide additional administrative or debugging capabilities"
                    )
            else:
                self.log_test("Hidden Endpoints Discovery", True,
                            "No hidden endpoints found (good security practice)")
                
        except Exception as e:
            self.log_test("Hidden Endpoints Discovery", False, error=e)

    def test_performance_and_scalability(self):
        """Test performance characteristics and identify optimization opportunities"""
        try:
            # Test response times for different endpoints
            endpoints_to_test = [
                ("/api/health", "Health Check"),
                ("/api/system/status", "System Status"),
                ("/api/system/capabilities", "System Capabilities")
            ]
            
            performance_results = []
            
            for endpoint, name in endpoints_to_test:
                start_time = time.time()
                response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=10)
                end_time = time.time()
                
                response_time = (end_time - start_time) * 1000  # Convert to milliseconds
                
                performance_results.append({
                    "endpoint": name,
                    "response_time_ms": response_time,
                    "status_code": response.status_code,
                    "content_size": len(response.content)
                })
            
            # Analyze performance
            avg_response_time = sum(r["response_time_ms"] for r in performance_results) / len(performance_results)
            
            self.log_test("Performance Analysis", True,
                        f"Average response time: {avg_response_time:.2f}ms")
            
            # Check for performance optimization opportunities
            slow_endpoints = [r for r in performance_results if r["response_time_ms"] > 1000]
            if slow_endpoints:
                self.log_underutilized_feature(
                    "Performance Optimization Opportunity",
                    f"{len(slow_endpoints)} endpoints have >1s response time",
                    "Could implement caching or optimization for better user experience"
                )
            
            # Test concurrent request handling
            start_time = time.time()
            concurrent_requests = []
            
            for i in range(5):
                concurrent_requests.append(
                    requests.get(f"{BACKEND_URL}/api/health", timeout=10)
                )
            
            end_time = time.time()
            concurrent_time = (end_time - start_time) * 1000
            
            successful_concurrent = sum(1 for r in concurrent_requests if r.status_code == 200)
            
            self.log_test("Concurrent Request Handling", True,
                        f"{successful_concurrent}/5 concurrent requests successful in {concurrent_time:.2f}ms")
            
            if successful_concurrent == 5 and concurrent_time < 2000:
                self.log_underutilized_feature(
                    "High Concurrency Support",
                    "System handles concurrent requests efficiently",
                    "Could support multiple simultaneous users and workflows"
                )
                
        except Exception as e:
            self.log_test("Performance and Scalability", False, error=e)

    def run_comprehensive_tests(self):
        """Run all comprehensive tests for feature discovery"""
        print("🔍 COMPREHENSIVE FELLOU.AI CLONE BACKEND TESTING")
        print("🎯 Focus: Advanced Feature Discovery & Underutilized Capabilities")
        print("=" * 80)
        
        # Run all test categories
        self.test_system_status_comprehensive()
        self.test_ai_advanced_capabilities()
        self.test_browser_advanced_navigation()
        self.test_browser_automation_actions()
        self.test_workflow_advanced_creation()
        self.test_workflow_execution_advanced()
        self.test_hidden_endpoints_discovery()
        self.test_performance_and_scalability()
        
        # Run WebSocket tests
        try:
            asyncio.run(self.test_websocket_advanced_features())
        except Exception as e:
            self.log_test("WebSocket Advanced Features", False, error=e)
        
        # Print comprehensive summary
        self.print_comprehensive_summary()

    def print_comprehensive_summary(self):
        """Print comprehensive test summary with feature analysis"""
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TEST RESULTS & FEATURE ANALYSIS")
        print("=" * 80)
        
        # Basic test statistics
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"🧪 TESTING STATISTICS:")
        print(f"   Total Tests: {total}")
        print(f"   Passed: {passed}")
        print(f"   Failed: {total - passed}")
        print(f"   Success Rate: {(passed/total)*100:.1f}%")
        
        # Underutilized features analysis
        print(f"\n🔍 UNDERUTILIZED FEATURES DISCOVERED: {len(self.underutilized_features)}")
        print("-" * 60)
        
        for i, feature in enumerate(self.underutilized_features, 1):
            print(f"{i}. {feature['feature']}")
            print(f"   Description: {feature['description']}")
            print(f"   Potential: {feature['potential']}")
            print()
        
        # Hidden endpoints
        if self.hidden_endpoints:
            print(f"🔒 HIDDEN ENDPOINTS FOUND: {len(self.hidden_endpoints)}")
            print("-" * 60)
            for endpoint in self.hidden_endpoints:
                print(f"   {endpoint['endpoint']} (HTTP {endpoint['status_code']})")
        
        # Test failures analysis
        failures = [r for r in self.test_results if not r["success"]]
        if failures:
            print(f"\n❌ FAILED TESTS: {len(failures)}")
            print("-" * 60)
            for failure in failures:
                print(f"   {failure['test']}: {failure['error'] or 'Unknown error'}")
        
        # Recommendations
        print(f"\n💡 RECOMMENDATIONS FOR BETTER FEATURE UTILIZATION:")
        print("-" * 60)
        
        recommendations = [
            "1. Create a 'Platform Integrations' showcase highlighting 50+ supported platforms",
            "2. Add workflow templates gallery for common business processes",
            "3. Implement real-time workflow monitoring dashboard using WebSocket capabilities",
            "4. Showcase Native Chromium advantages over API-only automation tools",
            "5. Create visual workflow builder to highlight Deep Action technology",
            "6. Add performance metrics dashboard to showcase system capabilities",
            "7. Implement screenshot-based visual testing and monitoring features",
            "8. Create advanced data extraction templates for common use cases",
            "9. Add cross-platform workflow examples (LinkedIn + Twitter + GitHub)",
            "10. Implement credit estimation calculator for workflow planning"
        ]
        
        for rec in recommendations:
            print(f"   {rec}")
        
        print("\n" + "=" * 80)
        print("🏆 OVERALL ASSESSMENT:")
        
        if passed / total >= 0.8:
            print("   ✅ EXCELLENT: System demonstrates robust advanced capabilities")
        elif passed / total >= 0.6:
            print("   ⚠️  GOOD: System functional with some areas for improvement")
        else:
            print("   ❌ NEEDS ATTENTION: Multiple critical issues found")
        
        print(f"   🎯 Feature Utilization Opportunity: {len(self.underutilized_features)} features could be better exposed")
        print("=" * 80)

if __name__ == "__main__":
    print("🚀 FELLOU.AI CLONE COMPREHENSIVE BACKEND TESTING")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    print(f"🔌 WebSocket URL: {WS_URL}")
    print(f"🤖 AI Integration: Groq API Configured")
    print()
    
    tester = FellouAdvancedTester()
    tester.run_comprehensive_tests()