import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

const CustomerDetails = ({ selectedCustomer, kitchenOrders }) => {

  const selectedCustomerOrders = useMemo(() => {
    if (!selectedCustomer) return [];

    return kitchenOrders
      .filter(order => order.customer_phone === selectedCustomer.phone)
      .sort((a, b) => new Date(b.order_time) - new Date(a.order_time));
  }, [kitchenOrders, selectedCustomer]);

  return (
    <motion.div
      className="lg:col-span-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="h-full bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">
            {selectedCustomer ? `Pedidos de ${selectedCustomer.name.split(' ')[0]}` : 'Histórico de Pedidos'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {selectedCustomer ? 'Detalhes dos pedidos do cliente selecionado' : 'Selecione um cliente para ver seu histórico'}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[66vh] overflow-y-auto">
          {selectedCustomer ? (
            selectedCustomerOrders.length > 0 ? (
              <div className="space-y-4">
                {selectedCustomerOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-lg border border-border bg-background/50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-foreground">Pedido #{String(order.id).split('-')[0]}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.order_time).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} às {new Date(order.order_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-600">{formatPrice(order.total)}</p>
                        <Badge variant={order.status === 'approved' ? 'default' : order.status === 'pending' ? 'secondary' : 'destructive'} className="mt-1">{order.status}</Badge>
                      </div>
                    </div>
                    <div className="mt-3 border-t pt-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm mb-1">
                          <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                          <span className="text-foreground">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-16 h-full flex flex-col justify-center items-center">
                <ShoppingBag className="h-10 w-10 mx-auto mb-2 text-muted-foreground/70" />
                <p>Nenhum pedido encontrado para este cliente.</p>
              </div>
            )
          ) : (
            <div className="text-center py-16 text-muted-foreground h-full flex flex-col justify-center items-center">
              <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-medium">Selecione um cliente ao lado</p>
              <p className="text-sm">para visualizar seus pedidos em detalhes.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CustomerDetails;