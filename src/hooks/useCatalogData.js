import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const useCatalogData = (businessSlug, toast) => {
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCatalogData = useCallback(async () => {
    if (!businessSlug) {
      setError('Slug do negócio não fornecido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: catalogData, error: catalogError } = await supabase
        .rpc('get_catalog_data_optimized', { slug: businessSlug });

      if (catalogError) {
        console.error('Erro ao buscar dados do catálogo:', catalogError);
        throw catalogError;
      }

      if (!catalogData || catalogData.length === 0) {
        setError('Negócio não encontrado');
        setLoading(false);
        return;
      }

      const businessInfo = catalogData[0];

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('business_slug', businessSlug)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      const userId = profileData.id; // Este é o ID do perfil/negócio que precisamos

      const { data: deliveryZones, error: deliveryError } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('user_id', userId)
        .order('neighborhood_name', { ascending: true });

      if (deliveryError) {
        console.error('Erro ao buscar zonas de entrega:', deliveryError);
      }

      const categories = businessInfo.categories_data || [];
      const products = businessInfo.products_data || [];
      const addonGroups = businessInfo.addon_groups_data || [];
      const addons = businessInfo.addons_data || [];

      const categoriesWithProducts = categories.map(category => ({
        ...category,
        products: products.filter(product => product.category_id === category.id)
      }));
      // AQUI É ONDE O ID DO NEGÓCIO E O SLUG SÃO ADICIONADOS CORRETAMENTE!
      const formattedBusinessData = {
        id: userId,
        businessName: businessInfo.business_name,
        businessSlug: businessSlug, // ✅✅✅ CORREÇÃO FINAL ✅✅✅
        categories: categoriesWithProducts,
        products: products,
        addonGroups: addonGroups,
        addons: addons,
        deliveryZones: deliveryZones || [],
        settings: {
          logo_url: businessInfo.logo_url,
          banner_url: businessInfo.banner_url,
          is_open: businessInfo.is_open,
          delivery_fee: businessInfo.delivery_fee,
          min_order_value: businessInfo.min_order_value,
          phone: businessInfo.phone,
          whatsapp: businessInfo.whatsapp,
          description: businessInfo.description,
          address: businessInfo.address
        }
      };

      setBusinessData(formattedBusinessData);

      try {
        await supabase.rpc('increment_menu_view', { p_business_slug: businessSlug });
      } catch (viewError) {
        console.warn('Erro ao incrementar visualização:', viewError);
      }

    } catch (err) {
      console.error('Erro ao carregar dados do catálogo:', err);
      setError(err.message || 'Erro ao carregar dados');

      if (toast) {
        toast({
          title: "Erro ao carregar cardápio",
          description: "Não foi possível carregar os dados do cardápio. Tente novamente.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [businessSlug, toast]);

  useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  return {
    businessData,
    loading,
    error,
    refetch: fetchCatalogData
  };
};

export { useCatalogData };