import React from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Eye, EyeOff, Edit, Trash2, Plus, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const ProductList = ({ handleOpenDialog, handleDeleteProduct, toggleProductAvailability }) => {
  const { categories, products, selectedCategoryFilter, setSelectedCategoryFilter, loadingData } = useData();
  const { toast } = useToast();

  const getProductsByCategory = (categoryId) => {
    return products.filter(p => p.category_id === categoryId);
  };

  const displayedCategories = selectedCategoryFilter ? categories.filter(c => c.id === selectedCategoryFilter) : categories;

  if (loadingData && categories.length === 0 && products.length === 0) {
    return <div className="text-center py-12">Carregando produtos...</div>;
  }

  return (
    <>
      <div className="flex space-x-2 overflow-x-auto pb-2 mb-6">
        <Button
          variant={selectedCategoryFilter === '' ? 'default' : 'outline'}
          onClick={() => setSelectedCategoryFilter('')}
          className={selectedCategoryFilter === '' ? 'bg-red-600 hover:bg-red-700 text-white' : 'hover:bg-red-50 hover:border-red-300'}
          size="sm"
        >
          Todas
        </Button>
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategoryFilter === category.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategoryFilter(category.id)}
            className={selectedCategoryFilter === category.id ? 'bg-red-600 hover:bg-red-700 text-white' : 'hover:bg-red-50 hover:border-red-300'}
            size="sm"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {categories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-lg shadow"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PackageSearch className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Crie categorias primeiro!</h3>
          <p className="text-gray-500 mb-4">Para adicionar produtos, você precisa ter pelo menos uma categoria criada.</p>
          <Button className="bg-gradient-to-r from-red-500 to-red-700" onClick={() => toast({ title: "Navegue para 'Cardápio' no menu lateral para criar suas categorias." })}>
            Gerenciar Cardápio
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {displayedCategories.length === 0 && selectedCategoryFilter && (
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-lg shadow"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto nesta categoria</h3>
              <p className="text-gray-500 mb-4">Adicione produtos a esta categoria para vê-los aqui.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 hover:bg-red-50 hover:border-red-300"
                onClick={() => handleOpenDialog(null, selectedCategoryFilter)}
              >
                Adicionar Produto
              </Button>
            </motion.div>
          )}
          {displayedCategories.map((category, categoryIndex) => {
            const categoryProducts = getProductsByCategory(category.id);
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.05 }}
              >
                <Card className="shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(null, category.id)}
                        className="hover:bg-red-50 hover:border-red-300"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Produto
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {categoryProducts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum produto nesta categoria ainda.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 hover:bg-red-50 hover:border-red-300"
                          onClick={() => handleOpenDialog(null, category.id)}
                        >
                          Adicionar Primeiro Produto
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {categoryProducts.map((product, productIndex) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: productIndex * 0.05 }}
                            className={`flex items-center space-x-4 p-4 border rounded-lg ${product.available ? 'bg-white' : 'bg-gray-50 opacity-75'}`}
                          >
                            <div className="w-16 h-16 bg-gray-100 border rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900">{product.name}</h4>
                              <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                {product.promotional_price ? (
                                  <>
                                    <span className="text-lg font-bold text-green-600">{formatPrice(product.promotional_price)}</span>
                                    <span className="text-sm text-gray-500 line-through">{formatPrice(product.price)}</span>
                                  </>
                                ) : (
                                  <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Button variant="outline" size="icon" onClick={() => toggleProductAvailability(product)} className={`${product.available ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'} hover:border-gray-300 h-8 w-8 sm:h-9 sm:w-9`}>
                                {product.available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleOpenDialog(product)} className="hover:bg-red-50 hover:border-red-300 h-8 w-8 sm:h-9 sm:w-9">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleDeleteProduct(product)} className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 sm:h-9 sm:w-9">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
           {displayedCategories.length === 0 && !selectedCategoryFilter && categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-lg shadow"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto para mostrar</h3>
              <p className="text-gray-500 mb-4">Selecione uma categoria para ver os produtos ou adicione novos produtos.</p>
            </motion.div>
          )}
        </div>
      )}
    </>
  );
};

export default ProductList;