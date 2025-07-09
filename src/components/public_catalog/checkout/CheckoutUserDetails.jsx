import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, User, Phone, CreditCard, MessageSquare, Search, Mail, Home, Coins, Bike as Motorcycle, Star, CopyCheck as Checkbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice } from '@/lib/utils';
import { Checkbox as UiCheckbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const CheckoutUserDetails = ({
  customerData,
  setCustomerData,
  errors,
  setErrors,
  orderType,
  setOrderType,
  deliveryZones,
  setDeliveryFee,
  finalTotal,
  customerAddresses,
}) => {
  const [neighborhoodSearch, setNeighborhoodSearch] = useState('');
  const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);

  useEffect(() => {
    setNeighborhoodSearch(customerData.neighborhood || '');
    const zone = deliveryZones.find(z => z.neighborhood_name.toLowerCase() === customerData.neighborhood?.toLowerCase());
    if (zone) {
      setDeliveryFee(Number(zone.fee) || 0);
    } else {
      setDeliveryFee(0);
    }
  }, [customerData.neighborhood, deliveryZones, setDeliveryFee]);

  const filteredZones = deliveryZones.filter(zone =>
    zone.neighborhood_name.toLowerCase().includes(neighborhoodSearch.toLowerCase())
  );

  const handleNeighborhoodSelect = (zoneName, zoneFee) => {
    setCustomerData(prev => ({ ...prev, neighborhood: zoneName }));
    setNeighborhoodSearch(zoneName);
    setShowNeighborhoodDropdown(false);
    setDeliveryFee(Number(zoneFee) || 0);
    if(errors.neighborhood) {
        setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.neighborhood;
            return newErrors;
        });
    }
  };

  const handleNeighborhoodInputChange = (value) => {
    setNeighborhoodSearch(value);
    setCustomerData(prev => ({ ...prev, neighborhood: value }));
    setShowNeighborhoodDropdown(true);
    if (!deliveryZones.find(zone => zone.neighborhood_name.toLowerCase() === value.toLowerCase())) {
      setDeliveryFee(0);
    }
  };

  const handlePaymentMethodSelection = (method) => {
    setCustomerData(prev => ({...prev, paymentMethod: method}));
    if (errors.paymentMethod) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.paymentMethod;
        return newErrors;
      });
    }
  };

  const handleAddressSelection = (addressId) => {
      const selected = customerAddresses.find(a => a.id === addressId);
      if (selected) {
          setCustomerData(prev => ({
              ...prev,
              address: selected.address,
              neighborhood: selected.neighborhood,
          }));
      }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="flex items-center space-x-2 text-gray-700 font-medium">Tipo de Pedido</Label>
        <div className="grid grid-cols-2 gap-2">
            <Button
                type="button"
                variant={orderType === 'delivery' ? 'destructive' : 'outline'}
                onClick={() => setOrderType('delivery')}
                className="w-full justify-center text-left p-2 h-auto"
            >
                <Motorcycle className="h-4 w-4 mr-2" /> Entrega
            </Button>
            <Button
                type="button"
                variant={orderType === 'pickup' ? 'destructive' : 'outline'}
                onClick={() => setOrderType('pickup')}
                className="w-full justify-center text-left p-2 h-auto"
            >
                <Home className="h-4 w-4 mr-2" /> Retirar no Local
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center space-x-2 text-gray-700 font-medium"><User className="h-4 w-4 text-red-500" /><span>Nome Completo *</span></Label>
            <Input id="name" value={customerData.name} onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))} className={`border-2 focus:border-red-500 focus:ring-red-500 ${errors.name ? 'border-red-300' : 'border-gray-200'}`} placeholder="Seu nome completo"/>
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center space-x-2 text-gray-700 font-medium"><Phone className="h-4 w-4 text-red-500" /><span>Telefone *</span></Label>
            <Input id="phone" value={customerData.phone} onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))} className={`border-2 focus:border-red-500 focus:ring-red-500 ${errors.phone ? 'border-red-300' : 'border-gray-200'}`} placeholder="(11) 99999-9999"/>
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center space-x-2 text-gray-700 font-medium"><Mail className="h-4 w-4 text-red-500" /><span>E-mail (opcional)</span></Label>
        <Input id="email" type="email" value={customerData.email} onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))} className="border-2 border-gray-200 focus:border-red-500 focus:ring-red-500" placeholder="seu@email.com"/>
      </div>
      
      <AnimatePresence>
      {orderType === 'delivery' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6 overflow-hidden">
          
          {customerAddresses.length > 0 && (
              <div className="space-y-2">
                  <Label htmlFor="saved_address" className="flex items-center space-x-2 text-gray-700 font-medium"><Home className="h-4 w-4 text-red-500" /><span>Usar endereço salvo</span></Label>
                  <Select onValueChange={handleAddressSelection}>
                      <SelectTrigger>
                          <SelectValue placeholder="Selecione um endereço..." />
                      </SelectTrigger>
                      <SelectContent>
                          {customerAddresses.map(addr => (
                              <SelectItem key={addr.id} value={addr.id}>
                                  <div className="flex items-center">
                                      {addr.is_default && <Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-400" />}
                                      <span>{addr.address_label}: {addr.address}, {addr.neighborhood}</span>
                                  </div>
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="neighborhood" className="flex items-center space-x-2 text-gray-700 font-medium"><MapPin className="h-4 w-4 text-red-500" /><span>Bairro *</span></Label>
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input id="neighborhood" value={neighborhoodSearch} onChange={(e) => handleNeighborhoodInputChange(e.target.value)} onFocus={() => setShowNeighborhoodDropdown(true)} onBlur={() => setTimeout(() => setShowNeighborhoodDropdown(false), 200)} className={`pl-10 border-2 focus:border-red-500 focus:ring-red-500 ${errors.neighborhood ? 'border-red-300' : 'border-gray-200'}`} placeholder="Digite para pesquisar seu bairro..."/>
                </div>
                {showNeighborhoodDropdown && filteredZones.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredZones.map((zone) => (
                            <button key={zone.id} type="button" onMouseDown={() => handleNeighborhoodSelect(zone.neighborhood_name, zone.fee)} className="w-full px-4 py-3 text-left hover:bg-red-50 border-b border-gray-100 last:border-b-0 flex justify-between items-center">
                                <span className="font-medium text-gray-800">{zone.neighborhood_name}</span>
                                <span className="text-sm text-red-600 font-semibold">Taxa: {formatPrice(zone.fee)}</span>
                            </button>
                        ))}
                    </div>
                )}
                {showNeighborhoodDropdown && neighborhoodSearch && filteredZones.length === 0 && <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">Nenhum bairro encontrado</div>}
            </div>
            {errors.neighborhood && <p className="text-red-500 text-sm">{errors.neighborhood}</p>}
          </div>
          <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center space-x-2 text-gray-700 font-medium"><MapPin className="h-4 w-4 text-red-500" /><span>Endereço Completo *</span></Label>
              <Input id="address" value={customerData.address} onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))} className={`border-2 focus:border-red-500 focus:ring-red-500 ${errors.address ? 'border-red-300' : 'border-gray-200'}`} placeholder="Rua, número, complemento..."/>
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
          </div>
          <div className="flex items-center space-x-2">
              <UiCheckbox id="saveAddress" checked={customerData.saveAddress} onCheckedChange={(checked) => setCustomerData(prev => ({...prev, saveAddress: checked}))} />
              <Label htmlFor="saveAddress" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Salvar este endereço para pedidos futuros
              </Label>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="payment" className="flex items-center space-x-2 text-gray-700 font-medium"><CreditCard className="h-4 w-4 text-red-500" /><span>Forma de Pagamento *</span></Label>
            <div className="grid grid-cols-2 gap-2">
                {['Pix', 'Cartão de Crédito', 'Dinheiro', 'Cartão de Débito'].map(method => (
                    <Button key={method} type="button" variant={customerData.paymentMethod === method ? 'destructive' : 'outline'} onClick={() => handlePaymentMethodSelection(method)} className="w-full justify-start text-left p-2 h-auto text-sm">
                        <span className={`mr-2 h-4 w-4 rounded-full border ${customerData.paymentMethod === method ? 'bg-red-500 border-red-500' : 'border-gray-400'}`}></span>
                        {method}
                    </Button>
                ))}
            </div>
          {errors.paymentMethod && <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>}
          
          <AnimatePresence>
            {customerData.paymentMethod === 'Dinheiro' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden pt-2">
                <Label htmlFor="changeFor" className="flex items-center space-x-2 text-gray-700 font-medium"><Coins className="h-4 w-4 text-red-500" /><span>Troco para?</span></Label>
                <Input
                  id="changeFor"
                  type="number"
                  value={customerData.changeFor}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, changeFor: e.target.value }))}
                  className={`border-2 focus:border-red-500 focus:ring-red-500 ${errors.changeFor ? 'border-red-300' : 'border-gray-200'}`}
                  placeholder="Ex: 50,00"
                />
                {errors.changeFor && <p className="text-red-500 text-sm">{errors.changeFor}</p>}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
        <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center space-x-2 text-gray-700 font-medium"><MessageSquare className="h-4 w-4 text-red-500" /><span>Observações</span></Label>
            <Textarea id="notes" value={customerData.notes} onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))} className="border-2 border-gray-200 focus:border-red-500 focus:ring-red-500 resize-none" placeholder="Alguma observação? (opcional)" rows={3}/>
        </div>
      </div>
    </div>
  );
};

export default CheckoutUserDetails;