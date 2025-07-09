import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Image as ImageIconPlaceholder } from 'lucide-react';
import ImageUploadField from '@/components/products/ImageUploadField';
import { useData } from '@/contexts/DataContext';
import { formatPrice } from '@/lib/utils';

const AddonGroupSelector = ({ selectedGroupIds, onSelectionChange }) => {
  const { addonGroups, addons } = useData();
  const [expandedGroupId, setExpandedGroupId] = useState(null);

  const handleToggleExpand = (groupId) => {
    setExpandedGroupId(currentId => (currentId === groupId ? null : groupId));
  };

  return (
    <div className="space-y-2">
      <Label>Grupos de Adicionais</Label>
      <p className="text-sm text-muted-foreground">Selecione os grupos de adicionais para este produto.</p>
      <div className="space-y-2 max-h-60 overflow-y-auto rounded-md border p-2 bg-gray-50/50">
        {addonGroups.length > 0 ? addonGroups.map(group => {
          const isSelected = selectedGroupIds.includes(group.id);
          const isExpanded = expandedGroupId === group.id;
          const groupAddons = addons.filter(a => a.addon_group_id === group.id);

          return (
            <Card key={group.id} className="overflow-hidden bg-white shadow-sm">
              <div className="flex items-center p-3 cursor-pointer" onClick={() => handleToggleExpand(group.id)}>
                <Checkbox
                  id={`group-${group.id}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => onSelectionChange(group.id, checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="mr-3"
                />
                <div className="flex-grow">
                  <Label htmlFor={`group-${group.id}`} className="font-medium cursor-pointer">{group.name}</Label>
                  <p className="text-xs text-muted-foreground">{groupAddons.length} item(s)</p>
                </div>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 pt-0">
                      <div className="border-t pt-3 space-y-2">
                        {groupAddons.length > 0 ? groupAddons.map(addon => (
                          <div key={addon.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md">
                            <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-gray-200">
                              {addon.image_url ? (
                                <img src={addon.image_url} alt={addon.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <ImageIconPlaceholder size={20} />
                                </div>
                              )}
                            </div>
                            <div className="flex-grow">
                              <p className="text-sm font-medium text-gray-800">{addon.name}</p>
                            </div>
                            <div className="text-sm font-semibold text-green-600">
                              {addon.price === 0 ? 'Grátis' : formatPrice(addon.price)}
                            </div>
                          </div>
                        )) : (
                          <p className="text-xs text-center text-muted-foreground py-2">Nenhum item neste grupo.</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        }) : (
          <p className="text-sm text-center text-muted-foreground py-4">Nenhum grupo de adicional criado.</p>
        )}
      </div>
    </div>
  );
};

function ProductForm({ product, onSave, onCancel }) {
  const { categories } = useData();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    promotional_price: '',
    category_id: '',
    image_url: '',
    available: true,
    addon_group_ids: [],
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        promotional_price: product.promotional_price?.toString() || '',
        category_id: product.category_id || '',
        image_url: product.image_url || '',
        available: product.available ?? true,
        addon_group_ids: product.addon_group_ids || [],
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value) => {
    setFormData(prev => ({ ...prev, category_id: value }));
  };

  const handleImageChange = (url) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const handleAddonGroupChange = (groupId, isSelected) => {
    setFormData(prev => {
      const currentIds = prev.addon_group_ids || [];
      if (isSelected) {
        return { ...prev, addon_group_ids: [...currentIds, groupId] };
      } else {
        return { ...prev, addon_group_ids: currentIds.filter(id => id !== groupId) };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      promotional_price: formData.promotional_price ? parseFloat(formData.promotional_price) : null,
    };
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="name">Nome do Produto</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="promotional_price">Preço Promocional (R$)</Label>
              <Input id="promotional_price" name="promotional_price" type="number" step="0.01" value={formData.promotional_price} onChange={handleChange} placeholder="Opcional" />
            </div>
          </div>
          <div>
            <Label htmlFor="category_id">Categoria</Label>
            <Select onValueChange={handleCategoryChange} value={formData.category_id} required>
              <SelectTrigger id="category_id">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-6">
          <ImageUploadField
            value={formData.image_url}
            onChange={handleImageChange}
            label="Imagem do Produto"
          />
          <AddonGroupSelector
            selectedGroupIds={formData.addon_group_ids}
            onSelectionChange={handleAddonGroupChange}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-red-600 hover:bg-red-700">{product?.name ? 'Atualizar Produto' : 'Criar Produto'}</Button>
      </div>
    </form>
  );
}

export default ProductForm;