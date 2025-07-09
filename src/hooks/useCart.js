import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useCart = (businessData, toast) => {
  const [cart, setCart] = useState([]);
  
  const addToCart = useCallback((product) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => 
        item.id === product.id && 
        JSON.stringify(item.addons) === JSON.stringify(product.addons || [])
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += (product.quantity || 1);
        return newCart;
      } else {
        const cartItemId = uuidv4();
        const finalPrice = product.finalPrice || product.promotional_price || product.price;

        const newCartItem = {
          ...product,
          cartItemId,
          quantity: product.quantity || 1,
          finalPrice,
          addons: product.addons || []
        };
        return [...prevCart, newCartItem];
      }
    });
  }, []);

  const removeFromCart = useCallback((cartItemId) => {
    setCart(prevCart => {
      const itemIndex = prevCart.findIndex(item => item.cartItemId === cartItemId);
      if (itemIndex === -1) return prevCart;

      const newCart = [...prevCart];
      const item = newCart[itemIndex];

      if (item.quantity > 1) {
        newCart[itemIndex] = { ...item, quantity: item.quantity - 1 };
        return newCart;
      } else {
        return newCart.filter(i => i.cartItemId !== cartItemId);
      }
    });
  }, []);
  
  const updateCartItemQuantity = useCallback((cartItemId, change) => {
    setCart(prevCart => {
      const itemIndex = prevCart.findIndex(item => item.cartItemId === cartItemId);
      if (itemIndex === -1) return prevCart;

      const newCart = [...prevCart];
      const item = newCart[itemIndex];
      const newQuantity = item.quantity + change;

      if (newQuantity <= 0) {
        return newCart.filter(i => i.cartItemId !== cartItemId);
      }

      newCart[itemIndex] = { ...item, quantity: newQuantity };
      return newCart;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      return total + (item.finalPrice * item.quantity);
    }, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }, [cart]);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    cartTotal,
    cartItemCount,
  };
};