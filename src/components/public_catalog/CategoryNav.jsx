import React from 'react';
import { Button } from '@/components/ui/button';

const CategoryNav = ({ categories, selectedCategory, onSelectCategory }) => {
  if (!categories || categories.length === 0) {
    return <div className="p-4 text-sm text-center text-gray-500">Nenhuma categoria encontrada.</div>;
  }
  return (
    <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar-sm">
      {categories.map(category => (
        <Button
          key={category.id}
          variant="ghost"
          className={`w-full justify-start text-left h-auto py-2.5 px-3 text-sm font-medium rounded-md transition-all duration-150 ease-in-out
            ${selectedCategory === category.id
              ? 'bg-red-500 text-white shadow-sm hover:bg-red-600'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          onClick={() => onSelectCategory(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </nav>
  );
};

export default CategoryNav;