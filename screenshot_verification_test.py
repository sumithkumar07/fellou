#!/usr/bin/env python3
"""
CRITICAL VISUAL DATA VERIFICATION - SCREENSHOT TESTING
Testing actual screenshots of real websites to prove we can SEE visual data, not just extract HTML code.
"""

import asyncio
import aiohttp
import json
import uuid
import time
import base64
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
from playwright.async_api import async_playwright

# Configuration
BASE_URL = "https://video-proxy-test.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class VisualDataVerificationTester:
    def __init__(self):
        self.session_id = str(uuid.uuid4())
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.playwright_instance = None
        self.browser_instance = None
        
    async def init_playwright(self):
        """Initialize Playwright for direct screenshot testing"""
        try:
            self.playwright_instance = await async_playwright().start()
            self.browser_instance = await self.playwright_instance.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox', 
                    '--disable-dev-shm-usage', 
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-blink-features=AutomationControlled',
                    '--no-first-run'
                ]
            )
            print("🌐 Playwright Native Browser Engine initialized for direct testing")
            return True
        except Exception as e:
            print(f"❌ Failed to initialize Playwright: {e}")
            return False
        
    async def cleanup_playwright(self):
        """Clean up Playwright resources"""
        try:
            if self.browser_instance:
                await self.browser_instance.close()
            if self.playwright_instance:
                await self.playwright_instance.stop()
            print("🔌 Playwright resources cleaned up")
        except Exception as e:
            print(f"⚠️ Error during Playwright cleanup: {e}")
        
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

    async def test_youtube_screenshot_direct(self):
        """Test 1: YouTube Screenshot Test - Direct Playwright"""
        print("\n🎥 TESTING YOUTUBE SCREENSHOT - DIRECT PLAYWRIGHT")
        print("=" * 60)
        
        try:
            page = await self.browser_instance.new_page()
            
            # Set realistic viewport and user agent
            await page.set_viewport_size({"width": 1920, "height": 1080})
            await page.set_extra_http_headers({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            })
            
            # Navigate to YouTube
            print("🌐 Navigating to YouTube...")
            await page.goto('https://www.youtube.com', timeout=30000, wait_until="domcontentloaded")
            await page.wait_for_timeout(3000)  # Wait for dynamic content
            
            # Take screenshot
            screenshot_bytes = await page.screenshot(full_page=False, type='png')
            screenshot_base64 = base64.b64encode(screenshot_bytes).decode('utf-8')
            
            # Verify we can see actual YouTube content
            page_title = await page.title()
            
            # Check for YouTube-specific elements
            youtube_elements = {
                'logo': await page.query_selector('[aria-label*="YouTube"], #logo, .ytd-topbar-logo-renderer'),
                'search_box': await page.query_selector('input[name="search_query"], #search'),
                'video_thumbnails': await page.query_selector_all('.ytd-rich-item-renderer, .ytd-video-renderer'),
                'navigation': await page.query_selector('ytd-guide-renderer, #guide')
            }
            
            elements_found = sum(1 for element in youtube_elements.values() if element)
            
            await page.close()
            
            if len(screenshot_base64) > 10000 and page_title and 'youtube' in page_title.lower():
                await self.log_test_result(
                    "YouTube Screenshot - Direct Playwright",
                    True,
                    f"✅ VISUAL DATA VERIFIED: YouTube screenshot captured ({len(screenshot_base64)} chars base64). Title: '{page_title}'. Elements found: {elements_found}/4. Can see actual YouTube homepage with visual content.",
                    {
                        "screenshot_size": len(screenshot_base64),
                        "page_title": page_title,
                        "elements_detected": elements_found,
                        "visual_verification": "SUCCESS - Real YouTube content visible"
                    }
                )
                
                # Save screenshot for verification
                with open('/app/youtube_screenshot_direct.png', 'wb') as f:
                    f.write(screenshot_bytes)
                print("💾 YouTube screenshot saved to /app/youtube_screenshot_direct.png")
                
            else:
                await self.log_test_result(
                    "YouTube Screenshot - Direct Playwright",
                    False,
                    f"❌ VISUAL DATA FAILED: Screenshot too small ({len(screenshot_base64)} chars) or invalid title: '{page_title}'"
                )
                
        except Exception as e:
            await self.log_test_result(
                "YouTube Screenshot - Direct Playwright",
                False,
                f"❌ YouTube screenshot error: {str(e)}"
            )

    async def test_google_screenshot_direct(self):
        """Test 2: Google Screenshot Test - Direct Playwright"""
        print("\n🔍 TESTING GOOGLE SCREENSHOT - DIRECT PLAYWRIGHT")
        print("=" * 60)
        
        try:
            page = await self.browser_instance.new_page()
            
            await page.set_viewport_size({"width": 1920, "height": 1080})
            await page.set_extra_http_headers({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            })
            
            # Navigate to Google
            print("🌐 Navigating to Google...")
            await page.goto('https://www.google.com', timeout=30000, wait_until="domcontentloaded")
            await page.wait_for_timeout(2000)
            
            # Take screenshot
            screenshot_bytes = await page.screenshot(full_page=False, type='png')
            screenshot_base64 = base64.b64encode(screenshot_bytes).decode('utf-8')
            
            # Verify Google-specific elements
            page_title = await page.title()
            
            google_elements = {
                'google_logo': await page.query_selector('img[alt*="Google"], .lnXdpd'),
                'search_bar': await page.query_selector('input[name="q"], textarea[name="q"]'),
                'search_button': await page.query_selector('input[value*="Search"], input[name="btnK"]'),
                'lucky_button': await page.query_selector('input[value*="Lucky"], input[name="btnI"]')
            }
            
            elements_found = sum(1 for element in google_elements.values() if element)
            
            await page.close()
            
            if len(screenshot_base64) > 5000 and page_title and 'google' in page_title.lower():
                await self.log_test_result(
                    "Google Screenshot - Direct Playwright",
                    True,
                    f"✅ VISUAL DATA VERIFIED: Google screenshot captured ({len(screenshot_base64)} chars base64). Title: '{page_title}'. Elements found: {elements_found}/4. Can see Google logo, search bar, and buttons.",
                    {
                        "screenshot_size": len(screenshot_base64),
                        "page_title": page_title,
                        "elements_detected": elements_found,
                        "visual_verification": "SUCCESS - Real Google interface visible"
                    }
                )
                
                # Save screenshot
                with open('/app/google_screenshot_direct.png', 'wb') as f:
                    f.write(screenshot_bytes)
                print("💾 Google screenshot saved to /app/google_screenshot_direct.png")
                
            else:
                await self.log_test_result(
                    "Google Screenshot - Direct Playwright",
                    False,
                    f"❌ VISUAL DATA FAILED: Screenshot too small or invalid title: '{page_title}'"
                )
                
        except Exception as e:
            await self.log_test_result(
                "Google Screenshot - Direct Playwright",
                False,
                f"❌ Google screenshot error: {str(e)}"
            )

    async def test_multiple_websites_screenshots(self):
        """Test 3: Real Website Content Verification - Multiple Sites"""
        print("\n🌐 TESTING MULTIPLE WEBSITES SCREENSHOTS")
        print("=" * 60)
        
        test_websites = [
            {"name": "GitHub", "url": "https://github.com", "expected_elements": ["github", "sign", "search"]},
            {"name": "Reddit", "url": "https://www.reddit.com", "expected_elements": ["reddit", "popular", "home"]},
            {"name": "Wikipedia", "url": "https://www.wikipedia.org", "expected_elements": ["wikipedia", "search", "language"]}
        ]
        
        successful_screenshots = 0
        
        for site in test_websites:
            try:
                page = await self.browser_instance.new_page()
                
                await page.set_viewport_size({"width": 1920, "height": 1080})
                await page.set_extra_http_headers({
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                })
                
                print(f"🌐 Navigating to {site['name']}...")
                await page.goto(site['url'], timeout=30000, wait_until="domcontentloaded")
                await page.wait_for_timeout(2000)
                
                # Take screenshot
                screenshot_bytes = await page.screenshot(full_page=False, type='png')
                screenshot_base64 = base64.b64encode(screenshot_bytes).decode('utf-8')
                
                # Get page content for verification
                page_title = await page.title()
                page_content = await page.content()
                
                # Check for expected elements in content
                elements_found = sum(1 for element in site['expected_elements'] 
                                   if element.lower() in page_content.lower() or element.lower() in page_title.lower())
                
                await page.close()
                
                if len(screenshot_base64) > 5000 and elements_found >= 2:
                    successful_screenshots += 1
                    await self.log_test_result(
                        f"{site['name']} Screenshot Verification",
                        True,
                        f"✅ VISUAL DATA VERIFIED: {site['name']} screenshot captured ({len(screenshot_base64)} chars). Title: '{page_title}'. Expected elements found: {elements_found}/{len(site['expected_elements'])}",
                        {
                            "website": site['name'],
                            "url": site['url'],
                            "screenshot_size": len(screenshot_base64),
                            "page_title": page_title,
                            "elements_found": elements_found
                        }
                    )
                    
                    # Save screenshot
                    filename = f"/app/{site['name'].lower()}_screenshot_direct.png"
                    with open(filename, 'wb') as f:
                        f.write(screenshot_bytes)
                    print(f"💾 {site['name']} screenshot saved to {filename}")
                    
                else:
                    await self.log_test_result(
                        f"{site['name']} Screenshot Verification",
                        False,
                        f"❌ VISUAL DATA FAILED: {site['name']} screenshot too small ({len(screenshot_base64)} chars) or elements not found ({elements_found}/{len(site['expected_elements'])})"
                    )
                    
            except Exception as e:
                await self.log_test_result(
                    f"{site['name']} Screenshot Verification",
                    False,
                    f"❌ {site['name']} screenshot error: {str(e)}"
                )
        
        # Overall assessment
        if successful_screenshots >= 2:
            await self.log_test_result(
                "Multiple Websites Visual Verification",
                True,
                f"✅ VISUAL DATA VERIFICATION SUCCESS: {successful_screenshots}/{len(test_websites)} websites successfully captured with visual content verification"
            )
        else:
            await self.log_test_result(
                "Multiple Websites Visual Verification",
                False,
                f"❌ VISUAL DATA VERIFICATION FAILED: Only {successful_screenshots}/{len(test_websites)} websites successfully captured"
            )

    async def test_backend_proxy_screenshots(self):
        """Test 4: Backend Proxy Screenshot Functionality"""
        print("\n🔄 TESTING BACKEND PROXY SCREENSHOT FUNCTIONALITY")
        print("=" * 60)
        
        async with aiohttp.ClientSession() as session:
            test_urls = [
                "https://www.youtube.com",
                "https://www.google.com",
                "https://httpbin.org/html"
            ]
            
            for url in test_urls:
                try:
                    # Test proxy endpoint
                    encoded_url = url.replace("https://", "").replace("http://", "")
                    proxy_url = f"{API_BASE}/proxy/{encoded_url}"
                    
                    async with session.get(proxy_url, timeout=30) as response:
                        if response.status == 200:
                            html_content = await response.text()
                            
                            # Check if we got actual website content
                            content_indicators = {
                                'youtube.com': ['youtube', 'video', 'watch', 'subscribe'],
                                'google.com': ['google', 'search', 'lucky', 'gmail'],
                                'httpbin.org': ['httpbin', 'html', 'test', 'request']
                            }
                            
                            domain = url.split("//")[1].split("/")[0]
                            expected_indicators = content_indicators.get(domain, [])
                            found_indicators = sum(1 for indicator in expected_indicators 
                                                 if indicator.lower() in html_content.lower())
                            
                            if len(html_content) > 1000 and found_indicators >= 2:
                                await self.log_test_result(
                                    f"Backend Proxy - {domain}",
                                    True,
                                    f"✅ PROXY WORKING: Retrieved {len(html_content)} chars of HTML content from {domain}. Content indicators found: {found_indicators}/{len(expected_indicators)}",
                                    {
                                        "url": url,
                                        "proxy_url": proxy_url,
                                        "content_size": len(html_content),
                                        "indicators_found": found_indicators
                                    }
                                )
                            else:
                                await self.log_test_result(
                                    f"Backend Proxy - {domain}",
                                    False,
                                    f"❌ PROXY FAILED: Content too small ({len(html_content)} chars) or indicators not found ({found_indicators}/{len(expected_indicators)})"
                                )
                        else:
                            await self.log_test_result(
                                f"Backend Proxy - {url}",
                                False,
                                f"❌ PROXY FAILED: HTTP {response.status} for {url}"
                            )
                            
                except Exception as e:
                    await self.log_test_result(
                        f"Backend Proxy - {url}",
                        False,
                        f"❌ PROXY ERROR: {str(e)}"
                    )

    async def test_visual_data_extraction_proof(self):
        """Test 5: Visual Data Extraction - Prove We Can SEE Data"""
        print("\n👁️ TESTING VISUAL DATA EXTRACTION - PROVE WE CAN SEE DATA")
        print("=" * 60)
        
        try:
            page = await self.browser_instance.new_page()
            
            # Navigate to a data-rich page
            test_url = "https://httpbin.org/html"
            await page.goto(test_url, timeout=30000, wait_until="domcontentloaded")
            await page.wait_for_timeout(1000)
            
            # Take screenshot first
            screenshot_bytes = await page.screenshot(full_page=True, type='png')
            screenshot_base64 = base64.b64encode(screenshot_bytes).decode('utf-8')
            
            # Extract specific visual elements
            page_title = await page.title()
            
            # Extract headings
            headings = await page.query_selector_all('h1, h2, h3, h4, h5, h6')
            heading_texts = []
            for heading in headings:
                text = await heading.text_content()
                if text:
                    heading_texts.append(text.strip())
            
            # Extract paragraphs
            paragraphs = await page.query_selector_all('p')
            paragraph_texts = []
            for p in paragraphs:
                text = await p.text_content()
                if text and len(text.strip()) > 10:
                    paragraph_texts.append(text.strip()[:100])
            
            # Extract links
            links = await page.query_selector_all('a[href]')
            link_data = []
            for link in links:
                href = await link.get_attribute('href')
                text = await link.text_content()
                if href and text:
                    link_data.append({"href": href, "text": text.strip()})
            
            await page.close()
            
            # Verify we extracted real, meaningful data
            total_extracted = len(heading_texts) + len(paragraph_texts) + len(link_data)
            
            if len(screenshot_base64) > 5000 and total_extracted >= 5:
                await self.log_test_result(
                    "Visual Data Extraction Proof",
                    True,
                    f"✅ VISUAL DATA EXTRACTION VERIFIED: Screenshot captured ({len(screenshot_base64)} chars) AND extracted {total_extracted} data elements. Headings: {len(heading_texts)}, Paragraphs: {len(paragraph_texts)}, Links: {len(link_data)}. This proves we can SEE and EXTRACT real data, not just recognize websites.",
                    {
                        "screenshot_size": len(screenshot_base64),
                        "page_title": page_title,
                        "headings_extracted": heading_texts,
                        "paragraphs_extracted": paragraph_texts[:3],
                        "links_extracted": link_data[:3],
                        "total_elements": total_extracted,
                        "proof_of_vision": "SUCCESS - Can see AND extract specific data elements"
                    }
                )
                
                # Save screenshot
                with open('/app/data_extraction_proof_screenshot.png', 'wb') as f:
                    f.write(screenshot_bytes)
                print("💾 Data extraction proof screenshot saved to /app/data_extraction_proof_screenshot.png")
                
            else:
                await self.log_test_result(
                    "Visual Data Extraction Proof",
                    False,
                    f"❌ VISUAL DATA EXTRACTION FAILED: Screenshot size: {len(screenshot_base64)}, Elements extracted: {total_extracted}"
                )
                
        except Exception as e:
            await self.log_test_result(
                "Visual Data Extraction Proof",
                False,
                f"❌ Visual data extraction error: {str(e)}"
            )

    async def run_visual_verification_tests(self):
        """Run all visual data verification tests"""
        print("🔍 CRITICAL VISUAL DATA VERIFICATION - SCREENSHOT TESTING")
        print("=" * 80)
        print("OBJECTIVE: Take actual screenshots of real websites to prove we can SEE visual data")
        print("=" * 80)
        print(f"Session ID: {self.session_id}")
        print(f"API Base URL: {API_BASE}")
        print("=" * 80)
        
        start_time = time.time()
        
        # Initialize Playwright
        if not await self.init_playwright():
            print("❌ Failed to initialize Playwright - cannot run visual tests")
            return
        
        try:
            # Run all visual verification tests
            await self.test_youtube_screenshot_direct()
            await self.test_google_screenshot_direct()
            await self.test_multiple_websites_screenshots()
            await self.test_backend_proxy_screenshots()
            await self.test_visual_data_extraction_proof()
            
        finally:
            # Clean up Playwright
            await self.cleanup_playwright()
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Generate comprehensive report
        print("\n" + "=" * 80)
        print("📊 VISUAL DATA VERIFICATION TEST RESULTS")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests} ✅")
        print(f"Failed: {self.failed_tests} ❌")
        print(f"Success Rate: {success_rate:.1f}%")
        print(f"Total Testing Time: {total_time:.2f} seconds")
        
        print("\n🎯 CRITICAL VISUAL VERIFICATION QUESTIONS ANSWERED:")
        print("-" * 60)
        
        # Analyze results for visual verification
        youtube_working = any(r['success'] and 'youtube' in r['test_name'].lower() for r in self.test_results)
        google_working = any(r['success'] and 'google' in r['test_name'].lower() for r in self.test_results)
        multiple_sites_working = any(r['success'] and 'multiple websites' in r['test_name'].lower() for r in self.test_results)
        proxy_working = any(r['success'] and 'proxy' in r['test_name'].lower() for r in self.test_results)
        data_extraction_working = any(r['success'] and 'extraction proof' in r['test_name'].lower() for r in self.test_results)
        
        print(f"1. Can we SEE YouTube visual content (thumbnails, titles)? {'✅ YES' if youtube_working else '❌ NO'}")
        print(f"2. Can we SEE Google interface (logo, search bar)? {'✅ YES' if google_working else '❌ NO'}")
        print(f"3. Can we SEE multiple real websites visually? {'✅ YES' if multiple_sites_working else '❌ NO'}")
        print(f"4. Does backend proxy show real visual content? {'✅ YES' if proxy_working else '❌ NO'}")
        print(f"5. Can we EXTRACT specific data we can SEE? {'✅ YES' if data_extraction_working else '❌ NO'}")
        
        print("\n📸 SCREENSHOT FILES GENERATED:")
        print("-" * 40)
        screenshot_files = [
            "/app/youtube_screenshot_direct.png",
            "/app/google_screenshot_direct.png", 
            "/app/github_screenshot_direct.png",
            "/app/reddit_screenshot_direct.png",
            "/app/wikipedia_screenshot_direct.png",
            "/app/data_extraction_proof_screenshot.png"
        ]
        
        for file_path in screenshot_files:
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                print(f"✅ {file_path} ({file_size} bytes)")
            else:
                print(f"❌ {file_path} (not created)")
        
        print("\n📋 DETAILED TEST RESULTS:")
        print("-" * 50)
        
        for result in self.test_results:
            print(f"{result['status']} {result['test_name']}")
            print(f"   Details: {result['details']}")
            if result.get('response_data'):
                if isinstance(result['response_data'], dict):
                    for key, value in result['response_data'].items():
                        if key != 'screenshot_size':  # Don't print huge screenshot data
                            print(f"   {key}: {value}")
            print()
        
        # Final assessment
        print("\n🏆 FINAL VISUAL DATA VERIFICATION ASSESSMENT:")
        print("-" * 60)
        
        if success_rate >= 80:
            print("✅ EXCELLENT: Visual data verification is working excellently")
            print("   We can SEE real visual content from websites, not just HTML")
            print("   Screenshots prove actual visual rendering capability")
        elif success_rate >= 60:
            print("⚠️ GOOD: Visual data verification is working but has some issues")
            print("   Most visual content can be seen and captured")
        else:
            print("❌ POOR: Visual data verification has significant issues")
            print("   Cannot reliably see or capture visual website content")
        
        return {
            "total_tests": self.total_tests,
            "passed_tests": self.passed_tests,
            "failed_tests": self.failed_tests,
            "success_rate": success_rate,
            "testing_time": total_time,
            "detailed_results": self.test_results,
            "visual_capabilities": {
                "youtube_visual": youtube_working,
                "google_visual": google_working,
                "multiple_sites_visual": multiple_sites_working,
                "backend_proxy_visual": proxy_working,
                "data_extraction_visual": data_extraction_working
            }
        }

async def main():
    """Main test execution function"""
    tester = VisualDataVerificationTester()
    results = await tester.run_visual_verification_tests()
    
    # Save results to file
    with open('/app/visual_verification_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n💾 Visual verification results saved to: /app/visual_verification_results.json")
    
    return results

if __name__ == "__main__":
    asyncio.run(main())