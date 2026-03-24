import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronDown, ChevronUp, Leaf, Package2, ReceiptText, Sprout } from 'lucide-react'
import Layout from '@/components/Layout'
import GlowCard from '@/components/GlowCard'
import ScrollReveal from '@/components/ScrollReveal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cancelOrderBatch, cancelOrderBatchItem, cancelPodRental, getMyOrders } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import type { OrderHistoryItem } from '@/types'

const statusTone: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-sky-100 text-sky-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  requested: 'bg-amber-100 text-amber-700',
  contact_schedule: 'bg-sky-100 text-sky-700',
  contact_scheduled: 'bg-sky-100 text-sky-700',
  renting: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
  refund_pending: 'bg-orange-100 text-orange-700',
}

export default function MyOrdersPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState<OrderHistoryItem[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [confirmCancelOrder, setConfirmCancelOrder] = useState<{
    kind: 'pod' | 'batch' | 'item'
    order: OrderHistoryItem
    itemId?: string
    itemLabel?: string
  } | null>(null)
  const [cancelSuccessMessage, setCancelSuccessMessage] = useState('')
  const [expandedBatches, setExpandedBatches] = useState<Record<string, boolean>>({})

  const formatINR = (value: number) => `₹${value.toLocaleString('en-IN')}`
  const formatStatusLabel = (value: string) => value.replace(/_/g, ' ')

  const buildInvoiceHtml = (order: OrderHistoryItem) => {
    const rows = (order.product_items || [])
      .map((item) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;">${item.name}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;text-align:right;">₹${item.unit_price.toLocaleString('en-IN')}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;text-align:right;">₹${item.line_total.toLocaleString('en-IN')}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;text-align:right;text-transform:capitalize;">${item.status}</td>
        </tr>
      `)
      .join('')

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>UrbanRoots Invoice ${order.batch_ref || order.id}</title>
        </head>
        <body style="font-family:'Segoe UI',Arial,sans-serif;background:#f3f6ef;padding:24px;color:#253223;">
          <div style="max-width:920px;margin:0 auto;background:#fff;border:1px solid #dbe6d2;border-radius:14px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#3f7f3c,#74b267);padding:18px 24px;color:#fff;">
              <h1 style="margin:0;font-size:28px;">UrbanRoots Invoice</h1>
              <p style="margin:6px 0 0;opacity:.95;">Batch Reference: <strong>${order.batch_ref || order.id.slice(0, 8)}</strong></p>
            </div>
            <div style="padding:24px;">
              <div style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;">
                <div>
                  <div style="font-size:13px;color:#51644f;">Booked On</div>
                  <div style="font-size:15px;font-weight:600;">${new Date(order.created_at).toLocaleString('en-IN')}</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:13px;color:#51644f;">Status</div>
                  <div style="font-size:15px;font-weight:600;text-transform:capitalize;">${order.status.replace('_', ' ')}</div>
                </div>
              </div>

              <table style="width:100%;border-collapse:collapse;margin-top:22px;font-size:14px;">
                <thead style="background:#f0f7ec;">
                  <tr>
                    <th style="padding:10px 12px;text-align:left;">Product</th>
                    <th style="padding:10px 12px;text-align:center;">Qty</th>
                    <th style="padding:10px 12px;text-align:right;">Unit</th>
                    <th style="padding:10px 12px;text-align:right;">Line Total</th>
                    <th style="padding:10px 12px;text-align:right;">Item Status</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>

              <div style="margin-top:18px;display:flex;justify-content:flex-end;">
                <div style="min-width:280px;border:1px solid #dbe6d2;border-radius:10px;padding:12px;background:#fafdf8;">
                  <div style="display:flex;justify-content:space-between;font-size:18px;"><span>Total</span><strong>₹${(order.total || 0).toLocaleString('en-IN')}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }

  const handlePrintInvoice = (order: OrderHistoryItem) => {
    if (order.type !== 'product') {
      return
    }

    const printWindow = window.open('', '_blank', 'width=1024,height=768')
    if (!printWindow) {
      setActionMessage('Please allow popups in your browser to print invoices.')
      return
    }

    printWindow.document.write(buildInvoiceHtml(order))
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 300)
  }

  const loadOrders = async () => {
    setFetching(true)
    setError('')
    try {
      const response = await getMyOrders()
      setOrders(response)
    } catch (requestError: any) {
      setError(requestError?.response?.data?.detail || 'Unable to load your order history right now.')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      navigate('/sign-in')
    }
  }, [loading, navigate, user])

  useEffect(() => {
    if (!user) {
      return
    }

    loadOrders()
  }, [user])

  const handleCancelSubscription = async (rentalId: string) => {
    setActionLoadingId(`pod-${rentalId}`)
    setActionMessage('')
    try {
      const result = await cancelPodRental(rentalId)
      setCancelSuccessMessage(result.message)
      setActionMessage('')
      await loadOrders()
    } catch (requestError: any) {
      setActionMessage(requestError?.response?.data?.detail || 'Unable to cancel this subscription right now.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancelBatch = async (order: OrderHistoryItem) => {
    setActionLoadingId(`batch-${order.id}`)
    setActionMessage('')
    try {
      const result = await cancelOrderBatch(order.id)
      setCancelSuccessMessage(result.message)
      await loadOrders()
    } catch (requestError: any) {
      setActionMessage(requestError?.response?.data?.detail || 'Unable to cancel this batch right now.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancelBatchItem = async (order: OrderHistoryItem, itemId: string) => {
    setActionLoadingId(`item-${itemId}`)
    setActionMessage('')
    try {
      const result = await cancelOrderBatchItem(order.id, itemId)
      setCancelSuccessMessage(result.message)
      await loadOrders()
    } catch (requestError: any) {
      setActionMessage(requestError?.response?.data?.detail || 'Unable to cancel this item right now.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const isCancelledStatus = (status: string) => status === 'cancelled' || status === 'refund_pending'

  const counts = useMemo(() => ({
    all: orders.length,
    pod: orders.filter((item) => item.type === 'pod_rental' && !isCancelledStatus(item.status)).length,
    product: orders
      .filter((item) => item.type === 'product')
      .reduce((sum, item) => sum + (item.item_count || 0), 0),
    productBatches: orders.filter((item) => item.type === 'product').length,
    cancelled: orders.filter((item) => isCancelledStatus(item.status)).length,
  }), [orders])

  const renderOrders = (items: OrderHistoryItem[]) => {
    if (fetching) {
      return (
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-[28px] border bg-muted/40" />
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <Card>
          <CardContent className="p-8 text-center text-sm text-red-600">{error}</CardContent>
        </Card>
      )
    }

    if (items.length === 0) {
      return (
        <Card>
          <CardContent className="p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ReceiptText className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold">No orders yet</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Product orders and pod rental requests linked to your account will show up here.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => navigate('/rent-a-pod')}>Rent a Pod</Button>
              <Button variant="outline" onClick={() => navigate('/products')}>Browse Products</Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid gap-5 lg:grid-cols-2">
        {items.map((order, index) => (
          <ScrollReveal key={order.id} delay={index * 0.05} yOffset={24}>
            <GlowCard className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {order.type === 'pod_rental' ? <Sprout className="h-3.5 w-3.5 text-primary" /> : <Package2 className="h-3.5 w-3.5 text-primary" />}
                      {order.type === 'pod_rental' ? 'Pod Rental' : 'Product Order'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{order.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{order.subtitle}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusTone[order.status] || 'bg-muted text-foreground'}`}>
                    {formatStatusLabel(order.status)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-primary/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Created</p>
                    <p className="mt-2 text-sm font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-2xl bg-primary/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Value</p>
                    <p className="mt-2 text-sm font-semibold">
                      {order.type === 'pod_rental'
                        ? `${formatINR(order.monthly_price || 0)}/mo`
                        : `${formatINR(order.total || 0)}`}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-primary/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reference</p>
                    <p className="mt-2 text-sm font-semibold">{order.batch_ref || order.id.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 rounded-3xl border border-primary/10 bg-background/80 p-4">
                  {Object.entries(order.details).map(([key, value]) => (
                    <div key={key} className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 text-sm last:border-b-0 last:pb-0">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="max-w-[60%] text-right font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                {order.type === 'product' && order.product_items && order.product_items.length > 0 ? (
                  <div className="mt-5 rounded-3xl border border-primary/10 bg-white/80 p-4">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between text-left"
                      onClick={() => setExpandedBatches((prev) => ({ ...prev, [order.id]: !prev[order.id] }))}
                    >
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Batch Items</p>
                        <p className="mt-1 text-sm font-semibold">
                          {order.item_count || 0} active products • {order.product_items.length} line items
                        </p>
                      </div>
                      {expandedBatches[order.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {expandedBatches[order.id] ? (
                      <div className="mt-4 space-y-3">
                        {order.product_items.map((item) => (
                          <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-primary/10 bg-background/80 p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover" />
                              <div>
                                <Link to={`/products/${item.product_id}`} className="font-semibold hover:text-primary">{item.name}</Link>
                                <p className="text-xs text-muted-foreground">
                                  {item.quantity} x {formatINR(item.unit_price)} • {item.category}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] ${statusTone[item.status] || 'bg-muted text-foreground'}`}>
                                {formatStatusLabel(item.status)}
                              </span>
                              <span className="text-sm font-semibold">{formatINR(item.line_total)}</span>
                              {order.can_cancel && item.status === 'requested' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-rose-200 text-rose-700 hover:bg-rose-50"
                                  disabled={actionLoadingId === `item-${item.id}`}
                                  onClick={() => setConfirmCancelOrder({
                                    kind: 'item',
                                    order,
                                    itemId: item.id,
                                    itemLabel: item.name,
                                  })}
                                >
                                  {actionLoadingId === `item-${item.id}` ? 'Cancelling...' : 'Cancel Item'}
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {order.type === 'pod_rental' && ['requested', 'contact_scheduled', 'renting'].includes(order.status) ? (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      className="border-rose-200 text-rose-700 hover:bg-rose-50"
                      disabled={actionLoadingId === `pod-${order.id}`}
                      onClick={() => setConfirmCancelOrder({ kind: 'pod', order })}
                    >
                      {actionLoadingId === `pod-${order.id}` ? 'Cancelling...' : 'Cancel Subscription'}
                    </Button>
                  </div>
                ) : null}

                {order.type === 'product' ? (
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <Button variant="outline" onClick={() => handlePrintInvoice(order)}>
                      Print Invoice
                    </Button>

                    {order.can_cancel ? (
                    <Button
                      variant="outline"
                      className="border-rose-200 text-rose-700 hover:bg-rose-50"
                      disabled={actionLoadingId === `batch-${order.id}`}
                      onClick={() => setConfirmCancelOrder({ kind: 'batch', order })}
                    >
                      {actionLoadingId === `batch-${order.id}` ? 'Cancelling...' : 'Cancel Full Batch'}
                    </Button>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </GlowCard>
          </ScrollReveal>
        ))}
      </div>
    )
  }

  return (
    <Layout>
      <section className="bg-[radial-gradient(circle_at_top_left,_rgba(110,185,88,0.16),_transparent_38%),linear-gradient(180deg,rgba(245,250,244,0.95),rgba(255,255,255,0.94))] py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <ReceiptText className="h-3.5 w-3.5" />
              My Orders
            </div>
            <h1 className="mt-5 text-5xl font-bold">Track everything linked to your account</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Pod rental requests and product orders live in one place so you can keep up with request status, installation timing, and booked purchases.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'All records', value: counts.all, icon: ReceiptText },
              { label: 'Pod rentals', value: counts.pod, icon: Sprout },
              { label: 'Cancelled orders', value: counts.cancelled, icon: ReceiptText },
              { label: 'Products in orders', value: counts.product, icon: Package2 },
              { label: 'Product batches', value: counts.productBatches, icon: Package2 },
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] border border-primary/10 bg-white/85 p-5 shadow-sm backdrop-blur-sm">
                <item.icon className="h-5 w-5 text-primary" />
                <p className="mt-5 text-3xl font-bold">{item.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {actionMessage ? (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="p-4 text-sm text-foreground">{actionMessage}</CardContent>
            </Card>
          ) : null}

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="h-auto rounded-2xl bg-muted/60 p-1">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pod">Pod Rentals</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled Orders</TabsTrigger>
              <TabsTrigger value="product">Product Batches</TabsTrigger>
            </TabsList>
            <TabsContent value="all">{renderOrders(orders)}</TabsContent>
            <TabsContent value="pod">{renderOrders(orders.filter((item) => item.type === 'pod_rental' && !isCancelledStatus(item.status)))}</TabsContent>
            <TabsContent value="cancelled">{renderOrders(orders.filter((item) => isCancelledStatus(item.status)))}</TabsContent>
            <TabsContent value="product">{renderOrders(orders.filter((item) => item.type === 'product'))}</TabsContent>
          </Tabs>

          <Card className="mt-8 border-primary/10 bg-primary/5">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold">Want to add another installation?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Open the pod catalog again to start another rental request with a different pod size.
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => navigate('/rent-a-pod')}>
                  <Leaf className="mr-2 h-4 w-4" />
                  Rent a Pod
                </Button>
                <Button variant="outline" onClick={() => navigate('/products')}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  View Products
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {confirmCancelOrder ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => setConfirmCancelOrder(null)}
            aria-label="Close cancel dialog"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/40 bg-background/95 p-6 shadow-2xl">
            <h3 className="text-2xl font-bold">
              {confirmCancelOrder.kind === 'pod'
                ? 'Cancel subscription?'
                : confirmCancelOrder.kind === 'batch'
                  ? 'Cancel full batch?'
                  : 'Cancel batch item?'}
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              {confirmCancelOrder.kind === 'pod'
                ? `${confirmCancelOrder.order.title} will move to cancelled orders. Refund will be processed shortly.`
                : confirmCancelOrder.kind === 'batch'
                  ? `${confirmCancelOrder.order.title} and all requested items will be moved to cancelled.`
                  : `${confirmCancelOrder.itemLabel || 'This item'} will be cancelled from ${confirmCancelOrder.order.title}.`}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmCancelOrder(null)}>Keep</Button>
              <Button
                className="bg-rose-600 text-white hover:bg-rose-700"
                onClick={async () => {
                  const target = confirmCancelOrder
                  setConfirmCancelOrder(null)
                  if (target.kind === 'pod') {
                    await handleCancelSubscription(target.order.id)
                    return
                  }
                  if (target.kind === 'batch') {
                    await handleCancelBatch(target.order)
                    return
                  }
                  if (target.itemId) {
                    await handleCancelBatchItem(target.order, target.itemId)
                  }
                }}
              >
                Confirm Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {cancelSuccessMessage ? (
        <div className="fixed inset-0 z-[145] flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/35 backdrop-blur-sm"
            onClick={() => setCancelSuccessMessage('')}
            aria-label="Close success dialog"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-primary/20 bg-background/95 p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-primary">Subscription Cancelled</h3>
            <p className="mt-3 text-sm text-muted-foreground">{cancelSuccessMessage}</p>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setCancelSuccessMessage('')}>Okay</Button>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  )
}
