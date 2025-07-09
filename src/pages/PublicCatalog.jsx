import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import DigitalMenuLoading from '@/components/public_catalog/CatalogLoading';
import DigitalMenuError from '@/components/public_catalog/CatalogError';
import DigitalMenuBanner from '@/components/public_catalog/CatalogBanner';
import BusinessInfoDisplay from '@/components/public_catalog/BusinessInfoDisplay';
import MobileBusinessHeader from '@/components/public_catalog/MobileBusinessHeader';
import CategoryNavigation from '@/components/public_catalog/CategoryNavigation';
import DigitalMenuMainContent from '@/components/public_catalog/CatalogMainContent';
import DigitalMenuContainer from '@/components/public_catalog/CatalogContainer';
import MobileCartButton from '@/components/public_catalog/MobileCartButton';
import MobileCartModal from '@/components/public_catalog/MobileCartModal';
import CustomerIdentificationModal from '@/components/public_catalog/CustomerIdentificationModal';
import CheckoutModal from '@/components/public_catalog/CheckoutModal';
import SearchModal from '@/components/public_catalog/SearchModal';
import ProductAddonModal from '@/components/public_catalog/ProductAddonModal';
import { useCatalogTheme } from '@/contexts/CatalogThemeContext';
import { useCustomer } from '@/contexts/CustomerContext';
import { useCatalogData } from '@/hooks/useCatalogData';
import { useCart } from '@/hooks/useCart';
import { useCartUI } from '@/hooks/useCartUI';
import { useCatalogFilters, scrollToCategory } from '@/utils/catalogHelpers';

const PublicDigitalMenu = () => {
  const { businessSlug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  useCatalogTheme();
  const { isIdentified, customer, setCustomer } = useCustomer();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isIdentificationModalOpen, setIsIdentificationModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const categoryRefs = useRef({});

  const { businessData, loading, error, refetch } = useCatalogData(businessSlug, toast);
  const { cart, addToCart, removeFromCart, updateCartItemQuantity, cartTotal, cartItemCount, clearCart } = useCart(businessData, toast);
  const { 
    isCartOpenMobile, 
    setIsCartOpenMobile, 
    isDesktopCartVisible, 
    isDesktopCartMinimized,
    handleDesktopCartMouseEnter,
    handleDesktopCartMouseLeave,
    toggleDesktopCartMinimize 
  } = useCartUI(cart, cartItemCount);

  useEffect(() => {
    localStorage.setItem('last-visited-slug', businessSlug);
  }, [businessSlug]);

  const { categoriesToDisplay } = useCatalogFilters(businessData, '');
  
  const handleAddToCartFromModal = (cartItem) => {
    addToCart(cartItem);
    toast({
      title: "Adicionado ao carrinho!",
      description: `${cartItem.name} foi adicionado ao seu pedido.`,
    });
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsAddonModalOpen(true);
  };
  
  const handleSimpleProductAdd = (product) => {
    addToCart({
      ...product,
      quantity: 1,
      addons: [],
      finalPrice: product.promotional_price || product.price,
    });
    toast({
      title: "Adicionado ao carrinho!",
      description: `${product.name} foi adicionado ao seu pedido.`,
    });
  };

  const handleWhatsAppClick = useCallback(() => {
    const whatsappNumber = (businessData?.settings?.whatsapp || businessData?.settings?.phone || '').replace(/\D/g, '');
    if (whatsappNumber) {
      window.open(`https://wa.me/55${whatsappNumber}`, '_blank');
    } else {
      toast({ title: "Contato não configurado", variant: "destructive" });
    }
  }, [businessData, toast]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copiado!" });
  }, [toast]);
  
  const handleScrollToCategory = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    scrollToCategory(categoryId, categoryRefs);
  }, []);
  
  const handleCheckout = () => {
    if (!businessData?.settings?.is_open) {
      toast({ title: "Estabelecimento Fechado", variant: "destructive" });
      return;
    }
    if (cart.length === 0) {
      toast({ title: "Carrinho Vazio", variant: "destructive" });
      return;
    }
    
    if (isIdentified) {
      setIsCheckoutOpen(true);
    } else {
      setIsIdentificationModalOpen(true);
    }
  };

  const onIdentified = () => {
    setIsIdentificationModalOpen(false);
    if(cart.length > 0) {
      setIsCheckoutOpen(true);
    } else {
      toast({ title: `Bem-vindo, ${customer.name.split(' ')[0]}!` });
    }
  };

  const handleOrderSuccess = (orderId) => {
    clearCart();
    setIsCheckoutOpen(false);
    navigate(`/order/status/${orderId}`);
  };

  if (loading) return <DigitalMenuLoading theme="light" />;
  if (error || !businessData) {
    return <DigitalMenuError theme="light" message={error || "Erro ao carregar cardápio"} onRetry={refetch} />;
  }
  
  const primaryColorClass = 'red';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <DigitalMenuContainer
        isDesktopCartVisible={isDesktopCartVisible}
        isDesktopCartMinimized={isDesktopCartMinimized}
        handleDesktopCartMouseEnter={handleDesktopCartMouseEnter}
        handleDesktopCartMouseLeave={handleDesktopCartMouseLeave}
        toggleDesktopCartMinimize={toggleDesktopCartMinimize}
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        onCheckout={handleCheckout}
        total={cartTotal}
        businessData={businessData}
        cartItemCount={cartItemCount}
      >
        <div className="hidden lg:block">
          <DigitalMenuBanner bannerUrl={businessData?.settings?.banner_url}>
            <BusinessInfoDisplay 
              businessData={businessData} 
              onShare={handleShare} 
              onWhatsAppClick={handleWhatsAppClick} 
            />
          </DigitalMenuBanner>
        </div>
        
        <MobileBusinessHeader 
          businessData={businessData}
          onWhatsAppClick={handleWhatsAppClick}
        />
        
        <CategoryNavigation 
          categories={businessData.categories.sort((a,b) => (a.order_index || 0) - (b.order_index || 0))}
          selectedCategory={selectedCategory} 
          onSelectCategory={handleScrollToCategory}
          onSearchClick={() => setIsSearchOpen(true)}
          onLoginClick={() => setIsIdentificationModalOpen(true)}
        />

        <DigitalMenuMainContent
          categoriesToDisplay={categoriesToDisplay}
          categoryRefs={categoryRefs}
          onProductClick={handleProductClick}
          onSimpleProductAdd={handleSimpleProductAdd}
          businessIsOpen={businessData.settings.is_open}
        />
      </DigitalMenuContainer>
      
      <MobileCartButton
        cartItemCount={cartItemCount}
        isCartOpenMobile={isCartOpenMobile}
        setIsCartOpenMobile={setIsCartOpenMobile}
      />

      <MobileCartModal
        isCartOpenMobile={isCartOpenMobile}
        setIsCartOpenMobile={setIsCartOpenMobile}
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        onCheckout={handleCheckout}
        total={cartTotal}
        businessData={businessData}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        businessData={businessData}
        onAddToCart={addToCart}
      />

      <CustomerIdentificationModal
        isOpen={isIdentificationModalOpen}
        onClose={() => setIsIdentificationModalOpen(false)}
        onIdentified={onIdentified}
      />

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          total={cartTotal}
          deliveryZones={businessData.deliveryZones || []}
          businessData={businessData}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {selectedProduct && (
        <ProductAddonModal
          product={selectedProduct}
          isOpen={isAddonModalOpen}
          onClose={() => {
            setIsAddonModalOpen(false);
            setSelectedProduct(null);
          }}
          onAddToCart={handleAddToCartFromModal}
          businessSlug={businessSlug}
        />
      )}
    </div>
  );
};

export default PublicDigitalMenu;