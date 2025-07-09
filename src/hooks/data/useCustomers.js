import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useCustomers = (user) => {
  const [customers, setCustomers] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);

  const loadCustomers = useCallback(async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .order('last_order_date', { ascending: false });
    if (error) {
      console.error('Error loading customers:', error);
    } else {
      setCustomers(data || []);
    }
  }, []);

  const loadCustomerOrders = useCallback(async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('customer_orders')
      .select('*')
      .eq('user_id', userId)
      .order('order_date', { ascending: false });
    if (error) {
      console.error('Error loading customer orders:', error);
    } else {
      setCustomerOrders(data || []);
    }
  }, []);

  const saveCustomerOrder = async (userId, customerDetails, cart, subtotal, deliveryFee, total) => {
    if (!userId) return null;

    try {
      let customer = customers.find(c => c.phone === customerDetails.phone);
      
      if (customer) {
        const { data: updatedCustomer, error: updateError } = await supabase
          .from('customers')
          .update({
            name: customerDetails.name,
            neighborhood: customerDetails.neighborhood,
            address: customerDetails.address,
            total_orders: customer.total_orders + 1,
            total_spent: Number(customer.total_spent) + Number(total),
            last_order_date: new Date().toISOString()
          })
          .eq('id', customer.id)
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating customer:', updateError);
        } else {
          customer = updatedCustomer;
        }
      } else {
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert({
            user_id: userId,
            name: customerDetails.name,
            phone: customerDetails.phone,
            neighborhood: customerDetails.neighborhood,
            address: customerDetails.address,
            total_orders: 1,
            total_spent: Number(total)
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating customer:', insertError);
          return null;
        } else {
          customer = newCustomer;
        }
      }

      const { data: orderData, error: orderError } = await supabase
        .from('customer_orders')
        .insert({
          user_id: userId,
          customer_id: customer.id,
          customer_name: customerDetails.name,
          customer_phone: customerDetails.phone,
          customer_neighborhood: customerDetails.neighborhood,
          customer_address: customerDetails.address,
          items: cart,
          subtotal: Number(subtotal),
          delivery_fee: Number(deliveryFee),
          total: Number(total),
          payment_method: customerDetails.paymentMethod,
          notes: customerDetails.notes
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error saving customer order:', orderError);
        return null;
      }

      await loadCustomers(userId);
      await loadCustomerOrders(userId);
      
      return orderData;
    } catch (error) {
      console.error('Error in saveCustomerOrder:', error);
      return null;
    }
  };

  const getCustomerStats = () => {
    const totalCustomers = customers.length;
    const totalOrders = customerOrders.length;
    const totalRevenue = customerOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalCustomers,
      totalOrders,
      totalRevenue,
      averageOrderValue
    };
  };

  return {
    customers,
    customerOrders,
    loadCustomers,
    loadCustomerOrders,
    saveCustomerOrder,
    getCustomerStats
  };
};