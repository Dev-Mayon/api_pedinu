import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, QrCode, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/customSupabaseClient';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

const MercadoPagoPayment = ({
  amount,
  paymentMethod,
  storeId,
  orderId,
  customerData,
  onPaymentSuccess,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const createPayment = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: functionError } = await supabase.functions.invoke('create-mercadopago-payment', {
          body: JSON.stringify({
            orderId,
            storeId,
            amount,
            customerData,
            paymentMethod,
          }),
        });

        if (functionError) throw new Error(functionError.message || 'Erro na função do servidor.');
        if (data.error) throw new Error(data.error);

        setPaymentData(data.payment);
        setPreferenceId(data.preferenceId);
        setPublicKey(data.publicKey);
        if (data.publicKey) {
          initMercadoPago(data.publicKey, { locale: 'pt-BR' });
        }
      } catch (e) {
        console.error('Error creating payment:', e);
        setError("Não foi possível gerar os dados de pagamento. Verifique as configurações e tente novamente.");
        toast({
          title: "Erro ao iniciar pagamento",
          description: e.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      createPayment();
    }
  }, [orderId, storeId, amount, customerData, paymentMethod, toast]);

  const handleCopyPixCode = () => {
    if (paymentData?.point_of_interaction?.transaction_data?.qr_code) {
      navigator.clipboard.writeText(paymentData.point_of_interaction.transaction_data.qr_code);
      setIsCopied(true);
      toast({
        title: "Copiado!",
        description: "Código Pix copiado para a área de transferência.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const onPaymentSubmit = async (mpData) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-mercadopago-payment', {
        body: JSON.stringify({
          ...mpData,
          orderId,
          customerData,
        }),
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (data.status === 'approved') {
        onPaymentSuccess(orderId);
      } else {
         toast({
          title: "Pagamento não aprovado",
          description: "Seu pagamento não foi aprovado. Por favor, tente novamente ou use outra forma de pagamento.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Houve um problema ao processar seu pagamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
        <p className="mt-4 text-lg text-gray-600">Gerando pagamento...</p>
      </div>
    );
  }
  
  if (error || (!paymentData && !preferenceId)) {
     return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <CreditCard className="h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg text-gray-600 font-semibold text-red-600">Erro ao carregar pagamento</p>
        <p className="text-sm text-gray-500">{error || "Não foi possível carregar as informações de pagamento."}</p>
      </div>
    );
  }

  if (paymentMethod === 'pix' && paymentData?.point_of_interaction?.transaction_data) {
    const { qr_code_base64, qr_code } = paymentData.point_of_interaction.transaction_data;
    return (
      <div className="text-center p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Pague com Pix</h3>
        <p className="text-gray-600 mb-4">Aponte a câmera do seu celular para o QR Code ou copie o código abaixo.</p>
        <div className="flex justify-center my-4 bg-white p-2 border rounded-lg">
          {qr_code_base64 ?
            <img  src={`data:image/jpeg;base64,${qr_code_base64}`} alt="QR Code Pix" />
             : <div className="h-48 w-48 bg-gray-200 animate-pulse rounded-md" />
          }
        </div>
        <div className="relative">
          <Input
            readOnly
            value={qr_code}
            className="pr-24 bg-gray-100"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={handleCopyPixCode}
          >
            {isCopied ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
            <span className="ml-2">{isCopied ? 'Copiado!' : 'Copiar'}</span>
          </Button>
        </div>
         <p className="text-sm text-gray-500 mt-4">Após o pagamento, seu pedido será confirmado automaticamente.</p>
      </div>
    );
  }

  if (paymentMethod === 'credit_card' && preferenceId && publicKey) {
      return (
          <div className="p-4">
              <Payment
                initialization={{
                  amount: amount,
                  preferenceId: preferenceId,
                }}
                customization={{
                  paymentMethods: {
                    creditCard: 'all',
                    debitCard: 'all',
                  },
                }}
                onSubmit={onPaymentSubmit}
              />
          </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <Loader2 className="h-12 w-12 animate-spin text-red-500" />
      <p className="mt-4 text-lg text-gray-600">Ajustando tudo para o pagamento...</p>
    </div>
  );
};

export default MercadoPagoPayment;