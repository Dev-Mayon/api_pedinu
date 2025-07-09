import React from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

function OrderSettings() {
  const { toast } = useToast();

  const handleFeatureClick = () => {
    toast({
      title: "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Configurações de Pedidos</h1>
        <p className="text-gray-600 mb-8">Configure como os pedidos são processados</p>
        <button 
          onClick={handleFeatureClick}
          className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          Configurar Pedidos
        </button>
      </motion.div>
    </div>
  );
}

export default OrderSettings;