import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Package, Shield, Truck, Minus, Plus, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import Layout from '@/components/layout/Layout';
import { useProductById } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { product, isLoading, error } = useProductById(id || '');
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-secondary rounded mb-8" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-secondary rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-secondary rounded w-3/4" />
                <div className="h-6 bg-secondary rounded w-1/4" />
                <div className="h-24 bg-secondary rounded" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/">
            <Button variant="outline">Return Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const displayPrice = product.sale_price || product.price;
  const isLowStock = product.stock_quantity <= (product.low_stock_threshold || 10);
  const specs = product.specs || {};

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link to={`/${product.category.replace('_', '-')}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {product.category.replace('_', ' ')}
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-xl overflow-hidden bg-secondary/50 border border-border/50">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_featured && (
                <Badge className="bg-cyber-gradient text-primary-foreground">Featured</Badge>
              )}
              {hasDiscount && (
                <Badge variant="destructive">
                  -{Math.round((1 - product.sale_price! / product.price) * 100)}% OFF
                </Badge>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            {/* Brand */}
            {product.brand && (
              <p className="text-sm text-primary font-mono uppercase tracking-wider mb-2">
                {product.brand}
              </p>
            )}

            {/* Title */}
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-4xl font-bold text-primary">
                ${displayPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock_quantity === 0 ? (
                <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
              ) : isLowStock ? (
                <Badge variant="secondary" className="bg-cyber-orange/20 text-cyber-orange border-cyber-orange/50">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Only {product.stock_quantity} left
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-cyber-green/20 text-cyber-green border-cyber-green/50">
                  In Stock ({product.stock_quantity})
                </Badge>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground mb-6">{product.description}</p>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart - ${(displayPrice * quantity).toFixed(2)}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-secondary/50 border border-border/50">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">DOA Warranty</p>
              </div>
              <div className="text-center">
                <Package className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">30-Day Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specs & Compatibility */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Technical Specifications */}
          {Object.keys(specs).length > 0 && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="font-display">Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {Object.entries(specs).map(([key, value]) => (
                      value && (
                        <TableRow key={key}>
                          <TableCell className="font-medium capitalize text-muted-foreground">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </TableCell>
                          <TableCell>{value}</TableCell>
                        </TableRow>
                      )
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Compatibility Notes */}
          {product.compatibility_notes && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="font-display">Compatibility Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {product.compatibility_notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
