import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const usePrinterSettings = (user) => {
  const [printerSettings, setPrinterSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPrinterSettings = useCallback(async (userId) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from('printer_settings')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is for "no rows" which is handled
          throw error;
      }

      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from('printer_settings')
          .insert({ user_id: userId, name: 'Impressora Principal', auto_print: false })
          .select()
          .single();

        if (insertError) {
          // It might fail if another process created it in the meantime. Re-fetch.
          if (insertError.code === '23505') { // unique_violation
             const { data: existingData, error: fetchError } = await supabase
                .from('printer_settings')
                .select('*')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false })
                .limit(1)
                .single();
              if(fetchError) throw fetchError;
              data = existingData;
          } else {
            throw insertError;
          }
        } else {
            data = newSettings;
        }
      }
      
      setPrinterSettings(data);
    } catch (e) {
      console.error('Error loading printer settings:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePrinterSettings = useCallback(async (updates) => {
    if (!user || !user.id || !printerSettings) return;

    try {
      const { data, error } = await supabase
        .from('printer_settings')
        .update(updates)
        .eq('id', printerSettings.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating printer settings:', error);
        throw error;
      }

      setPrinterSettings(data);
      return data;
    } catch (error) {
      console.error('Error in updatePrinterSettings:', error);
      throw error;
    }
  }, [user, printerSettings]);

  return { printerSettings, loadPrinterSettings, updatePrinterSettings, loading };
};