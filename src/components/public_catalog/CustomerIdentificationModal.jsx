import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomer } from '@/contexts/CustomerContext';

const CustomerIdentificationModal = ({ isOpen, onClose, onIdentified }) => {
  const { customer, setCustomer } = useCustomer();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setName(customer.name || '');
      setPhone(customer.phone || '');
    }
  }, [isOpen, customer]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'O nome é obrigatório.';
    if (!phone.trim()) newErrors.phone = 'O WhatsApp é obrigatório.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setCustomer({ ...customer, name, phone });
      onIdentified();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6" />
              <div>
                <h2 className="text-2xl font-bold">Identifique-se</h2>
                <p className="text-red-100">Para continuar, informe seus dados.</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="id-name" className="flex items-center space-x-2 text-gray-700 font-medium">
                  <User className="h-4 w-4 text-red-500" />
                  <span>Nome Completo *</span>
                </Label>
                <Input
                  id="id-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`border-2 focus:border-red-500 focus:ring-red-500 ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                  placeholder="Seu nome completo"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="id-phone" className="flex items-center space-x-2 text-gray-700 font-medium">
                  <Phone className="h-4 w-4 text-red-500" />
                  <span>WhatsApp *</span>
                </Label>
                <Input
                  id="id-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`border-2 focus:border-red-500 focus:ring-red-500 ${errors.phone ? 'border-red-300' : 'border-gray-200'}`}
                  placeholder="(11) 99999-9999"
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Continuar</span>
              </Button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerIdentificationModal;