import { useMemo } from 'react';

export const useCatalogFilters = (businessData, searchTerm) => {
  return useMemo(() => {
    if (!businessData) return { filteredProducts: [], categoriesToDisplay: [] };

    const filtered = businessData.products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const categories = businessData.categories
      .map(category => ({
        ...category,
        products: filtered.filter(p => p.category_id === category.id && p.available)
      }))
      .filter(category => category.products.length > 0)
      .sort((a, b) => a.order_index - b.order_index);

    return {
      filteredProducts: filtered,
      categoriesToDisplay: categories
    };
  }, [businessData, searchTerm]);
};

export const scrollToCategory = (categoryId, categoryRefs) => {
  const element = categoryRefs.current[categoryId];
  if (element) {
    const bannerHeight = document.querySelector('.catalog-banner-class')?.offsetHeight || 128;
    const navHeight = document.querySelector('.category-nav-class')?.offsetHeight || 48;
    const yOffset = -(navHeight) - 20;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const targetPosition = elementPosition + yOffset - bannerHeight;
    
    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
  }
};