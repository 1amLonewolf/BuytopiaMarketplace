import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Fetch DB cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Load from localStorage for guest users
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      } else {
        setCart({ items: [], totalItems: 0, totalPrice: 0 });
      }
    }
  }, [isAuthenticated, user]);

  // Save to localStorage when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cart');
      setCart(response.data.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      const response = await axios.post('/api/cart/add', {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images?.[0],
        vendor: product.vendor
      });
      setCart(response.data.data);
    } else {
      // Local cart for guest users
      const existingItem = cart.items.find(item => item.productId === product._id);
      let newItems;
      
      if (existingItem) {
        newItems = cart.items.map(item =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...cart.items, {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.images?.[0],
          vendor: product.vendor
        }];
      }

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      setCart({ items: newItems, totalItems, totalPrice });
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (isAuthenticated) {
      const response = await axios.put(`/api/cart/${productId}`, { quantity });
      setCart(response.data.data);
    } else {
      const newItems = cart.items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      );
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setCart({ items: newItems, totalItems, totalPrice });
    }
  };

  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      const response = await axios.delete(`/api/cart/${productId}`);
      setCart(response.data.data);
    } else {
      const newItems = cart.items.filter(item => item.productId !== productId);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setCart({ items: newItems, totalItems, totalPrice });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await axios.delete('/api/cart');
    }
    setCart({ items: [], totalItems: 0, totalPrice: 0 });
    localStorage.removeItem('cart');
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
