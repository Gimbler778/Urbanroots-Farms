import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CartItem } from '@/types/product';
import { useAuth } from '@/hooks/useAuth';
import { clearUserCart, getUserCart, removeUserCartItem, updateUserCartItemQuantity, upsertUserCartItem } from '@/services/api';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, imageOverride?: string) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  const toPersisted = (item: CartItem) => ({
    product_id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    description: item.description,
    image: item.images[0] ?? '',
    quantity: item.quantity,
  });

  const toCartItem = (item: {
    product_id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    image: string;
    quantity: number;
  }): CartItem => ({
    id: item.product_id,
    name: item.name,
    category: item.category as Product['category'],
    price: item.price,
    description: item.description,
    longDescription: item.description,
    images: [item.image],
    features: [],
    quantity: item.quantity,
  });

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      localStorage.removeItem('urbanroots-cart');
      setCart([]);
      return;
    }

    const loadServerCart = async () => {
      try {
        const items = await getUserCart();
        setCart(items.map(toCartItem));
      } catch {
        // Keep current cart state if server fetch fails.
      }
    };

    void loadServerCart();
  }, [user, loading]);

  const addToCart = (product: Product, imageOverride?: string) => {
    if (!user) {
      window.alert('Please sign in to add to cart.');
      return false;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        const nextQuantity = existingItem.quantity + 1;
        void updateUserCartItemQuantity(existingItem.id, nextQuantity);

        return prevCart.map((item) =>
          item.id === existingItem.id ? { ...item, quantity: nextQuantity } : item,
        );
      }

      const normalizedImages = imageOverride
        ? [imageOverride, ...product.images.filter((img) => img !== imageOverride)]
        : product.images;

      const changedItem = { ...product, images: normalizedImages, quantity: 1 };
      const nextCart = [...prevCart, changedItem];

      void upsertUserCartItem(toPersisted(changedItem));

      return nextCart;
    });

    return true;
  };

  const removeFromCart = (productId: string) => {
    if (!user) {
      return;
    }

    void removeUserCartItem(productId);
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!user) {
      return;
    }

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) => {
      const nextCart = prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );

      void updateUserCartItemQuantity(productId, quantity);

      return nextCart;
    });
  };

  const clearCart = () => {
    if (!user) {
      return;
    }

    void clearUserCart();
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
