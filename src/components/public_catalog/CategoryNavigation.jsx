import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomerMenu from './CustomerMenu';

const CategoryNavigation = memo(({ categories, selectedCategory, onSelectCategory, onSearchClick, onLoginClick, theme, primaryColor, className }) => {
  return (
    <div className={cn("sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm", className)}>
      <div className="flex items-center h-12 px-4 lg:px-6">
        <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar-sm h-full flex-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "py-2 px-4 text-sm font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none h-full flex items-center border-b-2 min-w-0 flex-shrink-0 rounded-t-lg",
                selectedCategory === category.id 
                  ? "text-red-600 border-red-600 bg-red-50" 
                  : "text-gray-600 border-transparent hover:text-red-600 hover:bg-red-50/50"
              )}
            >
              <span className="truncate">{category.name}</span>
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onSearchClick} 
            className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Search size={18} />
          </Button>
          <CustomerMenu onLoginClick={onLoginClick} />
        </div>
      </div>
    </div>
  );
});

CategoryNavigation.displayName = 'CategoryNavigation';

export default CategoryNavigation;