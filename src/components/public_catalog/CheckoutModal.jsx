import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CreditCard, ShoppingCart, ArrowLeft, Loader2, Copy, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useCustomer } from '@/contexts/CustomerContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import CheckoutUserDetails from '@/components/public_catalog/checkout/CheckoutUserDetails';
import CheckoutOrderSummary from '@/components/public_catalog/checkout/CheckoutOrderSummary';

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

  // Estados para PIX
  const [pixData, setPixData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // Mantido, mas a lógica de status agora é mais controlada pela EF

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
      setPixData(null);
      setPaymentStatus('pending'); // Resetar para pending ao abrir

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
    if (customer.phone && businessData.businessSlug) {
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_phone', customer.phone)
        .eq('business_slug', businessData.businessSlug);

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
  }, [customer.phone, businessData.businessSlug, selectedAddress]);

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
    
    if (customerData.paymentMethod === 'Dinheiro') {
      if (customerData.changeFor && customerData.changeFor.trim() !== '') {
        const changeValue = parseFloat(customerData.changeFor.replace(',', '.'));
        if (isNaN(changeValue) || changeValue <= 0) {
          newErrors.changeFor = 'Valor inválido para troco.';
        } else if (changeValue < finalTotal) {
          newErrors.changeFor = `O valor deve ser igual ou maior que ${formatPrice(finalTotal)}.`;
        }
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
          business_slug: businessData.businessSlug || businessData.slug || '',
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

  const copyPixCode = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      toast({
        title: "Código PIX copiado!",
        description: "Cole no seu app de pagamentos para finalizar.",
      });
    }
  };

  const handleDetailsSubmit = async () => {
    if (!validateForm()) {
      if (!customerData.paymentMethod) {
        setCustomerData(prev => ({ ...prev, paymentMethod: '' }));
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const { name, phone, email } = customerData;
      setCustomer({ name, phone, email });
      
      try {
        await saveAddressIfNeeded();
      } catch (addressError) {
        console.warn("⚠️ Falha ao salvar endereço (IGNORADA):", addressError);
      }

      const requestBody = {
        businessSlug: businessData.businessSlug || businessData.slug || businessData.business_slug,
        paymentMethod: customerData.paymentMethod, // Envia o método real para a Edge Function decidir
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
        total: finalTotal,
        orderType: orderType,
        notes: customerData.notes,
        changeFor: customerData.changeFor
      };

      console.log('--- ENVIANDO PARA EDGE FUNCTION ---', JSON.stringify(requestBody, null, 2));

      if (!requestBody.businessSlug) {
        throw new Error('Business slug não encontrado. Verifique se os dados do negócio foram carregados corretamente.');
      }

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

      // Verificação da resposta da Edge Function:
      if (!response.ok) {
        const errorData = await response.json();
        const detailedError = errorData.error || 'Erro desconhecido ao processar pagamento.';
        console.error('🔥 Erro da Edge Function (resposta não OK):', response.status, detailedError);
        throw new Error(detailedError); // Isso será capturado pelo bloco catch abaixo
      }

      const responseData = await response.json();
      console.log('--- RESPOSTA DA EDGE FUNCTION (SUCESSO) ---', responseData);

      // ✅ Se retornou QR Code, é PIX
      if (responseData.qrCode) {
        console.log('DEBUG: Recebeu dados PIX. Definindo step para "pix".');
        setPixData(responseData);
        setStep('pix');
      } else {
        // ✅ Se não retornou QR Code, é pagamento na entrega
        console.log('DEBUG: Não é PIX. Processando pagamento na entrega.');
        const newOrderId = responseData.orderId || responseData.id;
        console.log('DEBUG: orderId para pagamento na entrega:', newOrderId);
        
        toast({
          title: "Pedido Recebido!",
          description: `Pedido #${newOrderId} registrado. Pague ${customerData.paymentMethod.toLowerCase()} na entrega.`,
          duration: 5000
        });
        
        // Limpar carrinho e fechar modal
        if (onOrderSuccess) {
          console.log('DEBUG: Chamando onOrderSuccess...');
          // É importante garantir que onOrderSuccess não lance erros
          try {
            onOrderSuccess(newOrderId, false); // false = não redirecionar
          } catch (e) {
            console.error("⚠️ Erro ao executar onOrderSuccess:", e);
            // Poderia adicionar um toast de aviso aqui se for crítico
          }
        }
        
        console.log('DEBUG: Fechando modal em 2 segundos...');
        setTimeout(() => {
          onClose();
        }, 2000);
      }

    } catch (error) {
      console.error('🔥 Erro ao processar pedido (FRONTEND CATCH):', error);
      toast({
        title: "Erro ao criar pedido",
        description: error.message || "Não foi possível registrar seu pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      console.log('DEBUG: isSubmitting setado para false.');
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
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-6 w-6" />
              <div>
                <h2 className="text-2xl font-bold">
                  {step === 'pix' ? 'Pagamento PIX' : 'Finalizar Pedido'}
                </h2>
                <p className="text-red-100">{businessData.businessName}</p>
              </div>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-grow">
            {step === 'details' ? (
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
            ) : step === 'pix' && pixData ? (
              <div className="text-center space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-green-800">Pedido Criado!</h3>
                  <p className="text-green-700">Pedido #{pixData.orderId}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-4">Escaneie o QR Code para pagar</h4>
                  
                  {pixData.qrCodeBase64 && (
                    <div className="bg-white p-4 rounded-lg inline-block mb-4">
                      <img 
                        src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                        alt="QR Code PIX"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mb-4">
                    Ou copie o código PIX abaixo:
                  </p>

                  <div className="bg-white border rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-800 break-all">
                        {pixData.qrCode?.substring(0, 50)}...
                      </span>
                      <Button
                        onClick={copyPixCode}
                        variant="outline"
                        size="sm"
                        className="ml-2 flex-shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600 mb-2">
                      {formatPrice(pixData.totalAmount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Aguardando confirmação do pagamento...
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="bg-gray-50 border-t p-6">
            {step === 'details' ? (
              <>
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
              </>
            ) : step === 'pix' ? (
              <div className="space-y-3">
                <Button
                  onClick={copyPixCode}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg rounded-xl"
                >
                  <Copy className="h-5 w-5 mr-2" />
                  Copiar Código PIX
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full py-3 text-lg rounded-xl"
                >
                  Fechar
                </Button>
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckoutModal;