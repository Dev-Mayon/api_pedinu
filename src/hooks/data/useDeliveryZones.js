import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useDeliveryZones = (user) => {
  const [deliveryZones, setDeliveryZones] = useState([]);

  const loadDeliveryZones = useCallback(async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('user_id', userId)
      .order('neighborhood_name', { ascending: true });
    if (error) {
      console.error('Error loading delivery zones:', error);
    } else {
      setDeliveryZones(data || []);
    }
  }, []);

  const addDeliveryZone = async (zoneData) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('delivery_zones')
      .insert({ ...zoneData, user_id: user.id })
      .select()
      .single();
    if (error) {
      console.error('Error adding delivery zone:', error);
      return null;
    }
    await loadDeliveryZones(user.id);
    return data;
  };

  const updateDeliveryZone = async (id, updates) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('delivery_zones')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) console.error('Error updating delivery zone:', error);
    else await loadDeliveryZones(user.id);
  };

  const deleteDeliveryZone = async (id) => {
    if (!user) return;
    const { error } = await supabase
      .from('delivery_zones')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) console.error('Error deleting delivery zone:', error);
    else await loadDeliveryZones(user.id);
  };

  return { deliveryZones, loadDeliveryZones, addDeliveryZone, updateDeliveryZone, deleteDeliveryZone };
};