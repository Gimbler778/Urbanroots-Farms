import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Building2, Package, RefreshCw, Settings2, Sprout, Trash2 } from 'lucide-react'
import Layout from '@/components/Layout'
import ScrollReveal from '@/components/ScrollReveal'
import GlowCard from '@/components/GlowCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminDashboard,
  updateAdminBuildingApplicationStatus,
  updateAdminPodRentalStatus,
  updateAdminProduct,
} from '@/services/api'
import type {
  AdminProductCreatePayload,
  AdminDashboardData,
  BuildingApplicationStatus,
  PodRentalStatus,
  Product,
} from '@/types'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null)
  const [fetching, setFetching] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [productDrafts, setProductDrafts] = useState<Record<string, { stock: number; price: number }>>({})
  const [newProduct, setNewProduct] = useState<AdminProductCreatePayload>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: 'equipment',
    stock: 0,
    organic: true,
    unit: 'pcs',
  })

  const canCreateProduct =
    newProduct.name.trim().length > 0 &&
    newProduct.description.trim().length > 0 &&
    newProduct.image.trim().length > 0 &&
    newProduct.price > 0 &&
    newProduct.stock >= 0

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

  useEffect(() => {
    if (!dashboard) {
      return
    }
    setProductDrafts(
      dashboard.products.reduce<Record<string, { stock: number; price: number }>>((accumulator, product) => {
        accumulator[product.id] = { stock: product.stock, price: product.price }
        return accumulator
      }, {})
    )
  }, [dashboard])

  const metrics = useMemo(() => {
    return dashboard?.metrics ?? {
      products: 0,
      pod_rentals: 0,
      building_applications: 0,
      pending_pod_rentals: 0,
      pending_applications: 0,
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

  const handleCreateProduct = async () => {
    if (!canCreateProduct) {
      setError('Please complete all product fields and use a positive price.')
      return
    }

    setSavingId('create-product')
    try {
      await createAdminProduct(newProduct)
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        image: '',
        category: 'equipment',
        stock: 0,
        organic: true,
        unit: 'pcs',
      })
      await loadDashboard()
    } finally {
      setSavingId(null)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    setSavingId(id)
    try {
      await deleteAdminProduct(id)
      await loadDashboard()
    } finally {
      setSavingId(null)
    }
  }

  const handleUpdateProductQuick = async (product: Product) => {
    const draft = productDrafts[product.id] ?? { stock: product.stock, price: product.price }

    if (draft.stock < 0 || draft.price <= 0) {
      setError('Stock must be 0 or more, and price must be greater than 0.')
      return
    }

    setSavingId(product.id)
    try {
      await updateAdminProduct(product.id, { stock: draft.stock, price: draft.price })
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
              <p className="mt-2 text-sm text-muted-foreground">Manage products, building applications, and pod rentals from one page.</p>
            </div>
            <Button onClick={loadDashboard} disabled={fetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {[
              { title: 'Products', value: metrics.products, icon: Package },
              { title: 'Pod Rentals', value: metrics.pod_rentals, icon: Sprout },
              { title: 'Applications', value: metrics.building_applications, icon: Building2 },
              { title: 'Pending Rentals', value: metrics.pending_pod_rentals, icon: Activity },
              { title: 'Pending Apps', value: metrics.pending_applications, icon: Activity },
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

      <section className="py-10">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="pod-rentals" className="space-y-6">
            <TabsList className="h-auto rounded-2xl bg-muted/60 p-1">
              <TabsTrigger value="pod-rentals">Pod Rentals</TabsTrigger>
              <TabsTrigger value="applications">Building Applications</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>

            <TabsContent value="pod-rentals">
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
            </TabsContent>

            <TabsContent value="applications">
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
            </TabsContent>

            <TabsContent value="products">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Product</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input placeholder="Name" value={newProduct.name || ''} onChange={(event) => setNewProduct((current) => ({ ...current, name: event.target.value }))} />
                    <Input placeholder="Description" value={newProduct.description || ''} onChange={(event) => setNewProduct((current) => ({ ...current, description: event.target.value }))} />
                    <Input placeholder="Image URL" value={newProduct.image || ''} onChange={(event) => setNewProduct((current) => ({ ...current, image: event.target.value }))} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="number" placeholder="Price" value={newProduct.price || 0} onChange={(event) => setNewProduct((current) => ({ ...current, price: Number(event.target.value) }))} />
                      <Input type="number" placeholder="Stock" value={newProduct.stock || 0} onChange={(event) => setNewProduct((current) => ({ ...current, stock: Number(event.target.value) }))} />
                    </div>
                    <Button onClick={handleCreateProduct} disabled={savingId === 'create-product'} className="w-full">Create Product</Button>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {dashboard?.products.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        {(() => {
                          const draft = productDrafts[product.id] ?? { stock: product.stock, price: product.price }
                          return (
                        <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto_auto] md:items-center">
                          <div>
                            <div className="font-semibold">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.category}</div>
                          </div>
                          <Input
                            type="number"
                            min={0}
                            value={draft.stock}
                            onChange={(event) => {
                              const stock = Number(event.target.value)
                              setProductDrafts((current) => ({
                                ...current,
                                [product.id]: {
                                  ...draft,
                                  stock: Number.isFinite(stock) ? stock : 0,
                                },
                              }))
                            }}
                          />
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={draft.price}
                            onChange={(event) => {
                              const price = Number(event.target.value)
                              setProductDrafts((current) => ({
                                ...current,
                                [product.id]: {
                                  ...draft,
                                  price: Number.isFinite(price) ? price : 0,
                                },
                              }))
                            }}
                          />
                          <Button variant="outline" onClick={() => handleUpdateProductQuick(product)} disabled={savingId === product.id}>Save</Button>
                          <Button variant="destructive" onClick={() => handleDeleteProduct(product.id)} disabled={savingId === product.id}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                          )
                        })()}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  )
}
