import React, { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CartSummary from '@/components/public_catalog/CartSummary';

const DigitalMenuContainer = memo(({ 
  children, 
  isDesktopCartVisible, 
  isDesktopCartMinimized,
  handleDesktopCartMouseEnter,
  handleDesktopCartMouseLeave,
  toggleDesktopCartMinimize,
  cart,
  addToCart,
  removeFromCart,
  onCheckout,
  total,
  businessData,
  cartItemCount,
  theme,
  primaryColor
}) => {
  return (
    <div className="flex flex-col lg:flex-row">
      <div className={cn(
          "flex-grow transition-all duration-300 ease-in-out", 
          isDesktopCartVisible && !isDesktopCartMinimized ? "lg:mr-[24rem]" : "lg:mr-0",
          isDesktopCartVisible && isDesktopCartMinimized ? "lg:mr-16" : "lg:mr-0" 
        )}
      >
        {children}
      </div>
      
      <AnimatePresence>
        {isDesktopCartVisible && (
          <motion.div 
            className="hidden lg:block fixed top-0 right-0 h-screen z-40"
            initial={{ x: "100%" }}
            animate={{ x: isDesktopCartMinimized ? "calc(100% - 4rem)" : "0%" }} 
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseEnter={handleDesktopCartMouseEnter}
            onMouseLeave={handleDesktopCartMouseLeave}
          >
            {isDesktopCartMinimized ? (
              <div className="h-full w-16 bg-white border-l border-gray-200 flex flex-col items-center justify-between py-4 shadow-xl">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleDesktopCartMinimize} 
                  className="text-red-600 hover:bg-red-50"
                >
                  <Maximize2 size={24} />
                </Button>
                <div className="relative">
                  <ShoppingCart size={28} className="text-red-600" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <div />
              </div>
            ) : (
              <div className="relative w-96 h-full">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleDesktopCartMinimize} 
                  className="absolute top-2 right-2 z-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 bg-white/80 backdrop-blur-sm rounded-full"
                >
                  <Minimize2 size={20} />
                </Button>
                <CartSummary
                  cart={cart} 
                  onAddToCart={addToCart} 
                  onRemoveFromCart={removeFromCart}
                  onCheckout={onCheckout}
                  total={total}
                  isOpen={businessData?.settings?.is_open}
                  onClose={toggleDesktopCartMinimize} 
                  theme="light"
                  primaryColor={primaryColor}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

DigitalMenuContainer.displayName = 'DigitalMenuContainer';

export default DigitalMenuContainer;