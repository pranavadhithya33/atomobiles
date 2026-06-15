'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
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

  // 2. Load Cart
  useEffect(() => {
    const savedCart = localStorage.getItem('og_cart');
    if (savedCart) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // 3. Save Cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('og_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

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
        image: product.images?.[0], 
        basePrice: variantInfo?.variantPrice || product.our_price,
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

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const cartTotal = cart.reduce((sum, item) => {
    // Note: This total is a bit complex because of payment options
    // For simplicity, we use the basePrice here.
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
      cartTotal 
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
