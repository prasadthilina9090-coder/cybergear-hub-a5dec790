import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Product, CartItem, ProductSpecs } from '@/types/database';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Local storage key for guest cart
  const GUEST_CART_KEY = 'nexusgear_guest_cart';

  const loadGuestCart = useCallback(() => {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as CartItem[];
      } catch {
        return [];
      }
    }
    return [];
  }, []);

  const saveGuestCart = useCallback((cartItems: CartItem[]) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
  }, []);

  const fetchCart = useCallback(async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', uid);

      if (error) throw error;
      // Cast the nested product specs to ProductSpecs
      const cartItems = (data || []).map(item => ({
        ...item,
        product: item.product ? {
          ...item.product,
          specs: (item.product.specs || {}) as ProductSpecs,
        } : undefined,
      })) as CartItem[];
      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initCart = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        await fetchCart(session.user.id);
      } else {
        setItems(loadGuestCart());
        setIsLoading(false);
      }
    };

    initCart();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUserId(session.user.id);
        // Merge guest cart with user cart
        const guestCart = loadGuestCart();
        if (guestCart.length > 0) {
          for (const item of guestCart) {
            if (item.product) {
              await supabase
                .from('cart_items')
                .upsert({
                  user_id: session.user.id,
                  product_id: item.product_id,
                  quantity: item.quantity,
                }, { onConflict: 'user_id,product_id' });
            }
          }
          localStorage.removeItem(GUEST_CART_KEY);
        }
        await fetchCart(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        setItems([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchCart, loadGuestCart]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (userId) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .upsert({
            user_id: userId,
            product_id: product.id,
            quantity,
          }, { onConflict: 'user_id,product_id' });

        if (error) throw error;
        await fetchCart(userId);
        toast.success(`${product.name} added to cart`);
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add item to cart');
      }
    } else {
      // Guest cart
      const existingIndex = items.findIndex(item => item.product_id === product.id);
      let newItems: CartItem[];
      
      if (existingIndex > -1) {
        newItems = items.map((item, index) => 
          index === existingIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: crypto.randomUUID(),
          user_id: 'guest',
          product_id: product.id,
          quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          product,
        };
        newItems = [...items, newItem];
      }
      
      setItems(newItems);
      saveGuestCart(newItems);
      toast.success(`${product.name} added to cart`);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (userId) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);

        if (error) throw error;
        await fetchCart(userId);
        toast.success('Item removed from cart');
      } catch (error) {
        console.error('Error removing from cart:', error);
        toast.error('Failed to remove item');
      }
    } else {
      const newItems = items.filter(item => item.product_id !== productId);
      setItems(newItems);
      saveGuestCart(newItems);
      toast.success('Item removed from cart');
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }

    if (userId) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', userId)
          .eq('product_id', productId);

        if (error) throw error;
        await fetchCart(userId);
      } catch (error) {
        console.error('Error updating quantity:', error);
        toast.error('Failed to update quantity');
      }
    } else {
      const newItems = items.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      );
      setItems(newItems);
      saveGuestCart(newItems);
    }
  };

  const clearCart = async () => {
    if (userId) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
        setItems([]);
        toast.success('Cart cleared');
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast.error('Failed to clear cart');
      }
    } else {
      setItems([]);
      localStorage.removeItem(GUEST_CART_KEY);
      toast.success('Cart cleared');
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = item.product?.sale_price || item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
