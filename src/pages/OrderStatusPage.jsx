import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Utensils as CookingPot, Bike, CheckCircle2, AlertTriangle, Loader2, Home, ShoppingBag } from 'lucide-react';
import PedinuLogo from '@/components/ui/PedinuLogo';

const statusConfig = {
  received: {
    icon: <ChefHat className="h-8 w-8 text-white" />,
    text: "Recebido",
    description: "Seu pedido foi recebido e logo será preparado.",
    color: "bg-blue-500",
    progress: 1,
  },
  preparing: {
    icon: <CookingPot className="h-8 w-8 text-white" />,
    text: "Em Preparo",
    description: "Nossa cozinha já está preparando seu pedido com carinho!",
    color: "bg-yellow-500",
    progress: 2,
  },
  out_for_delivery: {
    icon: <Bike className="h-8 w-8 text-white" />,
    text: "Saiu para Entrega",
    description: "Seu pedido está a caminho! Fique de olho.",
    color: "bg-orange-500",
    progress: 3,
  },
  delivered: {
    icon: <CheckCircle2 className="h-8 w-8 text-white" />,
    text: "Entregue",
    description: "Seu pedido foi entregue. Bom apetite!",
    color: "bg-green-500",
    progress: 4,
  },
  cancelled: {
    icon: <AlertTriangle className="h-8 w-8 text-white" />,
    text: "Cancelado",
    description: "Este pedido foi cancelado.",
    color: "bg-red-500",
    progress: 0,
  },
};

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <Loader2 className="h-12 w-12 animate-spin text-red-500" />
    <p className="mt-4 text-lg text-gray-700">Buscando seu pedido...</p>
  </div>
);

const ErrorScreen = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
    <AlertTriangle className="h-12 w-12 text-red-500" />
    <p className="mt-4 text-lg text-red-700">{message}</p>
    <Button onClick={onRetry} className="mt-4">Tentar Novamente</Button>
  </div>
);

const OrderStatusPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [businessSlug, setBusinessSlug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // CONSULTA SEM JOIN ANINHADO!
  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Busca o pedido normalmente
      const { data: orderData, error: fetchError } = await supabase
        .from('kitchen_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError || !orderData) {
        throw new Error("Pedido não encontrado ou ocorreu um erro.");
      }

      setOrder(orderData);

      // 2. Busca o business_slug usando o user_id do pedido
      if (orderData.user_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('business_slug')
          .eq('id', orderData.user_id)
          .single();

        if (profileData && profileData.business_slug) {
          setBusinessSlug(profileData.business_slug);
        }
      }

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (!order) return;
    const channel = supabase
      .channel(`kitchen_orders:id=eq.${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'kitchen_orders',
        filter: `id=eq.${orderId}`
      },
        (payload) => {
          setOrder(payload.new);
        })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, order]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={fetchOrder} />;
  if (!order) return <ErrorScreen message="Pedido não encontrado." onRetry={fetchOrder} />;

  const currentStatusInfo = statusConfig[order.status] || statusConfig.received;
  const statusSteps = ['received', 'preparing', 'out_for_delivery', 'delivered'];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card className="shadow-2xl rounded-2xl overflow-hidden border-t-8 border-red-500">
          <CardHeader className="text-center bg-white p-6">
            <div className="flex justify-center mb-4">
              <PedinuLogo className="h-10" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">
              Acompanhe seu Pedido
            </CardTitle>
            <CardDescription className="text-gray-500 text-lg">
              Pedido #{order.id.toString().slice(-6).toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 bg-gray-50">
            <div className={`p-6 rounded-xl text-white flex items-center space-x-4 mb-8 shadow-lg transition-colors duration-500 ${currentStatusInfo.color}`}>
              <div className="flex-shrink-0">{currentStatusInfo.icon}</div>
              <div>
                <p className="text-2xl font-bold">{currentStatusInfo.text}</p>
                <p className="text-sm opacity-90">{currentStatusInfo.description}</p>
              </div>
            </div>

            {order.status !== 'cancelled' && (
              <div className="mb-8">
                <div className="flex justify-between items-end">
                  {statusSteps.map((step, index) => (
                    <div key={step} className="flex-1 flex flex-col items-center text-center">
                      <div className={`
                        h-6 w-6 rounded-full flex items-center justify-center border-2
                        ${currentStatusInfo.progress > index ? `${statusConfig[step].color} border-transparent text-white` : 'bg-white border-gray-300'}
                      `}>
                        {currentStatusInfo.progress > index && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                      <p className={`mt-2 text-xs font-medium ${currentStatusInfo.progress > index ? 'text-gray-800' : 'text-gray-400'}`}>
                        {statusConfig[step].text}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="h-1 bg-gray-200 rounded-full mt-2 -translate-y-7" style={{ zIndex: -1 }}>
                  <motion.div
                    className="h-1 bg-green-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStatusInfo.progress - 1) / 3) * 100}%` }}
                    transition={{ type: 'spring' }}
                  />
                </div>
              </div>
            )}

            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
              <h3 className="font-bold text-lg mb-2 text-gray-800">Detalhes do Pedido</h3>
              <AnimatePresence>
                <motion.div layout className="space-y-2">
                  {order.items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600">{item.quantity}x {item.name}</span>
                      <span className="font-medium text-gray-800">{formatPrice(item.price * item.quantity)}</span>
                    </motion.div>
                  ))}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-red-600">{formatPrice(order.total)}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {businessSlug && (
                <Button asChild className="flex-1 bg-red-600 hover:bg-red-700">
                  <Link to={`/cardapio/${businessSlug}`}>
                    <ShoppingBag className="mr-2 h-4 w-4" /> Ver Cardápio
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="flex-1">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" /> Página Inicial
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default OrderStatusPage;

