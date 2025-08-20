import asyncio
import httpx
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import os
from bs4 import BeautifulSoup
import re

class LinkedInIntegration:
    """
    LinkedIn integration for Fellou's professional network automation.
    Handles profile searches, company analysis, and professional networking.
    """
    
    def __init__(self):
        self.access_token = os.getenv("LINKEDIN_ACCESS_TOKEN")
        self.client_id = os.getenv("LINKEDIN_CLIENT_ID")
        self.client_secret = os.getenv("LINKEDIN_CLIENT_SECRET")
        
        self.base_url = "https://api.linkedin.com/v2"
        self.session = None
        
    async def initialize(self):
        """Initialize LinkedIn integration with authentication."""
        self.session = httpx.AsyncClient(
            timeout=30.0,
            headers={
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json",
                "X-Restli-Protocol-Version": "2.0.0"
            }
        )

    async def search_profiles(self, keywords: str, location: Optional[str] = None,
                            company: Optional[str] = None, max_results: int = 50) -> Dict[str, Any]:
        """
        Search for LinkedIn profiles based on criteria.
        
        Args:
            keywords: Search keywords (job title, skills, etc.)
            location: Geographic location filter
            company: Company name filter
            max_results: Maximum profiles to return
            
        Returns:
            List of matching profiles with details
        """
        
        if not self.session:
            await self.initialize()
            
        # Build search parameters
        search_params = {
            "keywords": keywords,
            "start": 0,
            "count": min(max_results, 50)
        }
        
        if location:
            search_params["geoUrn"] = await self._get_location_urn(location)
        if company:
            search_params["companyUrn"] = await self._get_company_urn(company)
            
        try:
            response = await self.session.get(
                f"{self.base_url}/people",
                params=search_params
            )
            
            if response.status_code == 200:
                data = response.json()
                return self._process_profile_results(data)
            else:
                # Fallback to web scraping
                return await self._scrape_linkedin_search(keywords, location, company, max_results)
                
        except Exception as e:
            print(f"LinkedIn API search error: {e}")
            return await self._scrape_linkedin_search(keywords, location, company, max_results)

    async def get_profile_details(self, profile_id: str) -> Dict[str, Any]:
        """
        Get detailed information about a specific LinkedIn profile.
        
        Args:
            profile_id: LinkedIn profile identifier
            
        Returns:
            Detailed profile information
        """
        
        if not self.session:
            await self.initialize()
            
        try:
            # Get basic profile info
            profile_response = await self.session.get(
                f"{self.base_url}/people/{profile_id}",
                params={
                    "projection": "(id,firstName,lastName,headline,industry,location,summary,positions,educations,skills)"
                }
            )
            
            if profile_response.status_code == 200:
                profile_data = profile_response.json()
                
                # Enrich with additional data
                profile_data["connections"] = await self._get_connection_count(profile_id)
                profile_data["recent_activity"] = await self._get_recent_activity(profile_id)
                profile_data["retrieved_at"] = datetime.now().isoformat()
                
                return profile_data
            else:
                return {"error": "Profile not found or access denied"}
                
        except Exception as e:
            return {"error": str(e)}

    async def search_companies(self, query: str, industry: Optional[str] = None,
                             size_range: Optional[str] = None) -> Dict[str, Any]:
        """
        Search for companies on LinkedIn.
        
        Args:
            query: Company name or description
            industry: Industry filter
            size_range: Company size (e.g., "1-10", "11-50", "51-200")
            
        Returns:
            List of matching companies
        """
        
        if not self.session:
            await self.initialize()
            
        search_params = {
            "q": "universalName",
            "universalName": query
        }
        
        try:
            response = await self.session.get(f"{self.base_url}/companies", params=search_params)
            
            if response.status_code == 200:
                data = response.json()
                companies = data.get("elements", [])
                
                # Enrich company data
                enriched_companies = []
                for company in companies:
                    company_details = await self._get_company_details(company.get("id"))
                    enriched_companies.append(company_details)
                
                return {
                    "companies": enriched_companies,
                    "total_count": len(enriched_companies),
                    "retrieved_at": datetime.now().isoformat()
                }
            else:
                return {"error": "Company search failed"}
                
        except Exception as e:
            return {"error": str(e)}

    async def analyze_company_employees(self, company_name: str, 
                                      job_titles: List[str] = None) -> Dict[str, Any]:
        """
        Analyze employees of a specific company.
        
        Args:
            company_name: Name of the company
            job_titles: Specific job titles to focus on
            
        Returns:
            Employee analysis including counts, roles, and insights
        """
        
        # Search for employees
        employee_search_query = f"company:{company_name}"
        if job_titles:
            title_query = " OR ".join([f'"{title}"' for title in job_titles])
            employee_search_query += f" AND ({title_query})"
            
        employees = await self.search_profiles(employee_search_query, max_results=100)
        
        if "error" in employees:
            return employees
            
        profiles = employees.get("profiles", [])
        
        # Analyze employee data
        role_distribution = {}
        seniority_levels = {"entry": 0, "mid": 0, "senior": 0, "executive": 0}
        department_distribution = {}
        
        for profile in profiles:
            # Analyze current position
            positions = profile.get("positions", {}).get("values", [])
            if positions:
                current_position = positions[0]  # Most recent position
                title = current_position.get("title", "").lower()
                
                # Categorize role
                if title in role_distribution:
                    role_distribution[title] += 1
                else:
                    role_distribution[title] = 1
                
                # Determine seniority
                if any(word in title for word in ["intern", "junior", "associate", "entry"]):
                    seniority_levels["entry"] += 1
                elif any(word in title for word in ["senior", "lead", "principal"]):
                    seniority_levels["senior"] += 1
                elif any(word in title for word in ["director", "vp", "ceo", "cto", "executive"]):
                    seniority_levels["executive"] += 1
                else:
                    seniority_levels["mid"] += 1
                
                # Categorize department
                department = self._categorize_department(title)
                department_distribution[department] = department_distribution.get(department, 0) + 1
        
        return {
            "company": company_name,
            "total_employees_found": len(profiles),
            "role_distribution": dict(sorted(role_distribution.items(), key=lambda x: x[1], reverse=True)),
            "seniority_levels": seniority_levels,
            "department_distribution": department_distribution,
            "top_profiles": profiles[:10],  # Top 10 profiles
            "analysis_date": datetime.now().isoformat()
        }

    async def send_connection_requests(self, profile_ids: List[str], 
                                     message: str = None) -> Dict[str, Any]:
        """
        Send connection requests to multiple profiles.
        
        Args:
            profile_ids: List of LinkedIn profile IDs
            message: Optional personalized message
            
        Returns:
            Results of connection requests
        """
        
        if not self.session:
            await self.initialize()
            
        results = {"sent": [], "failed": []}
        
        for profile_id in profile_ids:
            try:
                # Prepare connection request
                connection_data = {
                    "invitee": f"urn:li:person:{profile_id}",
                    "message": message or "I'd like to connect with you."
                }
                
                response = await self.session.post(
                    f"{self.base_url}/invitations",
                    json=connection_data
                )
                
                if response.status_code == 201:
                    results["sent"].append(profile_id)
                else:
                    results["failed"].append({"profile_id": profile_id, "error": response.text})
                
                # Rate limiting
                await asyncio.sleep(2)
                
            except Exception as e:
                results["failed"].append({"profile_id": profile_id, "error": str(e)})
        
        return results

    async def post_update(self, content: str, visibility: str = "PUBLIC") -> Dict[str, Any]:
        """
        Post a status update to LinkedIn.
        
        Args:
            content: Post content
            visibility: Post visibility (PUBLIC, CONNECTIONS)
            
        Returns:
            Posted update information
        """
        
        if not self.session:
            await self.initialize()
            
        post_data = {
            "author": f"urn:li:person:{await self._get_current_user_id()}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": content
                    },
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": visibility
            }
        }
        
        try:
            response = await self.session.post(f"{self.base_url}/ugcPosts", json=post_data)
            
            if response.status_code == 201:
                return response.json()
            else:
                return {"error": f"Failed to post update: {response.text}"}
                
        except Exception as e:
            return {"error": str(e)}

    # Helper methods
    async def _get_location_urn(self, location: str) -> str:
        """Get LinkedIn URN for a location."""
        # Simplified - in practice, you'd search the locations API
        return f"urn:li:geo:{hash(location) % 1000000}"

    async def _get_company_urn(self, company: str) -> str:
        """Get LinkedIn URN for a company."""
        # Simplified - in practice, you'd search the companies API
        return f"urn:li:company:{hash(company) % 1000000}"

    async def _get_company_details(self, company_id: str) -> Dict[str, Any]:
        """Get detailed company information."""
        try:
            response = await self.session.get(f"{self.base_url}/companies/{company_id}")
            if response.status_code == 200:
                return response.json()
            else:
                return {"id": company_id, "error": "Details unavailable"}
        except:
            return {"id": company_id, "error": "Details unavailable"}

    async def _get_connection_count(self, profile_id: str) -> int:
        """Get connection count for a profile."""
        # Simplified implementation
        return 500  # Placeholder

    async def _get_recent_activity(self, profile_id: str) -> List[Dict]:
        """Get recent activity for a profile."""
        # Simplified implementation
        return []  # Placeholder

    async def _get_current_user_id(self) -> str:
        """Get current authenticated user's ID."""
        try:
            response = await self.session.get(f"{self.base_url}/me")
            if response.status_code == 200:
                return response.json().get("id")
        except:
            pass
        return "current_user"  # Placeholder

    def _categorize_department(self, title: str) -> str:
        """Categorize job title into department."""
        title_lower = title.lower()
        
        if any(word in title_lower for word in ["engineer", "developer", "architect", "tech"]):
            return "Engineering"
        elif any(word in title_lower for word in ["sales", "account", "business development"]):
            return "Sales"
        elif any(word in title_lower for word in ["marketing", "growth", "brand"]):
            return "Marketing"
        elif any(word in title_lower for word in ["product", "pm"]):
            return "Product"
        elif any(word in title_lower for word in ["hr", "people", "talent"]):
            return "HR"
        elif any(word in title_lower for word in ["finance", "accounting", "controller"]):
            return "Finance"
        else:
            return "Other"

    def _process_profile_results(self, data: Dict) -> Dict[str, Any]:
        """Process and normalize profile search results."""
        elements = data.get("elements", [])
        
        processed_profiles = []
        for element in elements:
            profile = {
                "id": element.get("id"),
                "name": f"{element.get('firstName', '')} {element.get('lastName', '')}".strip(),
                "headline": element.get("headline"),
                "location": element.get("location", {}).get("name"),
                "industry": element.get("industry"),
                "summary": element.get("summary"),
                "profile_url": f"https://linkedin.com/in/{element.get('publicIdentifier', '')}",
                "connections": element.get("numConnections", 0)
            }
            processed_profiles.append(profile)
        
        return {
            "profiles": processed_profiles,
            "total_count": len(processed_profiles),
            "retrieved_at": datetime.now().isoformat()
        }

    async def _scrape_linkedin_search(self, keywords: str, location: str,
                                    company: str, max_results: int) -> Dict[str, Any]:
        """Fallback web scraping for LinkedIn search."""
        # Simplified fallback implementation
        return {
            "profiles": [],
            "total_count": 0,
            "method": "web_scraping_fallback",
            "note": "LinkedIn API unavailable, limited results",
            "retrieved_at": datetime.now().isoformat()
        }

    async def close(self):
        """Close the HTTP session."""
        if self.session:
            await self.session.aclose()