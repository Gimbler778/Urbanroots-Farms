import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Leaf, Package2, ReceiptText, Sprout } from 'lucide-react'
import Layout from '@/components/Layout'
import GlowCard from '@/components/GlowCard'
import ScrollReveal from '@/components/ScrollReveal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getMyOrders } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import type { OrderHistoryItem } from '@/types'

const statusTone: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-sky-100 text-sky-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  requested: 'bg-amber-100 text-amber-700',
  contact_scheduled: 'bg-sky-100 text-sky-700',
  renting: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
}

export default function MyOrdersPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState<OrderHistoryItem[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      navigate('/sign-in')
    }
  }, [loading, navigate, user])

  useEffect(() => {
    if (!user) {
      return
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

    loadOrders()
  }, [user])

  const counts = useMemo(() => ({
    all: orders.length,
    pod: orders.filter((item) => item.type === 'pod_rental').length,
    product: orders.filter((item) => item.type === 'product').length,
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
                    {order.status.replace('_', ' ')}
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
                        ? `₹${(order.monthly_price || 0).toLocaleString('en-IN')}/mo`
                        : `₹${(order.total || 0).toLocaleString('en-IN')}`}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-primary/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reference</p>
                    <p className="mt-2 text-sm font-semibold">{order.id.slice(0, 8)}</p>
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
              { label: 'Product orders', value: counts.product, icon: Package2 },
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
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="h-auto rounded-2xl bg-muted/60 p-1">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pod">Pod Rentals</TabsTrigger>
              <TabsTrigger value="product">Product Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="all">{renderOrders(orders)}</TabsContent>
            <TabsContent value="pod">{renderOrders(orders.filter((item) => item.type === 'pod_rental'))}</TabsContent>
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
    </Layout>
  )
}
