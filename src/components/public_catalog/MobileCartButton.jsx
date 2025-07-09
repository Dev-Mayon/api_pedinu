import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MobileCartButton = memo(({ 
  cartItemCount, 
  isCartOpenMobile, 
  setIsCartOpenMobile, 
  theme, 
  primaryColor 
}) => {
  if (cartItemCount === 0 || isCartOpenMobile) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-4 right-4 z-30 lg:hidden"
      >
        <Button
          size="lg"
          className="rounded-full shadow-xl h-14 w-14 p-0 bg-red-500 hover:bg-red-600 text-white active:scale-95 transition-all duration-150"
          onClick={() => setIsCartOpenMobile(true)}
          aria-label="Abrir carrinho"
        >
          <ShoppingCart size={24} />
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
            {cartItemCount}
          </span>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
});

MobileCartButton.displayName = 'MobileCartButton';

export default MobileCartButton;