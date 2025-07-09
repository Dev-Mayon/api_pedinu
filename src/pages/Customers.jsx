import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Phone, Eye, Info, Loader2, ShoppingBag, DollarSign, Repeat, Award, MessageCircle, Star, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
const CustomerProfileCard = ({
  customer,
  orders
}) => {
  if (!customer) return null;
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const totalOrders = orders.length;
  const averageTicket = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const getFrequencyBadge = orderCount => {
    if (orderCount > 10) return {
      label: "Cliente Fiel",
      icon: Award,
      color: "bg-gradient-to-r from-amber-500 to-yellow-400",
      textColor: "text-white"
    };
    if (orderCount > 3) return {
      label: "Recorrente",
      icon: Repeat,
      color: "bg-gradient-to-r from-sky-500 to-cyan-400",
      textColor: "text-white"
    };
    return {
      label: "Novo Cliente",
      icon: Star,
      color: "bg-gradient-to-r from-lime-500 to-green-400",
      textColor: "text-white"
    };
  };
  const frequency = getFrequencyBadge(totalOrders);
  const lastOrderDate = orders.length > 0 ? new Date(orders[0].created_at) : null;
  return <Card className="flex-1 flex flex-col bg-card/80 backdrop-blur-sm border-border/20 shadow-xl shadow-black/5">
      <CardHeader className="border-b border-border/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/80 to-primary/50 rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">{customer.name}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-0.5 text-muted-foreground text-sm">
                <Phone className="h-3 w-3" /> {customer.phone}
              </CardDescription>
            </div>
          </div>
          <Badge className={`${frequency.color} ${frequency.textColor} border-0 shadow-md text-xs`}>
            <frequency.icon className="h-3 w-3 mr-1" />
            {frequency.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar-sm">
        <div>
          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div className="p-1.5 bg-background/50 rounded-xl border border-border/10">
              <ShoppingBag className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-sm font-bold text-foreground">{totalOrders}</p>
              <p className="text-xs text-muted-foreground">Pedidos</p>
            </div>
            <div className="p-1.5 bg-background/50 rounded-xl border border-border/10">
              <DollarSign className="h-4 w-4 mx-auto mb-1 text-green-500" />
              <p className="text-sm font-bold text-green-500">{formatPrice(totalSpent)}</p>
              <p className="text-xs text-muted-foreground">Total Gasto</p>
            </div>
            <div className="p-1.5 bg-background/50 rounded-xl border border-border/10">
              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-blue-500" />
              <p className="text-sm font-bold text-blue-500">{formatPrice(averageTicket)}</p>
              <p className="text-xs text-muted-foreground">Ticket Médio</p>
            </div>
          </div>

          <h4 className="font-semibold mb-2 text-foreground flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-primary" /> Histórico de Pedidos</h4>
          <div className="space-y-2 pr-2">
            {orders.length > 0 ? orders.map(order => <motion.div key={order.id} initial={{
            opacity: 0,
            x: -10
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.3
          }} className="flex justify-between items-center p-2.5 bg-background/70 rounded-lg border border-border/10 hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {format(new Date(order.created_at), "dd/MM/yy 'às' HH:mm", {
                  locale: ptBR
                })}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.items.length} item(ns)</p>
                  </div>
                  <p className="font-semibold text-sm text-green-500">{formatPrice(order.total)}</p>
                </motion.div>) : <div className="text-center text-muted-foreground py-8">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>Nenhum pedido registrado.</p>
              </div>}
          </div>
        </div>
        
        <div className="mt-4 border-t border-border/10 pt-3 sticky bottom-0 bg-card/80 backdrop-blur-sm -mx-4 px-4 pb-1">
          {lastOrderDate && <p className="text-xs text-muted-foreground text-center mb-3">
              Último pedido {formatDistanceToNow(lastOrderDate, {
            locale: ptBR,
            addSuffix: true
          })}
            </p>}
          <Button size="sm" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-green-500/40 transition-shadow" onClick={() => window.open(`https://wa.me/55${customer.phone.replace(/\D/g, '')}`, '_blank')}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Conversar no WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>;
};
const CustomersPage = () => {
  const {
    kitchenOrders,
    loadingData,
    loadKitchenOrders
  } = useData();
  const {
    user
  } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState(null);
  useEffect(() => {
    if (user?.id) {
      loadKitchenOrders(user.id);
    }
  }, [user, loadKitchenOrders]);
  const customerData = useMemo(() => {
    const customerMap = new Map();
    kitchenOrders.forEach(order => {
      if (!order.customer_phone) return;
      if (!customerMap.has(order.customer_phone)) {
        customerMap.set(order.customer_phone, {
          phone: order.customer_phone,
          name: order.customer_name,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: new Date(0),
          neighborhood: ''
        });
      }
      const customer = customerMap.get(order.customer_phone);
      customer.totalOrders += 1;
      customer.totalSpent += Number(order.total);
      const orderDate = new Date(order.created_at);
      if (orderDate > customer.lastOrderDate) {
        customer.lastOrderDate = orderDate;
        if (order.delivery_address && order.delivery_address !== 'Retirada no local') {
          customer.neighborhood = order.delivery_address.split(',').pop()?.trim() || customer.neighborhood;
        }
      }
    });
    return Array.from(customerMap.values()).sort((a, b) => b.lastOrderDate - a.lastOrderDate);
  }, [kitchenOrders]);
  const filteredCustomers = useMemo(() => customerData.filter(customer => customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.phone.includes(searchTerm)), [customerData, searchTerm]);
  const selectedCustomer = useMemo(() => selectedCustomerPhone ? customerData.find(c => c.phone === selectedCustomerPhone) : null, [customerData, selectedCustomerPhone]);
  const selectedCustomerOrders = useMemo(() => selectedCustomer ? kitchenOrders.filter(order => order.customer_phone === selectedCustomer.phone).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [], [kitchenOrders, selectedCustomer]);
  useEffect(() => {
    if (!selectedCustomerPhone && filteredCustomers.length > 0) {
      setSelectedCustomerPhone(filteredCustomers[0].phone);
    }
  }, [filteredCustomers, selectedCustomerPhone]);
  if (loadingData) {
    return <div className="flex items-center justify-center h-full bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>;
  }
  return <div className="h-full flex flex-col p-4 md:p-6 bg-gradient-to-br from-background to-secondary/30">
       <motion.div initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">Gerenciador de Clientes</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie e entenda o comportamento dos seus clientes.
        </p>
       </motion.div>
      
      <div className="flex-1 flex flex-col lg:flex-row gap-6 items-start min-h-0">
        <motion.div className="w-full lg:w-1/2 flex flex-col" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: 0.2
      }}>
          <Card className="h-full flex flex-col bg-card/80 backdrop-blur-sm border-border/20 shadow-xl shadow-black/5">
            <CardHeader>
              <CardTitle className="text-foreground">Lista de Clientes</CardTitle>
              <div className="relative pt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Buscar por nome ou telefone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-background/50 border-border/20 focus:bg-background" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto custom-scrollbar-sm pr-2">
              <div className="space-y-2">
                {filteredCustomers.length > 0 ? filteredCustomers.map(customer => <motion.div key={customer.phone} layout className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 relative overflow-hidden ${selectedCustomer?.phone === customer.phone ? 'border-primary/50 bg-primary/10' : 'border-border/10 bg-background/50 hover:bg-accent/50 hover:border-primary/20'}`} onClick={() => setSelectedCustomerPhone(customer.phone)}>
                      {selectedCustomer?.phone === customer.phone && <motion.div layoutId="selected-customer-bg" className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />}
                      <div className="relative z-10">
                        <h3 className="font-semibold text-sm text-foreground truncate">{customer.name}</h3>
                        <p className="text-xs text-muted-foreground">{customer.phone}</p>
                      </div>
                    </motion.div>) : <div className="text-center text-muted-foreground py-16">
                    <Info className="h-10 w-10 mx-auto mb-2 text-muted-foreground/70" />
                    <p>{searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</p>
                  </div>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div className="w-full lg:w-1/2 flex flex-col" initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: 0.3
      }}>
          <AnimatePresence mode="wait">
            {selectedCustomer ? <motion.div key={selectedCustomer.phone} initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} exit={{
            opacity: 0,
            scale: 0.95
          }} transition={{
            duration: 0.3,
            ease: "easeInOut"
          }} className="h-full w-full">
                <CustomerProfileCard customer={selectedCustomer} orders={selectedCustomerOrders} />
              </motion.div> : <Card className="h-full flex-1 flex flex-col justify-center items-center text-center py-16 text-muted-foreground bg-card/80 backdrop-blur-sm border-border/20 shadow-xl shadow-black/5">
                <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="font-medium">Selecione um cliente ao lado</p>
                <p className="text-sm">para ver seu perfil detalhado.</p>
              </Card>}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>;
};
export default CustomersPage;