'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(null);

  // 1. Auth State Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Load and Sync Cart
  useEffect(() => {
    async function loadAndSyncCart() {
      if (!user) {
        // Guest mode: load from localStorage
        const savedCart = localStorage.getItem('og_cart');
        if (savedCart) {
          try {
            setCart(JSON.parse(savedCart));
          } catch (e) {
            console.error('Failed to parse cart:', e);
          }
        }
        setIsLoaded(true);
        return;
      }

      // Logged in mode: Sync guest items then load from DB
      try {
        const savedCart = localStorage.getItem('og_cart');
        if (savedCart) {
          const guestItems = JSON.parse(savedCart);
          if (guestItems && guestItems.length > 0) {
            console.log('Syncing guest items to account...');
            for (const item of guestItems) {
              await supabase.from('cart_items').upsert({
                user_id: user.id,
                product_id: item.id,
                payment_option: item.paymentOption,
                quantity: item.quantity
              }, { onConflict: 'user_id, product_id, payment_option' });
            }
            localStorage.removeItem('og_cart');
          }
        }
      } catch (e) {
        console.error('Cart sync failed:', e);
      }

      // Fetch final cart from DB
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          payment_option,
          product:products (
            id,
            name,
            slug,
            images,
            our_price
          )
        `)
        .eq('user_id', user.id);

      if (!error && data) {
        const dbCart = data.map(item => ({
          dbId: item.id,
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.images?.[0],
          basePrice: item.product.our_price,
          paymentOption: item.payment_option,
          quantity: item.quantity
        }));
        setCart(dbCart);
      }
      setIsLoaded(true);
    }
    
    if (isLoaded || !isLoaded) { // Run on mount and user change
      loadAndSyncCart();
    }
  }, [user]);

  // 3. Save Guest Cart to localStorage
  useEffect(() => {
    if (isLoaded && !user) {
      localStorage.setItem('og_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded, user]);

  const addToCart = async (product, quantity = 1, paymentOption = 'half_cod') => {
    if (user) {
      // Get existing item to calculate new quantity
      const existing = cart.find(item => item.id === product.id && item.paymentOption === paymentOption);
      const newQuantity = (existing ? existing.quantity : 0) + quantity;

      // Upsert to Database
      const { data, error } = await supabase
        .from('cart_items')
        .upsert({
          user_id: user.id,
          product_id: product.id,
          payment_option: paymentOption,
          quantity: newQuantity
        }, { onConflict: 'user_id, product_id, payment_option' });
      
      if (error) console.error('Error adding to cart:', error);
    }

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

  const removeFromCart = async (id, paymentOption) => {
    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', id)
        .eq('payment_option', paymentOption);
    }
    setCart(prev => prev.filter(item => !(item.id === id && item.paymentOption === paymentOption)));
  };

  const updateQuantity = async (id, paymentOption, quantity) => {
    if (quantity < 1) return removeFromCart(id, paymentOption);
    
    if (user) {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', id)
        .eq('payment_option', paymentOption);
    }

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
