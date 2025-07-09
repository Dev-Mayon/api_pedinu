import React, { memo } from 'react';
import { Search, BookOpen, Sparkles } from 'lucide-react';
import ProductItemCard from '@/components/public_catalog/ProductItemCard';
import { cn } from '@/lib/utils';

const DigitalMenuMainContent = memo(({ categoriesToDisplay, searchTerm, categoryRefs, onProductClick, onSimpleProductAdd, businessIsOpen, theme, primaryColor }) => {
  return (
    <main className="bg-gray-50 min-h-screen pb-20 lg:pb-8">
      {categoriesToDisplay.length === 0 && searchTerm && (
        <div className="text-center py-16 text-gray-500 px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold mb-2 text-gray-800">Nenhum resultado encontrado</h3>
            <p className="text-sm">Não encontramos produtos com o termo "{searchTerm}".</p>
          </div>
        </div>
      )}
      
      {categoriesToDisplay.length === 0 && !searchTerm && (
        <div className="text-center py-16 text-gray-500 px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold mb-2 text-gray-800">Cardápio Indisponível</h3>
            <p className="text-sm">Nenhum produto disponível para exibição no momento.</p>
          </div>
        </div>
      )}

      {categoriesToDisplay.map((category) => (
        <section 
          key={category.id} 
          id={`category-${category.id}`} 
          ref={el => categoryRefs.current[category.id] = el} 
          className="mb-6 scroll-mt-24"
        >
          <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-12 z-10">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Sparkles className="h-5 w-5 text-red-500 mr-2" />
              {category.name}
            </h2>
          </div>
          
          <div className="bg-white">
            {category.products.sort((a,b) => (a.order_index || 0) - (b.order_index || 0)).map((product, index) => (
              <div key={product.id}>
                <ProductItemCard 
                  product={product} 
                  onProductClick={onProductClick}
                  onSimpleProductAdd={onSimpleProductAdd}
                  isOpen={businessIsOpen}
                  theme="light"
                  primaryColor={primaryColor}
                />
                {index < category.products.length - 1 && (
                  <div className="border-b border-gray-100 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
});

DigitalMenuMainContent.displayName = 'DigitalMenuMainContent';

export default DigitalMenuMainContent;