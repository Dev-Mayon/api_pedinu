import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CreditCard, ShoppingCart, ArrowLeft, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useCustomer } from '@/contexts/CustomerContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import CheckoutUserDetails from '@/components/public_catalog/checkout/CheckoutUserDetails';
import CheckoutOrderSummary from '@/components/public_catalog/checkout/CheckoutOrderSummary';
//versao final
const CheckoutModal = ({
  isOpen,
  onClose,
  cart,
  total,
  deliveryZones,
  businessData,
  onOrderSuccess,
}) => {
  const { toast } = useToast();
  const { customer, setCustomer, selectedAddress } = useCustomer();
  const [step, setStep] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderType, setOrderType] = useState('delivery');

  const [customerData, setCustomerData] = useState({
    name: '', phone: '', email: '', neighborhood: '', address: '',
    paymentMethod: '', notes: '', changeFor: '', saveAddress: true,
  });

  const [deliveryFee, setDeliveryFee] = useState(0);
  const [errors, setErrors] = useState({});
  const [orderId, setOrderId] = useState(null);
  const [customerAddresses, setCustomerAddresses] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setOrderId(null);
      setOrderType('delivery');

      const defaultAddress = selectedAddress || customerAddresses.find(a => a.is_default);

      setCustomerData(prev => ({
        ...prev,
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        neighborhood: defaultAddress?.neighborhood || '',
        address: defaultAddress?.address || '',
        paymentMethod: '',
        notes: '',
        changeFor: '',
        saveAddress: true,
      }));
    }
  }, [customer, isOpen, selectedAddress, customerAddresses]);

  const fetchCustomerAddresses = useCallback(async () => {
    if (customer.phone && businessData.business_slug) {
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_phone', customer.phone)
        .eq('business_slug', businessData.business_slug);

      if (!error && data) {
        setCustomerAddresses(data);
        const defaultAddress = data.find(addr => addr.is_default) || data[0];
        if (defaultAddress && !selectedAddress) {
          setCustomerData(prev => ({
            ...prev,
            neighborhood: defaultAddress.neighborhood,
            address: defaultAddress.address,
          }));
        }
      }
    }
  }, [customer.phone, businessData.business_slug, selectedAddress]);

  useEffect(() => {
    if (isOpen) {
      fetchCustomerAddresses();
    }
  }, [isOpen, fetchCustomerAddresses]);

  const finalTotal = useMemo(() => total + deliveryFee, [total, deliveryFee]);

  const validateForm = () => {
    const newErrors = {};
    if (!customerData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!customerData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (orderType === 'delivery') {
      if (!customerData.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
      if (!customerData.address.trim()) newErrors.address = 'Endereço é obrigatório';
      if (customerData.neighborhood) {
        const zoneExists = deliveryZones.some(
          z => z.neighborhood_name.toLowerCase() === customerData.neighborhood.toLowerCase()
        );
        if (!zoneExists) {
          newErrors.neighborhood = 'Selecione um bairro válido da lista de entrega.';
        }
      }
    }
    if (!customerData.paymentMethod) newErrors.paymentMethod = 'Forma de pagamento é obrigatória';
    if (customerData.paymentMethod === 'Dinheiro' && customerData.changeFor) {
      const changeValue = parseFloat(customerData.changeFor);
      if (isNaN(changeValue) || changeValue < finalTotal) {
        newErrors.changeFor = `O valor deve ser igual ou maior que ${formatPrice(finalTotal)}.`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveAddressIfNeeded = async () => {
    if (orderType === 'delivery' && customerData.saveAddress && customerData.address && customerData.neighborhood) {
      const existingAddress = customerAddresses.find(
        addr =>
          addr.address.toLowerCase() === customerData.address.toLowerCase() &&
          addr.neighborhood.toLowerCase() === customerData.neighborhood.toLowerCase()
      );

      if (!existingAddress) {
        const { error } = await supabase.from('customer_addresses').insert({
          customer_phone: customer.phone,
          business_slug: businessData.business_slug || '',
          address: customerData.address,
          neighborhood: customerData.neighborhood,
          address_label: 'Casa'
        });

        if (error) {
          console.error("Failed to save new address:", error);
          toast({
            title: "Aviso",
            description: "Não foi possível salvar o novo endereço, mas o pedido continuará.",
            variant: "default"
          });
        }
      }
    }
  };

  const handleDetailsSubmit = async () => {
    console.log('--- EXECUTANDO VERSÃO FINAL DEPLOY MEIA-NOITE ---');
    if (!validateForm()) {
      if (!customerData.paymentMethod) {
        setCustomerData(prev => ({ ...prev, paymentMethod: '' }));
      }
      return;
    }

    setIsSubmitting(true);
    let newOrderId = null;

    try {
      if (!businessData?.id) throw new Error("ID do negócio não encontrado.");

      const { name, phone, email } = customerData;
      setCustomer({ name, phone, email });
      
      try {
        await saveAddressIfNeeded();
      } catch (addressError) {
        console.warn("⚠️ Falha ao salvar endereço (IGNORADA):", addressError);
      }

      const mappedPaymentMethod = {
        'Pix': 'pix', 'Cartão de Crédito': 'credit_card',
        'Dinheiro': 'cash', 'Cartão de Débito': 'debit_card'
      }[customerData.paymentMethod] || 'other';

      const orderItems = cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.finalPrice,
        addons: item.addons.map(addon => ({
          name: addon.name,
          quantity: addon.quantity,
          price: addon.price
        }))
      }));

      const changeAmount = customerData.paymentMethod === 'Dinheiro' && customerData.changeFor
          ? parseFloat(customerData.changeFor) : null;
      const changeDue = changeAmount ? changeAmount - finalTotal : null;

      let notes = customerData.notes || '';
      if (changeDue !== null && changeDue >= 0) {
        notes = `${notes} | Troco para ${formatPrice(changeDue)} (devolver ${formatPrice(changeDue)})`.trim();
      }

      const { data: newOrder, error: orderError } = await supabase
        .from('kitchen_orders')
        .insert({
          user_id: businessData.id,
          customer_name: customerData.name,
          customer_phone: customerData.phone,
          customer_email: customerData.email || null,
          delivery_address: orderType === 'delivery'
            ? `${customerData.address}, ${customerData.neighborhood}`
            : 'Retirada no local',
          items: orderItems,
          total: finalTotal,
          payment_method: mappedPaymentMethod,
          order_type: orderType,
          status: 'received',
          payment_status: 'pending',
          change_for: changeAmount
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      newOrderId = newOrder.id;
      setOrderId(newOrderId);

      if (['Dinheiro', 'Cartão de Débito'].includes(customerData.paymentMethod)) {
        await supabase
          .from('kitchen_orders')
          .update({ status: 'received', payment_status: 'paid_on_delivery' })
          .eq('id', newOrderId);

        toast({
          title: "Pedido Recebido!",
          description: "Seu pedido foi registrado. Pague na entrega."
        });
        onOrderSuccess(newOrderId);
      } else if (['Pix', 'Cartão de Crédito'].includes(customerData.paymentMethod)) {
        try {
          // Criamos o corpo da requisição em uma variável para maior clareza
          const requestBody = {
            // ✅ AQUI ESTAVA O ERRO: Garantimos o uso de 'business_slug' com underscore
            businessSlug: businessData.business_slug,
            cart: cart.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.finalPrice,
            })),
            customerDetails: {
              name: customerData.name,
              email: customerData.email,
              phone: customerData.phone,
              address: customerData.address,
              neighborhood: customerData.neighborhood,
            },
            deliveryFee: deliveryFee,
          };

          // ✅ É EXATAMENTE AQUI QUE A LINHA DEVE SER ADICIONADA
          console.log('--- DADOS FINAIS PRESTES A ENVIAR ---', JSON.stringify(requestBody, null, 2));

          const response = await fetch(
            'https://rsrhzvuwndagyqxilaej.supabase.co/functions/v1/create-mercadopago-preference',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            // Acessa a mensagem de erro detalhada que a nossa Edge Function melhorada envia
            const detailedError = errorData.error || 'Erro ao criar preferência de pagamento.';
            throw new Error(detailedError);
          }

          const { preferenceId } = await response.json();
          const redirectUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`;
          window.location.href = redirectUrl;

        } catch (mpError) {
          console.error('🔥 Erro ao chamar Edge Function do Mercado Pago:', mpError);
          toast({
            title: "Erro de Pagamento",
            description: mpError.message || "Não foi possível iniciar o pagamento online. Tente novamente.",
            variant: "destructive"
          });
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      console.error('🔥 Principal catch acionado em handleDetailsSubmit:', error);
      toast({
        title: "Erro ao criar pedido",
        description: "Não foi possível registrar seu pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      if (!['Pix', 'Cartão de Crédito'].includes(customerData.paymentMethod)) {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white relative flex items-center">
            {/* ... o resto do seu JSX continua igual ... */}
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-6 w-6" />
              <div>
                <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
                <p className="text-red-100">{businessData.businessName}</p>
              </div>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-grow">
            <CheckoutUserDetails
              customerData={customerData}
              setCustomerData={setCustomerData}
              errors={errors}
              setErrors={setErrors}
              orderType={orderType}
              setOrderType={setOrderType}
              deliveryZones={deliveryZones}
              setDeliveryFee={setDeliveryFee}
              finalTotal={finalTotal}
              customerAddresses={customerAddresses}
            />
          </div>

          <div className="bg-gray-50 border-t p-6">
            <CheckoutOrderSummary
              total={total}
              deliveryFee={deliveryFee}
              finalTotal={finalTotal}
              orderType={orderType}
              paymentMethod={customerData.paymentMethod}
              changeFor={customerData.changeFor}
            />
            <Button
              type="button"
              onClick={handleDetailsSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 text-lg rounded-xl shadow-lg mt-4"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : `Continuar para Pagamento - ${formatPrice(finalTotal)}`}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckoutModal;