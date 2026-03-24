import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Building2, ClipboardList, Package, RefreshCw, Settings2, Sprout } from 'lucide-react'
import Layout from '@/components/Layout'
import ScrollReveal from '@/components/ScrollReveal'
import GlowCard from '@/components/GlowCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import {
  getAdminDashboard,
  updateAdminBuildingApplicationStatus,
  updateAdminPodRentalStatus,
} from '@/services/api'
import type {
  AdminDashboardData,
  BuildingApplicationStatus,
  PodRentalStatus,
} from '@/types'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null)
  const [fetching, setFetching] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [requestView, setRequestView] = useState<'all' | 'pods' | 'building'>('all')

  useEffect(() => {
    if (!loading && !user) {
      navigate('/sign-in')
      return
    }
    if (!loading && user && user.role !== 'admin') {
      navigate('/')
    }
  }, [loading, navigate, user])

  const loadDashboard = async () => {
    setFetching(true)
    setError('')
    try {
      const response = await getAdminDashboard()
      setDashboard(response)
    } catch (requestError: any) {
      setError(requestError?.response?.data?.detail || 'Unable to load admin dashboard data.')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboard()
    }
  }, [user?.role])

  const metrics = useMemo(() => {
    return dashboard?.metrics ?? {
      products: 0,
      pod_rentals: 0,
      building_applications: 0,
      product_order_batches: 0,
      pending_pod_rentals: 0,
      pending_applications: 0,
      pending_product_batches: 0,
    }
  }, [dashboard])

  const updatePodStatus = async (id: string, status: PodRentalStatus) => {
    setSavingId(id)
    try {
      await updateAdminPodRentalStatus(id, status)
      await loadDashboard()
    } finally {
      setSavingId(null)
    }
  }

  const updateApplicationStatus = async (id: string, status: BuildingApplicationStatus) => {
    setSavingId(id)
    try {
      await updateAdminBuildingApplicationStatus(id, status)
      await loadDashboard()
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
                <Settings2 className="h-3.5 w-3.5" />
                Admin Console
              </div>
              <h1 className="mt-4 text-4xl font-bold">UrbanRoots Operations Dashboard</h1>
              <p className="mt-2 text-sm text-muted-foreground">Manage product batches, products/services, building applications, and pod rentals.</p>
            </div>
            <Button onClick={loadDashboard} disabled={fetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="mt-8 grid gap-4 md:grid-cols-6">
            {[
              { title: 'Products', value: metrics.products, icon: Package },
              { title: 'Product Batches', value: metrics.product_order_batches, icon: ClipboardList },
              { title: 'Pod Rentals', value: metrics.pod_rentals, icon: Sprout },
              { title: 'Applications', value: metrics.building_applications, icon: Building2 },
              { title: 'Pending Rentals', value: metrics.pending_pod_rentals, icon: Activity },
              { title: 'Pending Batches', value: metrics.pending_product_batches, icon: Activity },
            ].map((item) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="h-full border-primary/10">
                  <CardContent className="p-5">
                    <item.icon className="h-4 w-4 text-primary" />
                    <div className="mt-3 text-2xl font-bold">{item.value}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.title}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Product Orders Page</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">Review customer batch requests and accept/reject whole batches or single items.</p>
                <Button asChild>
                  <Link to="/admin/product-orders">Open Product Orders</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Add Product / Add Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">Use separate creation options for equipment and services, then manage catalog stock/pricing.</p>
                <Button variant="outline" asChild>
                  <Link to="/admin/catalog">Open Catalog Manager</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
            <div className="space-y-6">
              <div className="w-full overflow-x-auto">
                <div className="inline-flex min-w-full items-center gap-1 rounded-2xl border border-primary/10 bg-muted/40 p-1 sm:min-w-0">
                  <Button
                    variant="ghost"
                    className={`h-10 rounded-xl px-5 text-base ${requestView === 'all' ? 'bg-background font-semibold text-foreground shadow-sm' : 'text-muted-foreground'}`}
                    onClick={() => setRequestView('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    className={`h-10 rounded-xl px-5 text-base ${requestView === 'pods' ? 'bg-background font-semibold text-foreground shadow-sm' : 'text-muted-foreground'}`}
                    onClick={() => setRequestView('pods')}
                  >
                    Pods
                  </Button>
                  <Button
                    variant="ghost"
                    className={`h-10 rounded-xl px-5 text-base ${requestView === 'building' ? 'bg-background font-semibold text-foreground shadow-sm' : 'text-muted-foreground'}`}
                    onClick={() => setRequestView('building')}
                  >
                    Building Applications
                  </Button>
                </div>
              </div>
              {(requestView === 'all' || requestView === 'pods') ? (
                <>
                  <h2 className="text-2xl font-semibold">Pod Rental Requests</h2>
                  <div className="grid gap-4">
                    {dashboard?.pod_rentals.map((rental) => (
                      <ScrollReveal key={rental.id}>
                        <GlowCard>
                          <CardContent className="p-5">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div>
                                <div className="text-lg font-semibold">{rental.pod_name}</div>
                                <div className="text-sm text-muted-foreground">{rental.full_name} • {rental.email}</div>
                                <div className="text-sm text-muted-foreground">{rental.city}, {rental.state} • {rental.preferred_start_date}</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <select
                                  aria-label="Update pod rental status"
                                  value={rental.status}
                                  onChange={(event) => updatePodStatus(rental.id, event.target.value as PodRentalStatus)}
                                  disabled={savingId === rental.id}
                                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                  <option value="requested">requested</option>
                                  <option value="contact_scheduled">contact_scheduled</option>
                                  <option value="renting">renting</option>
                                  <option value="completed">completed</option>
                                  <option value="cancelled">cancelled</option>
                                </select>
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">₹{rental.monthly_price.toLocaleString('en-IN')}/mo</span>
                              </div>
                            </div>
                          </CardContent>
                        </GlowCard>
                      </ScrollReveal>
                    ))}
                  </div>
                </>
              ) : null}

            {(requestView === 'all' || requestView === 'building') ? (
            <div className={`${requestView === 'all' ? 'mt-10 ' : ''}space-y-6`}>
              <h2 className="text-2xl font-semibold">Building Applications</h2>
              <div className="grid gap-4">
                {dashboard?.building_applications.map((application) => (
                  <ScrollReveal key={application.id}>
                    <GlowCard>
                      <CardContent className="p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <div className="text-lg font-semibold">{application.building_name}</div>
                            <div className="text-sm text-muted-foreground">{application.full_name} • {application.user_email}</div>
                            <div className="text-sm text-muted-foreground">{application.building_type} • {application.space_size}</div>
                          </div>
                          <select
                            aria-label="Update building application status"
                            value={application.status}
                            onChange={(event) => updateApplicationStatus(application.id, event.target.value as BuildingApplicationStatus)}
                            disabled={savingId === application.id}
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                          >
                            <option value="submitted">submitted</option>
                            <option value="reviewing">reviewing</option>
                            <option value="approved">approved</option>
                            <option value="rejected">rejected</option>
                          </select>
                        </div>
                      </CardContent>
                    </GlowCard>
                  </ScrollReveal>
                ))}
              </div>
            </div>
            ) : null}
        </div>
        </div>
      </section>
    </Layout>
  )
}
