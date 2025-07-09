import React, { memo } from 'react';
    import { motion } from 'framer-motion';
    import { Plus, Minus, Send, ShoppingCart, ImageOff as ImageIconPlaceholder, X } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { formatPrice, cn } from '@/lib/utils';

    const CartSummary = memo(({ cart, onAddToCart, onRemoveFromCart, onCheckout, total, isOpen, onClose }) => {
      return (
        <div
          className="relative w-full max-w-md lg:w-96 bg-white shadow-2xl p-4 flex flex-col h-[90vh] lg:h-auto lg:max-h-screen z-50 rounded-t-2xl lg:rounded-none border-t lg:border-t-0 lg:border-l border-gray-200"
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Seu Pedido</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </Button>
          </div>
          
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 py-10">
              <ShoppingCart size={48} className="mb-3 text-gray-300" />
              <p className="font-medium">Seu carrinho está vazio.</p>
              <p className="text-sm">Adicione itens para continuar.</p>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 -mr-1 mb-3 custom-scrollbar-sm">
              {cart.map(item => (
                <motion.div
                  key={item.cartItemId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-start space-x-3 p-2 rounded-lg transition-colors hover:bg-gray-50"
                >
                  <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 border bg-gray-100 border-gray-200">
                    {item.image_url ?
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                      : <ImageIconPlaceholder size={24} className="m-auto text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate text-gray-800" title={item.name}>{item.name}</h4>
                    <p className="text-xs text-gray-500">{formatPrice(item.finalPrice)}</p>
                    {item.addons && item.addons.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.addons.map(addon => (
                          <div key={addon.id}>+ {addon.quantity}x {addon.name}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 rounded-full hover:bg-gray-100 border-gray-300" 
                      onClick={() => onRemoveFromCart(item.cartItemId)}
                    >
                      <Minus className="h-3.5 w-3.5 text-gray-600" />
                    </Button>
                    <span className="text-sm font-medium w-5 text-center text-gray-800">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 rounded-full border-gray-300 hover:bg-gray-100" 
                      onClick={() => onAddToCart(item)}
                    >
                      <Plus className="h-3.5 w-3.5 text-gray-600" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="border-t pt-4 mt-auto border-gray-200">
            <div className="space-y-1.5 mb-3 text-sm">
              <div className="flex justify-between items-center text-gray-800">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Taxa de Entrega</span>
                <span>Calculada no checkout</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-lg font-bold mb-4 text-gray-800">
              <span>Total (parcial)</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Button
              className={cn(
                "w-full h-11 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all",
                isOpen 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
              onClick={onCheckout}
              disabled={!isOpen || cart.length === 0}
            >
              <Send className="h-5 w-5 mr-2" />
              {isOpen ? 'Finalizar Pedido' : 'Estabelecimento Fechado'}
            </Button>
          </div>
        </div>
      );
    });

    CartSummary.displayName = 'CartSummary';

    export default CartSummary;