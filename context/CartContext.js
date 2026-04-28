'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('og_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('og_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product, quantity = 1, paymentOption = 'half_cod') => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.paymentOption === paymentOption);
      if (existing) {
        return prev.map(item => 
          item.id === product.id && item.paymentOption === paymentOption
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        slug: product.slug, 
        image: product.images?.[0], 
        basePrice: product.our_price,
        paymentOption,
        quantity 
      }];
    });
  };

  const removeFromCart = (id, paymentOption) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.paymentOption === paymentOption)));
  };

  const updateQuantity = (id, paymentOption, quantity) => {
    if (quantity < 1) return removeFromCart(id, paymentOption);
    setCart(prev => prev.map(item => 
      item.id === id && item.paymentOption === paymentOption
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
