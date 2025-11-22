import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, User } from 'lucide-react';
import { NewsArticle, formatNewsDate } from '@/lib/newsAPI';

interface NewsCardProps {
    article: NewsArticle;
}

const NewsCard = ({ article }: NewsCardProps) => {
    const handleReadMore = () => {
        if (article.url) {
            window.open(article.url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
            {/* Thumbnail Image */}
            {article.urlToImage && (
                <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Hide image if it fails to load
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>
            )}

            <CardContent className="flex-1 flex flex-col p-6">
                {/* Source Badge */}
                <div className="mb-3">
                    <Badge variant="secondary" className="text-xs">
                        {article.source}
                    </Badge>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2">
                    {article.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                    {article.description || 'No description available'}
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    {article.publishedAt && (
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatNewsDate(article.publishedAt)}</span>
                        </div>
                    )}
                    {article.author && article.author !== 'Unknown' && (
                        <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{article.author}</span>
                        </div>
                    )}
                </div>

                {/* Read More Button */}
                <Button
                    onClick={handleReadMore}
                    variant="default"
                    size="sm"
                    className="w-full"
                    disabled={!article.url}
                >
                    Read in detail
                    <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    );
};

export default NewsCard;
