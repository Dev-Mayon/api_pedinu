import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ShoppingBag, AlertTriangle, Loader2, Home, User, Phone, ArrowLeft } from 'lucide-react';
import PedinuLogo from '@/components/ui/PedinuLogo';
import { useCustomer } from '@/contexts/CustomerContext';
import CustomerIdentificationModal from '@/components/public_catalog/CustomerIdentificationModal';

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <Loader2 className="h-12 w-12 animate-spin text-red-500" />
    <p className="mt-4 text-lg text-gray-700">Carregando...</p>
  </div>
);

const NoOrders = ({ businessSlug }) => (
  <div className="text-center">
    <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum pedido encontrado</h3>
    <p className="mt-1 text-sm text-gray-500">Você ainda não fez nenhum pedido com este número.</p>
    <div className="mt-6">
      <Button asChild>
        <Link to={businessSlug ? `/cardapio/${businessSlug}` : '/'}>Fazer um pedido</Link>
      </Button>
    </div>
  </div>
);

const MyOrdersPage = () => {
  const { customer, isIdentified, setCustomer } = useCustomer();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isIdentificationModalOpen, setIsIdentificationModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async (phone) => {
    if (!phone) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('kitchen_orders')
        .select(`
          id,
          created_at,
          total,
          status,
          items,
          profile:profiles(business_slug, business_name)
        `)
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setOrders(data || []);
    } catch (e) {
      console.error(e);
      setError("Não foi possível buscar seus pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isIdentified) {
      setIsIdentificationModalOpen(true);
    } else {
      fetchOrders(customer.phone);
    }
  }, [isIdentified, customer.phone, fetchOrders]);

  const onIdentified = () => {
    setIsIdentificationModalOpen(false);
    fetchOrders(customer.phone);
  };
  
  const handleBackToMenu = () => {
    const lastBusinessSlug = localStorage.getItem('last-visited-slug');
    if (lastBusinessSlug) {
      navigate(`/cardapio/${lastBusinessSlug}`);
    } else {
      navigate('/'); // Fallback
    }
  };


  if (loading) return <LoadingScreen />;

  return (
    <>
      <CustomerIdentificationModal
        isOpen={isIdentificationModalOpen}
        onClose={() => navigate(-1)} // Go back if modal is closed
        onIdentified={onIdentified}
      />
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
             <Button variant="ghost" size="icon" onClick={handleBackToMenu}>
               <ArrowLeft />
             </Button>
            <PedinuLogo className="h-8" />
            <div className="w-10"></div>
          </div>
        </header>

        <main className="py-8 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto"
          >
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">Meus Pedidos</CardTitle>
                <CardDescription>Veja aqui o histórico de seus pedidos.</CardDescription>
              </CardHeader>
              <CardContent>
                {error && <div className="text-center text-red-500 p-4"><AlertTriangle className="mx-auto h-8 w-8 mb-2" />{error}</div>}
                
                {!loading && orders.length === 0 && !error && (
                  <NoOrders businessSlug={orders[0]?.profile?.business_slug} />
                )}

                {orders.length > 0 && (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <Link to={`/order/status/${order.id}`} key={order.id}>
                        <motion.div 
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-800">Pedido em {order.profile?.business_name || 'Estabelecimento'}</p>
                              <p className="text-sm text-gray-500">
                                {format(parseISO(order.created_at), "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                            <p className="font-bold text-lg text-red-600">{formatPrice(order.total)}</p>
                          </div>
                          <div className="mt-2">
                             <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                               order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                               order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                               'bg-blue-100 text-blue-800'
                             }`}>
                               {order.status}
                             </span>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default MyOrdersPage;