#!/usr/bin/env python3
"""
Browser Automation - Open YouTube Functionality Test
Testing the specific "open youtube" functionality that needs retesting
"""

import asyncio
import aiohttp
import json
import uuid
from datetime import datetime

# Configuration
BASE_URL = "https://youtube-navigator.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class YouTubeAutomationTester:
    def __init__(self):
        self.session_id = str(uuid.uuid4())
        self.test_results = []
        
    async def log_test_result(self, test_name: str, success: bool, details: str, response_data: any = None):
        """Log test result with details"""
        status = "✅ PASS" if success else "❌ FAIL"
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
        
    async def test_youtube_chat_command(self):
        """Test the 'open youtube' chat command"""
        print("\n🎥 TESTING YOUTUBE CHAT COMMAND")
        print("=" * 50)
        
        async with aiohttp.ClientSession() as session:
            try:
                # Test the exact command that should open YouTube
                chat_payload = {
                    "message": "open youtube",
                    "session_id": self.session_id
                }
                
                async with session.post(f"{API_BASE}/chat", json=chat_payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Check if the response indicates YouTube should be opened
                        website_opened = data.get('website_opened', False)
                        website_name = data.get('website_name', '')
                        website_url = data.get('website_url', '')
                        native_browser = data.get('native_browser', False)
                        proxy_url = data.get('proxy_url', '')
                        ai_response = data.get('response', '')
                        
                        if website_opened and 'youtube' in website_name.lower():
                            await self.log_test_result(
                                "YouTube Chat Command - Backend Response",
                                True,
                                f"✅ BACKEND WORKING: 'open youtube' command correctly processed. website_opened: {website_opened}, website_name: {website_name}, native_browser: {native_browser}",
                                {
                                    "website_opened": website_opened,
                                    "website_name": website_name,
                                    "website_url": website_url,
                                    "native_browser": native_browser,
                                    "proxy_url": proxy_url,
                                    "ai_response_preview": ai_response[:200] + "..." if len(ai_response) > 200 else ai_response
                                }
                            )
                            
                            # Test if the proxy URL works
                            if proxy_url:
                                try:
                                    async with session.get(proxy_url, timeout=15) as proxy_response:
                                        if proxy_response.status == 200:
                                            proxy_content = await proxy_response.text()
                                            if len(proxy_content) > 1000 and 'youtube' in proxy_content.lower():
                                                await self.log_test_result(
                                                    "YouTube Proxy URL Functionality",
                                                    True,
                                                    f"✅ PROXY WORKING: YouTube proxy URL returns valid content ({len(proxy_content)} chars)",
                                                    {"proxy_url": proxy_url, "content_size": len(proxy_content)}
                                                )
                                            else:
                                                await self.log_test_result(
                                                    "YouTube Proxy URL Functionality",
                                                    False,
                                                    f"❌ PROXY CONTENT ISSUE: Content too small ({len(proxy_content)} chars) or doesn't contain YouTube"
                                                )
                                        else:
                                            await self.log_test_result(
                                                "YouTube Proxy URL Functionality",
                                                False,
                                                f"❌ PROXY HTTP ERROR: Status {proxy_response.status}"
                                            )
                                except Exception as e:
                                    await self.log_test_result(
                                        "YouTube Proxy URL Functionality",
                                        False,
                                        f"❌ PROXY ERROR: {str(e)}"
                                    )
                            else:
                                await self.log_test_result(
                                    "YouTube Proxy URL Functionality",
                                    False,
                                    "❌ NO PROXY URL: Backend didn't provide proxy_url"
                                )
                                
                        else:
                            await self.log_test_result(
                                "YouTube Chat Command - Backend Response",
                                False,
                                f"❌ BACKEND ISSUE: 'open youtube' not processed correctly. website_opened: {website_opened}, website_name: {website_name}",
                                data
                            )
                    else:
                        await self.log_test_result(
                            "YouTube Chat Command - Backend Response",
                            False,
                            f"❌ CHAT API ERROR: HTTP {response.status}",
                            await response.text()
                        )
                        
            except Exception as e:
                await self.log_test_result(
                    "YouTube Chat Command - Backend Response",
                    False,
                    f"❌ CHAT COMMAND ERROR: {str(e)}"
                )

    async def test_various_youtube_commands(self):
        """Test various ways to open YouTube"""
        print("\n🎯 TESTING VARIOUS YOUTUBE COMMANDS")
        print("=" * 50)
        
        youtube_commands = [
            "go to youtube",
            "open YouTube",
            "navigate to youtube",
            "visit youtube",
            "show me youtube",
            "launch youtube"
        ]
        
        successful_commands = 0
        
        async with aiohttp.ClientSession() as session:
            for command in youtube_commands:
                try:
                    chat_payload = {
                        "message": command,
                        "session_id": self.session_id
                    }
                    
                    async with session.post(f"{API_BASE}/chat", json=chat_payload) as response:
                        if response.status == 200:
                            data = await response.json()
                            website_opened = data.get('website_opened', False)
                            website_name = data.get('website_name', '')
                            
                            if website_opened and 'youtube' in website_name.lower():
                                successful_commands += 1
                                await self.log_test_result(
                                    f"YouTube Command Variant: '{command}'",
                                    True,
                                    f"✅ COMMAND RECOGNIZED: '{command}' successfully triggers YouTube opening",
                                    {"command": command, "website_name": website_name}
                                )
                            else:
                                await self.log_test_result(
                                    f"YouTube Command Variant: '{command}'",
                                    False,
                                    f"❌ COMMAND NOT RECOGNIZED: '{command}' doesn't trigger YouTube opening"
                                )
                        else:
                            await self.log_test_result(
                                f"YouTube Command Variant: '{command}'",
                                False,
                                f"❌ API ERROR: HTTP {response.status} for command '{command}'"
                            )
                            
                except Exception as e:
                    await self.log_test_result(
                        f"YouTube Command Variant: '{command}'",
                        False,
                        f"❌ ERROR: {str(e)} for command '{command}'"
                    )
        
        # Overall assessment
        success_rate = (successful_commands / len(youtube_commands)) * 100
        if success_rate >= 80:
            await self.log_test_result(
                "YouTube Command Recognition Overall",
                True,
                f"✅ EXCELLENT: {successful_commands}/{len(youtube_commands)} YouTube commands recognized ({success_rate:.1f}%)"
            )
        elif success_rate >= 50:
            await self.log_test_result(
                "YouTube Command Recognition Overall",
                True,
                f"⚠️ GOOD: {successful_commands}/{len(youtube_commands)} YouTube commands recognized ({success_rate:.1f}%)"
            )
        else:
            await self.log_test_result(
                "YouTube Command Recognition Overall",
                False,
                f"❌ POOR: Only {successful_commands}/{len(youtube_commands)} YouTube commands recognized ({success_rate:.1f}%)"
            )

    async def test_ai_response_quality(self):
        """Test the quality of AI response for YouTube commands"""
        print("\n🤖 TESTING AI RESPONSE QUALITY")
        print("=" * 50)
        
        async with aiohttp.ClientSession() as session:
            try:
                chat_payload = {
                    "message": "open youtube",
                    "session_id": self.session_id
                }
                
                async with session.post(f"{API_BASE}/chat", json=chat_payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        ai_response = data.get('response', '')
                        
                        # Check for quality indicators in AI response
                        quality_indicators = [
                            'youtube',
                            'native browser',
                            'loading',
                            'functionality',
                            'chromium',
                            'browser engine'
                        ]
                        
                        found_indicators = sum(1 for indicator in quality_indicators 
                                             if indicator.lower() in ai_response.lower())
                        
                        if len(ai_response) > 100 and found_indicators >= 3:
                            await self.log_test_result(
                                "AI Response Quality for YouTube",
                                True,
                                f"✅ HIGH QUALITY: AI response is detailed ({len(ai_response)} chars) with {found_indicators}/{len(quality_indicators)} quality indicators",
                                {
                                    "response_length": len(ai_response),
                                    "quality_indicators_found": found_indicators,
                                    "response_preview": ai_response[:300] + "..." if len(ai_response) > 300 else ai_response
                                }
                            )
                        else:
                            await self.log_test_result(
                                "AI Response Quality for YouTube",
                                False,
                                f"❌ LOW QUALITY: AI response too short ({len(ai_response)} chars) or lacks quality indicators ({found_indicators}/{len(quality_indicators)})"
                            )
                    else:
                        await self.log_test_result(
                            "AI Response Quality for YouTube",
                            False,
                            f"❌ API ERROR: HTTP {response.status}"
                        )
                        
            except Exception as e:
                await self.log_test_result(
                    "AI Response Quality for YouTube",
                    False,
                    f"❌ ERROR: {str(e)}"
                )

    async def run_youtube_automation_tests(self):
        """Run all YouTube automation tests"""
        print("🎥 BROWSER AUTOMATION - OPEN YOUTUBE FUNCTIONALITY TEST")
        print("=" * 70)
        print("Testing the specific 'open youtube' functionality that needs retesting")
        print("=" * 70)
        print(f"Session ID: {self.session_id}")
        print(f"API Base URL: {API_BASE}")
        print("=" * 70)
        
        start_time = datetime.now()
        
        # Run all tests
        await self.test_youtube_chat_command()
        await self.test_various_youtube_commands()
        await self.test_ai_response_quality()
        
        end_time = datetime.now()
        total_time = (end_time - start_time).total_seconds()
        
        # Generate report
        print("\n" + "=" * 70)
        print("📊 YOUTUBE AUTOMATION TEST RESULTS")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r['success'])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {success_rate:.1f}%")
        print(f"Total Testing Time: {total_time:.2f} seconds")
        
        print("\n🎯 YOUTUBE AUTOMATION ASSESSMENT:")
        print("-" * 50)
        
        # Analyze specific capabilities
        backend_working = any(r['success'] and 'backend response' in r['test_name'].lower() for r in self.test_results)
        proxy_working = any(r['success'] and 'proxy' in r['test_name'].lower() for r in self.test_results)
        command_recognition = any(r['success'] and 'command recognition overall' in r['test_name'].lower() for r in self.test_results)
        ai_quality = any(r['success'] and 'ai response quality' in r['test_name'].lower() for r in self.test_results)
        
        print(f"1. Backend processes 'open youtube' correctly? {'✅ YES' if backend_working else '❌ NO'}")
        print(f"2. YouTube proxy URL works? {'✅ YES' if proxy_working else '❌ NO'}")
        print(f"3. Various YouTube commands recognized? {'✅ YES' if command_recognition else '❌ NO'}")
        print(f"4. AI response quality is good? {'✅ YES' if ai_quality else '❌ NO'}")
        
        print("\n📋 DETAILED TEST RESULTS:")
        print("-" * 50)
        
        for result in self.test_results:
            print(f"{result['status']} {result['test_name']}")
            print(f"   Details: {result['details']}")
            if result.get('response_data') and isinstance(result['response_data'], dict):
                for key, value in result['response_data'].items():
                    if key not in ['ai_response_preview', 'response_preview']:  # Skip long text
                        print(f"   {key}: {value}")
            print()
        
        # Final assessment for test_result.md
        print("\n🏆 FINAL ASSESSMENT FOR TEST_RESULT.MD:")
        print("-" * 60)
        
        if success_rate >= 75 and backend_working:
            print("✅ WORKING: YouTube automation functionality is working correctly")
            print("   Backend processes commands, proxy works, AI responds appropriately")
            working_status = True
        elif success_rate >= 50:
            print("⚠️ PARTIALLY WORKING: YouTube automation has some issues but core functionality works")
            print("   Backend may work but some components have problems")
            working_status = "partial"
        else:
            print("❌ NOT WORKING: YouTube automation functionality has significant issues")
            print("   Core backend functionality is not working properly")
            working_status = False
        
        return {
            "working_status": working_status,
            "success_rate": success_rate,
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "testing_time": total_time,
            "capabilities": {
                "backend_processing": backend_working,
                "proxy_functionality": proxy_working,
                "command_recognition": command_recognition,
                "ai_response_quality": ai_quality
            },
            "detailed_results": self.test_results
        }

async def main():
    """Main test execution function"""
    tester = YouTubeAutomationTester()
    results = await tester.run_youtube_automation_tests()
    
    # Save results to file
    with open('/app/youtube_automation_test_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n💾 YouTube automation test results saved to: /app/youtube_automation_test_results.json")
    
    return results

if __name__ == "__main__":
    asyncio.run(main())