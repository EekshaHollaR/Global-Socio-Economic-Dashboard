import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Newspaper, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import NewsCard from '@/components/NewsCard';
import { fetchCrisisNews, NewsResponse } from '@/lib/newsAPI';
import { useToast } from '@/hooks/use-toast';

const NewsPage = () => {
    const { country, type } = useParams<{ country: string; type: 'economic' | 'food' }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [newsData, setNewsData] = useState<NewsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNews = async () => {
            if (!country || !type) {
                toast({
                    title: 'Invalid Parameters',
                    description: 'Country and crisis type are required',
                    variant: 'destructive',
                });
                navigate('/crisis-analyzer');
                return;
            }

            if (type !== 'economic' && type !== 'food') {
                toast({
                    title: 'Invalid Crisis Type',
                    description: 'Crisis type must be either "economic" or "food"',
                    variant: 'destructive',
                });
                navigate('/crisis-analyzer');
                return;
            }

            setLoading(true);
            try {
                const data = await fetchCrisisNews(country, type, 20);
                setNewsData(data);

                if (data.status === 'demo') {
                    toast({
                        title: 'Demo Mode',
                        description: 'Showing demo news data. Configure NEWS_API_KEY for real news.',
                    });
                }
            } catch (error) {
                console.error('Error loading news:', error);
                toast({
                    title: 'Failed to Load News',
                    description: 'Unable to fetch news articles. Please try again later.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        loadNews();
    }, [country, type, navigate, toast]);

    const handleBack = () => {
        navigate('/crisis-analyzer');
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Crisis Analyzer
                    </Button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Newspaper className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            {country} - {type === 'economic' ? 'Economic' : 'Food'} Crisis News
                        </h1>
                        <p className="text-muted-foreground">
                            Latest news articles related to {type} crisis in {country}
                        </p>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <Card className="py-12">
                        <CardContent className="text-center">
                            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Loading News Articles...
                            </h3>
                            <p className="text-muted-foreground">
                                Fetching the latest {type} crisis news for {country}
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
                                Found {newsData.totalResults} article{newsData.totalResults !== 1 ? 's' : ''}
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
                                No recent news articles found for {type} crisis in {country}.
                                Try checking back later or explore other countries.
                            </p>
                            <Button onClick={handleBack}>
                                Return to Crisis Analyzer
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default NewsPage;
