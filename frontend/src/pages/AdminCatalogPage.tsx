import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, RefreshCw, Trash2 } from 'lucide-react'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminDashboard,
  updateAdminProduct,
} from '@/services/api'
import type { AdminProductCreatePayload, Product } from '@/types'

export default function AdminCatalogPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [fetching, setFetching] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [productDrafts, setProductDrafts] = useState<Record<string, { stock: number; price: number }>>({})
  const [newEntryType, setNewEntryType] = useState<'equipment' | 'service'>('equipment')
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

  const loadProducts = async () => {
    setFetching(true)
    setError('')
    try {
      const response = await getAdminDashboard()
      setProducts(response.products)
    } catch (requestError: any) {
      setError(requestError?.response?.data?.detail || 'Unable to load products.')
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
      loadProducts()
    }
  }, [user?.role])

  useEffect(() => {
    setProductDrafts(
      products.reduce<Record<string, { stock: number; price: number }>>((accumulator, product) => {
        accumulator[product.id] = { stock: product.stock, price: product.price }
        return accumulator
      }, {}),
    )
  }, [products])

  const handleCreateProduct = async () => {
    if (!canCreateProduct) {
      setError('Please complete all fields and use a positive price.')
      return
    }

    setSavingId('create-product')
    try {
      await createAdminProduct({ ...newProduct, category: newEntryType })
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        image: '',
        category: newEntryType,
        stock: 0,
        organic: true,
        unit: 'pcs',
      })
      await loadProducts()
    } finally {
      setSavingId(null)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    setSavingId(id)
    try {
      await deleteAdminProduct(id)
      await loadProducts()
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
      await loadProducts()
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
                <Box className="h-3.5 w-3.5" />
                Product & Service Catalog
              </div>
              <h1 className="mt-4 text-4xl font-bold">Add Product / Add Service</h1>
              <p className="mt-2 text-sm text-muted-foreground">Create and manage equipment and services in separate catalog controls.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/admin')}>Back to Dashboard</Button>
              <Button onClick={loadProducts} disabled={fetching}>
                <RefreshCw className={`mr-2 h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>{newEntryType === 'equipment' ? 'Add Product' : 'Add Service'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={newEntryType === 'equipment' ? 'default' : 'outline'}
                    onClick={() => {
                      setNewEntryType('equipment')
                      setNewProduct((current) => ({ ...current, category: 'equipment' }))
                    }}
                  >
                    Add Product
                  </Button>
                  <Button
                    variant={newEntryType === 'service' ? 'default' : 'outline'}
                    onClick={() => {
                      setNewEntryType('service')
                      setNewProduct((current) => ({ ...current, category: 'service' }))
                    }}
                  >
                    Add Service
                  </Button>
                </div>

                <Input placeholder="Name" value={newProduct.name || ''} onChange={(event) => setNewProduct((current) => ({ ...current, name: event.target.value }))} />
                <Input placeholder="Description" value={newProduct.description || ''} onChange={(event) => setNewProduct((current) => ({ ...current, description: event.target.value }))} />
                <Input placeholder="Image URL" value={newProduct.image || ''} onChange={(event) => setNewProduct((current) => ({ ...current, image: event.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Price" value={newProduct.price || 0} onChange={(event) => setNewProduct((current) => ({ ...current, price: Number(event.target.value) }))} />
                  <Input type="number" placeholder="Stock" value={newProduct.stock || 0} onChange={(event) => setNewProduct((current) => ({ ...current, stock: Number(event.target.value) }))} />
                </div>
                <Button onClick={handleCreateProduct} disabled={savingId === 'create-product'} className="w-full">
                  {newEntryType === 'equipment' ? 'Create Product' : 'Create Service'}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-primary">Edit Current List of Products</h2>
                <p className="mt-1 text-sm text-muted-foreground">Update stock and price for existing products</p>
              </div>
              <div className="sticky top-0 grid gap-3 rounded-t-2xl border border-b-0 border-primary/10 bg-primary/5 p-4 md:grid-cols-[1.5fr_1fr_1fr_auto_auto] md:items-center">
                <div className="font-semibold text-primary">Product</div>
                <div className="font-semibold text-primary">Stock</div>
                <div className="font-semibold text-primary">Price</div>
                <div className="font-semibold text-primary">Action</div>
                <div className="font-semibold text-primary">Delete</div>
              </div>
              {products.length > 0 ? (
                products.map((product, index) => {
                  const isLast = index === products.length - 1
                  const draft = productDrafts[product.id] ?? { stock: product.stock, price: product.price }
                  return (
                    <div
                      key={product.id}
                      className={`grid gap-3 border border-t-0 border-primary/10 bg-background p-4 md:grid-cols-[1.5fr_1fr_1fr_auto_auto] md:items-center ${isLast ? 'rounded-b-2xl border-b' : ''}`}
                    >
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
                })
              ) : (
                <div className="rounded-b-2xl border border-t-0 border-primary/10 bg-background p-6 text-center text-muted-foreground">
                  No products yet. Create one using the form on the left.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
