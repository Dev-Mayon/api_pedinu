import { useState, useEffect, useRef, useCallback } from 'react';

export const useCartUI = (cart, cartItemCount) => {
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);
  const [isDesktopCartVisible, setIsDesktopCartVisible] = useState(false);
  const [isDesktopCartMinimized, setIsDesktopCartMinimized] = useState(false);
  const desktopCartHoverTimeout = useRef(null);

  useEffect(() => {
    if (cart.length === 0) {
      setIsDesktopCartVisible(false);
      setIsDesktopCartMinimized(false);
      setIsCartOpenMobile(false);
    } else if (cart.length > 0 && window.innerWidth >= 1024) {
      setIsDesktopCartVisible(true);
      if (cart.length >= 1) {
        setIsDesktopCartMinimized(true);
      }
    }
  }, [cart]);

  const handleDesktopCartMouseEnter = useCallback(() => {
    if (isDesktopCartMinimized) {
      clearTimeout(desktopCartHoverTimeout.current);
      setIsDesktopCartMinimized(false);
    }
  }, [isDesktopCartMinimized]);

  const handleDesktopCartMouseLeave = useCallback(() => {
    if (isDesktopCartVisible && cart.length >= 1) {
      desktopCartHoverTimeout.current = setTimeout(() => {
        setIsDesktopCartMinimized(true);
      }, 300);
    }
  }, [isDesktopCartVisible, cart.length]);

  const toggleDesktopCartMinimize = useCallback(() => {
    setIsDesktopCartMinimized(prev => !prev);
  }, []);

  return {
    isCartOpenMobile,
    setIsCartOpenMobile,
    isDesktopCartVisible,
    isDesktopCartMinimized,
    handleDesktopCartMouseEnter,
    handleDesktopCartMouseLeave,
    toggleDesktopCartMinimize
  };
};