import React from 'react';
import { AlertTriangle } from 'lucide-react';

const KitchenLoading = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50">
      <AlertTriangle className="h-16 w-16 text-orange-400 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Carregando Pedidos...</h2>
      <p className="text-gray-500">Aguarde um momento enquanto buscamos os dados da sua cozinha.</p>
    </div>
  );
};

export default KitchenLoading;