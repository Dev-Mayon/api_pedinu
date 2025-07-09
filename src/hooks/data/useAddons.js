import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useAddons = (user) => {
  const [addonGroups, setAddonGroups] = useState([]);
  const [addons, setAddons] = useState([]);

  const loadAddonGroups = useCallback(async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('addon_groups')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');
    if (error) console.error('Error loading addon groups:', error);
    else setAddonGroups(data || []);
  }, []);

  const loadAddons = useCallback(async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('addons')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');
    if (error) console.error('Error loading addons:', error);
    else setAddons(data || []);
  }, []);

  const addAddonGroup = async (groupData) => {
    if (!user) return null;
    const payload = { ...groupData, user_id: user.id };
    const { data, error } = await supabase
      .from('addon_groups')
      .insert(payload)
      .select()
      .single();
    if (error) {
      console.error('Error adding addon group:', error);
      return null;
    }
    setAddonGroups(prev => [...prev, data]);
    return data;
  };

  const updateAddonGroup = async (id, updates) => {
    const { data, error } = await supabase
      .from('addon_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating addon group:', error);
      return null;
    }
    setAddonGroups(prev => prev.map(g => (g.id === id ? data : g)));
    return data;
  };

  const deleteAddonGroup = async (id) => {
    const { error } = await supabase
      .from('addon_groups')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting addon group:', error);
      return false;
    }
    setAddonGroups(prev => prev.filter(g => g.id !== id));
    setAddons(prev => prev.filter(a => a.addon_group_id !== id));
    return true;
  };

  const addAddon = async (addonData) => {
    if (!user || !addonData.addon_group_id) {
      console.error("User or addon_group_id missing for addAddon");
      return null;
    }
    const payload = { ...addonData, user_id: user.id };
    const { data, error } = await supabase
      .from('addons')
      .insert(payload)
      .select()
      .single();
    if (error) {
      console.error('Error adding addon:', error);
      return null;
    }
    setAddons(prev => [...prev, data]);
    return data;
  };

  const updateAddon = async (id, updates) => {
    const { data, error } = await supabase
      .from('addons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating addon:', error);
      return null;
    }
    setAddons(prev => prev.map(a => (a.id === id ? data : a)));
    return data;
  };

  const deleteAddon = async (id) => {
    const { error } = await supabase
      .from('addons')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting addon:', error);
      return false;
    }
    setAddons(prev => prev.filter(a => a.id !== id));
    return true;
  };

  return {
    addonGroups,
    addons,
    loadAddonGroups,
    loadAddons,
    addAddonGroup,
    updateAddonGroup,
    deleteAddonGroup,
    addAddon,
    updateAddon,
    deleteAddon,
  };
};