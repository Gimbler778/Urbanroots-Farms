import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useProductImages } from '@/hooks/useProductImages';
import { equipmentData, servicesData } from '@/data/products';
import { ArrowBigDown, ArrowBigUp, ArrowLeft, CreditCard, MessageCircleReply, ShoppingCart, Trash2 } from 'lucide-react';
import { createProductReview, deleteProductReview, getProductReviews, replyToProductReview, voteProductReview } from '@/services/api';
import type { ProductReview } from '@/types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Find product from both equipment and services
  const product = [...equipmentData, ...servicesData].find((p) => p.id === id);
  
  // Load real images from backend image service
  const { images: productImages } = useProductImages(
    product?.name || '',
    product?.category || 'equipment',
    product?.images || []
  );
  
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPageSize] = useState(8);
  const [reviewSort, setReviewSort] = useState<'newest' | 'oldest' | 'top'>('newest');
  const [topLevelCount, setTopLevelCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [newReviewBody, setNewReviewBody] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);
  const [collapsedThreadById, setCollapsedThreadById] = useState<Record<string, boolean>>({});
  const [votePendingId, setVotePendingId] = useState<string | null>(null);
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);
  const displayPrice = `₹${product?.price?.toLocaleString('en-IN') ?? '0'}`;

  // Use productImages if available, otherwise fall back to product.images

  if (!product) {
    return (
      <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, productImages[selectedImage] || product.images[selectedImage]);
  };

  const handleBuyNow = () => {
    const added = addToCart(product, productImages[selectedImage] || product.images[selectedImage]);
    if (added) {
      navigate('/cart');
    }
  };

  const reviewsByParent = useMemo(() => {
    const grouped = new Map<string | null, ProductReview[]>();
    reviews.forEach((review) => {
      const key = review.parent_id;
      const existing = grouped.get(key) ?? [];
      existing.push(review);
      grouped.set(key, existing);
    });
    return grouped;
  }, [reviews]);

  const descendantCountById = useMemo(() => {
    const countCache = new Map<string, number>();

    const countDescendants = (reviewId: string): number => {
      const cached = countCache.get(reviewId);
      if (cached !== undefined) {
        return cached;
      }

      const children = reviewsByParent.get(reviewId) ?? [];
      let total = children.length;
      children.forEach((child) => {
        total += countDescendants(child.id);
      });

      countCache.set(reviewId, total);
      return total;
    };

    reviews.forEach((review) => {
      countDescendants(review.id);
    });

    return countCache;
  }, [reviews, reviewsByParent]);

  const loadReviews = useCallback(async (productId: string, page: number, sort: 'newest' | 'oldest' | 'top') => {
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const response = await getProductReviews(productId, page, reviewPageSize, sort);
      setReviews(response.reviews);
      setTopLevelCount(response.total_top_level);
      setHasNextPage(response.has_next);
    } catch {
      setReviewsError('Could not load product reviews right now.');
    } finally {
      setReviewsLoading(false);
    }
  }, [reviewPageSize]);

  useEffect(() => {
    if (!product?.id) {
      return;
    }
    loadReviews(product.id, reviewPage, reviewSort);
  }, [product?.id, reviewPage, reviewSort, loadReviews]);

  const handleCreateReview = async (event: FormEvent) => {
    event.preventDefault();
    if (!product?.id) {
      return;
    }
    if (!user) {
      navigate('/sign-in');
      return;
    }

    setSubmittingReview(true);
    try {
      await createProductReview(product.id, { body: newReviewBody, rating: newReviewRating });
      setNewReviewBody('');
      setNewReviewRating(5);
      setReviewPage(1);
      await loadReviews(product.id, 1, reviewSort);
    } catch {
      setReviewsError('Could not post your review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!product?.id) {
      return;
    }
    if (!user) {
      navigate('/sign-in');
      return;
    }

    const body = (replyDrafts[reviewId] ?? '').trim();
    if (!body) {
      return;
    }

    setSubmittingReplyId(reviewId);
    try {
      await replyToProductReview(product.id, reviewId, { body });
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: '' }));
      setCollapsedThreadById((prev) => ({ ...prev, [reviewId]: false }));
      setOpenReplyId(null);
      await loadReviews(product.id, reviewPage, reviewSort);
    } catch {
      setReviewsError('Could not post your comment. Please try again.');
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const handleVote = async (review: ProductReview, direction: -1 | 1) => {
    if (!product?.id) {
      return;
    }
    if (!user) {
      navigate('/sign-in');
      return;
    }

    const nextValue: -1 | 0 | 1 = review.user_vote === direction ? 0 : direction;
    const delta = nextValue - review.user_vote;

    setVotePendingId(review.id);
    setReviews((current) =>
      current.map((item) =>
        item.id === review.id
          ? { ...item, user_vote: nextValue, score: item.score + delta, upvotes: item.upvotes + delta }
          : item,
      ),
    );

    try {
      await voteProductReview(product.id, review.id, { value: nextValue });
    } catch {
      await loadReviews(product.id, reviewPage, reviewSort);
      setReviewsError('Could not update your vote. Please try again.');
    } finally {
      setVotePendingId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!product?.id) {
      return;
    }

    setDeletePendingId(reviewId);
    try {
      await deleteProductReview(product.id, reviewId);
      await loadReviews(product.id, reviewPage, reviewSort);
    } catch {
      setReviewsError('Could not delete this comment. Please try again.');
    } finally {
      setDeletePendingId(null);
    }
  };

  const renderReviewTree = (review: ProductReview) => {
    const replies = reviewsByParent.get(review.id) ?? [];
    const hasReplies = replies.length > 0;
    const isCollapsed = collapsedThreadById[review.id] ?? false;
    const descendantCount = descendantCountById.get(review.id) ?? replies.length;
    const showRail = hasReplies || review.depth > 0;

    return (
      <div
        key={review.id}
        className={showRail ? 'relative mt-4 border-l border-dashed border-border/60 pl-6' : 'mt-4'}
      >
        {showRail ? (
          <span aria-hidden="true" className="absolute left-0 top-4 w-4 border-t border-dashed border-border/60" />
        ) : null}

        {hasReplies ? (
          <button
            type="button"
            onClick={() => setCollapsedThreadById((prev) => ({ ...prev, [review.id]: !isCollapsed }))}
            className="group absolute left-[-10px] top-2 inline-flex h-5 w-5 items-center justify-center rounded-sm border border-border bg-background text-[10px] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={isCollapsed ? 'Expand comments' : 'Collapse comments'}
            title={isCollapsed ? 'Expand this thread' : 'Collapse this thread'}
          >
            {isCollapsed ? '+' : '-'}
          </button>
        ) : showRail ? (
          <span
            aria-hidden="true"
            className="absolute left-[-10px] top-2 inline-flex h-5 w-5 items-center justify-center rounded-sm border border-border bg-muted text-[10px] font-semibold text-muted-foreground"
          >
            ·
          </span>
        ) : null}

        <div className="w-full rounded-2xl border border-primary/10 bg-card/90 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{review.author_name}</p>
            <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleString()}</span>
            {review.rating ? (
              <span className="ml-auto text-xs font-medium text-amber-600">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{review.is_deleted ? '[deleted]' : review.body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1">
            <Button
              variant={review.user_vote === 1 ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-2"
              onClick={() => handleVote(review, 1)}
              disabled={votePendingId === review.id || review.is_deleted}
              aria-label="Upvote"
            >
              <ArrowBigUp className="h-4 w-4" />
            </Button>
            <span className="min-w-10 text-center text-sm font-semibold text-foreground">{review.score}</span>
            <Button
              variant={review.user_vote === -1 ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-2"
              onClick={() => handleVote(review, -1)}
              disabled={votePendingId === review.id || review.is_deleted}
              aria-label="Downvote"
            >
              <ArrowBigDown className="h-4 w-4" />
            </Button>

            {!review.is_deleted ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setOpenReplyId(openReplyId === review.id ? null : review.id)}
              >
                <MessageCircleReply className="mr-1.5 h-3.5 w-3.5" />
                Reply
              </Button>
            ) : null}

            {user && user.id === review.user_id && !review.is_deleted ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                onClick={() => handleDelete(review.id)}
                disabled={deletePendingId === review.id}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                {deletePendingId === review.id ? 'Deleting...' : 'Delete'}
              </Button>
            ) : null}
          </div>

          {openReplyId === review.id ? (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyDrafts[review.id] ?? ''}
                onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [review.id]: event.target.value }))}
                rows={3}
                maxLength={2000}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Write your comment"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleReply(review.id)}
                  disabled={submittingReplyId === review.id || !(replyDrafts[review.id] ?? '').trim()}
                >
                  {submittingReplyId === review.id ? 'Posting...' : 'Post Comment'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setOpenReplyId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {hasReplies && isCollapsed ? (
          <button
            type="button"
            onClick={() => setCollapsedThreadById((prev) => ({ ...prev, [review.id]: false }))}
            className="mt-2 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            + {descendantCount} {descendantCount === 1 ? 'comment' : 'comments'} hidden
          </button>
        ) : null}

        {!isCollapsed ? replies.map((reply) => renderReviewTree(reply)) : null}
      </div>
    );
  };

  return (
    <Layout>
    <section className="bg-[radial-gradient(circle_at_top_left,_rgba(66,125,78,0.14),_transparent_42%),linear-gradient(180deg,rgba(248,252,248,0.95),rgba(255,255,255,0.92))] py-10">
    <div className="container mx-auto px-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/products')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        {/* Left Side - Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-3xl border-2 border-primary/10 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-lg flex items-center justify-center">
            <img
              src={productImages[selectedImage] || product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {productImages.length > 1 && (
            <div className={`grid gap-4 ${productImages.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === index
                      ? 'border-primary shadow-lg shadow-primary/30 scale-100'
                      : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Product Info */}
        <div className="space-y-6 rounded-[30px] border border-primary/10 bg-card/95 p-8 shadow-[0_18px_50px_rgba(40,63,42,0.08)] backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                {product.category === 'equipment' ? 'Equipment' : 'Service'}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
            <p className="text-xl text-muted-foreground mb-4">
              {product.description}
            </p>
            <div className="text-4xl font-bold text-primary mb-6">
              {displayPrice}
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              {product.longDescription}
            </p>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-3">Key Features</h2>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {product.specifications && (
            <>
              <Separator />
              <div>
                <h2 className="text-xl font-semibold mb-3">Specifications</h2>
                <dl className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex">
                      <dt className="font-medium w-1/3">{key}:</dt>
                      <dd className="text-muted-foreground w-2/3">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleAddToCart}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button onClick={handleBuyNow} size="lg" className="flex-1">
              <CreditCard className="mr-2 h-5 w-5" />
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
    </section>

      {/* Reviews Section */}
      <section className="py-12">
      <div className="container mx-auto px-4">
      <Separator className="mb-10" />
      <div>
        <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
        <Card>
          <CardHeader>
            <CardTitle>Share your experience</CardTitle>
            <CardDescription>Post a review and add comments in threaded discussions.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateReview} className="space-y-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label htmlFor="product-rating" className="text-sm font-medium text-foreground">Rating</label>
                <select
                  id="product-rating"
                  value={newReviewRating}
                  onChange={(event) => setNewReviewRating(Number(event.target.value))}
                  className="w-28 rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={newReviewBody}
                onChange={(event) => setNewReviewBody(event.target.value)}
                rows={4}
                maxLength={2000}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={user ? 'Write your review...' : 'Sign in to post your review'}
                disabled={!user || submittingReview}
              />
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={!user || submittingReview || !newReviewBody.trim()}>
                  {submittingReview ? 'Posting...' : 'Post Review'}
                </Button>
                {!user ? <p className="text-xs text-muted-foreground">Please sign in to review.</p> : null}
              </div>
            </form>

            {reviewsError ? <p className="mt-4 text-sm text-destructive">{reviewsError}</p> : null}

            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Showing page {reviewPage}. Top-level reviews: {topLevelCount}</p>
              <div className="flex items-center gap-2">
                <label htmlFor="product-review-sort" className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Sort</label>
                <select
                  id="product-review-sort"
                  value={reviewSort}
                  onChange={(event) => {
                    setReviewSort(event.target.value as 'newest' | 'oldest' | 'top');
                    setReviewPage(1);
                  }}
                  className="rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="top">Most liked</option>
                </select>
              </div>
            </div>

            {reviewsLoading ? (
              <p className="mt-6 text-sm text-muted-foreground">Loading reviews...</p>
            ) : (reviewsByParent.get(null) ?? []).length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-8 text-center">
                <p className="text-muted-foreground">
                  Be the first to review this {product.category === 'equipment' ? 'equipment' : 'service'}.
                </p>
              </div>
            ) : (
              <div className="mt-6">
                {(reviewsByParent.get(null) ?? []).map((review) => renderReviewTree(review))}
                <div className="mt-6 flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setReviewPage((prev) => Math.max(1, prev - 1))}
                    disabled={reviewPage <= 1 || reviewsLoading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {reviewPage}</span>
                  <Button
                    variant="outline"
                    onClick={() => setReviewPage((prev) => prev + 1)}
                    disabled={!hasNextPage || reviewsLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </section>
    </Layout>
  );
}
