import React, { useState } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { MapPin, DollarSign, PlusCircle, Trash2, Edit, Save, X, Loader2 } from 'lucide-react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { formatPrice } from '@/lib/utils';

    const DeliveryZonesSection = ({ deliveryZones, onAdd, onUpdate, onDelete }) => {
      const { toast } = useToast();
      const [newNeighborhood, setNewNeighborhood] = useState('');
      const [newFee, setNewFee] = useState('');
      const [editingZone, setEditingZone] = useState(null);
      const [isSubmitting, setIsSubmitting] = useState(false);

      const handleAddZone = async (e) => {
        e.preventDefault();
        if (!newNeighborhood.trim() || !newFee) {
          toast({ title: "Campos obrigatórios", description: "Preencha o nome do bairro e a taxa.", variant: "destructive" });
          return;
        }
        setIsSubmitting(true);
        await onAdd({ neighborhood_name: newNeighborhood, fee: parseFloat(newFee) });
        setNewNeighborhood('');
        setNewFee('');
        setIsSubmitting(false);
        toast({ title: "Sucesso!", description: "Nova área de entrega adicionada." });
      };

      const handleUpdateZone = async () => {
        if (!editingZone.neighborhood_name.trim() || !editingZone.fee) {
          toast({ title: "Campos obrigatórios", description: "Preencha o nome do bairro e a taxa.", variant: "destructive" });
          return;
        }
        setIsSubmitting(true);
        await onUpdate(editingZone.id, { neighborhood_name: editingZone.neighborhood_name, fee: parseFloat(editingZone.fee) });
        setEditingZone(null);
        setIsSubmitting(false);
        toast({ title: "Sucesso!", description: "Área de entrega atualizada." });
      };

      const handleDeleteZone = async (id) => {
        await onDelete(id);
        toast({ title: "Sucesso!", description: "Área de entrega removida.", variant: "destructive" });
      };

      const startEditing = (zone) => {
        setEditingZone({ ...zone });
      };

      const cancelEditing = () => {
        setEditingZone(null);
      };

      return (
        <Card>
          <CardHeader>
            <CardTitle>Áreas de Entrega</CardTitle>
            <CardDescription>Configure taxas de entrega personalizadas para cada bairro.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {deliveryZones && deliveryZones.map((zone) => (
                    <motion.div
                      key={zone.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-3 rounded-lg border bg-gray-50"
                    >
                      {editingZone && editingZone.id === zone.id ? (
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <Input
                            value={editingZone.neighborhood_name}
                            onChange={(e) => setEditingZone({ ...editingZone, neighborhood_name: e.target.value })}
                            placeholder="Nome do Bairro"
                            className="flex-grow"
                          />
                          <div className="relative w-full sm:w-auto">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              type="number"
                              value={editingZone.fee}
                              onChange={(e) => setEditingZone({ ...editingZone, fee: e.target.value })}
                              placeholder="Taxa"
                              className="pl-10"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" onClick={handleUpdateZone} disabled={isSubmitting}>
                              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-green-600" />}
                            </Button>
                            <Button size="icon" variant="ghost" onClick={cancelEditing}>
                              <X className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-800">{zone.neighborhood_name}</p>
                              <p className="text-sm text-green-600 font-semibold">{formatPrice(zone.fee)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" onClick={() => startEditing(zone)}>
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDeleteZone(zone.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {deliveryZones && deliveryZones.length === 0 && (
                   <div className="text-center text-gray-500 py-6">
                     <MapPin className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                     Nenhuma área de entrega cadastrada.
                   </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <form onSubmit={handleAddZone} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="sm:col-span-2">
                    <Label htmlFor="neighborhood">Nome do Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={newNeighborhood}
                      onChange={(e) => setNewNeighborhood(e.target.value)}
                      placeholder="Ex: Centro"
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fee">Taxa (R$)</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="fee"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newFee}
                        onChange={(e) => setNewFee(e.target.value)}
                        placeholder="5.00"
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="sm:col-span-3 bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                    Adicionar Bairro
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    };

    export default DeliveryZonesSection;