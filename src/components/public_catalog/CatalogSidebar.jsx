import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ImageOff as ImageIconPlaceholder } from 'lucide-react';
import { Input } from '@/components/ui/input';
import BusinessInfo from '@/components/public_catalog/BusinessInfo'; /* This component is not used in the new design */
import CategoryNav from '@/components/public_catalog/CategoryNav'; /* This component is not used in the new design for desktop sidebar */

/* 
  This component is no longer used for the primary desktop layout in PublicCatalog.jsx
  as per the new design which is a single-column layout.
  It might be repurposed for a mobile-only drawer or a different search/filter interaction later.
  For now, its direct usage in the main three-column layout of PublicCatalog.jsx is removed.
  The content it used to hold (BusinessInfo, CategoryNav for desktop sidebar) is now integrated
  directly into PublicCatalog.jsx for the new single-column design.
*/

const DigitalMenuSidebar = ({
  businessData, // Kept for potential future use, e.g. mobile drawer
  categories, // Kept for potential future use
  selectedCategory, // Kept for potential future use
  searchTerm,
  onSearchTermChange,
  onSelectCategory, // Kept for potential future use
  onShare, // Kept for potential future use
  isOpen, 
  onClose  
}) => {
  // This is a simplified version, focusing on a potential search modal trigger or mobile usage
  // The main desktop sidebar structure is removed as per the new design.
  
  const sidebarContentForMobileDrawer = (
    <div className="flex flex-col h-full">
      {/* Simplified content for a mobile drawer, if needed */}
      {businessData && businessData.settings.banner_url ? (
        <div className="w-full h-32 bg-gray-200 flex-shrink-0">
          <img-replace src={businessData.settings.banner_url} alt={`${businessData.businessName} banner`} className="w-full h-full object-cover" />
        </div>
      ) : businessData && (
        <div className="w-full h-32 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white flex-shrink-0">
          <ImageIconPlaceholder size={48} />
        </div>
      )}
      {/* BusinessInfo and CategoryNav would be used here if this was a full mobile drawer for categories/info */}
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar produtos..."
            className="pl-8 h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-red-300"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
      </div>
      {/* Example: <CategoryNav categories={categories} selectedCategory={selectedCategory} onSelectCategory={onSelectCategory} /> */}
      <div className="p-4 text-sm text-gray-500">Categorias apareceriam aqui em um drawer móvel.</div>
    </div>
  );


  return (
    <>
      {/* No Desktop Sidebar in the new design */}

      {/* Mobile Sidebar (Drawer) - Kept for potential mobile navigation that differs from desktop tabs */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:hidden fixed inset-0 z-50 flex"
            aria-modal="true"
            role="dialog"
          >
            <div className="w-72 sm:w-80 bg-white shadow-xl flex flex-col h-full overflow-y-auto">
              {/* This content would need to be designed based on mobile needs, 
                  potentially using CategoryNav and a compact BusinessInfo */}
              {sidebarContentForMobileDrawer}
            </div>
            <div className="flex-1 bg-black/50" onClick={onClose} aria-label="Fechar menu lateral"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DigitalMenuSidebar;