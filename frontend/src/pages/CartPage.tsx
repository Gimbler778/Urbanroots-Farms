import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { fetchProductImages } from '@/services/imageService';
import { checkoutOrderBatch } from '@/services/api';
import type { ProductOrderBatch } from '@/types';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, XCircle, BadgeCheck } from 'lucide-react';

function normalizeCartItemName(value: string): string {
  return value
    .replace(/\s+\d+$/, '')
    .replace(/\s+Service$/i, '')
    .trim();
}

const TAX_RATE = 0.08;
const REFERRAL_DISCOUNT_RATE = 0.05;
const MAX_COMBINED_DISCOUNT_RATE = 0.3;
const COUPON_DISCOUNT_BY_CODE: Record<string, number> = {
  WELCOME5: 0.05,
  URBAN10: 0.1,
  HARVEST15: 0.15,
};

export default function CartPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [cartImageById, setCartImageById] = useState<Record<string, string>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccessBatch, setCheckoutSuccessBatch] = useState<ProductOrderBatch | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>('');
  const [appliedReferralCode, setAppliedReferralCode] = useState<string>('');
  const [discountMessage, setDiscountMessage] = useState('');
  const formatINR = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  const subtotal = getCartTotal();
  const couponRate = appliedCouponCode ? (COUPON_DISCOUNT_BY_CODE[appliedCouponCode] ?? 0) : 0;
  const referralRate = appliedReferralCode ? REFERRAL_DISCOUNT_RATE : 0;
  const discountRate = Math.min(couponRate + referralRate, MAX_COMBINED_DISCOUNT_RATE);
  const discountAmount = Number((subtotal * discountRate).toFixed(2));
  const discountedSubtotal = Number(Math.max(subtotal - discountAmount, 0).toFixed(2));
  const taxAmount = Number((discountedSubtotal * TAX_RATE).toFixed(2));
  const totalAmount = Number((discountedSubtotal + taxAmount).toFixed(2));

  const finalizeSuccessfulCheckout = (destination?: string) => {
    clearCart();
    setCheckoutSuccessBatch(null);
    setCouponInput('');
    setReferralInput('');
    setAppliedCouponCode('');
    setAppliedReferralCode('');
    setDiscountMessage('');
    if (destination) {
      navigate(destination);
    }
  };

  const applyCouponCode = () => {
    const normalized = couponInput.trim().toUpperCase();
    if (!normalized) {
      setDiscountMessage('Enter a coupon code before applying.');
      return;
    }

    if (!COUPON_DISCOUNT_BY_CODE[normalized]) {
      setDiscountMessage('Invalid coupon code. Try WELCOME5, URBAN10, or HARVEST15.');
      return;
    }

    setAppliedCouponCode(normalized);
    setDiscountMessage(`Coupon ${normalized} applied.`);
  };

  const applyReferralCode = () => {
    const normalized = referralInput.trim().toUpperCase();
    if (!normalized) {
      setDiscountMessage('Enter a referral code before applying.');
      return;
    }

    if (normalized.length < 4) {
      setDiscountMessage('Referral code must be at least 4 characters.');
      return;
    }

    setAppliedReferralCode(normalized);
    setDiscountMessage(`Referral code ${normalized} applied.`);
  };

  const downloadInvoice = (batch: ProductOrderBatch) => {
    const rows = batch.items
      .map((item) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;">${item.name}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;text-align:right;">₹${item.unit_price.toLocaleString('en-IN')}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;text-align:right;">₹${item.line_total.toLocaleString('en-IN')}</td>
        </tr>
      `)
      .join('');

    const createdAt = new Date(batch.created_at).toLocaleString('en-IN');
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>UrbanRoots Invoice ${batch.batch_ref}</title>
        </head>
        <body style="font-family:'Segoe UI',Arial,sans-serif;background:#f3f6ef;padding:24px;color:#253223;">
          <div style="max-width:920px;margin:0 auto;background:#fff;border:1px solid #dbe6d2;border-radius:14px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#3f7f3c,#74b267);padding:18px 24px;color:#fff;">
              <h1 style="margin:0;font-size:28px;">UrbanRoots Invoice</h1>
              <p style="margin:6px 0 0;opacity:.95;">Batch Reference: <strong>${batch.batch_ref}</strong></p>
            </div>
            <div style="padding:24px;">
              <div style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;">
                <div>
                  <div style="font-size:13px;color:#51644f;">Customer</div>
                  <div style="font-size:18px;font-weight:700;">${batch.customer_name}</div>
                  <div style="font-size:14px;color:#51644f;">${batch.customer_email}</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:13px;color:#51644f;">Created At</div>
                  <div style="font-size:15px;font-weight:600;">${createdAt}</div>
                  <div style="font-size:13px;margin-top:6px;color:#51644f;">Status: <strong style="text-transform:capitalize;">${batch.status}</strong></div>
                </div>
              </div>

              <table style="width:100%;border-collapse:collapse;margin-top:22px;font-size:14px;">
                <thead style="background:#f0f7ec;">
                  <tr>
                    <th style="padding:10px 12px;text-align:left;">Product</th>
                    <th style="padding:10px 12px;text-align:center;">Qty</th>
                    <th style="padding:10px 12px;text-align:right;">Unit</th>
                    <th style="padding:10px 12px;text-align:right;">Line Total</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>

              <div style="margin-top:18px;display:flex;justify-content:flex-end;">
                <div style="min-width:280px;border:1px solid #dbe6d2;border-radius:10px;padding:12px;background:#fafdf8;">
                  <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>Subtotal</span><strong>₹${batch.subtotal.toLocaleString('en-IN')}</strong></div>
                  <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>Tax</span><strong>₹${batch.tax.toLocaleString('en-IN')}</strong></div>
                  <div style="display:flex;justify-content:space-between;font-size:18px;"><span>Total</span><strong>₹${batch.total.toLocaleString('en-IN')}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `UrbanRoots-Invoice-${batch.batch_ref}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError('');
    try {
      const result = await checkoutOrderBatch({
        coupon_code: appliedCouponCode || undefined,
        referral_code: appliedReferralCode || undefined,
      });

      const batchWithAppliedDiscount = discountAmount > 0
        ? {
            ...result.batch,
            subtotal: discountedSubtotal,
            tax: taxAmount,
            total: totalAmount,
          }
        : result.batch;

      setCheckoutSuccessBatch(batchWithAppliedDiscount);
    } catch (requestError: any) {
      setCheckoutError(requestError?.response?.data?.detail || 'Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  useEffect(() => {
    if (!cart.length) {
      setCartImageById({});
      return;
    }

    let cancelled = false;

    const loadCartImages = async () => {
      const entries = await Promise.all(
        cart.map(async (item) => {
          const normalizedName = normalizeCartItemName(item.name);
          const query = item.category === 'equipment'
            ? `${normalizedName} agriculture equipment`
            : `${normalizedName} agriculture service farming`;

          const images = await fetchProductImages(query, 1);
          return [item.id, images[0] || item.images[0]] as const;
        }),
      );

      if (!cancelled) {
        setCartImageById(Object.fromEntries(entries));
      }
    };

    void loadCartImages();

    return () => {
      cancelled = true;
    };
  }, [cart]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8 text-muted-foreground">Checking your session...</CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <ShoppingBag className="h-16 w-16 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">Login to Access the Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Please sign in to view your cart and continue checkout.
              </p>
              <Button onClick={() => navigate('/sign-in')} size="lg">
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (cart.length === 0) {
    return (
      <Layout>
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <ShoppingBag className="h-24 w-24 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Your Cart is Empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button onClick={() => navigate('/products')} size="lg">
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
      </Layout>
    );
  }

  return (
    <Layout>
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/products')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Continue Shopping
      </Button>

      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    to={`/products/${item.id}`}
                    className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-primary/10 flex-shrink-0 hover:ring-2 hover:ring-primary/30 transition"
                  >
                    <img
                      src={cartImageById[item.id] || item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link
                          to={`/products/${item.id}`}
                          className="font-semibold text-lg truncate block hover:text-primary transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {item.category === 'equipment' ? 'Equipment' : 'Service'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex justify-between items-center">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {formatINR(item.price)} each
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {formatINR(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Clear Cart Button */}
          <Button
            variant="outline"
            onClick={clearCart}
            className="w-full text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 rounded-xl border border-primary/15 bg-primary/5 p-3">
                <p className="text-sm font-medium">Apply discounts</p>
                <div className="flex gap-2">
                  <Input
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value)}
                    placeholder="Coupon code"
                    className="h-9"
                  />
                  <Button type="button" variant="outline" className="h-9" onClick={applyCouponCode}>
                    Apply
                  </Button>
                </div>
                {appliedCouponCode ? (
                  <div className="flex items-center justify-between text-xs text-primary">
                    <span>Coupon active: {appliedCouponCode}</span>
                    <button
                      type="button"
                      className="font-medium underline"
                      onClick={() => setAppliedCouponCode('')}
                    >
                      Remove
                    </button>
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <Input
                    value={referralInput}
                    onChange={(event) => setReferralInput(event.target.value)}
                    placeholder="Referral code"
                    className="h-9"
                  />
                  <Button type="button" variant="outline" className="h-9" onClick={applyReferralCode}>
                    Apply
                  </Button>
                </div>
                {appliedReferralCode ? (
                  <div className="flex items-center justify-between text-xs text-primary">
                    <span>Referral active: {appliedReferralCode}</span>
                    <button
                      type="button"
                      className="font-medium underline"
                      onClick={() => setAppliedReferralCode('')}
                    >
                      Remove
                    </button>
                  </div>
                ) : null}

                {discountMessage ? <p className="text-xs text-muted-foreground">{discountMessage}</p> : null}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
                  </span>
                  <span className="font-medium">{formatINR(subtotal)}</span>
                </div>
                {discountAmount > 0 ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-green-600">-{formatINR(discountAmount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">{formatINR(taxAmount)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {formatINR(totalAmount)}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isCheckingOut}>
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>

    {checkoutError ? (
      <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
        <button
          type="button"
          className="absolute inset-0 bg-black/45 backdrop-blur-sm"
          onClick={() => setCheckoutError('')}
          aria-label="Close checkout error dialog"
        />
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-red-200 bg-background/95 p-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-red-600" />
            <h3 className="text-2xl font-bold text-red-700">Checkout Failed</h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{checkoutError}</p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCheckoutError('')}>Close</Button>
            <Button onClick={() => {
              setCheckoutError('');
              void handleCheckout();
            }}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    ) : null}

    {checkoutSuccessBatch ? (
      <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
        <button
          type="button"
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => finalizeSuccessfulCheckout()}
          aria-label="Close checkout success dialog"
        />
        <div className="relative z-10 w-full max-w-lg rounded-3xl border border-primary/20 bg-background/95 p-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-6 w-6 text-emerald-600" />
            <h3 className="text-2xl font-bold text-primary">Order Batch Created</h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Your order is saved as batch <span className="font-semibold text-foreground">{checkoutSuccessBatch.batch_ref}</span>.
            You can track item status and cancellations in My Orders. Your cart will be cleared once you continue.
          </p>
          <div className="mt-4 rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm">
            <div className="flex justify-between"><span>Items</span><strong>{checkoutSuccessBatch.item_count}</strong></div>
            <div className="mt-2 flex justify-between"><span>Total</span><strong>{formatINR(checkoutSuccessBatch.total)}</strong></div>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button variant="outline" onClick={() => downloadInvoice(checkoutSuccessBatch)}>Download Invoice</Button>
            <Button variant="outline" onClick={() => finalizeSuccessfulCheckout('/products')}>
              Continue Shopping
            </Button>
            <Button onClick={() => finalizeSuccessfulCheckout('/my-orders')}>
              View My Orders
            </Button>
          </div>
        </div>
      </div>
    ) : null}
    </Layout>
  );
}
