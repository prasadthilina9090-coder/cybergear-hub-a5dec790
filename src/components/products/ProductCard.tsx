import { Link } from 'react-router-dom';
import { ShoppingCart, Zap, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/types/database';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.sale_price! / product.price) * 100)
    : 0;

  const displayPrice = product.sale_price || product.price;
  const isLowStock = product.stock_quantity <= (product.low_stock_threshold || 10);

  return (
    <Card className="group relative overflow-hidden bg-card border-border/50 hover:border-primary/50 transition-all duration-300">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.is_featured && (
          <Badge className="bg-cyber-gradient text-primary-foreground">
            <Zap className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        {hasDiscount && (
          <Badge variant="destructive">
            -{discountPercent}%
          </Badge>
        )}
        {isLowStock && product.stock_quantity > 0 && (
          <Badge variant="secondary" className="bg-cyber-orange/20 text-cyber-orange border-cyber-orange/50">
            Low Stock
          </Badge>
        )}
        {product.stock_quantity === 0 && (
          <Badge variant="secondary" className="bg-destructive/20 text-destructive">
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Image */}
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-secondary/50">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          {/* Glow overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>

      <CardContent className="p-4">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-primary font-mono uppercase tracking-wider mb-1">
            {product.brand}
          </p>
        )}

        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Specs Preview */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.specs.ram && (
              <Badge variant="outline" className="text-xs py-0">
                {product.specs.ram}
              </Badge>
            )}
            {product.specs.storage && (
              <Badge variant="outline" className="text-xs py-0">
                {product.specs.storage}
              </Badge>
            )}
            {product.specs.cpu && (
              <Badge variant="outline" className="text-xs py-0 truncate max-w-[100px]">
                {product.specs.cpu}
              </Badge>
            )}
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-display text-lg font-bold text-primary">
              ${displayPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="ml-2 text-sm text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            disabled={product.stock_quantity === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
