import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export const useBusinessSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  const loadSettings = useCallback(async (userId) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      let { data, error: fetchError } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (fetchError && fetchError.code === 'PGRST116') {
        const { data: newSettings, error: insertError } = await supabase
          .from('business_settings')
          .insert({ user_id: userId, is_open: true, auto_approve_orders: false })
          .select()
          .single();

        if (insertError) throw insertError;
        data = newSettings;
      } else if (fetchError) {
        throw fetchError;
      }
      
      setSettings(data);
    } catch (e) {
      console.error('Error loading business settings:', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = useCallback(async (updates) => {
    if (!user || !user.id) return;
    
    const { data: existingSettings, error: checkError } = await supabase
      .from('business_settings')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing settings:', checkError);
      throw checkError;
    }

    let resultData;

    if (existingSettings) {
      const { data, error: updateError } = await supabase
        .from('business_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (updateError) {
        console.error('Error updating business settings:', updateError);
        throw updateError;
      }
      resultData = data;
    } else {
      const { data, error: insertError } = await supabase
        .from('business_settings')
        .insert({ ...updates, user_id: user.id })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error inserting business settings:', insertError);
        throw insertError;
      }
      resultData = data;
    }
    
    setSettings(prev => ({...prev, ...resultData}));
    return resultData;
  }, [user]);

  return { settings, loadSettings, updateSetting, loading, error };
};