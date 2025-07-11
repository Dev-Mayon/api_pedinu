import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { X, ShoppingCart, CreditCard, Banknote, QrCode, Copy, CheckCircle } from 'lucide-react';

const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  cart, 
  businessData, 
  onOrderSuccess 
}) => {
  const [step, setStep] = useState('checkout');
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    paymentMethod: '',
    observations: '',
    changeAmount: ''
  });
  const [saveAddress, setSaveAddress] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = businessData?.deliveryFee || 0;
  const total = subtotal + deliveryFee;

  const resetForm = () => {
    setStep('checkout');
    setCustomerData({
      name: '',
      phone: '',
      email: '',
      address: '',
      paymentMethod: '',
      observations: '',
      changeAmount: ''
    });
    setSaveAddress(false);
    setPixData(null);
    setPaymentStatus('pending');
    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!customerData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    if (!customerData.phone.trim()) {
      toast({
        title: "Erro", 
        description: "Telefone é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    if (!customerData.address.trim()) {
      toast({
        title: "Erro",
        description: "Endereço é obrigatório", 
        variant: "destructive"
      });
      return false;
    }

    if (!customerData.paymentMethod) {
      toast({
        title: "Erro",
        description: "Selecione uma forma de pagamento",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const saveCustomerAddress = async () => {
    if (!saveAddress) return;

    try {
      const response = await fetch('/api/customer-addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessSlug: businessData.businessSlug,
          phone: customerData.phone,
          name: customerData.name,
          address: customerData.address,
          email: customerData.email
        }),
      });

      if (!response.ok) {
        console.warn('Falha ao salvar endereço do cliente');
      }
    } catch (error) {
      console.warn('Erro ao salvar endereço:', error);
    }
  };

  const calculateChangeAmount = () => {
    if (customerData.paymentMethod !== 'Dinheiro' || !customerData.changeAmount) {
      return 0;
    }
    
    const changeValue = parseFloat(customerData.changeAmount.replace(',', '.')) || 0;
    return Math.max(0, changeValue - total);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      await saveCustomerAddress();

      // MAPEAMENTO TEMPORÁRIO - TODOS PARA 'PIX'
      const mappedPaymentMethod = 'pix'; // Força todos para 'pix' que sabemos que funciona

      const requestBody = {
        businessSlug: businessData.businessSlug || businessData.slug || businessData.business_slug,
        customerName: customerData.name,
        customerPhone: customerData.phone,
        customerEmail: customerData.email || '',
        customerAddress: customerData.address,
        paymentMethod: mappedPaymentMethod, // Sempre 'pix'
        observations: customerData.observations || '',
        changeAmount: calculateChangeAmount(),
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          addons: item.addons || []
        })),
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total
      };

      console.log('Enviando dados do pedido:', requestBody);

      if (!requestBody.businessSlug) {
        throw new Error('businessSlug não encontrado nos dados do negócio');
      }

      // APENAS PIX chama a Edge Function
      if (customerData.paymentMethod === 'Pix') {
        const response = await fetch('/api/create-mercadopago-preference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Erro ao criar preferência de pagamento: ${errorData}`);
        }

        const result = await response.json();
        console.log('Resposta da Edge Function:', result);

        if (result.qrCode) {
          setPixData(result);
          setStep('pix');
        } else {
          throw new Error('QR Code não foi gerado');
        }
      } else {
        // OUTROS MÉTODOS: Apenas registra no banco
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...requestBody,
            paymentStatus: 'paid_on_delivery'
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Erro ao registrar pedido: ${errorData}`);
        }

        const result = await response.json();
        const newOrderId = result.orderId || result.id;

        toast({
          title: "Pedido Recebido!",
          description: `Pedido #${newOrderId} registrado. Pague ${customerData.paymentMethod.toLowerCase()} na entrega.`,
          duration: 5000
        });

        // Limpa carrinho e fecha modal
        setTimeout(() => {
          onOrderSuccess(newOrderId, false); // false = não redirecionar
          onClose();
        }, 1000);
      }

    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      toast({
        title: "Erro ao criar pedido",
        description: error.message || "Não foi possível registrar seu pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      toast({
        title: "Código copiado!",
        description: "Código PIX copiado para a área de transferência",
      });
    }
  };

  if (step === 'pix') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Pagamento PIX
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Escaneie o QR Code ou copie o código PIX
              </p>
              
              {pixData?.qrCodeBase64 && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                    alt="QR Code PIX"
                    className="w-48 h-48 border rounded"
                  />
                </div>
              )}
              
              <div className="bg-gray-50 p-3 rounded border">
                <p className="text-xs text-gray-600 mb-2">Código PIX:</p>
                <p className="text-sm font-mono break-all">{pixData?.qrCode}</p>
              </div>
              
              <Button 
                onClick={copyPixCode}
                className="w-full mt-3"
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Código PIX
              </Button>
            </div>
            
            <div className="text-center pt-4 border-t">
              <p className="text-lg font-semibold">Total: R$ {total.toFixed(2)}</p>
              <p className="text-sm text-gray-600">
                Após o pagamento, seu pedido será confirmado automaticamente
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Finalizar Pedido
            <span className="text-sm font-normal text-gray-600">
              {businessData?.businessName}
            </span>
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dados do Cliente */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={customerData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={customerData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-mail (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={customerData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="address">Endereço Completo *</Label>
              <Textarea
                id="address"
                value={customerData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número, complemento..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveAddress"
                checked={saveAddress}
                onCheckedChange={setSaveAddress}
              />
              <Label htmlFor="saveAddress" className="text-sm">
                Salvar este endereço para pedidos futuros
              </Label>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-base font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Forma de Pagamento *
                </Label>
                <RadioGroup
                  value={customerData.paymentMethod}
                  onValueChange={(value) => handleInputChange('paymentMethod', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Pix" id="pix" />
                    <Label htmlFor="pix">Pix</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Dinheiro" id="dinheiro" />
                    <Label htmlFor="dinheiro">Dinheiro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Cartão de Crédito" id="credito" />
                    <Label htmlFor="credito">Cartão de Crédito</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Cartão de Débito" id="debito" />
                    <Label htmlFor="debito">Cartão de Débito</Label>
                  </div>
                </RadioGroup>

                {customerData.paymentMethod === 'Dinheiro' && (
                  <div className="mt-4">
                    <Label htmlFor="changeAmount" className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Troco para?
                    </Label>
                    <Input
                      id="changeAmount"
                      value={customerData.changeAmount}
                      onChange={(e) => handleInputChange('changeAmount', e.target.value)}
                      placeholder="50"
                      type="number"
                      step="0.01"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={customerData.observations}
                  onChange={(e) => handleInputChange('observations', e.target.value)}
                  placeholder="Alguma observação? (opcional)"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Resumo do Pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de entrega:</span>
                <span>R$ {deliveryFee.toFixed(2)}</span>
              </div>
              {customerData.paymentMethod === 'Dinheiro' && customerData.changeAmount && (
                <>
                  <div className="flex justify-between">
                    <span>Pagamento em dinheiro:</span>
                    <span>R$ {parseFloat(customerData.changeAmount.replace(',', '.') || '0').toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>Troco:</span>
                    <span>R$ {calculateChangeAmount().toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total:</span>
                <span className="text-red-600">R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Botão de Finalizar */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 text-lg"
          >
            {loading ? (
              "Processando..."
            ) : (
              `Continuar para Pagamento - R$ ${total.toFixed(2)}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;

