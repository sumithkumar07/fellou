#!/usr/bin/env python3
"""
YouTube AI Assistant Workflow Backend Testing
Testing the complete AI assistant workflow for YouTube video playback functionality.
"""

import asyncio
import aiohttp
import json
import uuid
import time
import base64
import urllib.parse
from datetime import datetime
from typing import Dict, List, Any, Optional

# Configuration
BASE_URL = "https://youtube-navigator.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class YouTubeWorkflowTester:
    def __init__(self):
        self.session_id = f"test_session_{uuid.uuid4().hex[:8]}"
        self.tab_id = None
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
        
    async def test_health_check(self):
        """Test basic health endpoints"""
        print("\n🏥 TESTING HEALTH ENDPOINTS")
        print("=" * 60)
        
        async with aiohttp.ClientSession() as session:
            # Test 1: Health Check
            try:
                async with session.get(f"{API_BASE}/health") as response:
                    if response.status == 200:
                        data = await response.json()
                        browser_available = data.get('native_browser_engine', False)
                        youtube_support = data.get('features', {}).get('youtube_support', False)
                        await self.log_test_result(
                            "Health Check - Browser Engine",
                            True,
                            f"Health OK - Browser: {browser_available}, YouTube: {youtube_support}, Version: {data.get('version')}",
                            data
                        )
                    else:
                        await self.log_test_result(
                            "Health Check - Browser Engine",
                            False,
                            f"Health endpoint returned {response.status}",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "Health Check - Browser Engine",
                    False,
                    f"Health endpoint error: {str(e)}"
                )
            
            # Test 2: System Status
            try:
                async with session.get(f"{API_BASE}/system/status") as response:
                    if response.status == 200:
                        data = await response.json()
                        browser_engine = data.get('services', {}).get('native_chromium_engine', False)
                        youtube_support = data.get('capabilities', {}).get('youtube_video_support', False)
                        await self.log_test_result(
                            "System Status - YouTube Support",
                            True,
                            f"System OK - Chromium: {browser_engine}, YouTube: {youtube_support}",
                            {"browser_engine": browser_engine, "youtube_support": youtube_support}
                        )
                    else:
                        await self.log_test_result(
                            "System Status - YouTube Support",
                            False,
                            f"System status returned {response.status}",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "System Status - YouTube Support",
                    False,
                    f"System status error: {str(e)}"
                )

    async def test_ai_youtube_command(self):
        """Test AI assistant responding to 'open youtube' command"""
        print("\n🤖 TESTING AI YOUTUBE COMMAND")
        print("=" * 60)
        
        async with aiohttp.ClientSession() as session:
            try:
                chat_payload = {
                    "message": "open youtube",
                    "session_id": self.session_id
                }
                
                async with session.post(f"{API_BASE}/chat", json=chat_payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Check if AI detected YouTube intent
                        website_opened = data.get('website_opened', False)
                        website_name = data.get('website_name', '')
                        tab_id = data.get('tab_id')
                        screenshot = data.get('screenshot')
                        proxy_url = data.get('proxy_url')
                        
                        if website_opened and website_name.lower() == 'youtube':
                            self.tab_id = tab_id  # Store for later tests
                            await self.log_test_result(
                                "AI YouTube Command Detection",
                                True,
                                f"AI successfully detected 'open youtube' command - Tab ID: {tab_id}, Screenshot: {bool(screenshot)}",
                                {
                                    "website_opened": website_opened,
                                    "website_name": website_name,
                                    "tab_id": tab_id,
                                    "has_screenshot": bool(screenshot),
                                    "proxy_url": proxy_url
                                }
                            )
                        else:
                            await self.log_test_result(
                                "AI YouTube Command Detection",
                                False,
                                f"AI failed to detect YouTube command - Website opened: {website_opened}, Name: {website_name}",
                                data
                            )
                    else:
                        await self.log_test_result(
                            "AI YouTube Command Detection",
                            False,
                            f"Chat endpoint returned {response.status}",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "AI YouTube Command Detection",
                    False,
                    f"Chat endpoint error: {str(e)}"
                )

    async def test_youtube_proxy_access(self):
        """Test YouTube access via proxy endpoint"""
        print("\n🌐 TESTING YOUTUBE PROXY ACCESS")
        print("=" * 60)
        
        async with aiohttp.ClientSession() as session:
            try:
                youtube_url = "https://www.youtube.com"
                encoded_url = urllib.parse.quote(youtube_url, safe='')
                proxy_endpoint = f"{API_BASE}/proxy/{encoded_url}"
                
                async with session.get(proxy_endpoint) as response:
                    if response.status == 200:
                        content = await response.text()
                        
                        # Check for YouTube-specific content
                        youtube_indicators = [
                            'youtube', 'ytd-app', 'ytInitialData', 'watch?v=', 'video'
                        ]
                        
                        found_indicators = [indicator for indicator in youtube_indicators if indicator.lower() in content.lower()]
                        
                        if len(found_indicators) >= 3:
                            await self.log_test_result(
                                "YouTube Proxy Access",
                                True,
                                f"YouTube loaded via proxy - Found {len(found_indicators)} YouTube indicators, Content size: {len(content)} chars",
                                {
                                    "content_size": len(content),
                                    "youtube_indicators": found_indicators,
                                    "proxy_url": proxy_endpoint
                                }
                            )
                        else:
                            await self.log_test_result(
                                "YouTube Proxy Access",
                                False,
                                f"YouTube content not properly loaded - Only {len(found_indicators)} indicators found",
                                {"found_indicators": found_indicators}
                            )
                    else:
                        await self.log_test_result(
                            "YouTube Proxy Access",
                            False,
                            f"Proxy endpoint returned {response.status}",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "YouTube Proxy Access",
                    False,
                    f"Proxy access error: {str(e)}"
                )

    async def test_native_browser_youtube(self):
        """Test native browser interaction with YouTube"""
        print("\n🎥 TESTING NATIVE BROWSER YOUTUBE INTERACTION")
        print("=" * 60)
        
        if not self.tab_id:
            await self.log_test_result(
                "Native Browser YouTube Test",
                False,
                "No tab_id available from previous tests - cannot test browser interaction"
            )
            return
        
        async with aiohttp.ClientSession() as session:
            # Test 1: Get screenshot of YouTube page
            try:
                async with session.get(f"{API_BASE}/native-browser/screenshot/{self.tab_id}") as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('success') and data.get('screenshot'):
                            screenshot_data = data.get('screenshot')
                            # Verify it's valid base64
                            try:
                                base64.b64decode(screenshot_data)
                                await self.log_test_result(
                                    "YouTube Screenshot Capture",
                                    True,
                                    f"YouTube screenshot captured - Size: {len(screenshot_data)} chars base64",
                                    {"screenshot_size": len(screenshot_data), "tab_id": self.tab_id}
                                )
                            except:
                                await self.log_test_result(
                                    "YouTube Screenshot Capture",
                                    False,
                                    "Screenshot data is not valid base64"
                                )
                        else:
                            await self.log_test_result(
                                "YouTube Screenshot Capture",
                                False,
                                "Screenshot capture failed or no data returned",
                                data
                            )
                    else:
                        await self.log_test_result(
                            "YouTube Screenshot Capture",
                            False,
                            f"Screenshot endpoint returned {response.status}",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "YouTube Screenshot Capture",
                    False,
                    f"Screenshot error: {str(e)}"
                )
            
            # Test 2: Get page info
            try:
                interact_payload = {
                    "tab_id": self.tab_id,
                    "action": "get_info"
                }
                
                async with session.post(f"{API_BASE}/native-browser/interact", json=interact_payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('success'):
                            title = data.get('title', '')
                            url = data.get('url', '')
                            page_info = data.get('page_info', {})
                            
                            if 'youtube' in url.lower() or 'youtube' in title.lower():
                                await self.log_test_result(
                                    "YouTube Page Info",
                                    True,
                                    f"YouTube page loaded - Title: {title[:50]}..., URL: {url}",
                                    {
                                        "title": title,
                                        "url": url,
                                        "page_info": page_info
                                    }
                                )
                            else:
                                await self.log_test_result(
                                    "YouTube Page Info",
                                    False,
                                    f"Page doesn't appear to be YouTube - Title: {title}, URL: {url}"
                                )
                        else:
                            await self.log_test_result(
                                "YouTube Page Info",
                                False,
                                "Failed to get page info",
                                data
                            )
                    else:
                        await self.log_test_result(
                            "YouTube Page Info",
                            False,
                            f"Page info endpoint returned {response.status}",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "YouTube Page Info",
                    False,
                    f"Page info error: {str(e)}"
                )
            
            # Test 3: Test scroll interaction
            try:
                scroll_payload = {
                    "tab_id": self.tab_id,
                    "action": "scroll",
                    "delta_y": 300
                }
                
                async with session.post(f"{API_BASE}/native-browser/interact", json=scroll_payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('success'):
                            scroll_info = data.get('scroll_info', {})
                            await self.log_test_result(
                                "YouTube Scroll Interaction",
                                True,
                                f"Scroll successful - Position: {scroll_info.get('scrollY', 0)}px",
                                {"scroll_info": scroll_info}
                            )
                        else:
                            await self.log_test_result(
                                "YouTube Scroll Interaction",
                                False,
                                f"Scroll failed: {data.get('error', 'Unknown error')}",
                                data
                            )
                    else:
                        await self.log_test_result(
                            "YouTube Scroll Interaction",
                            False,
                            f"Scroll endpoint returned {response.status}",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "YouTube Scroll Interaction",
                    False,
                    f"Scroll interaction error: {str(e)}"
                )

    async def test_youtube_video_elements(self):
        """Test detection of YouTube video elements"""
        print("\n🎬 TESTING YOUTUBE VIDEO ELEMENTS")
        print("=" * 60)
        
        if not self.tab_id:
            await self.log_test_result(
                "YouTube Video Elements Test",
                False,
                "No tab_id available - cannot test video elements"
            )
            return
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(f"{API_BASE}/native-browser/elements/{self.tab_id}?element_type=interactive") as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('success'):
                            elements = data.get('elements', [])
                            
                            # Look for video-related elements
                            video_elements = []
                            for element in elements:
                                text = element.get('text', '').lower()
                                tag = element.get('tagName', '').lower()
                                if any(keyword in text for keyword in ['play', 'video', 'watch', 'subscribe']) or tag == 'video':
                                    video_elements.append(element)
                            
                            if video_elements:
                                await self.log_test_result(
                                    "YouTube Video Elements Detection",
                                    True,
                                    f"Found {len(video_elements)} video-related elements out of {len(elements)} total interactive elements",
                                    {
                                        "total_elements": len(elements),
                                        "video_elements": len(video_elements),
                                        "sample_elements": video_elements[:3]
                                    }
                                )
                            else:
                                await self.log_test_result(
                                    "YouTube Video Elements Detection",
                                    False,
                                    f"No video-related elements found among {len(elements)} interactive elements"
                                )
                        else:
                            await self.log_test_result(
                                "YouTube Video Elements Detection",
                                False,
                                "Failed to get page elements",
                                data
                            )
                    else:
                        await self.log_test_result(
                            "YouTube Video Elements Detection",
                            False,
                            f"Elements endpoint returned {response.status}",
                            await response.text()
                        )
            except Exception as e:
                await self.log_test_result(
                    "YouTube Video Elements Detection",
                    False,
                    f"Elements detection error: {str(e)}"
                )

    async def run_youtube_workflow_tests(self):
        """Run complete YouTube workflow tests"""
        print("🎥 YOUTUBE AI ASSISTANT WORKFLOW TESTING")
        print("=" * 80)
        print(f"Session ID: {self.session_id}")
        print(f"API Base URL: {API_BASE}")
        print("=" * 80)
        
        start_time = time.time()
        
        # Run all test suites in order
        await self.test_health_check()
        await self.test_ai_youtube_command()
        await self.test_youtube_proxy_access()
        await self.test_native_browser_youtube()
        await self.test_youtube_video_elements()
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Generate comprehensive report
        print("\n" + "=" * 80)
        print("📊 YOUTUBE WORKFLOW TEST RESULTS")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests} ✅")
        print(f"Failed: {self.failed_tests} ❌")
        print(f"Success Rate: {success_rate:.1f}%")
        print(f"Total Testing Time: {total_time:.2f} seconds")
        
        print("\n🎯 YOUTUBE WORKFLOW CAPABILITIES:")
        print("-" * 50)
        
        # Analyze results for YouTube-specific capabilities
        ai_command_working = any(r['success'] and 'youtube command' in r['test_name'].lower() for r in self.test_results)
        proxy_access_working = any(r['success'] and 'proxy access' in r['test_name'].lower() for r in self.test_results)
        browser_interaction_working = any(r['success'] and 'browser' in r['test_name'].lower() and 'youtube' in r['test_name'].lower() for r in self.test_results)
        video_elements_working = any(r['success'] and 'video elements' in r['test_name'].lower() for r in self.test_results)
        
        print(f"1. AI detects 'open youtube' command? {'✅ YES' if ai_command_working else '❌ NO'}")
        print(f"2. YouTube loads via proxy? {'✅ YES' if proxy_access_working else '❌ NO'}")
        print(f"3. Native browser can interact with YouTube? {'✅ YES' if browser_interaction_working else '❌ NO'}")
        print(f"4. Video elements are detectable? {'✅ YES' if video_elements_working else '❌ NO'}")
        
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
            "youtube_capabilities": {
                "ai_command_detection": ai_command_working,
                "proxy_access": proxy_access_working,
                "browser_interaction": browser_interaction_working,
                "video_elements_detection": video_elements_working
            },
            "tab_id": self.tab_id
        }

async def main():
    """Main test execution function"""
    tester = YouTubeWorkflowTester()
    results = await tester.run_youtube_workflow_tests()
    
    # Save results to file
    with open('/app/youtube_backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n💾 Test results saved to: /app/youtube_backend_test_results.json")
    
    return results

if __name__ == "__main__":
    asyncio.run(main())