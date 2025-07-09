import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProductItemCard from '@/components/public_catalog/ProductItemCard';

const SearchModal = ({ isOpen, onClose, businessData, onAddToCart, theme, primaryColor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!businessData || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = businessData.products.filter(product => 
      product.available && (
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );

    setSearchResults(filtered);
  }, [searchTerm, businessData]);

  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-white"
      >
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center p-4 space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                ref={inputRef}
                placeholder="Buscar produtos..."
                className="pl-10 pr-4 h-12 text-base bg-gray-50 border-gray-200 focus:bg-white focus:border-red-300 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-12 w-12 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl flex-shrink-0"
            >
              <X size={24} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!searchTerm.trim() && (
            <div className="text-center py-16 px-4">
              <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2 text-gray-800">Buscar Produtos</h3>
                <p className="text-sm text-gray-600">Digite o nome do produto que você está procurando</p>
              </div>
            </div>
          )}

          {searchTerm.trim() && searchResults.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2 text-gray-800">Nenhum resultado encontrado</h3>
                <p className="text-sm text-gray-600">Não encontramos produtos com o termo "{searchTerm}"</p>
              </div>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="bg-white">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                </h2>
              </div>
              
              {searchResults.map((product, index) => (
                <div key={product.id}>
                  <ProductItemCard
                    product={product}
                    onAddToCart={onAddToCart}
                    isOpen={businessData?.settings?.is_open}
                    theme={theme}
                    primaryColor={primaryColor}
                  />
                  {index < searchResults.length - 1 && (
                    <div className="border-b border-gray-100 mx-4"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchModal;