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

  // 2. Load Cart
  useEffect(() => {
    async function loadCart() {
      if (user) {
        // Fetch from Database
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
            dbId: item.id, // Supabase PK
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
      } else {
        // Fetch from localStorage for guests
        const savedCart = localStorage.getItem('og_cart');
        if (savedCart) {
          try {
            setCart(JSON.parse(savedCart));
          } catch (e) {
            console.error('Failed to parse cart:', e);
          }
        }
      }
      setIsLoaded(true);
    }
    loadCart();
  }, [user]);

  // 3. Sync Guest Cart to DB on Login
  useEffect(() => {
    if (isLoaded && user && cart.length > 0) {
      const savedCart = localStorage.getItem('og_cart');
      if (savedCart) {
        try {
          const guestItems = JSON.parse(savedCart);
          if (guestItems.length > 0) {
            const sync = async () => {
              for (const item of guestItems) {
                await supabase.from('cart_items').upsert({
                  user_id: user.id,
                  product_id: item.id,
                  payment_option: item.paymentOption,
                  quantity: item.quantity
                }, { onConflict: 'user_id, product_id, payment_option' });
              }
              localStorage.removeItem('og_cart');
              // Re-load cart to get DB IDs
              const { data } = await supabase
                .from('cart_items')
                .select(`id, quantity, payment_option, product:products(id, name, slug, images, our_price)`)
                .eq('user_id', user.id);
              if (data) {
                setCart(data.map(i => ({
                  dbId: i.id,
                  id: i.product.id,
                  name: i.product.name,
                  slug: i.product.slug,
                  image: i.product.images?.[0],
                  basePrice: i.product.our_price,
                  paymentOption: i.payment_option,
                  quantity: i.quantity
                })));
              }
            };
            sync();
          }
        } catch (e) {
          console.error('Sync failed:', e);
        }
      }
    }
  }, [user, isLoaded]);

  // 4. Save Guest Cart to localStorage
  useEffect(() => {
    if (isLoaded && !user) {
      localStorage.setItem('og_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded, user]);

  const addToCart = async (product, quantity = 1, paymentOption = 'half_cod') => {
    if (user) {
      // Upsert to Database
      const { data, error } = await supabase
        .from('cart_items')
        .upsert({
          user_id: user.id,
          product_id: product.id,
          payment_option: paymentOption,
          quantity: quantity // For simplicity, we just set it. We could increment if we fetch first.
        }, { onConflict: 'user_id, product_id, payment_option' })
        .select();
      
      // Refresh cart to get latest data with quantity sum or just optimistic update
      // For speed, let's do optimistic update
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
