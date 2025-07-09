import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useCategories = (user) => {
  const [categories, setCategories] = useState([]);

  const loadCategories = useCallback(async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true });
    if (error) console.error('Error loading categories:', error);
    else setCategories(data || []);
  }, []);

  const addCategory = async (name) => {
    if (!user) return null;
    const newOrderIndex = categories.length > 0 ? Math.max(...categories.map(c => c.order_index)) + 1 : 0;
    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: user.id, name, order_index: newOrderIndex })
      .select()
      .single();
    if (error) {
      console.error('Error adding category:', error);
      return null;
    } else {
      setCategories(prev => [...prev, data].sort((a, b) => a.order_index - b.order_index));
      return data;
    }
  };

  const updateCategory = async (id, updates) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) console.error('Error updating category:', error);
    else {
      setCategories(prev => prev.map(cat => cat.id === id ? data : cat).sort((a, b) => a.order_index - b.order_index));
    }
  };

  const deleteCategory = async (id, loadProducts) => {
    if (!user) return;
    
    await supabase
      .from('products')
      .update({ category_id: null }) 
      .eq('category_id', id)
      .eq('user_id', user.id);

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) console.error('Error deleting category:', error);
    else {
      setCategories(prev => prev.filter(cat => cat.id !== id));
      if (loadProducts) await loadProducts(user.id); 
    }
  };

  const reorderCategories = async (newCategoriesOrder) => {
    if (!user) return;
    const updates = newCategoriesOrder.map((cat, index) => 
      supabase.from('categories').update({ order_index: index }).eq('id', cat.id).eq('user_id', user.id)
    );
    await Promise.all(updates.map(p => p.catch(e => console.error('Error reordering categories (single):', e))));
    await loadCategories(user.id); 
  };

  return { categories, loadCategories, addCategory, updateCategory, deleteCategory, reorderCategories };
};