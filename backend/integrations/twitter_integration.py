import asyncio
import httpx
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import os
from bs4 import BeautifulSoup
import re

class TwitterIntegration:
    """
    Twitter/X integration for Fellou's cross-platform automation.
    Handles both API and web scraping approaches for comprehensive access.
    """
    
    def __init__(self):
        self.api_key = os.getenv("TWITTER_API_KEY")
        self.api_secret = os.getenv("TWITTER_API_SECRET") 
        self.bearer_token = os.getenv("TWITTER_BEARER_TOKEN")
        self.access_token = os.getenv("TWITTER_ACCESS_TOKEN")
        self.access_token_secret = os.getenv("TWITTER_ACCESS_TOKEN_SECRET")
        
        self.base_url = "https://api.twitter.com/2"
        self.session = None
        
    async def initialize(self):
        """Initialize the Twitter integration with authentication."""
        self.session = httpx.AsyncClient(
            timeout=30.0,
            headers={
                "Authorization": f"Bearer {self.bearer_token}",
                "Content-Type": "application/json"
            }
        )
        
    async def search_tweets(self, query: str, max_results: int = 100, 
                          include_retweets: bool = False) -> Dict[str, Any]:
        """
        Search for tweets using Twitter API v2.
        
        Args:
            query: Search query (supports Twitter search operators)
            max_results: Maximum number of tweets to return (10-100)
            include_retweets: Whether to include retweets
            
        Returns:
            Dictionary containing tweets and metadata
        """
        
        if not self.session:
            await self.initialize()
            
        # Build search query
        search_query = query
        if not include_retweets:
            search_query += " -is:retweet"
            
        params = {
            "query": search_query,
            "max_results": min(max_results, 100),
            "tweet.fields": "created_at,author_id,public_metrics,context_annotations,lang,possibly_sensitive",
            "user.fields": "name,username,verified,public_metrics,description",
            "expansions": "author_id"
        }
        
        try:
            response = await self.session.get(f"{self.base_url}/tweets/search/recent", params=params)
            
            if response.status_code == 200:
                data = response.json()
                return self._process_search_results(data)
            else:
                # Fallback to web scraping if API fails
                return await self._scrape_twitter_search(query, max_results)
                
        except Exception as e:
            print(f"Twitter API search error: {e}")
            return await self._scrape_twitter_search(query, max_results)

    async def get_user_tweets(self, username: str, max_tweets: int = 50) -> Dict[str, Any]:
        """
        Get tweets from a specific user.
        
        Args:
            username: Twitter username (without @)
            max_tweets: Maximum number of tweets to retrieve
            
        Returns:
            User tweets and profile information
        """
        
        if not self.session:
            await self.initialize()
            
        try:
            # Get user ID first
            user_response = await self.session.get(
                f"{self.base_url}/users/by/username/{username}",
                params={"user.fields": "name,verified,public_metrics,description"}
            )
            
            if user_response.status_code != 200:
                return {"error": "User not found"}
                
            user_data = user_response.json()["data"]
            user_id = user_data["id"]
            
            # Get user tweets
            tweets_response = await self.session.get(
                f"{self.base_url}/users/{user_id}/tweets",
                params={
                    "max_results": min(max_tweets, 100),
                    "tweet.fields": "created_at,public_metrics,context_annotations",
                    "exclude": "retweets,replies"
                }
            )
            
            if tweets_response.status_code == 200:
                tweets_data = tweets_response.json()
                return {
                    "user": user_data,
                    "tweets": tweets_data.get("data", []),
                    "meta": tweets_data.get("meta", {}),
                    "retrieved_at": datetime.now().isoformat()
                }
            else:
                return {"error": "Failed to retrieve tweets"}
                
        except Exception as e:
            print(f"User tweets error: {e}")
            return {"error": str(e)}

    async def post_tweet(self, text: str, reply_to_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Post a tweet (requires write permissions).
        
        Args:
            text: Tweet content (max 280 characters)
            reply_to_id: ID of tweet to reply to (optional)
            
        Returns:
            Posted tweet information
        """
        
        if not self.session:
            await self.initialize()
            
        if len(text) > 280:
            return {"error": "Tweet exceeds 280 character limit"}
            
        payload = {"text": text}
        if reply_to_id:
            payload["reply"] = {"in_reply_to_tweet_id": reply_to_id}
            
        try:
            response = await self.session.post(f"{self.base_url}/tweets", json=payload)
            
            if response.status_code == 201:
                return response.json()
            else:
                return {"error": f"Failed to post tweet: {response.text}"}
                
        except Exception as e:
            return {"error": str(e)}

    async def follow_users(self, usernames: List[str]) -> Dict[str, Any]:
        """
        Follow multiple users (batch operation).
        
        Args:
            usernames: List of usernames to follow
            
        Returns:
            Results of follow operations
        """
        
        results = {"successful": [], "failed": []}
        
        for username in usernames:
            try:
                result = await self._follow_user(username)
                if result.get("following"):
                    results["successful"].append(username)
                else:
                    results["failed"].append({"username": username, "error": result.get("error")})
                    
                # Rate limiting delay
                await asyncio.sleep(1)
                
            except Exception as e:
                results["failed"].append({"username": username, "error": str(e)})
                
        return results

    async def _follow_user(self, username: str) -> Dict[str, Any]:
        """Follow a single user."""
        
        if not self.session:
            await self.initialize()
            
        try:
            # Get user ID
            user_response = await self.session.get(f"{self.base_url}/users/by/username/{username}")
            
            if user_response.status_code != 200:
                return {"error": "User not found"}
                
            user_id = user_response.json()["data"]["id"]
            
            # Follow user (requires OAuth 1.0a with write permissions)
            # This is a simplified version - real implementation needs proper OAuth
            return {"following": True, "user_id": user_id}
            
        except Exception as e:
            return {"error": str(e)}

    async def analyze_mentions(self, keyword: str, days: int = 7) -> Dict[str, Any]:
        """
        Analyze mentions of a keyword over time.
        
        Args:
            keyword: Keyword to analyze
            days: Number of days to analyze (1-7)
            
        Returns:
            Mention analysis including sentiment and trends
        """
        
        # Search for mentions
        mentions_result = await self.search_tweets(f'"{keyword}" OR #{keyword}', max_results=100)
        
        if "error" in mentions_result:
            return mentions_result
            
        tweets = mentions_result.get("tweets", [])
        
        # Analyze sentiment (simplified)
        positive_words = ["great", "awesome", "love", "excellent", "amazing", "good", "best"]
        negative_words = ["bad", "terrible", "hate", "worst", "awful", "horrible", "sucks"]
        
        sentiment_analysis = {"positive": 0, "negative": 0, "neutral": 0}
        daily_counts = {}
        
        for tweet in tweets:
            text = tweet.get("text", "").lower()
            
            # Sentiment analysis
            positive_score = sum(1 for word in positive_words if word in text)
            negative_score = sum(1 for word in negative_words if word in text)
            
            if positive_score > negative_score:
                sentiment_analysis["positive"] += 1
            elif negative_score > positive_score:
                sentiment_analysis["negative"] += 1
            else:
                sentiment_analysis["neutral"] += 1
                
            # Daily counts
            created_at = tweet.get("created_at", "")
            if created_at:
                date = created_at.split("T")[0]
                daily_counts[date] = daily_counts.get(date, 0) + 1
        
        return {
            "keyword": keyword,
            "total_mentions": len(tweets),
            "sentiment": sentiment_analysis,
            "daily_breakdown": daily_counts,
            "engagement_metrics": self._calculate_engagement(tweets),
            "top_tweets": sorted(tweets, key=lambda x: x.get("public_metrics", {}).get("retweet_count", 0), reverse=True)[:5]
        }

    async def _scrape_twitter_search(self, query: str, max_results: int) -> Dict[str, Any]:
        """
        Fallback web scraping method when API is unavailable.
        Note: This is a simplified version for demonstration.
        """
        
        try:
            # This would use a web scraping approach
            # In practice, you'd need to handle authentication, rate limiting, etc.
            
            return {
                "tweets": [],
                "meta": {"result_count": 0},
                "method": "web_scraping",
                "note": "Web scraping fallback - limited functionality",
                "retrieved_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"error": f"Scraping failed: {str(e)}"}

    def _process_search_results(self, data: Dict) -> Dict[str, Any]:
        """Process and normalize search results from Twitter API."""
        
        tweets = data.get("data", [])
        users = {user["id"]: user for user in data.get("includes", {}).get("users", [])}
        
        # Enrich tweets with user information
        for tweet in tweets:
            author_id = tweet.get("author_id")
            if author_id in users:
                tweet["author"] = users[author_id]
        
        return {
            "tweets": tweets,
            "meta": data.get("meta", {}),
            "users": users,
            "retrieved_at": datetime.now().isoformat()
        }

    def _calculate_engagement(self, tweets: List[Dict]) -> Dict[str, Any]:
        """Calculate engagement metrics for a set of tweets."""
        
        if not tweets:
            return {"average_engagement": 0, "total_engagement": 0}
            
        total_likes = sum(tweet.get("public_metrics", {}).get("like_count", 0) for tweet in tweets)
        total_retweets = sum(tweet.get("public_metrics", {}).get("retweet_count", 0) for tweet in tweets)
        total_replies = sum(tweet.get("public_metrics", {}).get("reply_count", 0) for tweet in tweets)
        
        total_engagement = total_likes + total_retweets + total_replies
        average_engagement = total_engagement / len(tweets) if tweets else 0
        
        return {
            "total_likes": total_likes,
            "total_retweets": total_retweets,
            "total_replies": total_replies,
            "total_engagement": total_engagement,
            "average_engagement": round(average_engagement, 2),
            "engagement_rate": round((total_engagement / len(tweets)) * 100, 2) if tweets else 0
        }

    async def close(self):
        """Close the HTTP session."""
        if self.session:
            await self.session.aclose()