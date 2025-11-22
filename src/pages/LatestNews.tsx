import { useState, useEffect } from 'react';
import { Newspaper, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import NewsCard from '@/components/NewsCard';
import { fetchLatestNews, NewsResponse } from '@/lib/newsAPI';
import { useToast } from '@/hooks/use-toast';

const LatestNews = () => {
    const { toast } = useToast();

    const [newsData, setNewsData] = useState<NewsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'economic' | 'food'>('all');

    useEffect(() => {
        const loadLatestNews = async () => {
            setLoading(true);
            try {
                const crisisType = filter === 'all' ? undefined : filter;
                const data = await fetchLatestNews(crisisType, 30);
                setNewsData(data);

                if (data.status === 'demo') {
                    toast({
                        title: 'Demo Mode',
                        description: 'Showing demo news data. Configure NEWS_API_KEY for real news.',
                    });
                }
            } catch (error) {
                console.error('Error loading latest news:', error);
                toast({
                    title: 'Failed to Load News',
                    description: 'Unable to fetch latest news articles. Please try again later.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        loadLatestNews();
    }, [filter, toast]);

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8 space-y-6">
                {/* Header */}
                <section className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <Newspaper className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="font-display text-3xl font-bold text-foreground">
                                Latest Crisis News
                            </h1>
                            <p className="text-muted-foreground">
                                Real-time global crisis news from around the world
                            </p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <Tabs
                        value={filter}
                        onValueChange={(v) => setFilter(v as 'all' | 'economic' | 'food')}
                        className="w-full"
                    >
                        <TabsList className="grid w-full max-w-md grid-cols-3">
                            <TabsTrigger value="all">All Crisis News</TabsTrigger>
                            <TabsTrigger value="economic">Economic</TabsTrigger>
                            <TabsTrigger value="food">Food</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </section>

                {/* Loading State */}
                {loading && (
                    <Card className="py-12">
                        <CardContent className="text-center">
                            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Loading Latest News...
                            </h3>
                            <p className="text-muted-foreground">
                                Fetching the most recent crisis news articles
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Error/Demo Alert */}
                {!loading && newsData && (newsData.status === 'demo' || newsData.status === 'error') && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {newsData.message || 'Using demo data. Configure NEWS_API_KEY for real news.'}
                        </AlertDescription>
                    </Alert>
                )}

                {/* News Grid */}
                {!loading && newsData && newsData.articles.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {newsData.articles.length} of {newsData.totalResults} article{newsData.totalResults !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Last updated: {new Date(newsData.fetchedAt).toLocaleString()}
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {newsData.articles.map((article, index) => (
                                <NewsCard key={`${article.url}-${index}`} article={article} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && newsData && newsData.articles.length === 0 && (
                    <Card className="py-12">
                        <CardContent className="text-center">
                            <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                No News Articles Found
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                No recent crisis news articles available at the moment.
                                Please check back later or try a different filter.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default LatestNews;
