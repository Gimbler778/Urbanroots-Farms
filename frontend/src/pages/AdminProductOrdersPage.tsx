import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, RefreshCw } from 'lucide-react'
import Layout from '@/components/Layout'
import GlowCard from '@/components/GlowCard'
import ScrollReveal from '@/components/ScrollReveal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import {
  getAdminProductOrderBatches,
  updateAdminProductOrderBatchItemStatus,
  updateAdminProductOrderBatchStatus,
} from '@/services/api'
import type { ProductOrderBatch } from '@/types'

export default function AdminProductOrdersPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [batches, setBatches] = useState<ProductOrderBatch[]>([])
  const [fetching, setFetching] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const formatINR = (value: number) => `₹${value.toLocaleString('en-IN')}`

  const loadBatches = async () => {
    setFetching(true)
    setError('')
    try {
      const response = await getAdminProductOrderBatches()
      setBatches(response)
    } catch (requestError: any) {
      setError(requestError?.response?.data?.detail || 'Unable to load product order batches.')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      navigate('/sign-in')
      return
    }
    if (!loading && user && user.role !== 'admin') {
      navigate('/')
    }
  }, [loading, navigate, user])

  useEffect(() => {
    if (user?.role === 'admin') {
      loadBatches()
    }
  }, [user?.role])

  const handleBatchStatusUpdate = async (batchId: string, status: ProductOrderBatch['status']) => {
    setSavingId(`batch-${batchId}`)
    try {
      await updateAdminProductOrderBatchStatus(batchId, status)
      await loadBatches()
    } finally {
      setSavingId(null)
    }
  }

  const handleItemStatusUpdate = async (
    batchId: string,
    itemId: string,
    status: ProductOrderBatch['items'][number]['status'],
  ) => {
    setSavingId(`item-${itemId}`)
    try {
      await updateAdminProductOrderBatchItemStatus(batchId, itemId, status)
      await loadBatches()
    } finally {
      setSavingId(null)
    }
  }

  if (loading || fetching) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl border bg-muted/30" />
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <Layout>
      <section className="bg-[radial-gradient(circle_at_top_left,_rgba(89,164,85,0.22),_transparent_38%),linear-gradient(180deg,rgba(246,250,244,0.95),rgba(255,255,255,0.92))] py-14">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <ClipboardList className="h-3.5 w-3.5" />
                Product Orders
              </div>
              <h1 className="mt-4 text-4xl font-bold">Batch Order Control</h1>
              <p className="mt-2 text-sm text-muted-foreground">Accept, reject, or update each customer product batch and individual batch items.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/admin')}>Back to Dashboard</Button>
              <Button onClick={loadBatches} disabled={fetching}>
                <RefreshCw className={`mr-2 h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="mt-8 space-y-4">
            {batches.map((batch, index) => (
              <ScrollReveal key={batch.id} delay={index * 0.04}>
                <GlowCard>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold">Batch {batch.batch_ref}</h3>
                        <p className="text-sm text-muted-foreground">{batch.customer_name} • {batch.customer_email}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{new Date(batch.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                          {batch.status}
                        </span>
                        <select
                          aria-label="Update batch status"
                          value={batch.status}
                          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                          disabled={savingId === `batch-${batch.id}`}
                          onChange={(event) => handleBatchStatusUpdate(batch.id, event.target.value as ProductOrderBatch['status'])}
                        >
                          <option value="requested">requested</option>
                          <option value="processing">processing (needs contact)</option>
                          <option value="contact_schedule">contact_schedule</option>
                          <option value="completed">completed (accept)</option>
                          <option value="cancelled">cancelled (reject)</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                      <Card className="border-primary/10">
                        <CardContent className="p-3">
                          <p className="text-xs text-muted-foreground">Active Items</p>
                          <p className="text-lg font-semibold">{batch.item_count}</p>
                        </CardContent>
                      </Card>
                      <Card className="border-primary/10">
                        <CardContent className="p-3">
                          <p className="text-xs text-muted-foreground">Subtotal</p>
                          <p className="text-lg font-semibold">{formatINR(batch.subtotal)}</p>
                        </CardContent>
                      </Card>
                      <Card className="border-primary/10">
                        <CardContent className="p-3">
                          <p className="text-xs text-muted-foreground">Tax</p>
                          <p className="text-lg font-semibold">{formatINR(batch.tax)}</p>
                        </CardContent>
                      </Card>
                      <Card className="border-primary/10">
                        <CardContent className="p-3">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-lg font-semibold">{formatINR(batch.total)}</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-5 space-y-3">
                      {batch.items.map((item) => (
                        <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-primary/10 bg-background/80 p-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover" />
                            <div>
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.category} • {item.quantity} x {formatINR(item.unit_price)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">{formatINR(item.line_total)}</span>
                            <select
                              aria-label="Update batch item status"
                              value={item.status}
                              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                              disabled={savingId === `item-${item.id}`}
                              onChange={(event) => handleItemStatusUpdate(
                                batch.id,
                                item.id,
                                event.target.value as ProductOrderBatch['items'][number]['status'],
                              )}
                            >
                              <option value="requested">requested</option>
                              <option value="processing">processing (needs contact)</option>
                              <option value="contact_schedule">contact_schedule</option>
                              <option value="completed">completed (accept)</option>
                              <option value="cancelled">cancelled (reject)</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </GlowCard>
              </ScrollReveal>
            ))}

            {batches.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No product order batches yet.
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </section>
    </Layout>
  )
}
