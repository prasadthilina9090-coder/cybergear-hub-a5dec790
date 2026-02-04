import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function CartDrawer() {
  const { items, isLoading, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading cart...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="font-display">Your Cart</SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="p-6 rounded-full bg-secondary">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Your cart is empty</p>
          <Link to="/pc">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader>
        <SheetTitle className="font-display">Your Cart ({items.length})</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-3 rounded-lg bg-secondary/50">
              <div className="w-20 h-20 rounded-md bg-muted overflow-hidden flex-shrink-0">
                {item.product?.image_url ? (
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{item.product?.name}</h4>
                <p className="text-xs text-muted-foreground capitalize">
                  {item.product?.category.replace('_', ' ')}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeFromCart(item.product_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">
                  ${((item.product?.sale_price || item.product?.price || 0) * item.quantity).toFixed(2)}
                </p>
                {item.product?.sale_price && item.product?.price && (
                  <p className="text-xs text-muted-foreground line-through">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-display text-xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
        </div>
        <p className="text-xs text-muted-foreground">Shipping calculated at checkout</p>
        
        <div className="flex flex-col gap-2">
          {user ? (
            <Link to="/checkout" className="w-full">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                Checkout
              </Button>
            </Link>
          ) : (
            <Link to="/auth" className="w-full">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                Sign in to Checkout
              </Button>
            </Link>
          )}
          <Button variant="outline" onClick={clearCart} className="w-full">
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
