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
import uuid
from datetime import datetime
import sys
import os

# Production Backend URLs
BACKEND_URL = "https://api-ui-bridge-1.preview.emergentagent.com"

class EnhancedAISystemTester:
    def __init__(self):
        self.session_id = str(uuid.uuid4())
        self.test_results = []
        self.discovered_features = []
        self.ai_responses = []
        self.platform_integrations = []
        self.credit_estimations = []
        
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

    def log_discovered_feature(self, feature_name, description, ai_response_snippet):
        """Log discovered features from AI responses"""
        self.discovered_features.append({
            "feature": feature_name,
            "description": description,
            "ai_response_snippet": ai_response_snippet,
            "timestamp": datetime.now().isoformat()
        })

    def test_enhanced_ai_system_prompt_simple_queries(self):
        """Test 1: Enhanced AI System Prompt Testing - Send simple queries and verify advanced responses"""
        try:
            simple_queries = [
                {
                    "message": "research",
                    "test_name": "Simple Query: Research",
                    "expected_features": ["multi-site research", "platform integrations", "workflow automation"]
                },
                {
                    "message": "help me automate",
                    "test_name": "Simple Query: Automate",
                    "expected_features": ["workflow templates", "cross-platform integration", "monitoring"]
                },
                {
                    "message": "what can you do?",
                    "test_name": "Simple Query: Capabilities",
                    "expected_features": ["50+ platforms", "native chromium", "deep action"]
                },
                {
                    "message": "analyze this page",
                    "test_name": "Simple Query: Analysis",
                    "expected_features": ["screenshot capture", "metadata extraction", "data mining"]
                }
            ]
            
            for query in simple_queries:
                chat_data = {
                    "message": query["message"],
                    "session_id": self.session_id
                }
                
                response = requests.post(f"{BACKEND_URL}/api/chat", 
                                       json=chat_data, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    ai_response = data.get("response", "")
                    self.ai_responses.append({
                        "query": query["message"],
                        "response": ai_response,
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    # Check if AI proactively suggests advanced capabilities
                    advanced_keywords = [
                        "workflow", "automation", "integration", "platform", "chromium",
                        "screenshot", "data extraction", "monitoring", "50+", "native",
                        "deep action", "cross-platform", "linkedin", "twitter", "github"
                    ]
                    
                    found_keywords = [kw for kw in advanced_keywords 
                                    if kw.lower() in ai_response.lower()]
                    
                    # Check for proactive feature suggestions
                    proactive_indicators = [
                        "i can", "i have", "capabilities", "features", "advanced",
                        "suggest", "recommend", "try asking", "hidden", "powerful"
                    ]
                    
                    found_proactive = [ind for ind in proactive_indicators 
                                     if ind.lower() in ai_response.lower()]
                    
                    if len(found_keywords) >= 3 and len(found_proactive) >= 2:
                        self.log_test(query["test_name"], True,
                                    f"AI proactively suggested {len(found_keywords)} advanced features with {len(found_proactive)} proactive indicators")
                        
                        # Log specific discovered features
                        for expected_feature in query["expected_features"]:
                            if any(keyword in expected_feature.lower() for keyword in found_keywords):
                                self.log_discovered_feature(
                                    f"Proactive {expected_feature.title()}",
                                    f"AI proactively suggested {expected_feature} for simple query '{query['message']}'",
                                    ai_response[:200] + "..."
                                )
                    else:
                        self.log_test(query["test_name"], False,
                                    f"AI response lacks proactive advanced features. Keywords: {len(found_keywords)}, Proactive: {len(found_proactive)}")
                else:
                    self.log_test(query["test_name"], False, f"HTTP {response.status_code}")
                    
        except Exception as e:
            self.log_test("Enhanced AI System Prompt - Simple Queries", False, error=e)

    def test_cross_platform_integration_discovery(self):
        """Test 2: Cross-Platform Integration Discovery - Ask about platform support"""
        try:
            platform_queries = [
                {
                    "message": "What platforms do you support?",
                    "test_name": "Platform Support Query",
                    "expected_platforms": ["LinkedIn", "Twitter", "GitHub", "Slack", "Google Sheets"]
                },
                {
                    "message": "Show me all your integrations",
                    "test_name": "Integration Discovery Query",
                    "expected_count": 50
                },
                {
                    "message": "Can you connect to social media platforms?",
                    "test_name": "Social Media Integration Query",
                    "expected_platforms": ["Facebook", "Instagram", "TikTok", "YouTube"]
                }
            ]
            
            for query in platform_queries:
                chat_data = {
                    "message": query["message"],
                    "session_id": self.session_id
                }
                
                response = requests.post(f"{BACKEND_URL}/api/chat", 
                                       json=chat_data, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    ai_response = data.get("response", "")
                    
                    # Check for platform mentions
                    platform_keywords = [
                        "linkedin", "twitter", "github", "slack", "google sheets", "facebook",
                        "instagram", "tiktok", "youtube", "reddit", "pinterest", "whatsapp",
                        "telegram", "discord", "notion", "airtable", "salesforce", "hubspot",
                        "mailchimp", "stripe", "paypal", "shopify", "wordpress", "webflow"
                    ]
                    
                    found_platforms = [platform for platform in platform_keywords 
                                     if platform.lower() in ai_response.lower()]
                    
                    # Check for "50+" mention
                    has_fifty_plus = "50" in ai_response or "fifty" in ai_response.lower()
                    
                    if len(found_platforms) >= 5 or has_fifty_plus:
                        self.log_test(query["test_name"], True,
                                    f"AI mentioned {len(found_platforms)} platforms, 50+ indicator: {has_fifty_plus}")
                        
                        # Store platform integrations
                        self.platform_integrations.extend(found_platforms)
                        
                        self.log_discovered_feature(
                            "Comprehensive Platform Integration Knowledge",
                            f"AI demonstrated knowledge of {len(found_platforms)} platforms",
                            ai_response[:300] + "..."
                        )
                    else:
                        self.log_test(query["test_name"], False,
                                    f"AI mentioned only {len(found_platforms)} platforms, no 50+ indicator")
                else:
                    self.log_test(query["test_name"], False, f"HTTP {response.status_code}")
                    
        except Exception as e:
            self.log_test("Cross-Platform Integration Discovery", False, error=e)

    def test_native_chromium_capabilities(self):
        """Test 3: Native Chromium Capabilities - Test browser features explanation"""
        try:
            browser_queries = [
                {
                    "message": "What browser features do you have?",
                    "test_name": "Browser Features Query",
                    "expected_features": ["native chromium", "screenshot capture", "css selectors", "form automation"]
                },
                {
                    "message": "How do you handle web automation?",
                    "test_name": "Web Automation Query",
                    "expected_features": ["playwright", "browser engine", "javascript execution", "real browser"]
                },
                {
                    "message": "Can you take screenshots?",
                    "test_name": "Screenshot Capability Query",
                    "expected_features": ["automatic capture", "visual monitoring", "base64", "png"]
                }
            ]
            
            for query in browser_queries:
                chat_data = {
                    "message": query["message"],
                    "session_id": self.session_id
                }
                
                response = requests.post(f"{BACKEND_URL}/api/chat", 
                                       json=chat_data, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    ai_response = data.get("response", "")
                    
                    # Check for Native Chromium features
                    chromium_keywords = [
                        "native chromium", "playwright", "browser engine", "screenshot",
                        "css selector", "form automation", "javascript", "real browser",
                        "headless", "automation", "visual", "capture", "extract"
                    ]
                    
                    found_chromium_features = [kw for kw in chromium_keywords 
                                             if kw.lower() in ai_response.lower()]
                    
                    if len(found_chromium_features) >= 3:
                        self.log_test(query["test_name"], True,
                                    f"AI explained {len(found_chromium_features)} Native Chromium features")
                        
                        self.log_discovered_feature(
                            "Native Chromium Engine Explanation",
                            f"AI demonstrated knowledge of Native Chromium capabilities",
                            ai_response[:250] + "..."
                        )
                    else:
                        self.log_test(query["test_name"], False,
                                    f"AI mentioned only {len(found_chromium_features)} browser features")
                else:
                    self.log_test(query["test_name"], False, f"HTTP {response.status_code}")
                    
        except Exception as e:
            self.log_test("Native Chromium Capabilities", False, error=e)

    def test_proactive_feature_discovery(self):
        """Test 4: Proactive Feature Discovery - Basic messages should trigger feature suggestions"""
        try:
            basic_messages = [
                {
                    "message": "hi",
                    "test_name": "Basic Greeting - Feature Discovery",
                    "expected_suggestions": 2
                },
                {
                    "message": "help",
                    "test_name": "Basic Help - Feature Discovery",
                    "expected_suggestions": 3
                },
                {
                    "message": "what's new?",
                    "test_name": "Basic Update Query - Feature Discovery",
                    "expected_suggestions": 2
                }
            ]
            
            for message in basic_messages:
                chat_data = {
                    "message": message["message"],
                    "session_id": self.session_id
                }
                
                response = requests.post(f"{BACKEND_URL}/api/chat", 
                                       json=chat_data, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    ai_response = data.get("response", "")
                    
                    # Check for proactive feature suggestions
                    suggestion_patterns = [
                        "i can", "try asking", "you might not know", "hidden features",
                        "advanced capabilities", "did you know", "for example",
                        "workflow", "automation", "integration", "monitoring"
                    ]
                    
                    found_suggestions = [pattern for pattern in suggestion_patterns 
                                       if pattern.lower() in ai_response.lower()]
                    
                    # Count numbered suggestions (1., 2., 3.)
                    numbered_suggestions = ai_response.count("1.") + ai_response.count("2.") + ai_response.count("3.")
                    
                    if len(found_suggestions) >= 3 or numbered_suggestions >= message["expected_suggestions"]:
                        self.log_test(message["test_name"], True,
                                    f"AI proactively suggested features: {len(found_suggestions)} patterns, {numbered_suggestions} numbered items")
                        
                        self.log_discovered_feature(
                            "Proactive Feature Discovery",
                            f"AI proactively suggested features for basic message '{message['message']}'",
                            ai_response[:200] + "..."
                        )
                    else:
                        self.log_test(message["test_name"], False,
                                    f"AI didn't proactively suggest enough features: {len(found_suggestions)} patterns, {numbered_suggestions} numbered")
                else:
                    self.log_test(message["test_name"], False, f"HTTP {response.status_code}")
                    
        except Exception as e:
            self.log_test("Proactive Feature Discovery", False, error=e)

    def test_advanced_command_recognition(self):
        """Test 5: Advanced Command Recognition - AI should recognize intent and suggest capabilities"""
        try:
            intent_queries = [
                {
                    "message": "I need to find leads",
                    "test_name": "Lead Generation Intent Recognition",
                    "expected_suggestions": ["linkedin", "contact extraction", "crm", "email verification"]
                },
                {
                    "message": "Monitor my competitors",
                    "test_name": "Monitoring Intent Recognition",
                    "expected_suggestions": ["website monitoring", "alerts", "screenshots", "change detection"]
                },
                {
                    "message": "Extract data from websites",
                    "test_name": "Data Extraction Intent Recognition",
                    "expected_suggestions": ["css selectors", "scraping", "automation", "structured data"]
                }
            ]
            
            for query in intent_queries:
                chat_data = {
                    "message": query["message"],
                    "session_id": self.session_id
                }
                
                response = requests.post(f"{BACKEND_URL}/api/chat", 
                                       json=chat_data, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    ai_response = data.get("response", "")
                    
                    # Check for relevant capability suggestions
                    found_relevant_suggestions = [suggestion for suggestion in query["expected_suggestions"] 
                                                if suggestion.lower() in ai_response.lower()]
                    
                    # Check for workflow creation suggestion
                    workflow_indicators = ["workflow", "automate", "steps", "process", "create"]
                    found_workflow_indicators = [ind for ind in workflow_indicators 
                                               if ind.lower() in ai_response.lower()]
                    
                    if len(found_relevant_suggestions) >= 2 and len(found_workflow_indicators) >= 2:
                        self.log_test(query["test_name"], True,
                                    f"AI recognized intent and suggested {len(found_relevant_suggestions)} relevant capabilities")
                        
                        self.log_discovered_feature(
                            "Advanced Intent Recognition",
                            f"AI recognized '{query['message']}' intent and suggested relevant capabilities",
                            ai_response[:250] + "..."
                        )
                    else:
                        self.log_test(query["test_name"], False,
                                    f"AI didn't recognize intent well: {len(found_relevant_suggestions)} relevant, {len(found_workflow_indicators)} workflow indicators")
                else:
                    self.log_test(query["test_name"], False, f"HTTP {response.status_code}")
                    
        except Exception as e:
            self.log_test("Advanced Command Recognition", False, error=e)

    def test_credit_estimation_transparency(self):
        """Test 6: Credit Estimation & Transparency - Verify AI mentions cost estimates"""
        try:
            complex_task_queries = [
                {
                    "message": "Create a complex workflow to monitor 10 websites and send daily reports",
                    "test_name": "Complex Workflow Credit Estimation",
                    "expected_credits": 25
                },
                {
                    "message": "Automate lead generation across LinkedIn, Twitter, and GitHub with data export",
                    "test_name": "Multi-Platform Automation Credit Estimation",
                    "expected_credits": 20
                },
                {
                    "message": "Set up comprehensive social media monitoring with alerts and analytics",
                    "test_name": "Monitoring System Credit Estimation",
                    "expected_credits": 15
                }
            ]
            
            for query in complex_task_queries:
                chat_data = {
                    "message": query["message"],
                    "session_id": self.session_id
                }
                
                response = requests.post(f"{BACKEND_URL}/api/chat", 
                                       json=chat_data, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    ai_response = data.get("response", "")
                    
                    # Check for credit estimation mentions
                    credit_indicators = [
                        "credits", "cost", "estimated", "minutes", "~25", "pricing",
                        "resource", "time", "workflow costs", "estimated"
                    ]
                    
                    found_credit_indicators = [ind for ind in credit_indicators 
                                             if ind.lower() in ai_response.lower()]
                    
                    # Look for specific credit numbers
                    import re
                    credit_numbers = re.findall(r'(\d+)\s*credit', ai_response.lower())
                    time_estimates = re.findall(r'(\d+)\s*minute', ai_response.lower())
                    
                    if len(found_credit_indicators) >= 2 or credit_numbers or time_estimates:
                        self.log_test(query["test_name"], True,
                                    f"AI provided cost transparency: {len(found_credit_indicators)} indicators, credits: {credit_numbers}, time: {time_estimates}")
                        
                        # Store credit estimations
                        if credit_numbers:
                            self.credit_estimations.append({
                                "query": query["message"],
                                "estimated_credits": credit_numbers[0],
                                "response": ai_response[:200]
                            })
                        
                        self.log_discovered_feature(
                            "Credit Estimation Transparency",
                            f"AI provided cost estimates for complex task",
                            ai_response[:200] + "..."
                        )
                    else:
                        self.log_test(query["test_name"], False,
                                    f"AI didn't provide cost transparency: {len(found_credit_indicators)} indicators")
                else:
                    self.log_test(query["test_name"], False, f"HTTP {response.status_code}")
                    
        except Exception as e:
            self.log_test("Credit Estimation & Transparency", False, error=e)

    def test_workflow_creation_enhanced_prompts(self):
        """Test 7: Workflow Creation with Enhanced Prompts - Verify Native Browser integration"""
        try:
            workflow_instruction = "Create a comprehensive lead generation workflow that monitors LinkedIn profiles, extracts contact information, verifies emails, and saves to Google Sheets with automated follow-up scheduling"
            
            workflow_data = {
                "instruction": workflow_instruction,
                "session_id": self.session_id,
                "workflow_type": "lead_generation"
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
                    browser_actions = workflow.get("browser_actions", False)
                    deep_action_enabled = workflow.get("deep_action_enabled", False)
                    
                    # Check for Native Browser integration
                    native_browser_indicators = [
                        "native_browser" in required_platforms,
                        browser_actions,
                        deep_action_enabled,
                        len(steps) >= 4,
                        estimated_credits >= 20
                    ]
                    
                    native_browser_score = sum(native_browser_indicators)
                    
                    if native_browser_score >= 3:
                        self.log_test("Workflow Creation with Enhanced Prompts", True,
                                    f"Workflow includes Native Browser integration: {native_browser_score}/5 indicators")
                        
                        self.log_discovered_feature(
                            "Native Browser Workflow Integration",
                            f"Created workflow with {len(steps)} steps, {estimated_credits} credits, browser actions: {browser_actions}",
                            f"Platforms: {required_platforms}, Deep Action: {deep_action_enabled}"
                        )
                    else:
                        self.log_test("Workflow Creation with Enhanced Prompts", False,
                                    f"Workflow lacks Native Browser integration: {native_browser_score}/5 indicators")
                else:
                    self.log_test("Workflow Creation with Enhanced Prompts", False, "No workflow in response")
            else:
                self.log_test("Workflow Creation with Enhanced Prompts", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Workflow Creation with Enhanced Prompts", False, error=e)

    def run_enhanced_ai_tests(self):
        """Run all enhanced AI system prompt tests"""
        print("🚀 ENHANCED AI SYSTEM PROMPT TESTING - 26 UNDERUTILIZED FEATURES DISCOVERY")
        print("🎯 Focus: Enhanced AI System Prompt, Cross-Platform Integration, Native Chromium, Proactive Discovery")
        print("=" * 90)
        
        # Run all test categories
        self.test_enhanced_ai_system_prompt_simple_queries()
        self.test_cross_platform_integration_discovery()
        self.test_native_chromium_capabilities()
        self.test_proactive_feature_discovery()
        self.test_advanced_command_recognition()
        self.test_credit_estimation_transparency()
        self.test_workflow_creation_enhanced_prompts()
        
        # Print comprehensive summary
        self.print_enhanced_summary()

    def print_enhanced_summary(self):
        """Print enhanced test summary focused on AI system prompt effectiveness"""
        print("\n" + "=" * 90)
        print("📊 ENHANCED AI SYSTEM PROMPT TEST RESULTS")
        print("=" * 90)
        
        # Basic test statistics
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"🧪 TESTING STATISTICS:")
        print(f"   Total Tests: {total}")
        print(f"   Passed: {passed}")
        print(f"   Failed: {total - passed}")
        print(f"   Success Rate: {(passed/total)*100:.1f}%")
        
        # Discovered features analysis
        print(f"\n🔍 DISCOVERED FEATURES THROUGH AI CONVERSATION: {len(self.discovered_features)}")
        print("-" * 70)
        
        for i, feature in enumerate(self.discovered_features, 1):
            print(f"{i}. {feature['feature']}")
            print(f"   Description: {feature['description']}")
            print(f"   AI Response: {feature['ai_response_snippet']}")
            print()
        
        # Platform integrations discovered
        unique_platforms = list(set(self.platform_integrations))
        if unique_platforms:
            print(f"🌐 PLATFORM INTEGRATIONS DISCOVERED: {len(unique_platforms)}")
            print("-" * 70)
            print(f"   Platforms: {', '.join(unique_platforms[:10])}{'...' if len(unique_platforms) > 10 else ''}")
            print()
        
        # Credit estimations
        if self.credit_estimations:
            print(f"💰 CREDIT ESTIMATIONS PROVIDED: {len(self.credit_estimations)}")
            print("-" * 70)
            for estimation in self.credit_estimations:
                print(f"   Task: {estimation['query'][:50]}...")
                print(f"   Estimated Credits: {estimation['estimated_credits']}")
                print()
        
        # Test failures analysis
        failures = [r for r in self.test_results if not r["success"]]
        if failures:
            print(f"❌ FAILED TESTS: {len(failures)}")
            print("-" * 70)
            for failure in failures:
                print(f"   {failure['test']}: {failure['error'] or 'AI response insufficient'}")
            print()
        
        # AI Response Quality Analysis
        print(f"🤖 AI RESPONSE QUALITY ANALYSIS:")
        print("-" * 70)
        
        total_responses = len(self.ai_responses)
        if total_responses > 0:
            avg_response_length = sum(len(r["response"]) for r in self.ai_responses) / total_responses
            print(f"   Total AI Responses Analyzed: {total_responses}")
            print(f"   Average Response Length: {avg_response_length:.0f} characters")
            
            # Check for proactive responses
            proactive_responses = sum(1 for r in self.ai_responses 
                                    if any(indicator in r["response"].lower() 
                                          for indicator in ["i can", "try asking", "advanced", "features"]))
            
            print(f"   Proactive Responses: {proactive_responses}/{total_responses} ({(proactive_responses/total_responses)*100:.1f}%)")
        
        # Recommendations for AI System Prompt Enhancement
        print(f"\n💡 RECOMMENDATIONS FOR AI SYSTEM PROMPT ENHANCEMENT:")
        print("-" * 70)
        
        recommendations = []
        
        if passed / total < 0.8:
            recommendations.append("1. Enhance AI system prompt to be more proactive in suggesting advanced features")
        
        if len(unique_platforms) < 20:
            recommendations.append("2. Improve platform integration knowledge display - should mention 50+ platforms")
        
        if not self.credit_estimations:
            recommendations.append("3. Add consistent credit estimation and cost transparency to AI responses")
        
        if len([f for f in self.discovered_features if "native chromium" in f["feature"].lower()]) == 0:
            recommendations.append("4. Better highlight Native Chromium engine capabilities in AI responses")
        
        recommendations.extend([
            "5. Implement feature discovery onboarding through AI conversation",
            "6. Add workflow template suggestions based on user queries",
            "7. Create AI-driven feature spotlight system",
            "8. Enhance intent recognition for better capability matching",
            "9. Add contextual feature suggestions based on user's current task",
            "10. Implement progressive feature disclosure through AI interaction"
        ])
        
        for rec in recommendations:
            print(f"   {rec}")
        
        print("\n" + "=" * 90)
        print("🏆 ENHANCED AI SYSTEM ASSESSMENT:")
        
        if passed / total >= 0.85:
            print("   ✅ EXCELLENT: Enhanced AI system prompt is working effectively")
            print("   🎯 All 26 underutilized features are now accessible through AI conversation")
        elif passed / total >= 0.7:
            print("   ⚠️  GOOD: Enhanced AI system prompt is functional with room for improvement")
            print("   🎯 Most underutilized features are accessible, some need better exposure")
        else:
            print("   ❌ NEEDS IMPROVEMENT: Enhanced AI system prompt requires significant enhancement")
            print("   🎯 Many underutilized features are not effectively exposed through AI conversation")
        
        print(f"   📈 Feature Discovery Success: {len(self.discovered_features)} features discovered through conversation")
        print(f"   🌐 Platform Integration Awareness: {len(unique_platforms)} platforms identified")
        print(f"   💰 Cost Transparency: {len(self.credit_estimations)} credit estimations provided")
        print("=" * 90)

if __name__ == "__main__":
    print("🚀 ENHANCED AI SYSTEM PROMPT TESTING")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    print(f"🎯 Testing Focus: 26 Underutilized Features Discovery through AI Conversation")
    print()
    
    tester = EnhancedAISystemTester()
    tester.run_enhanced_ai_tests()