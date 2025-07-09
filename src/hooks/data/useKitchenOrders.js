import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useKitchenOrders = (user, businessSettings) => {
  const [kitchenOrders, setKitchenOrders] = useState([]);

  const loadKitchenOrders = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('kitchen_orders')
        .select('*')
        .eq('user_id', userId)
        .order('order_time', { ascending: false });
        
      if (error) {
        console.error('Error loading kitchen orders:', error);
        return;
      }
      
      const processedOrders = data ? data.map(order => ({
        ...order,
        order_time: new Date(order.order_time)
      })) : [];
      
      setKitchenOrders(processedOrders);
    } catch (error) {
      console.error('Error in loadKitchenOrders:', error);
    }
  }, []);

  const addKitchenOrder = async (newOrderData) => {
    if (!user) return null;
    
    try {
      const status = businessSettings?.auto_approve_orders ? 'approved' : 'received';

      const orderWithUserId = {
        ...newOrderData,
        user_id: user.id,
        status: status,
        order_time: newOrderData.order_time || new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('kitchen_orders')
        .insert(orderWithUserId)
        .select()
        .single();
        
      if (error) {
        console.error('Error adding kitchen order:', error);
        return null;
      }
      
      const processedOrder = {
        ...data,
        order_time: new Date(data.order_time)
      };
      
      setKitchenOrders(prev => {
        const existingOrder = prev.find(order => order.id === processedOrder.id);
        if (existingOrder) {
          return prev;
        }
        return [processedOrder, ...prev];
      });
      
      return processedOrder;
    } catch (error) {
      console.error('Error in addKitchenOrder:', error);
      return null;
    }
  };

  const updateKitchenOrderStatus = async (orderId, newStatus) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('kitchen_orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating kitchen order status:', error);
        return false;
      }
      
      const processedOrder = {
        ...data,
        order_time: new Date(data.order_time)
      };
      
      setKitchenOrders(prev => 
        prev.map(order => 
          order.id === orderId ? processedOrder : order
        )
      );
      return true;
    } catch (error) {
      console.error('Error in updateKitchenOrderStatus:', error);
      return false;
    }
  };
  
  const cancelKitchenOrder = async (orderId) => { 
    return updateKitchenOrderStatus(orderId, 'cancelled');
  };

  const getKitchenOrders = () => {
    return kitchenOrders;
  };

  return { 
    kitchenOrders, 
    loadKitchenOrders, 
    addKitchenOrder, 
    updateKitchenOrderStatus, 
    cancelKitchenOrder, 
    getKitchenOrders 
  };
};