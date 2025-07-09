import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerContext = createContext();

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}

export function CustomerProvider({ children }) {
  const [customer, setCustomerState] = useState({ name: '', phone: '', email: '' });
  const [isIdentified, setIsIdentified] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    try {
      const storedCustomer = localStorage.getItem('pedinu-customer');
      if (storedCustomer) {
        const parsedCustomer = JSON.parse(storedCustomer);
        setCustomerState({
            name: parsedCustomer.name || '',
            phone: parsedCustomer.phone || '',
            email: parsedCustomer.email || '',
        });
        if (parsedCustomer.name && parsedCustomer.phone) {
          setIsIdentified(true);
        }
      }
    } catch (error) {
      console.error('Failed to parse customer data from localStorage', error);
      localStorage.removeItem('pedinu-customer');
    }
  }, []);

  const setCustomer = (customerData) => {
    try {
      const currentData = JSON.parse(localStorage.getItem('pedinu-customer') || '{}');
      const updatedCustomer = { ...currentData, ...customerData };
      localStorage.setItem('pedinu-customer', JSON.stringify(updatedCustomer));
      setCustomerState({
        name: updatedCustomer.name || '',
        phone: updatedCustomer.phone || '',
        email: updatedCustomer.email || '',
      });
      if (updatedCustomer.name && updatedCustomer.phone) {
        setIsIdentified(true);
      }
    } catch (error) {
      console.error('Failed to save customer data to localStorage', error);
    }
  };
  
  const clearCustomer = () => {
    localStorage.removeItem('pedinu-customer');
    setCustomerState({ name: '', phone: '', email: '' });
    setSelectedAddress(null);
    setIsIdentified(false);
  };

  const value = {
    customer,
    isIdentified,
    setCustomer,
    clearCustomer,
    selectedAddress,
    setSelectedAddress,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}