import React, { useState, useMemo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatPrice } from '@/lib/utils';
import { isToday, startOfToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import BusinessStatusToggle from '@/components/dashboard/BusinessStatusToggle';
import { useToast } from '@/components/ui/use-toast';

const StatCards = lazy(() => import('@/components/dashboard/StatCards'));
const CustomerList = lazy(() => import('@/components/dashboard/CustomerList'));
const CustomerDetails = lazy(() => import('@/components/dashboard/CustomerDetails'));

function DashboardLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
    </div>
  );
}

function Dashboard() {
  const { customers, kitchenOrders, getCustomerStats, loadingData, refreshData, businessSettings, updateBusinessSettings, loadingBusinessSettings } = useData();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const { toast } = useToast();

  const handleToggleStatus = async (newStatus) => {
    setIsSavingStatus(true);
    try {
      await updateBusinessSettings({ is_open: newStatus });
      toast({
        title: "Status da loja atualizado!",
        description: `Sua loja agora está ${newStatus ? 'aberta' : 'fechada'}.`,
      });
    } catch (error) {
      toast({
        title: "Erro!",
        description: "Não foi possível atualizar o status da loja.",
        variant: "destructive",
      });
    } finally {
      setIsSavingStatus(false);
    }
  };

  const todayStats = useMemo(() => {
    const today = startOfToday();
    const todaysOrders = kitchenOrders.filter(order =>
      isToday(new Date(order.order_time)) && order.status === 'approved'
    );
    const todaysRevenue = todaysOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const todaysOrderCount = todaysOrders.length;
    const averageTicketToday = todaysOrderCount > 0 ? todaysRevenue / todaysOrderCount : 0;
    return { todaysRevenue, todaysOrderCount, averageTicketToday };
  }, [kitchenOrders]);

  const generalStats = useMemo(() => getCustomerStats(), [customers, kitchenOrders]);

  if (loadingData && !customers.length && !kitchenOrders.length) {
    return <DashboardLoadingSkeleton />;
  }

  const statCardsData = [
    { title: 'Vendas de Hoje', value: formatPrice(todayStats.todaysRevenue), icon: DollarSign, color: 'from-green-500 to-green-600', description: 'Receita do dia' },
    { title: 'Pedidos de Hoje', value: todayStats.todaysOrderCount, icon: ShoppingBag, color: 'from-blue-500 to-blue-600', description: 'Pedidos aprovados' },
    { title: 'Ticket Médio (Hoje)', value: formatPrice(todayStats.averageTicketToday), icon: TrendingUp, color: 'from-orange-500 to-orange-600', description: 'Média por pedido' },
    { title: 'Total de Clientes', value: generalStats.totalCustomers, icon: Users, color: 'from-purple-500 to-purple-600', description: 'Clientes cadastrados' }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do seu negócio e histórico de clientes.
          </p>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm" disabled={loadingData}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </motion.div>

      {businessSettings && (
        <BusinessStatusToggle
          isOpen={businessSettings.is_open}
          onToggleStatus={handleToggleStatus}
          isLoading={isSavingStatus || loadingBusinessSettings}
        />
      )}

      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <StatCards cards={statCardsData} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <CustomerList
            customers={customers}
            onSelectCustomer={setSelectedCustomer}
            selectedCustomer={selectedCustomer}
          />
          <CustomerDetails
            selectedCustomer={selectedCustomer}
            kitchenOrders={kitchenOrders}
          />
        </div>
      </Suspense>
    </div>
  );
}

export default Dashboard;