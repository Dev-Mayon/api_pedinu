import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu as MenuIcon, X as XIcon, ShoppingCart } from 'lucide-react';

const DigitalMenuHeaderMobile = ({ businessName, cartItemCount, isSidebarOpen, onToggleSidebar }) => {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white shadow-md p-3 flex items-center justify-between">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
        {isSidebarOpen ? <XIcon className="h-6 w-6 text-gray-700" /> : <MenuIcon className="h-6 w-6 text-gray-700" />}
      </Button>
      <h1 className="text-lg font-semibold text-gray-800 truncate px-2">{businessName}</h1>
      <div className="w-10 flex justify-end">
        {cartItemCount > 0 && (
           <div className="relative">
            <ShoppingCart className="h-6 w-6 text-gray-700" />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {cartItemCount}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default DigitalMenuHeaderMobile;