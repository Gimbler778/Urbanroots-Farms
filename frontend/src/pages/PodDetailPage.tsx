import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowBigDown, ArrowBigUp, ArrowLeft, CalendarDays, Leaf, MessageCircleReply, Ruler, Sprout, Star, Trash2 } from 'lucide-react'
import Layout from '@/components/Layout'
import PodRentalDialog from '@/components/PodRentalDialog'
import FarmBotDialog from '@/components/FarmBotDialog'
import GlowCard from '@/components/GlowCard'
import ScrollReveal from '@/components/ScrollReveal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { podPlansBySlug } from '@/data/podPlans'
import { createPodReview, deletePodReview, getPodReviews, replyToPodReview, votePodReview } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import type { PodReview } from '@/types'

export default function PodDetailPage() {
  const { podId } = useParams<{ podId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [farmBotOpen, setFarmBotOpen] = useState(false)
  const [reviews, setReviews] = useState<PodReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewPageSize] = useState(6)
  const [reviewSort, setReviewSort] = useState<'newest' | 'oldest' | 'top'>('newest')
  const [topLevelCount, setTopLevelCount] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [newReviewBody, setNewReviewBody] = useState('')
  const [newReviewRating, setNewReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [openReplyId, setOpenReplyId] = useState<string | null>(null)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null)
  const [collapsedThreadById, setCollapsedThreadById] = useState<Record<string, boolean>>({})
  const [votePendingId, setVotePendingId] = useState<string | null>(null)
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null)

  const pod = podId ? podPlansBySlug[podId] : undefined

  const reviewsByParent = useMemo(() => {
    const grouped = new Map<string | null, PodReview[]>()
    reviews.forEach((review) => {
      const key = review.parent_id
      const existing = grouped.get(key) ?? []
      existing.push(review)
      grouped.set(key, existing)
    })
    return grouped
  }, [reviews])

  const descendantCountById = useMemo(() => {
    const countCache = new Map<string, number>()

    const countDescendants = (reviewId: string): number => {
      const cached = countCache.get(reviewId)
      if (cached !== undefined) {
        return cached
      }

      const children = reviewsByParent.get(reviewId) ?? []
      let total = children.length
      children.forEach((child) => {
        total += countDescendants(child.id)
      })

      countCache.set(reviewId, total)
      return total
    }

    reviews.forEach((review) => {
      countDescendants(review.id)
    })

    return countCache
  }, [reviews, reviewsByParent])

  const loadReviews = useCallback(async (podPlanId: string, page: number, sort: 'newest' | 'oldest' | 'top') => {
    setReviewsLoading(true)
    setReviewsError(null)
    try {
      const response = await getPodReviews(podPlanId, page, reviewPageSize, sort)
      setReviews(response.reviews)
      setTopLevelCount(response.total_top_level)
      setHasNextPage(response.has_next)
    } catch {
      setReviewsError('Could not load pod reviews right now.')
    } finally {
      setReviewsLoading(false)
    }
  }, [reviewPageSize])

  useEffect(() => {
    if (!pod?.id) {
      return
    }
    loadReviews(pod.id, reviewPage, reviewSort)
  }, [pod?.id, reviewPage, reviewSort, loadReviews])

  const handleCreateReview = async (event: FormEvent) => {
    event.preventDefault()
    if (!pod?.id) {
      return
    }
    if (!user) {
      navigate('/sign-in')
      return
    }

    setSubmittingReview(true)
    try {
      await createPodReview(pod.id, { body: newReviewBody, rating: newReviewRating })
      setNewReviewBody('')
      setNewReviewRating(5)
      setReviewPage(1)
      await loadReviews(pod.id, 1, reviewSort)
    } catch {
      setReviewsError('Could not post your review. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleReply = async (reviewId: string) => {
    if (!pod?.id) {
      return
    }
    if (!user) {
      navigate('/sign-in')
      return
    }

    const body = (replyDrafts[reviewId] ?? '').trim()
    if (!body) {
      return
    }

    setSubmittingReplyId(reviewId)
    try {
      await replyToPodReview(pod.id, reviewId, { body })
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: '' }))
      setCollapsedThreadById((prev) => ({ ...prev, [reviewId]: false }))
      setOpenReplyId(null)
      await loadReviews(pod.id, reviewPage, reviewSort)
    } catch {
      setReviewsError('Could not post your reply. Please try again.')
    } finally {
      setSubmittingReplyId(null)
    }
  }

  const handleVote = async (review: PodReview, direction: -1 | 1) => {
    if (!pod?.id) {
      return
    }
    if (!user) {
      navigate('/sign-in')
      return
    }

    const nextValue: -1 | 0 | 1 = review.user_vote === direction ? 0 : direction
    const delta = nextValue - review.user_vote
    const previous = reviews.map((item) => ({ ...item }))

    setVotePendingId(review.id)
    setReviews((current) =>
      current.map((item) =>
        item.id === review.id
          ? { ...item, user_vote: nextValue, score: item.score + delta, upvotes: item.upvotes + delta }
          : item,
      ),
    )

    try {
      await votePodReview(pod.id, review.id, { value: nextValue })
    } catch {
      setReviews(previous)
      setReviewsError('Could not update your vote. Please try again.')
    } finally {
      setVotePendingId(null)
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!pod?.id) {
      return
    }

    setDeletePendingId(reviewId)
    try {
      await deletePodReview(pod.id, reviewId)
      await loadReviews(pod.id, reviewPage, reviewSort)
    } catch {
      setReviewsError('Could not delete this review. Please try again.')
    } finally {
      setDeletePendingId(null)
    }
  }

  const renderReviewTree = (review: PodReview) => {
    const replies = reviewsByParent.get(review.id) ?? []
    const hasReplies = replies.length > 0
    const isCollapsed = collapsedThreadById[review.id] ?? false
    const descendantCount = descendantCountById.get(review.id) ?? replies.length
    const showRail = hasReplies || review.depth > 0

    return (
      <div
        key={review.id}
        className={showRail ? 'relative mt-4 border-l border-dashed border-border pl-6' : 'mt-4'}
      >
        {showRail ? (
          <span aria-hidden="true" className="absolute left-0 top-4 w-4 border-t border-dashed border-border" />
        ) : null}

        {hasReplies ? (
          <button
            type="button"
            onClick={() => setCollapsedThreadById((prev) => ({ ...prev, [review.id]: !isCollapsed }))}
            className="group absolute left-[-10px] top-2 inline-flex h-5 w-5 items-center justify-center rounded-sm border border-border bg-background text-[10px] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={isCollapsed ? 'Expand replies' : 'Collapse replies'}
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

        <div className="relative w-full rounded-2xl border border-primary/10 bg-card/90 p-4">
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
                placeholder="Share your reply"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleReply(review.id)}
                  disabled={submittingReplyId === review.id || !(replyDrafts[review.id] ?? '').trim()}
                >
                  {submittingReplyId === review.id ? 'Posting...' : 'Post Reply'}
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
            + {descendantCount} {descendantCount === 1 ? 'reply' : 'replies'} hidden
          </button>
        ) : null}

        {!isCollapsed ? replies.map((reply) => renderReviewTree(reply)) : null}
      </div>
    )
  }

  if (!pod) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="rounded-[28px] border border-border bg-card p-10 text-center shadow-sm">
            <h1 className="text-3xl font-bold">Pod Not Found</h1>
            <p className="mt-3 text-muted-foreground">The pod you selected is not available in the current catalog.</p>
            <Button className="mt-6" onClick={() => navigate('/rent-a-pod')}>Back to Rent a Pod</Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <section className="bg-[radial-gradient(circle_at_top_left,_rgba(110,185,88,0.18),_transparent_42%),linear-gradient(180deg,rgba(245,250,244,0.95),rgba(255,255,255,0.92))] py-12">
        <div className="container mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate('/rent-a-pod')} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Rent a Pod
          </Button>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <ScrollReveal yOffset={24}>
              <div className="space-y-4">
                <div className="overflow-hidden rounded-[28px] border border-primary/15 bg-white shadow-[0_20px_55px_rgba(52,77,48,0.12)]">
                  {(() => {
                    const src = pod.images[selectedImage]
                    const isTopView = typeof src === 'string' && src.toLowerCase().includes('top')
                    return (
                      <img
                        src={src}
                        alt={pod.name}
                        className={`h-[460px] w-full ${isTopView ? 'object-contain bg-muted/30' : 'object-cover'}`}
                      />
                    )
                  })()}
                </div>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                  {pod.images.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`overflow-hidden rounded-2xl border-2 transition-all ${selectedImage === index ? 'border-primary shadow-lg shadow-primary/15' : 'border-transparent hover:border-primary/30'}`}
                    >
                      <img src={image} alt={`${pod.name} ${index + 1}`} className="h-20 w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.08} yOffset={24}>
              <div className="space-y-6 rounded-[30px] border border-primary/10 bg-card/95 p-8 shadow-[0_18px_50px_rgba(40,63,42,0.08)] backdrop-blur-sm">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  <Sprout className="h-3.5 w-3.5" />
                  {pod.size} Pod
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{pod.name}</h1>
                  <p className="mt-3 text-lg text-muted-foreground">{pod.longDescription}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Monthly</p>
                    <p className="mt-2 text-2xl font-bold text-primary">₹{pod.monthlyPrice.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Area</p>
                    <p className="mt-2 text-lg font-semibold">{pod.area}</p>
                  </div>
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Capacity</p>
                    <p className="mt-2 text-lg font-semibold">{pod.maxPlants}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-2xl border p-4">
                    <Ruler className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">Space match</p>
                      <p className="text-sm text-muted-foreground">{pod.bestFor.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border p-4">
                    <Leaf className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">Best crops</p>
                      <p className="text-sm text-muted-foreground">{pod.crops.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="flex-1" onClick={() => setDialogOpen(true)}>
                    <CalendarDays className="mr-2 h-5 w-5" />
                    Choose Plan
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setFarmBotOpen(true)}>
                    Talk to FarmBot
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            <ScrollReveal>
              <GlowCard className="h-full">
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                  <CardDescription>What makes this pod fit for long-term urban farming.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pod.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 rounded-2xl bg-primary/5 p-4">
                      <Star className="mt-1 h-4 w-4 text-primary" />
                      <p className="text-sm text-muted-foreground">{feature}</p>
                    </div>
                  ))}
                </CardContent>
              </GlowCard>
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <GlowCard className="h-full">
                <CardHeader>
                  <CardTitle>Included Services</CardTitle>
                  <CardDescription>The support layer bundled into the rental plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pod.services.map((service) => (
                    <div key={service} className="flex items-start gap-3 rounded-2xl bg-primary/5 p-4">
                      <Sprout className="mt-1 h-4 w-4 text-primary" />
                      <p className="text-sm text-muted-foreground">{service}</p>
                    </div>
                  ))}
                </CardContent>
              </GlowCard>
            </ScrollReveal>
          </div>

          <ScrollReveal className="mt-10">
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
                <CardDescription>Technical details for planning your installation.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {Object.entries(pod.specifications).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{key}</p>
                    <p className="mt-2 font-semibold">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </ScrollReveal>

          <Separator className="my-12" />

          <div>
            <h2 className="text-3xl font-bold">Customer Reviews</h2>
            <Card className="mt-6 overflow-hidden">
              <CardHeader>
                <CardTitle>Share your pod experience</CardTitle>
                <CardDescription>
                  Threaded discussions are enabled. Post a review and reply to other growers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateReview} className="space-y-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label htmlFor="pod-rating" className="text-sm font-medium text-foreground">Rating</label>
                    <select
                      id="pod-rating"
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
                    placeholder={user ? 'Write your review for this pod...' : 'Sign in to post your review'}
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
                    <label htmlFor="review-sort" className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Sort</label>
                    <select
                      id="review-sort"
                      value={reviewSort}
                      onChange={(event) => {
                        setReviewSort(event.target.value as 'newest' | 'oldest' | 'top')
                        setReviewPage(1)
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
                  <motion.div
                    initial={{ opacity: 0.4, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-8 text-center"
                  >
                    <p className="text-muted-foreground">No reviews yet for the {pod.name.toLowerCase()}. Be the first to post.</p>
                  </motion.div>
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

      <PodRentalDialog open={dialogOpen} onOpenChange={setDialogOpen} pod={pod} />
      <FarmBotDialog open={farmBotOpen} onOpenChange={setFarmBotOpen} />
    </Layout>
  )
}
