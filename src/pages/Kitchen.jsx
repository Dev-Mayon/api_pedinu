import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import KitchenHeader from '@/components/kitchen/KitchenHeader';
import OrderColumn from '@/components/kitchen/OrderColumn';
import KitchenLoading from '@/components/kitchen/KitchenLoading';
import { kitchenViewStatuses, orderStatusConfig } from '@/components/kitchen/kitchenConfig';

function Kitchen() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const { businessSettings, kitchenOrders, updateKitchenOrderStatus, cancelKitchenOrder, addKitchenOrder, loadingData, updateBusinessSettings } = useData(); 

  const handleUpdateStatus = async (orderId, newStatus) => {
    const success = await updateKitchenOrderStatus(orderId, newStatus);
    if (success) {
      toast({
        title: "Status Atualizado!",
        description: `Pedido #${orderId.slice(-4)} movido para ${orderStatusConfig[newStatus]?.title || newStatus}.`
      });
    } else {
        toast({
            title: "Erro ao atualizar!",
            description: `Não foi possível mover o pedido #${orderId.slice(-4)}.`,
            variant: "destructive"
        });
    }
  };
  
  const handleApproveOrder = (orderId) => {
    handleUpdateStatus(orderId, 'approved');
  };

  const handleCancelOrder = async (orderId) => {
    const success = await cancelKitchenOrder(orderId);
    if(success) {
        toast({
            title: "Pedido Cancelado!",
            description: `Pedido #${orderId.slice(-4)} foi cancelado.`,
            variant: "destructive"
        });
    } else {
        toast({
            title: "Erro ao cancelar!",
            description: `Não foi possível cancelar o pedido #${orderId.slice(-4)}.`,
            variant: "destructive"
        });
    }
  };

  const handleAutoApproveChange = async (checked) => {
    try {
      await updateBusinessSettings({ auto_approve_orders: checked });
      toast({
        title: "Configuração salva!",
        description: `Aprovação automática ${checked ? 'ativada' : 'desativada'}.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível alterar a configuração.",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = kitchenOrders.filter(order =>
    (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    kitchenViewStatuses.includes(order.status)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (businessSettings && businessSettings.is_open && Math.random() < 0.05) { 
        const newOrderId = `KORD${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
        const sampleItems = [
            { name: 'Pizza Calabresa', quantity: Math.floor(Math.random() * 2) + 1 },
            { name: 'X-Tudo', quantity: Math.floor(Math.random() * 1) + 1 },
            { name: 'Açaí 500ml', quantity: Math.floor(Math.random() * 2) + 1 },
            { name: 'Refrigerante 2L', quantity: 1 },
        ];
        const numItems = Math.floor(Math.random() * 2) + 1;
        const currentItems = [];
        for(let i=0; i<numItems; i++){
            currentItems.push(sampleItems[Math.floor(Math.random() * sampleItems.length)]);
        }

        const newOrder = {
          id: newOrderId,
          customer_name: ['Roberto Alves', 'Fernanda Costa', 'Lucas Martins', 'Beatriz Santos'][Math.floor(Math.random() * 4)],
          items: currentItems,
          total: Math.floor(Math.random() * 80) + 20,
          order_time: new Date().toISOString(),
          order_type: Math.random() > 0.5 ? 'delivery' : 'pickup',
          delivery_address: 'Rua Exemplo, ' + (Math.floor(Math.random() * 1000) + 1),
          payment_method: ['pix', 'credit_card', 'cash'][Math.floor(Math.random()*3)]
        };
        addKitchenOrder(newOrder).then(addedOrder => {
            if(addedOrder){
                const toastTitle = businessSettings?.auto_approve_orders ? "✅ Pedido Aprovado!" : "🎉 Novo Pedido!";
                const toastDescription = businessSettings?.auto_approve_orders 
                    ? `Pedido #${addedOrder.id.slice(-4)} foi para produção.`
                    : `Pedido #${addedOrder.id.slice(-4)} aguardando análise.`;

                toast({
                    title: toastTitle,
                    description: toastDescription,
                });
            }
        }); 
      }
    }, 35000); 
    return () => clearInterval(interval);
  }, [businessSettings, toast, addKitchenOrder]);

  if (loadingData || !businessSettings) {
    return <KitchenLoading />;
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <KitchenHeader 
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        businessSettings={businessSettings}
        onAutoApproveChange={handleAutoApproveChange}
      />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-3 overflow-y-auto">
        {kitchenViewStatuses.map(statusKey => (
          <OrderColumn
            key={statusKey}
            statusKey={statusKey}
            orders={filteredOrders.filter(order => order.status === statusKey)}
            onUpdateStatus={handleUpdateStatus}
            onCancelOrder={handleCancelOrder}
            onApproveOrder={handleApproveOrder}
          />
        ))}
      </div>
    </div>
  );
}

export default Kitchen;