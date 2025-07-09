import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessSettings } from '@/hooks/data/useBusinessSettings';
import { useCategories } from '@/hooks/data/useCategories';
import { useProducts } from '@/hooks/data/useProducts';
import { useDeliveryZones } from '@/hooks/data/useDeliveryZones';
import { useKitchenOrders } from '@/hooks/data/useKitchenOrders';
import { useCustomers } from '@/hooks/data/useCustomers';
import { useAddons } from '@/hooks/data/useAddons';
import { usePrinterSettings } from '@/hooks/data/usePrinterSettings';

const DataContext = createContext();

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
}

export function DataProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  const { settings: businessSettings, loadSettings: loadBusinessSettings, updateSetting: updateBusinessSettings, loading: loadingBusinessSettings } = useBusinessSettings();
  const { categories, loadCategories, addCategory, updateCategory, deleteCategory: originalDeleteCategory, reorderCategories } = useCategories(user);
  const { products, loadProducts, addProduct, updateProduct, deleteProduct, reorderProducts } = useProducts(user);
  const { deliveryZones, loadDeliveryZones, addDeliveryZone, updateDeliveryZone, deleteDeliveryZone } = useDeliveryZones(user);
  const { kitchenOrders, loadKitchenOrders, addKitchenOrder, updateKitchenOrderStatus, cancelKitchenOrder, getKitchenOrders } = useKitchenOrders(user, businessSettings);
  const { customers, customerOrders, loadCustomers, loadCustomerOrders, saveCustomerOrder, getCustomerStats } = useCustomers(user);
  const { addonGroups, addons, loadAddonGroups, loadAddons, addAddonGroup, updateAddonGroup, deleteAddonGroup, addAddon, updateAddon, deleteAddon } = useAddons(user);
  const { printerSettings, loadPrinterSettings, updatePrinterSettings } = usePrinterSettings(user);

  const deleteCategory = useCallback((id) => {
    return originalDeleteCategory(id, loadProducts);
  }, [originalDeleteCategory, loadProducts]);

  useEffect(() => {
    const loadAllDataForUser = async () => {
      if (user && user.id) {
        setLoadingData(true);
        await Promise.all([
          loadBusinessSettings(user.id),
          loadCategories(user.id),
          loadProducts(user.id),
          loadDeliveryZones(user.id),
          loadKitchenOrders(user.id),
          loadCustomers(user.id),
          loadCustomerOrders(user.id),
          loadAddonGroups(user.id),
          loadAddons(user.id),
          loadPrinterSettings(user.id)
        ]);
        setLoadingData(false);
      } else if(!authLoading) {
        setLoadingData(false);
      }
    };

    loadAllDataForUser();
  }, [user, authLoading, loadBusinessSettings, loadCategories, loadProducts, loadDeliveryZones, loadKitchenOrders, loadCustomers, loadCustomerOrders, loadAddonGroups, loadAddons, loadPrinterSettings]);

  const refreshData = useCallback(async () => {
    if (user && user.id) {
      setLoadingData(true);
      await Promise.all([
        loadBusinessSettings(user.id),
        loadCategories(user.id),
        loadProducts(user.id),
        loadDeliveryZones(user.id),
        loadKitchenOrders(user.id),
        loadCustomers(user.id),
        loadCustomerOrders(user.id),
        loadAddonGroups(user.id),
        loadAddons(user.id),
        loadPrinterSettings(user.id)
      ]).finally(() => setLoadingData(false));
    }
  }, [user, loadBusinessSettings, loadCategories, loadProducts, loadDeliveryZones, loadKitchenOrders, loadCustomers, loadCustomerOrders, loadAddonGroups, loadAddons, loadPrinterSettings]);
  
  const value = {
    businessSettings,
    updateBusinessSettings,
    loadingBusinessSettings,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    reorderProducts,
    deliveryZones,
    addDeliveryZone,
    updateDeliveryZone,
    deleteDeliveryZone,
    kitchenOrders,
    loadKitchenOrders,
    addKitchenOrder,
    updateKitchenOrderStatus,
    cancelKitchenOrder,
    getKitchenOrders,
    customers,
    customerOrders,
    loadCustomers,
    loadCustomerOrders,
    saveCustomerOrder,
    getCustomerStats,
    addonGroups,
    addons,
    addAddonGroup,
    updateAddonGroup,
    deleteAddonGroup,
    addAddon,
    updateAddon,
    deleteAddon,
    printerSettings,
    updatePrinterSettings,
    loadingData,
    refreshData,
    selectedCategoryFilter, 
    setSelectedCategoryFilter,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}