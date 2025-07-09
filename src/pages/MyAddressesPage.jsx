import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Loader2, AlertTriangle, ArrowLeft, Home, Trash2, Edit, Star, CheckCircle } from 'lucide-react';
import PedinuLogo from '@/components/ui/PedinuLogo';
import { useCustomer } from '@/contexts/CustomerContext';
import CustomerIdentificationModal from '@/components/public_catalog/CustomerIdentificationModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <Loader2 className="h-12 w-12 animate-spin text-red-500" />
    <p className="mt-4 text-lg text-gray-700">Carregando...</p>
  </div>
);

const AddressFormModal = ({ isOpen, onClose, onSave, address, deliveryZones }) => {
  const [formData, setFormData] = useState({ address_label: 'Casa', address: '', neighborhood: '' });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (address) {
      setFormData({
        address_label: address.address_label || 'Casa',
        address: address.address || '',
        neighborhood: address.neighborhood || '',
      });
    } else {
      setFormData({ address_label: 'Casa', address: '', neighborhood: '' });
    }
    setErrors({});
  }, [address, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório.';
    if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{address ? 'Editar Endereço' : 'Adicionar Novo Endereço'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do seu endereço abaixo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="address_label">Rótulo (Ex: Casa, Trabalho)</Label>
            <Input id="address_label" value={formData.address_label} onChange={(e) => setFormData({ ...formData, address_label: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Select value={formData.neighborhood} onValueChange={(value) => setFormData({ ...formData, neighborhood: value })}>
              <SelectTrigger className={errors.neighborhood ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione um bairro" />
              </SelectTrigger>
              <SelectContent>
                {deliveryZones.map(zone => (
                  <SelectItem key={zone.id} value={zone.neighborhood_name}>{zone.neighborhood_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.neighborhood && <p className="text-red-500 text-sm">{errors.neighborhood}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Endereço Completo (Rua, Número, Comp.)</Label>
            <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={errors.address ? 'border-red-500' : ''} />
            {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar Endereço
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MyAddressesPage = () => {
  const { customer, isIdentified, setSelectedAddress } = useCustomer();
  const [addresses, setAddresses] = useState([]);
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isIdentificationModalOpen, setIsIdentificationModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const businessSlug = localStorage.getItem('last-visited-slug');

  const fetchAddresses = useCallback(async (phone, slug) => {
    if (!phone || !slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_phone', phone)
        .eq('business_slug', slug)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setAddresses(data || []);
    } catch (e) {
      console.error(e);
      setError("Não foi possível buscar seus endereços.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDeliveryZones = useCallback(async (slug) => {
    if (!slug) return;
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('business_slug', slug)
        .single();
      
      if (profileError) throw profileError;

      const { data, error: zonesError } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('user_id', profileData.id);
      
      if (zonesError) throw zonesError;
      setDeliveryZones(data || []);
    } catch (e) {
      console.error("Error fetching delivery zones:", e);
    }
  }, []);

  useEffect(() => {
    if (!isIdentified) {
      setIsIdentificationModalOpen(true);
    } else {
      fetchAddresses(customer.phone, businessSlug);
      fetchDeliveryZones(businessSlug);
    }
  }, [isIdentified, customer.phone, businessSlug, fetchAddresses, fetchDeliveryZones]);

  const onIdentified = () => {
    setIsIdentificationModalOpen(false);
    fetchAddresses(customer.phone, businessSlug);
    fetchDeliveryZones(businessSlug);
  };

  const handleBackToMenu = () => {
    if (businessSlug) {
      navigate(`/cardapio/${businessSlug}`);
    } else {
      navigate('/');
    }
  };

  const handleSaveAddress = async (formData) => {
    const addressData = {
      ...formData,
      customer_phone: customer.phone,
      business_slug: businessSlug,
    };

    let result;
    if (editingAddress) {
      result = await supabase.from('customer_addresses').update(addressData).eq('id', editingAddress.id);
    } else {
      result = await supabase.from('customer_addresses').insert(addressData);
    }

    if (result.error) {
      toast({ title: "Erro!", description: "Não foi possível salvar o endereço.", variant: "destructive" });
      console.error(result.error);
    } else {
      toast({ title: "Sucesso!", description: `Endereço ${editingAddress ? 'atualizado' : 'adicionado'}.` });
      setIsFormModalOpen(false);
      setEditingAddress(null);
      fetchAddresses(customer.phone, businessSlug);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const { error } = await supabase.from('customer_addresses').delete().eq('id', addressId);
    if (error) {
      toast({ title: "Erro!", description: "Não foi possível remover o endereço.", variant: "destructive" });
    } else {
      toast({ title: "Endereço removido." });
      fetchAddresses(customer.phone, businessSlug);
    }
  };

  const handleSetDefault = async (addressId) => {
    // Reset all other addresses to not be default
    const { error: resetError } = await supabase
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('customer_phone', customer.phone)
      .eq('business_slug', businessSlug);

    if (resetError) {
      toast({ title: "Erro!", description: "Não foi possível atualizar o endereço padrão.", variant: "destructive" });
      return;
    }

    // Set the selected address as default
    const { error: setError } = await supabase
      .from('customer_addresses')
      .update({ is_default: true })
      .eq('id', addressId);

    if (setError) {
      toast({ title: "Erro!", description: "Não foi possível definir o endereço padrão.", variant: "destructive" });
    } else {
      toast({ title: "Endereço padrão atualizado!" });
      fetchAddresses(customer.phone, businessSlug);
    }
  };
  
  const handleSelectAndReturn = (address) => {
    setSelectedAddress(address);
    handleBackToMenu();
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <CustomerIdentificationModal isOpen={isIdentificationModalOpen} onClose={() => navigate(-1)} onIdentified={onIdentified} />
      <AddressFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSave={handleSaveAddress} address={editingAddress} deliveryZones={deliveryZones} />

      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
            <Button variant="ghost" size="icon" onClick={handleBackToMenu}><ArrowLeft /></Button>
            <PedinuLogo className="h-8" />
            <div className="w-10"></div>
          </div>
        </header>

        <main className="py-8 px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto">
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Meus Endereços</CardTitle>
                  <CardDescription>Clique em um endereço para usá-lo no seu próximo pedido.</CardDescription>
                </div>
                <Button onClick={() => { setEditingAddress(null); setIsFormModalOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" /> Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                {error && <div className="text-center text-red-500 p-4"><AlertTriangle className="mx-auto h-8 w-8 mb-2" />{error}</div>}
                
                {!loading && addresses.length === 0 && !error && (
                  <div className="text-center py-10">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum endereço cadastrado</h3>
                    <p className="mt-1 text-sm text-gray-500">Adicione um endereço para facilitar seus próximos pedidos.</p>
                  </div>
                )}

                {addresses.length > 0 && (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {addresses.map(addr => (
                        <motion.div
                          key={addr.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          className={cn(
                            "border rounded-lg p-4 flex items-start justify-between cursor-pointer transition-all",
                            addr.is_default ? "border-red-500 bg-red-50" : "hover:bg-gray-50 hover:border-gray-300"
                          )}
                           onClick={() => handleSelectAndReturn(addr)}
                        >
                          <div className="flex items-start space-x-4 flex-1">
                             <div className="mt-1 flex-shrink-0">
                                {addr.is_default ? 
                                    <CheckCircle className="h-6 w-6 text-red-500" /> :
                                    <Home className="h-6 w-6 text-gray-400" />
                                }
                             </div>
                            <div>
                              <p className="font-bold text-gray-800 flex items-center">
                                {addr.address_label}
                              </p>
                              <p className="text-gray-600">{addr.address}</p>
                              <p className="text-sm text-gray-500">{addr.neighborhood}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-0" onClick={(e) => e.stopPropagation()}>
                             {!addr.is_default && (
                                <Button variant="ghost" size="sm" onClick={() => handleSetDefault(addr.id)}>
                                    <Star className="h-4 w-4 mr-1" />
                                    Padrão
                                </Button>
                             )}
                            <Button variant="ghost" size="icon" onClick={() => { setEditingAddress(addr); setIsFormModalOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteAddress(addr.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
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

export default MyAddressesPage;