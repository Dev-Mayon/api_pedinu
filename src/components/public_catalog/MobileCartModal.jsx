import React from 'react';
    import CartSummary from './CartSummary';
    import { motion, AnimatePresence } from 'framer-motion';

    const MobileCartModal = ({
      isCartOpenMobile,
      setIsCartOpenMobile,
      cart,
      addToCart,
      removeFromCart,
      onCheckout,
      total,
      businessData,
      theme,
      primaryColor,
    }) => {

      return (
        <AnimatePresence>
          {isCartOpenMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsCartOpenMobile(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-0 left-0 right-0"
              >
                <CartSummary
                  cart={cart}
                  onAddToCart={addToCart}
                  onRemoveFromCart={removeFromCart}
                  onCheckout={onCheckout}
                  total={total}
                  isOpen={businessData?.settings?.is_open}
                  onClose={() => setIsCartOpenMobile(false)}
                  theme={theme}
                  primaryColor={primaryColor}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      );
    };

    export default MobileCartModal;