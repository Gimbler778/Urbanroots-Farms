import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { equipmentData, servicesData } from '@/data/products';
import { ArrowLeft, ShoppingCart, CreditCard } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);

  // Find product from both equipment and services
  const product = [...equipmentData, ...servicesData].find((p) => p.id === id);

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
    addToCart(product);
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/cart');
  };

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
        Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Left Side - Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-96 h-96 object-contain p-8"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 transition-colors ${
                    selectedImage === index
                      ? 'border-primary'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-contain p-4"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full">
                {product.category === 'equipment' ? '🛠️ Equipment' : '⚙️ Service'}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
            <p className="text-xl text-muted-foreground mb-4">
              {product.description}
            </p>
            <div className="text-4xl font-bold text-primary mb-6">
              ${product.price}
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
          <div className="flex gap-4">
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

      {/* Reviews Section */}
      <Separator className="my-12" />
      <div>
        <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
        <Card>
          <CardHeader>
            <CardTitle>Reviews Coming Soon</CardTitle>
            <CardDescription>
              Product reviews and ratings will be available once our authentication system is complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                Be the first to review this {product.category === 'equipment' ? 'equipment' : 'service'}!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </Layout>
  );
}
