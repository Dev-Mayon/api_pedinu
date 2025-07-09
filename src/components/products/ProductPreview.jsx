import React from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Share2, Clock, Plus, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/utils';

const ProductPreview = ({ previewData, isDialogOpen, editingProduct, selectedCategoryFilter }) => {
  const { categories, products, businessSettings } = useData();
  const { user } = useAuth();
  const { toast } = useToast();

  const getProductsByCategory = (categoryId) => {
    return products.filter(p => p.category_id === categoryId);
  };
  
  const currentCategory = selectedCategoryFilter || categories[0]?.id;
  const productsToDisplay = currentCategory ? getProductsByCategory(currentCategory) : [];

  return (
    <motion.div
      className="lg:w-1/3 bg-gray-100 p-4 border-l border-gray-200 overflow-y-auto h-full"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
    >
      <div className="sticky top-0 bg-gray-100 pt-2 pb-4 z-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Pré-visualização do Cardápio</h2>
        <div className="bg-white shadow-lg rounded-lg p-3 max-w-sm mx-auto">
          {businessSettings?.banner_url ? (
            <div className="h-20 sm:h-24 w-full rounded-t-md overflow-hidden mb-2 bg-gray-200">
               <img src={businessSettings.banner_url} alt="Banner Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-20 sm:h-24 w-full rounded-t-md bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white mb-2">
              <ImageIcon size={32} />
            </div>
          )}

          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                {businessSettings?.logo_url ? (
                  <img src={businessSettings.logo_url} alt="Logo Preview" className="w-full h-full object-cover" />
                ) : (
                  <Store size={20} className="text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 truncate max-w-[120px]">{user?.business_name || "Seu Negócio"}</h3>
                <div className={`flex items-center space-x-1 text-xs ${businessSettings?.is_open ? 'text-green-600' : 'text-red-600'}`}>
                  <Clock className="h-3 w-3" />
                  <span>{businessSettings?.is_open ? 'Aberto' : 'Fechado'}</span>
                </div>
              </div>
            </div>
            <Share2 className="h-4 w-4 text-gray-500 cursor-pointer" onClick={() => toast({ title: "Compartilhar (apenas visual)" })} />
          </div>

          <div className="flex space-x-3 border-b mb-3 text-xs px-1 overflow-x-auto whitespace-nowrap pb-1 custom-scrollbar-sm">
            {categories.map(cat => (
              <span key={cat.id} className={`pb-1 border-b-2 ${cat.id === currentCategory ? 'border-red-600 text-red-600 font-semibold' : 'border-transparent text-gray-500 hover:text-red-500'}`}>
                {cat.name}
              </span>
            ))}
            {categories.length === 0 && <span className="text-gray-400">Nenhuma categoria</span>}
          </div>
          
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar-sm pr-1">
            {isDialogOpen && previewData.name && previewData.categoryId && (
              <Card className="mb-2 border-red-500 border-2 shadow-md">
                <CardContent className="p-2">
                  <div className="flex space-x-2">
                    <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                      {previewData.image ? (
                        <img src={previewData.image} alt={previewData.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-xs truncate">{previewData.name || "Nome do Produto"}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{previewData.description || "Descrição..."}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center space-x-1">
                          {previewData.promotionalPrice ? (
                            <>
                              <span className="text-xs font-bold text-green-600">{formatPrice(previewData.promotionalPrice)}</span>
                              <span className="text-[10px] text-gray-400 line-through">{formatPrice(previewData.price)}</span>
                            </>
                          ) : (
                            <span className="text-xs font-bold text-gray-800">{formatPrice(previewData.price)}</span>
                          )}
                        </div>
                        <Button size="sm" className="h-5 w-5 p-0 bg-red-600 hover:bg-red-700">
                          <Plus className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {productsToDisplay.slice(0, 3).map(p => (
              (!isDialogOpen || p.id !== editingProduct?.id) &&
              <Card key={p.id} className="mb-2 shadow-sm">
                <CardContent className="p-2">
                  <div className="flex space-x-2">
                    <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-xs truncate">{p.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.description}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center space-x-1">
                          {p.promotional_price ? (
                            <>
                              <span className="text-xs font-bold text-green-600">{formatPrice(p.promotional_price)}</span>
                              <span className="text-[10px] text-gray-400 line-through">{formatPrice(p.price)}</span>
                            </>
                          ) : (
                            <span className="text-xs font-bold text-gray-800">{formatPrice(p.price)}</span>
                          )}
                        </div>
                        <Button size="sm" className="h-5 w-5 p-0 bg-red-600 hover:bg-red-700">
                          <Plus className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {productsToDisplay.length === 0 && !isDialogOpen && (
              <p className="text-xs text-gray-400 text-center py-4">Nenhum produto nesta categoria.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductPreview;