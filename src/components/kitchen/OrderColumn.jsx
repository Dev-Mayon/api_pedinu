import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderCard from '@/components/kitchen/OrderCard';
import { orderStatusConfig } from '@/components/kitchen/kitchenConfig';

const OrderColumn = ({ statusKey, orders, onUpdateStatus, onCancelOrder, onApproveOrder }) => {
  const config = orderStatusConfig[statusKey];

  return (
    <motion.div
      key={statusKey}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 * Object.keys(orderStatusConfig).indexOf(statusKey) }}
      className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
      style={{ minHeight: '600px', maxHeight: 'calc(100vh - 160px)' }}
    >
      <div className={`${config.bgColor} ${config.textColor} p-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <config.icon className="h-4 w-4 mr-2 flex-shrink-0" />
            <h2 className="text-sm font-semibold truncate">{config.title}</h2>
          </div>
          <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium min-w-[1.5rem] text-center flex-shrink-0 ml-2">
            {orders.length}
          </span>
        </div>
      </div>
      
      <div className={`flex-1 p-2 overflow-y-auto custom-scrollbar-sm transition-colors duration-300 ${orders.length === 0 ? config.emptyBgColor : 'bg-gray-50'}`}>
        <AnimatePresence>
          {orders.length > 0 ? (
            orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={onUpdateStatus}
                onCancelOrder={onCancelOrder}
                onApproveOrder={onApproveOrder}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 py-8 flex flex-col items-center justify-center h-full"
            >
              <config.icon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-medium">Nenhum pedido</p>
              <p className="text-xs text-gray-400 mt-1">nesta etapa</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default OrderColumn;