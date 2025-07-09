import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Check, ArrowRight, Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/utils';
import { orderStatusConfig } from '@/components/kitchen/kitchenConfig';

const OrderCard = ({ order, onUpdateStatus, onCancelOrder, onApproveOrder }) => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);

  const timeSinceOrder = Math.round((new Date() - new Date(order.order_time)) / 60000);
  const statusInfo = orderStatusConfig[order.status];

  if (!statusInfo) {
    console.error("Status de pedido inválido:", order.status, order);
    return <Card className="mb-2 p-2 bg-red-100 text-red-700 border border-red-300 rounded-lg text-xs">Erro: Status de pedido desconhecido.</Card>;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mb-2"
    >
      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <CardHeader className="p-2 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-xs font-semibold text-gray-900 truncate">#{order.id.slice(-4)}</CardTitle>
              <CardDescription className="text-xs text-gray-600 truncate">{order.customer_name}</CardDescription>
            </div>
            <div className="flex items-center text-xs text-gray-500 ml-2 flex-shrink-0">
              <Clock className="h-3 w-3 mr-1" />
              <span>{timeSinceOrder}min</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-2">
          <div className="mb-2">
            <div className="text-xs text-gray-600 mb-1">Itens:</div>
            <div className="text-xs text-gray-800 space-y-0.5 max-h-16 overflow-y-auto custom-scrollbar-sm">
              {order.items.slice(0, expanded ? order.items.length : 2).map((item, index) => (
                <div key={`${item.name}-${index}`} className="truncate">
                  <span className="font-medium">{item.quantity}x</span> <span className="text-gray-700">{item.name}</span>
                </div>
              ))}
            </div>
            {order.items.length > 2 && (
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs h-auto p-0 mt-1 text-blue-600 hover:text-blue-700" 
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Menos' : `+${order.items.length - 2}`}
              </Button>
            )}
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tipo:</span>
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${order.order_type === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {order.order_type === 'delivery' ? 'Entrega' : 'Retirada'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pagamento:</span>
              <span className="text-gray-800 capitalize text-xs">{order.payment_method}</span>
            </div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-sm font-bold text-gray-900 text-center">{formatPrice(order.total)}</div>
          </div>
        </CardContent>
        
        <CardFooter className="p-2 border-t border-gray-100 space-y-1.5">
          {order.status === 'received' && (
             <Button
                className="w-full h-7 text-xs bg-green-600 hover:bg-green-700 text-white font-medium"
                onClick={() => onApproveOrder(order.id)}
              >
                Aprovar Pedido
                <Check className="h-3 w-3 ml-1" />
              </Button>
          )}

          {statusInfo.next && order.status !== 'received' && (
            <Button
              className="w-full h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
              onClick={() => onUpdateStatus(order.id, statusInfo.next)}
            >
              Avançar
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
          
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-6 text-xs border-gray-300 px-1" 
              onClick={() => toast({ title: "🚧 Impressão em breve!", description: "Esta funcionalidade ainda não foi implementada."})}
            >
              <Printer className="h-3 w-3" />
            </Button>
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-6 text-xs text-red-600 border-red-300 hover:bg-red-50 px-1" 
                onClick={() => onCancelOrder(order.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default OrderCard;