/**
 * News API Integration for Crisis Analyzer
 * TypeScript interfaces and API client for fetching crisis-related news
 */

// =====================================================================
// TypeScript Interfaces
// =====================================================================

export interface NewsArticle {
    title: string;
    description: string;
    source: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    author: string;
}

export interface NewsResponse {
    status: 'success' | 'demo' | 'error';
    country?: string;
    crisisType: string;
    totalResults: number;
    articles: NewsArticle[];
    fetchedAt: string;
    message?: string;
}

// =====================================================================
// API Configuration
// =====================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// =====================================================================
// News API Functions
// =====================================================================

/**
 * Fetch crisis-related news for a specific country
 * @param country - Country name (e.g., "Haiti", "Yemen")
 * @param crisisType - Type of crisis ("economic" or "food")
 * @param pageSize - Number of articles to fetch (default: 20)
 */
export async function fetchCrisisNews(
    country: string,
    crisisType: 'economic' | 'food',
    pageSize: number = 20
): Promise<NewsResponse> {
    try {
        const params = new URLSearchParams({
            country,
            type: crisisType,
            pageSize: pageSize.toString()
        });

        console.log(`📰 Fetching news for ${country} (${crisisType})...`);

        const response = await fetch(`${API_BASE_URL}/api/news?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error (${response.status}):`, errorText);
            throw new Error(`Failed to fetch news: ${response.status}`);
        }

        const data: NewsResponse = await response.json();
        console.log(`✅ Fetched ${data.articles.length} articles for ${country}`);

        return data;

    } catch (error) {
        console.error('❌ Error fetching crisis news:', error);

        // Return fallback data on error
        return {
            status: 'error',
            crisisType,
            country,
            totalResults: 0,
            articles: [],
            fetchedAt: new Date().toISOString(),
            message: error instanceof Error ? error.message : 'Failed to fetch news'
        };
    }
}

/**
 * Fetch latest global crisis news
 * @param crisisType - Optional filter ("economic", "food", or undefined for all)
 * @param pageSize - Number of articles to fetch (default: 30)
 */
export async function fetchLatestNews(
    crisisType?: 'economic' | 'food',
    pageSize: number = 30
): Promise<NewsResponse> {
    try {
        const params = new URLSearchParams({
            pageSize: pageSize.toString()
        });

        if (crisisType) {
            params.append('type', crisisType);
        }

        console.log(`📰 Fetching latest crisis news (${crisisType || 'all'})...`);

        const response = await fetch(`${API_BASE_URL}/api/news/latest?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error (${response.status}):`, errorText);
            throw new Error(`Failed to fetch latest news: ${response.status}`);
        }

        const data: NewsResponse = await response.json();
        console.log(`✅ Fetched ${data.articles.length} latest articles`);

        return data;

    } catch (error) {
        console.error('❌ Error fetching latest news:', error);

        // Return fallback data on error
        return {
            status: 'error',
            crisisType: crisisType || 'all',
            totalResults: 0,
            articles: [],
            fetchedAt: new Date().toISOString(),
            message: error instanceof Error ? error.message : 'Failed to fetch news'
        };
    }
}

/**
 * Format date for display
 * @param dateString - ISO date string
 */
export function formatNewsDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) {
            return 'Just now';
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    } catch (error) {
        return 'Unknown date';
    }
}
