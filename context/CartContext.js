'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  // 1. Auth State Listener
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user || null);
        setAuthLoaded(true);
      })
      .catch(err => {
        console.error('Cart context auth fetch failed:', err);
        setAuthLoaded(true);
      });
  }, []);

  // 2. Load Cart & Wishlist
  useEffect(() => {
    const savedCart = localStorage.getItem('og_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
    const savedWishlist = localStorage.getItem('og_wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Failed to parse wishlist:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // 3. Save Cart & Wishlist to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('og_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('og_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded]);

  const addToCart = async (product, quantity = 1, paymentOption = 'half_cod', variantInfo = null) => {
    const variantId = variantInfo ? `${variantInfo.ram}GB-${variantInfo.storage}GB` : null;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.paymentOption === paymentOption && item.variantId === variantId);
      if (existing) {
        return prev.map(item => 
          item.id === product.id && item.paymentOption === paymentOption && item.variantId === variantId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        slug: product.slug, 
        image: product.image || product.images?.[0], 
        basePrice: variantInfo?.variantPrice || product.price || product.our_price,
        paymentOption,
        quantity,
        variantId,
        variantInfo
      }];
    });
  };

  const removeFromCart = async (id, paymentOption, variantId = null) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.paymentOption === paymentOption && item.variantId === variantId)));
  };

  const updateQuantity = async (id, paymentOption, quantity, variantId = null) => {
    if (quantity < 1) return removeFromCart(id, paymentOption, variantId);
    
    setCart(prev => prev.map(item => 
      item.id === id && item.paymentOption === paymentOption && item.variantId === variantId
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, {
          id: product.id,
          name: product.name,
          slug: product.slug || product.id,
          image: product.image || product.images?.[0],
          price: product.price || product.our_price,
          originalPrice: product.originalPrice || product.market_price,
          brand: product.brand
        }];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const cartTotal = cart.reduce((sum, item) => {
    return sum + (item.basePrice * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      isLoaded,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartCount, 
      cartTotal,
      wishlist,
      toggleWishlist,
      isInWishlist,
      wishlistCount: wishlist.length,
      user
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
