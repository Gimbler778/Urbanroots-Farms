import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link to={`/products/${product.id}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <CardHeader className="p-0">
          <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100 flex items-center justify-center">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-32 h-32 object-contain p-4"
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
              ${product.price}
            </span>
            <span className="text-sm text-muted-foreground">
              {product.category === 'equipment' ? '🛠️ Equipment' : '⚙️ Service'}
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
