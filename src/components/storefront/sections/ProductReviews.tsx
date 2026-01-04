/**
 * ProductReviews Section Component
 * Displays customer reviews and ratings (Step 2.2)
 */

import { Star, ThumbsUp, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ProductReviewsConfig {
  title?: string;
  showRatingBreakdown?: boolean;
  showPhotos?: boolean;
  sortBy?: 'newest' | 'highest' | 'lowest' | 'helpful';
  pageSize?: number;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  photos?: string[];
}

interface ProductReviewsProps {
  config: ProductReviewsConfig;
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
  ratingBreakdown?: { stars: number; count: number }[];
  onWriteReview?: () => void;
  onHelpful?: (reviewId: string) => void;
}

export function ProductReviews({
  config,
  reviews = [],
  averageRating = 4.5,
  totalReviews = 128,
  ratingBreakdown,
  onWriteReview,
  onHelpful,
}: ProductReviewsProps) {
  const {
    title = 'Customer Reviews',
    showRatingBreakdown = true,
    showPhotos = true,
  } = config;

  // Placeholder reviews if none provided
  const displayReviews: Review[] = reviews.length > 0 ? reviews : [
    {
      id: '1',
      author: 'Sarah M.',
      rating: 5,
      title: 'Absolutely love it!',
      content: 'This product exceeded my expectations. The quality is outstanding and it arrived quickly. Would definitely recommend!',
      date: '2 weeks ago',
      helpful: 12,
      photos: [],
    },
    {
      id: '2',
      author: 'John D.',
      rating: 4,
      title: 'Great product, minor issues',
      content: 'Overall very satisfied with my purchase. The only small issue was the packaging could be better. Product itself is fantastic.',
      date: '1 month ago',
      helpful: 8,
      photos: [],
    },
    {
      id: '3',
      author: 'Emily R.',
      rating: 5,
      title: 'Perfect gift',
      content: 'Bought this as a gift and the recipient loved it. Beautiful design and excellent craftsmanship.',
      date: '1 month ago',
      helpful: 5,
      photos: [],
    },
  ];

  // Default rating breakdown
  const displayBreakdown = ratingBreakdown || [
    { stars: 5, count: 89 },
    { stars: 4, count: 24 },
    { stars: 3, count: 10 },
    { stars: 2, count: 3 },
    { stars: 1, count: 2 },
  ];

  const maxCount = Math.max(...displayBreakdown.map(b => b.count));

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-muted text-muted'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
          <Button onClick={onWriteReview}>Write a Review</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Rating Summary */}
          {showRatingBreakdown && (
            <div className="md:col-span-1">
              <div className="bg-muted/30 rounded-lg p-6">
                {/* Average Rating */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
                  <div className="flex justify-center mb-2">
                    {renderStars(Math.round(averageRating), 'md')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {totalReviews} reviews
                  </p>
                </div>

                {/* Rating Breakdown */}
                <div className="space-y-2">
                  {displayBreakdown.map(({ stars, count }) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-sm w-3">{stars}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <Progress
                        value={(count / maxCount) * 100}
                        className="flex-1 h-2"
                      />
                      <span className="text-sm text-muted-foreground w-8">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className={showRatingBreakdown ? 'md:col-span-2' : 'md:col-span-3'}>
            <div className="space-y-6">
              {displayReviews.map(review => (
                <div key={review.id} className="border-b pb-6 last:border-0">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(review.rating)}
                        <span className="font-medium">{review.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.author} • {review.date}
                      </p>
                    </div>
                  </div>

                  {/* Review Content */}
                  <p className="text-sm leading-relaxed mb-3">{review.content}</p>

                  {/* Review Photos */}
                  {showPhotos && review.photos && review.photos.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {review.photos.map((photo, idx) => (
                        <div
                          key={idx}
                          className="w-16 h-16 rounded overflow-hidden bg-muted"
                        >
                          <img
                            src={photo}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Review Actions */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => onHelpful?.(review.id)}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Helpful ({review.helpful})
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
