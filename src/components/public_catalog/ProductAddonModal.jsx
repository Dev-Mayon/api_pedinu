import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, ShoppingCart, ImageOff as ImageIconPlaceholder } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCatalogData } from '@/hooks/useCatalogData';

const AddonItem = ({ addon, onSelect, onDeselect, count, group, selectedCount }) => {
  const canSelect = group.max_selection === 0 || selectedCount < group.max_selection;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-200">
          {addon.image_url ? (
            <img src={addon.image_url} alt={addon.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIconPlaceholder size={24} />
            </div>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-800">{addon.name}</p>
          <p className="text-sm font-semibold text-green-600">
            {addon.price === 0 ? 'Grátis' : `+ ${formatPrice(addon.price)}`}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-full"
          onClick={() => onDeselect(addon)}
          disabled={count === 0}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-sm font-bold w-5 text-center">{count}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-full"
          onClick={() => onSelect(addon)}
          disabled={!canSelect}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const AddonGroup = ({ group, addons, selectedAddons, onAddonSelect, onAddonDeselect }) => {
  const groupAddons = addons.filter(a => a.addon_group_id === group.id);
  const selectedCount = Object.values(selectedAddons).reduce((acc, addon) => {
    if (addon.addon_group_id === group.id) {
      return acc + addon.quantity;
    }
    return acc;
  }, 0);

  const isRequirementMet = selectedCount >= group.min_selection;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-bold text-gray-900">{group.name}</h4>
          <p className="text-sm text-gray-500">
            Escolha no mínimo {group.min_selection} e no máximo {group.max_selection === 0 ? 'quantos quiser' : group.max_selection}.
          </p>
        </div>
        {!isRequirementMet && (
          <Badge variant="destructive">Obrigatório</Badge>
        )}
      </div>
      <div className="space-y-2">
        {groupAddons.map(addon => (
          <AddonItem
            key={addon.id}
            addon={addon}
            onSelect={onAddonSelect}
            onDeselect={onAddonDeselect}
            count={selectedAddons[addon.id]?.quantity || 0}
            group={group}
            selectedCount={selectedCount}
          />
        ))}
      </div>
    </div>
  );
};

const ProductAddonModal = ({ product, isOpen, onClose, onAddToCart, businessSlug }) => {
  const { businessData } = useCatalogData(businessSlug);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [quantity, setQuantity] = useState(1);

  const addonGroups = businessData?.addonGroups || [];
  const addons = businessData?.addons || [];

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setSelectedAddons({});
        setQuantity(1);
      }, 300); // Aguarda a animação de fechamento
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const productAddonGroups = useMemo(() => {
    if (!product || !product.addon_group_ids || !addonGroups) return [];
    return addonGroups.filter(g => product.addon_group_ids.includes(g.id));
  }, [product, addonGroups]);

  const handleAddonSelect = (addon) => {
    setSelectedAddons(prev => {
      const newQuantity = (prev[addon.id]?.quantity || 0) + 1;
      return { ...prev, [addon.id]: { ...addon, quantity: newQuantity } };
    });
  };

  const handleAddonDeselect = (addon) => {
    setSelectedAddons(prev => {
      const currentQuantity = prev[addon.id]?.quantity || 0;
      if (currentQuantity <= 1) {
        const { [addon.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [addon.id]: { ...addon, quantity: currentQuantity - 1 } };
    });
  };

  const totalAddonsPrice = useMemo(() => {
    return Object.values(selectedAddons).reduce((total, addon) => {
      return total + (addon.price * addon.quantity);
    }, 0);
  }, [selectedAddons]);

  const finalPrice = useMemo(() => {
    const basePrice = product?.promotional_price || product?.price || 0;
    return (basePrice + totalAddonsPrice) * quantity;
  }, [product, totalAddonsPrice, quantity]);

  const isAddToCartDisabled = useMemo(() => {
    return productAddonGroups.some(group => {
      const selectedCount = Object.values(selectedAddons).reduce((acc, addon) => {
        if (addon.addon_group_id === group.id) {
          return acc + addon.quantity;
        }
        return acc;
      }, 0);
      return selectedCount < group.min_selection;
    });
  }, [productAddonGroups, selectedAddons]);

  const handleAddToCart = () => {
    if (isAddToCartDisabled) return;
    const cartItem = {
      ...product,
      quantity,
      addons: Object.values(selectedAddons),
      finalPrice: finalPrice / quantity,
    };
    onAddToCart(cartItem);
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 rounded-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative h-40 bg-gray-100">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIconPlaceholder size={48} />
              </div>
            )}
          </div>
          <DialogHeader className="p-4 sm:p-6">
            <DialogTitle className="text-xl sm:text-2xl font-bold">{product.name}</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">{product.description}</DialogDescription>
          </DialogHeader>
          
          <div className="px-4 sm:px-6 max-h-[calc(100vh-450px)] overflow-y-auto space-y-6 custom-scrollbar-sm">
            {productAddonGroups.map(group => (
              <AddonGroup
                key={group.id}
                group={group}
                addons={addons}
                selectedAddons={selectedAddons}
                onAddonSelect={handleAddonSelect}
                onAddonDeselect={handleAddonDeselect}
              />
            ))}
          </div>

          <DialogFooter className="p-4 sm:p-6 bg-gray-50 border-t flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-4">
            <div className="flex items-center justify-center space-x-3">
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-bold w-8 text-center">{quantity}</span>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={() => setQuantity(q => q + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="w-full sm:w-auto h-12 text-base font-semibold bg-red-600 hover:bg-red-700"
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Adicionar ({formatPrice(finalPrice)})
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductAddonModal;