import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ImageOff, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

const ProductCard = ({ product, cartQuantity, onAddToCart, onRemoveFromCart, isOpen }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col border border-gray-100 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="h-40 sm:h-48 w-full overflow-hidden relative">
        {product.image_url ? (
          <img-replace src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
            <ImageOff size={48} />
          </div>
        )}
        {!isOpen && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">Fechado</span>
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 line-clamp-2" title={product.name}>{product.name}</h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-2 flex-grow line-clamp-3">{product.description}</p>
        
        <div className="mt-auto">
          <div className="mb-2.5">
            {product.promotional_price ? (
              <div className="flex items-baseline space-x-1.5">
                <p className="text-lg sm:text-xl font-bold text-green-600">{formatPrice(product.promotional_price)}</p>
                <p className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</p>
              </div>
            ) : (
              <p className="text-lg sm:text-xl font-bold text-gray-800">{formatPrice(product.price)}</p>
            )}
          </div>

          {isOpen ? (
            <div className="flex items-center">
              {cartQuantity > 0 ? (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full border-red-300 text-red-500 hover:bg-red-50 flex-shrink-0"
                    onClick={() => onRemoveFromCart(product.id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-base font-medium w-10 text-center">{cartQuantity}</span>
                  <Button
                    size="icon"
                    className="h-9 w-9 rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600 flex-shrink-0"
                    onClick={() => onAddToCart(product)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full h-9 bg-red-500 hover:bg-red-600 text-white font-medium"
                  onClick={() => onAddToCart(product)}
                >
                  <ShoppingCart className="h-4 w-4 mr-1.5" /> Adicionar
                </Button>
              )}
            </div>
          ) : (
             <Button
                className="w-full h-9 bg-gray-300 text-gray-500 cursor-not-allowed"
                disabled
              >
                Indisponível
              </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;