import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, PackagePlus, Image as ImageIcon, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import ImageUploadField from '@/components/products/ImageUploadField';
import { formatPrice } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

const AddonForm = ({ addon, group, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: addon?.name || '',
    price: addon?.price || '',
    image_url: addon?.image_url || '',
  });
  const [isFree, setIsFree] = useState(addon?.price === 0);

  useEffect(() => {
    if (isFree) {
      setFormData(prev => ({ ...prev, price: 0 }));
    }
  }, [isFree]);

  const handleSubmit = () => {
    onSave({
      ...formData,
      price: isFree ? 0 : (parseFloat(formData.price) || 0),
      addon_group_id: group.id,
    });
  };

  return (
    <div className="space-y-4">
      <ImageUploadField
        value={formData.image_url}
        onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
        label="Imagem do Adicional (Opcional)"
      />
      <div>
        <Label htmlFor="addonName">Nome do Adicional</Label>
        <Input id="addonName" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex: Queijo Extra" />
      </div>
      <div>
        <Label htmlFor="addonPrice">Preço (R$)</Label>
        <Input id="addonPrice" type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} placeholder="2.50" disabled={isFree} />
      </div>
       <div className="flex items-center space-x-2">
            <Checkbox
              id="isFree"
              checked={isFree}
              onCheckedChange={setIsFree}
            />
            <Label htmlFor="isFree" className="cursor-pointer">Adicional Gratuito</Label>
        </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={!formData.name.trim()}>Salvar Adicional</Button>
      </div>
    </div>
  );
};

const AddonGroupForm = ({ group, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    min_selection: group?.min_selection || 0,
    max_selection: group?.max_selection || 1,
  });

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="groupName">Nome do Grupo</Label>
        <Input id="groupName" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex: Molhos, Bordas" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minSelection">Mínimo</Label>
          <Input id="minSelection" type="number" value={formData.min_selection} onChange={(e) => setFormData(prev => ({ ...prev, min_selection: parseInt(e.target.value, 10) || 0 }))} />
        </div>
        <div>
          <Label htmlFor="maxSelection">Máximo</Label>
          <Input id="maxSelection" type="number" value={formData.max_selection} onChange={(e) => setFormData(prev => ({ ...prev, max_selection: parseInt(e.target.value, 10) || 1 }))} />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={!formData.name.trim()}>Salvar Grupo</Button>
      </div>
    </div>
  );
};

const AddonGroupItem = ({ group }) => {
  const { addons, addAddon, updateAddon, deleteAddon, updateAddonGroup, deleteAddonGroup } = useData();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddonDialogOpen, setIsAddonDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);

  const groupAddons = useMemo(() => addons.filter(a => a.addon_group_id === group.id), [addons, group.id]);

  const handleSaveAddon = async (addonData) => {
    let result;
    if (editingAddon) {
      result = await updateAddon(editingAddon.id, addonData);
    } else {
      result = await addAddon(addonData);
    }
    
    if (result) {
      toast({ title: `Adicional ${editingAddon ? 'atualizado' : 'adicionado'}!` });
      setIsAddonDialogOpen(false);
      setEditingAddon(null);
    } else {
      toast({ title: 'Erro ao salvar adicional', variant: 'destructive' });
    }
  };

  const handleSaveGroup = async (groupData) => {
    const result = await updateAddonGroup(group.id, groupData);
    if (result) {
      toast({ title: 'Grupo atualizado!' });
      setIsGroupDialogOpen(false);
    } else {
      toast({ title: 'Erro ao atualizar grupo', variant: 'destructive' });
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader className="p-4 flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <h4 className="font-semibold">{group.name}</h4>
          <p className="text-xs text-muted-foreground">
            {groupAddons.length} item(s) | Seleção: {group.min_selection} a {group.max_selection}
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setIsGroupDialogOpen(true); }}><Settings className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteAddonGroup(group.id); }} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-4 pt-0 space-y-3">
          {groupAddons.map(addon => (
            <div key={addon.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                  {addon.image_url ? <img src={addon.image_url} alt={addon.name} className="w-full h-full object-cover rounded" /> : <ImageIcon className="h-5 w-5 text-gray-400" />}
                </div>
                <div>
                  <p className="font-medium">{addon.name}</p>
                  <p className="text-sm text-green-600 font-semibold">
                    {addon.price === 0 ? 'Grátis' : formatPrice(addon.price)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={() => { setEditingAddon(addon); setIsAddonDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteAddon(addon.id)} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={() => { setEditingAddon(null); setIsAddonDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar Item
          </Button>
        </CardContent>
      )}

      <Dialog open={isAddonDialogOpen} onOpenChange={setIsAddonDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingAddon ? 'Editar' : 'Novo'} Adicional em "{group.name}"</DialogTitle></DialogHeader>
          <AddonForm addon={editingAddon} group={group} onSave={handleSaveAddon} onCancel={() => setIsAddonDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Grupo de Adicionais</DialogTitle></DialogHeader>
          <AddonGroupForm group={group} onSave={handleSaveGroup} onCancel={() => setIsGroupDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

function AddonGroupManager() {
  const { addonGroups, addAddonGroup } = useData();
  const { toast } = useToast();
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

  const handleSaveGroup = async (groupData) => {
    const result = await addAddonGroup(groupData);
    if (result) {
      toast({ title: 'Grupo de adicionais criado!' });
      setIsGroupDialogOpen(false);
    } else {
      toast({ title: 'Erro ao criar grupo', variant: 'destructive' });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Grupos de Adicionais</CardTitle>
        <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="hover:bg-red-50 hover:border-red-300">
              <PackagePlus className="h-4 w-4 mr-2" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Grupo de Adicionais</DialogTitle></DialogHeader>
            <AddonGroupForm onSave={handleSaveGroup} onCancel={() => setIsGroupDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {addonGroups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum grupo de adicional criado.</p>
            </div>
          ) : (
            addonGroups.map(group => <AddonGroupItem key={group.id} group={group} />)
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AddonGroupManager;