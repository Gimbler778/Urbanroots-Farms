import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { useProductImages } from '@/hooks/useProductImages';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { images } = useProductImages(product.name, product.category, product.images);
  const displayPrice = `₹${product.price.toLocaleString('en-IN')}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, images[0] || product.images[0]);
  };

  return (
    <Link to={`/products/${product.id}`} className="block">
      <Card className="h-full hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden group">
        <CardHeader className="p-0">
          <div className="aspect-video overflow-hidden rounded-t-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
            <img
              src={images[0] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg mb-2 line-clamp-1">{product.name}</CardTitle>
          <CardDescription className="line-clamp-2 mb-3">
            {product.description}
          </CardDescription>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {displayPrice}
            </span>
            <span className="text-sm text-muted-foreground">
              {product.category === 'equipment' ? 'Equipment' : 'Service'}
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button 
            onClick={handleAddToCart} 
            className="w-full"
            variant="default"
          >
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
