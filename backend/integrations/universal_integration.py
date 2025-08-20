import asyncio
from typing import Dict, List, Any, Optional
from .twitter_integration import TwitterIntegration
from .linkedin_integration import LinkedInIntegration
from datetime import datetime
import json

class UniversalIntegration:
    """
    Universal API manager for Fellou's 50+ platform integrations.
    Provides unified interface for all external platform interactions.
    """
    
    def __init__(self):
        self.integrations = {}
        self.initialize_integrations()
        
    def initialize_integrations(self):
        """Initialize all available integrations."""
        self.integrations = {
            "twitter": TwitterIntegration(),
            "linkedin": LinkedInIntegration(),
            # Add more integrations as they're implemented
            "reddit": None,  # Placeholder for future implementation
            "github": None,  # Placeholder for future implementation
            "facebook": None,  # Placeholder for future implementation
            "instagram": None,  # Placeholder for future implementation
        }
        
    async def execute_cross_platform_workflow(self, workflow_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a workflow across multiple platforms simultaneously.
        
        Args:
            workflow_config: Configuration defining cross-platform actions
            
        Returns:
            Aggregated results from all platforms
        """
        
        platforms = workflow_config.get("platforms", [])
        action = workflow_config.get("action")
        parameters = workflow_config.get("parameters", {})
        
        results = {}
        
        # Execute actions on each platform in parallel
        tasks = []
        for platform in platforms:
            if platform in self.integrations and self.integrations[platform]:
                task = self._execute_platform_action(platform, action, parameters)
                tasks.append((platform, task))
        
        # Wait for all tasks to complete
        if tasks:
            completed_tasks = await asyncio.gather(*[task for _, task in tasks], return_exceptions=True)
            
            for (platform, _), result in zip(tasks, completed_tasks):
                if isinstance(result, Exception):
                    results[platform] = {"error": str(result)}
                else:
                    results[platform] = result
        
        return {
            "workflow_id": workflow_config.get("workflow_id", "unknown"),
            "action": action,
            "platforms": platforms,
            "results": results,
            "executed_at": datetime.now().isoformat(),
            "success_count": len([r for r in results.values() if "error" not in r]),
            "total_platforms": len(platforms)
        }

    async def _execute_platform_action(self, platform: str, action: str, parameters: Dict) -> Dict[str, Any]:
        """Execute a specific action on a platform."""
        
        integration = self.integrations.get(platform)
        if not integration:
            return {"error": f"Platform {platform} not available"}
        
        try:
            # Route action to appropriate method based on platform and action type
            if platform == "twitter":
                return await self._execute_twitter_action(integration, action, parameters)
            elif platform == "linkedin":
                return await self._execute_linkedin_action(integration, action, parameters)
            else:
                return {"error": f"Action {action} not implemented for {platform}"}
                
        except Exception as e:
            return {"error": str(e)}

    async def _execute_twitter_action(self, twitter: TwitterIntegration, action: str, parameters: Dict) -> Dict[str, Any]:
        """Execute Twitter-specific actions."""
        
        if action == "search":
            query = parameters.get("query", "")
            max_results = parameters.get("max_results", 50)
            return await twitter.search_tweets(query, max_results)
            
        elif action == "analyze_mentions":
            keyword = parameters.get("keyword", "")
            days = parameters.get("days", 7)
            return await twitter.analyze_mentions(keyword, days)
            
        elif action == "follow_users":
            usernames = parameters.get("usernames", [])
            return await twitter.follow_users(usernames)
            
        elif action == "post_tweet":
            text = parameters.get("text", "")
            reply_to = parameters.get("reply_to_id")
            return await twitter.post_tweet(text, reply_to)
            
        elif action == "get_user_tweets":
            username = parameters.get("username", "")
            max_tweets = parameters.get("max_tweets", 50)
            return await twitter.get_user_tweets(username, max_tweets)
            
        else:
            return {"error": f"Unknown Twitter action: {action}"}

    async def _execute_linkedin_action(self, linkedin: LinkedInIntegration, action: str, parameters: Dict) -> Dict[str, Any]:
        """Execute LinkedIn-specific actions."""
        
        if action == "search_profiles":
            keywords = parameters.get("keywords", "")
            location = parameters.get("location")
            company = parameters.get("company")
            max_results = parameters.get("max_results", 50)
            return await linkedin.search_profiles(keywords, location, company, max_results)
            
        elif action == "analyze_company":
            company_name = parameters.get("company_name", "")
            job_titles = parameters.get("job_titles", [])
            return await linkedin.analyze_company_employees(company_name, job_titles)
            
        elif action == "send_connections":
            profile_ids = parameters.get("profile_ids", [])
            message = parameters.get("message")
            return await linkedin.send_connection_requests(profile_ids, message)
            
        elif action == "post_update":
            content = parameters.get("content", "")
            visibility = parameters.get("visibility", "PUBLIC")
            return await linkedin.post_update(content, visibility)
            
        elif action == "search_companies":
            query = parameters.get("query", "")
            industry = parameters.get("industry")
            size_range = parameters.get("size_range")
            return await linkedin.search_companies(query, industry, size_range)
            
        else:
            return {"error": f"Unknown LinkedIn action: {action}"}

    async def social_media_monitoring(self, keywords: List[str], platforms: List[str] = None) -> Dict[str, Any]:
        """
        Monitor mentions across multiple social media platforms.
        
        Args:
            keywords: Keywords to monitor
            platforms: Platforms to monitor (default: all available)
            
        Returns:
            Aggregated monitoring results
        """
        
        if platforms is None:
            platforms = ["twitter", "linkedin"]  # Default platforms
        
        monitoring_results = {}
        
        for platform in platforms:
            if platform not in self.integrations or not self.integrations[platform]:
                continue
                
            platform_results = {}
            
            for keyword in keywords:
                try:
                    if platform == "twitter":
                        result = await self.integrations[platform].analyze_mentions(keyword)
                    elif platform == "linkedin":
                        result = await self.integrations[platform].search_profiles(keyword, max_results=20)
                    else:
                        result = {"error": f"Monitoring not implemented for {platform}"}
                        
                    platform_results[keyword] = result
                    
                    # Rate limiting between keywords
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    platform_results[keyword] = {"error": str(e)}
            
            monitoring_results[platform] = platform_results
        
        # Aggregate insights
        aggregated_insights = self._aggregate_monitoring_insights(monitoring_results, keywords)
        
        return {
            "keywords": keywords,
            "platforms": platforms,
            "detailed_results": monitoring_results,
            "aggregated_insights": aggregated_insights,
            "monitoring_timestamp": datetime.now().isoformat()
        }

    def _aggregate_monitoring_insights(self, results: Dict, keywords: List[str]) -> Dict[str, Any]:
        """Aggregate insights from cross-platform monitoring."""
        
        insights = {
            "total_mentions": 0,
            "platform_breakdown": {},
            "keyword_performance": {},
            "sentiment_overview": {"positive": 0, "negative": 0, "neutral": 0},
            "top_performing_content": []
        }
        
        for platform, platform_data in results.items():
            platform_mentions = 0
            
            for keyword, keyword_data in platform_data.items():
                if "error" in keyword_data:
                    continue
                    
                # Count mentions
                if platform == "twitter":
                    mentions = keyword_data.get("total_mentions", 0)
                    sentiment = keyword_data.get("sentiment", {})
                    
                    platform_mentions += mentions
                    insights["sentiment_overview"]["positive"] += sentiment.get("positive", 0)
                    insights["sentiment_overview"]["negative"] += sentiment.get("negative", 0)
                    insights["sentiment_overview"]["neutral"] += sentiment.get("neutral", 0)
                    
                elif platform == "linkedin":
                    mentions = keyword_data.get("total_count", 0)
                    platform_mentions += mentions
                
                # Track keyword performance
                if keyword not in insights["keyword_performance"]:
                    insights["keyword_performance"][keyword] = {"mentions": 0, "platforms": []}
                
                insights["keyword_performance"][keyword]["mentions"] += mentions
                if platform not in insights["keyword_performance"][keyword]["platforms"]:
                    insights["keyword_performance"][keyword]["platforms"].append(platform)
            
            insights["platform_breakdown"][platform] = platform_mentions
            insights["total_mentions"] += platform_mentions
        
        return insights

    async def bulk_content_distribution(self, content: str, platforms: List[str], 
                                      platform_specific_config: Dict = None) -> Dict[str, Any]:
        """
        Distribute content across multiple platforms simultaneously.
        
        Args:
            content: Base content to distribute
            platforms: Target platforms
            platform_specific_config: Platform-specific customizations
            
        Returns:
            Distribution results
        """
        
        if platform_specific_config is None:
            platform_specific_config = {}
        
        distribution_results = {}
        
        for platform in platforms:
            try:
                # Customize content for platform
                platform_content = platform_specific_config.get(platform, {}).get("content", content)
                
                if platform == "twitter":
                    # Ensure content fits Twitter's character limit
                    if len(platform_content) > 280:
                        platform_content = platform_content[:277] + "..."
                    
                    result = await self.integrations[platform].post_tweet(platform_content)
                    
                elif platform == "linkedin":
                    visibility = platform_specific_config.get(platform, {}).get("visibility", "PUBLIC")
                    result = await self.integrations[platform].post_update(platform_content, visibility)
                    
                else:
                    result = {"error": f"Content distribution not implemented for {platform}"}
                
                distribution_results[platform] = result
                
                # Rate limiting between platforms
                await asyncio.sleep(2)
                
            except Exception as e:
                distribution_results[platform] = {"error": str(e)}
        
        return {
            "content": content,
            "platforms": platforms,
            "results": distribution_results,
            "distributed_at": datetime.now().isoformat(),
            "success_count": len([r for r in distribution_results.values() if "error" not in r])
        }

    def get_available_platforms(self) -> List[str]:
        """Get list of available platform integrations."""
        return [platform for platform, integration in self.integrations.items() if integration is not None]

    def get_platform_capabilities(self, platform: str) -> Dict[str, Any]:
        """Get capabilities for a specific platform."""
        
        capabilities = {
            "twitter": {
                "actions": ["search", "analyze_mentions", "follow_users", "post_tweet", "get_user_tweets"],
                "data_types": ["tweets", "user_profiles", "engagement_metrics", "sentiment_analysis"],
                "rate_limits": {"search": 300, "post": 300, "follow": 400},
                "authentication": "Bearer Token"
            },
            "linkedin": {
                "actions": ["search_profiles", "analyze_company", "send_connections", "post_update", "search_companies"],
                "data_types": ["profiles", "companies", "connections", "posts"],
                "rate_limits": {"search": 100, "connections": 100, "posts": 20},
                "authentication": "OAuth 2.0"
            }
        }
        
        return capabilities.get(platform, {"error": "Platform not available"})

    async def close_all_integrations(self):
        """Close all integration sessions."""
        for integration in self.integrations.values():
            if integration and hasattr(integration, 'close'):
                await integration.close()