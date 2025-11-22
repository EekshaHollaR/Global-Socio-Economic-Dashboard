"""
News Integration using Google News RSS Feeds
No API key required - uses public RSS feeds
"""

import feedparser
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import urllib.parse

# =====================================================================
# Configuration
# =====================================================================

# Google News RSS base URL
GOOGLE_NEWS_BASE = 'https://news.google.com/rss'

# Cache configuration
_news_cache: Dict[str, Dict] = {}
CACHE_DURATION_HOURS = 6

# =====================================================================
# Helper Functions
# =====================================================================

def _get_cache_key(country: str, crisis_type: str) -> str:
    """Generate cache key for news queries"""
    return f"{country}_{crisis_type}"

def _is_cache_valid(cache_entry: Dict) -> bool:
    """Check if cached data is still valid"""
    if not cache_entry:
        return False
    
    try:
        cached_time = datetime.fromisoformat(cache_entry.get('timestamp', ''))
        expiry_time = cached_time + timedelta(hours=CACHE_DURATION_HOURS)
        return datetime.now() < expiry_time
    except:
        return False

def _get_crisis_keywords(crisis_type: str) -> str:
    """Get search keywords based on crisis type"""
    keywords = {
        'economic': 'economic crisis OR financial crisis OR recession OR debt crisis',
        'food': 'food crisis OR food shortage OR famine OR hunger crisis'
    }
    return keywords.get(crisis_type.lower(), 'crisis')

def _fetch_google_news(query: str, max_items: int = 20) -> List[Dict]:
    """
    Fetch news from Google News RSS
    
    Args:
        query: Search query
        max_items: Maximum number of articles
    
    Returns:
        List of formatted news articles
    """
    try:
        # Encode query for URL
        encoded_query = urllib.parse.quote(query)
        feed_url = f"{GOOGLE_NEWS_BASE}/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"
        
        print(f"📰 Fetching from Google News: {query}")
        print(f"   URL: {feed_url}")
        
        # Parse RSS feed
        feed = feedparser.parse(feed_url)
        
        articles = []
        for entry in feed.entries[:max_items]:
            # Extract source from title (Google News format: "Title - Source")
            title = entry.get('title', 'No title')
            source = 'Google News'
            
            if ' - ' in title:
                parts = title.rsplit(' - ', 1)
                title = parts[0]
                source = parts[1] if len(parts) > 1 else 'Google News'
            
            # Get description
            description = entry.get('summary', entry.get('description', 'No description available'))
            # Remove HTML tags from description
            if description:
                import re
                description = re.sub('<[^<]+?>', '', description)
            
            articles.append({
                'title': title,
                'description': description[:300] if description else 'No description available',
                'source': source,
                'url': entry.get('link', ''),
                'urlToImage': '',  # Google News RSS doesn't provide images
                'publishedAt': entry.get('published', datetime.now().isoformat()),
                'author': source
            })
        
        print(f"✅ Fetched {len(articles)} articles from Google News")
        return articles
        
    except Exception as e:
        print(f"❌ Error fetching from Google News: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

# =====================================================================
# News Fetching Functions
# =====================================================================

def fetch_crisis_news(country: str, crisis_type: str, page_size: int = 20) -> Dict:
    """
    Fetch crisis-related news for a specific country using Google News
    
    Args:
        country: Country name (e.g., "Haiti", "Yemen")
        crisis_type: Type of crisis ("economic" or "food")
        page_size: Number of articles to fetch
    
    Returns:
        Dict with 'articles' list and metadata
    """
    try:
        # Check cache first
        cache_key = _get_cache_key(country, crisis_type)
        if cache_key in _news_cache and _is_cache_valid(_news_cache[cache_key]):
            print(f"✅ Returning cached news for {country} ({crisis_type})")
            return _news_cache[cache_key]['data']
        
        # Build search query
        crisis_keywords = _get_crisis_keywords(crisis_type)
        query = f"{country} {crisis_keywords}"
        
        print(f"📰 Fetching news for {country} ({crisis_type})")
        
        # Fetch from Google News
        articles = _fetch_google_news(query, page_size)
        
        result = {
            'status': 'success',
            'country': country,
            'crisisType': crisis_type,
            'totalResults': len(articles),
            'articles': articles,
            'fetchedAt': datetime.now().isoformat(),
            'source': 'Google News RSS'
        }
        
        # Cache the result
        _news_cache[cache_key] = {
            'timestamp': datetime.now().isoformat(),
            'data': result
        }
        
        return result
        
    except Exception as e:
        print(f"❌ Error fetching news: {str(e)}")
        import traceback
        traceback.print_exc()
        return _get_demo_news(country, crisis_type)

def fetch_latest_crisis_news(crisis_type: Optional[str] = None, page_size: int = 30) -> Dict:
    """
    Fetch latest global crisis news using Google News
    
    Args:
        crisis_type: Optional filter ("economic" or "food"), None for all
        page_size: Number of articles to fetch
    
    Returns:
        Dict with 'articles' list and metadata
    """
    try:
        # Build search query
        if crisis_type:
            query = _get_crisis_keywords(crisis_type)
        else:
            query = "global crisis OR economic crisis OR food crisis"
        
        print(f"📰 Fetching latest global crisis news ({crisis_type or 'all'})")
        
        # Fetch from Google News
        articles = _fetch_google_news(query, page_size)
        
        result = {
            'status': 'success',
            'crisisType': crisis_type or 'all',
            'totalResults': len(articles),
            'articles': articles,
            'fetchedAt': datetime.now().isoformat(),
            'source': 'Google News RSS'
        }
        
        return result
        
    except Exception as e:
        print(f"❌ Error fetching latest news: {str(e)}")
        import traceback
        traceback.print_exc()
        return _get_demo_latest_news(crisis_type)

# =====================================================================
# Demo/Fallback Data
# =====================================================================

def _get_demo_news(country: str, crisis_type: str) -> Dict:
    """Return demo news data when fetching fails"""
    demo_articles = [
        {
            'title': f'{country} Faces {crisis_type.title()} Crisis Challenges',
            'description': f'Recent reports indicate growing concerns about {crisis_type} stability in {country}.',
            'source': 'Demo News',
            'url': 'https://example.com',
            'urlToImage': '',
            'publishedAt': datetime.now().isoformat(),
            'author': 'Demo Author'
        },
        {
            'title': f'Experts Analyze {crisis_type.title()} Situation in {country}',
            'description': f'Economic analysts discuss the current {crisis_type} indicators affecting {country}.',
            'source': 'Demo Economics',
            'url': 'https://example.com',
            'urlToImage': '',
            'publishedAt': (datetime.now() - timedelta(days=1)).isoformat(),
            'author': 'Demo Analyst'
        }
    ]
    
    return {
        'status': 'demo',
        'country': country,
        'crisisType': crisis_type,
        'totalResults': len(demo_articles),
        'articles': demo_articles,
        'fetchedAt': datetime.now().isoformat(),
        'message': 'Using demo data - Google News RSS unavailable'
    }

def _get_demo_latest_news(crisis_type: Optional[str]) -> Dict:
    """Return demo latest news data when fetching fails"""
    demo_articles = [
        {
            'title': 'Global Economic Outlook Shows Mixed Signals',
            'description': 'International financial institutions report varied economic indicators across regions.',
            'source': 'Demo Global News',
            'url': 'https://example.com',
            'urlToImage': '',
            'publishedAt': datetime.now().isoformat(),
            'author': 'Demo Reporter'
        },
        {
            'title': 'Food Security Concerns Rise in Multiple Regions',
            'description': 'UN agencies highlight increasing food insecurity challenges worldwide.',
            'source': 'Demo World Report',
            'url': 'https://example.com',
            'urlToImage': '',
            'publishedAt': (datetime.now() - timedelta(hours=12)).isoformat(),
            'author': 'Demo Correspondent'
        }
    ]
    
    return {
        'status': 'demo',
        'crisisType': crisis_type or 'all',
        'totalResults': len(demo_articles),
        'articles': demo_articles,
        'fetchedAt': datetime.now().isoformat(),
        'message': 'Using demo data - Google News RSS unavailable'
    }

# =====================================================================
# Cache Management
# =====================================================================

def clear_news_cache():
    """Clear all cached news data"""
    global _news_cache
    _news_cache = {}
    print("✅ News cache cleared")
