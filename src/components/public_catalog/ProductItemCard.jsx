import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ImageOff as ImageIconPlaceholder } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const ProductItemCard = memo(({ product, onProductClick, onSimpleProductAdd, isOpen }) => {
  const discountPercentage = product.promotional_price && product.price ? Math.round(((product.price - product.promotional_price) / product.price) * 100) : 0;

  const hasAddons = product.addon_group_ids && product.addon_group_ids.length > 0;

  const handleClick = (e, isButtonClick = false) => {
    if (isOpen && product.available) {
      if (isButtonClick && !hasAddons) {
        e.stopPropagation();
        onSimpleProductAdd(product);
      } else {
        onProductClick(product);
      }
    }
  };

  return (
    <div 
      className="bg-white p-4 flex items-center space-x-4 transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
      onClick={(e) => handleClick(e, false)}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes de ${product.name}`}
    >
      <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIconPlaceholder size={32} />
          </div>
        )}
        {discountPercentage > 0 && (
          <div className="absolute -top-1 -right-1">
            <Badge className="text-xs px-1.5 py-0.5 font-bold bg-green-500 text-white shadow-md border border-white">
              -{discountPercentage}%
            </Badge>
          </div>
        )}
      </div>
      
      <div className="flex-grow min-w-0">
        <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2 leading-tight" title={product.name}>
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed" title={product.description}>
            {product.description}
          </p>
        )}
        <div className="flex items-baseline space-x-2">
          <span className="text-lg font-black text-gray-900">
            {hasAddons ? 'A partir de ' : ''}{formatPrice(product.promotional_price || product.price)}
          </span>
          {product.promotional_price && (
            <span className="text-sm line-through text-gray-500">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0">
        {isOpen && product.available ? (
          <Button
            variant="default"
            onClick={(e) => handleClick(e, true)}
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white shadow-md active:scale-95 transition-all duration-150"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <Plus size={20} className="font-bold" />
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="outline" 
            disabled 
            className="text-xs px-3 py-2 h-auto cursor-not-allowed border-gray-300 text-gray-400 bg-gray-100 rounded-lg"
          >
            {!product.available ? 'Indisponível' : 'Fechado'}
          </Button>
        )}
      </div>
    </div>
  );
});

ProductItemCard.displayName = 'ProductItemCard';

export default ProductItemCard;