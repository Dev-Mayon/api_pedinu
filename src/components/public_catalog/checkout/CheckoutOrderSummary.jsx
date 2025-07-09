import React from 'react';
import { formatPrice } from '@/lib/utils';

const CheckoutOrderSummary = ({ total, deliveryFee, finalTotal, orderType, paymentMethod, changeFor }) => {
  const changeForValue = parseFloat(changeFor);
  const showChangeInfo = paymentMethod === 'Dinheiro' && !isNaN(changeForValue) && changeForValue >= finalTotal;
  const changeDue = showChangeInfo ? changeForValue - finalTotal : 0;

  return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-xl mb-4">
      <h3 className="font-bold text-gray-800 mb-2">Resumo do Pedido</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-semibold">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">{orderType === 'delivery' ? 'Taxa de entrega:' : 'Retirada no local:'}</span>
          <span className="font-semibold">{formatPrice(deliveryFee)}</span>
        </div>
        {showChangeInfo && (
          <>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Pagamento em dinheiro:</span>
              <span className="font-semibold">{formatPrice(changeForValue)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-blue-600">
              <span className="font-medium">Troco:</span>
              <span className="font-bold">{formatPrice(changeDue)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between items-center text-lg font-bold text-red-600 border-t pt-2 mt-2">
          <span>Total:</span>
          <span>{formatPrice(finalTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutOrderSummary;