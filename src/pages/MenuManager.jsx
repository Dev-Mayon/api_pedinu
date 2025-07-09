import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, GripVertical, PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import AddonGroupManager from '@/components/menu/AddonGroupManager';

function MenuManager() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useData();
  const { toast } = useToast();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    addCategory(newCategoryName.trim());
    setNewCategoryName('');
    setIsCategoryDialogOpen(false);
    toast({
      title: "Categoria adicionada!",
      description: `A categoria "${newCategoryName}" foi criada com sucesso.`
    });
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setIsCategoryDialogOpen(true);
  };

  const handleUpdateCategory = () => {
    if (!newCategoryName.trim() || !editingCategory) return;
    
    updateCategory(editingCategory.id, { name: newCategoryName.trim() });
    setEditingCategory(null);
    setNewCategoryName('');
    setIsCategoryDialogOpen(false);
    toast({
      title: "Categoria atualizada!",
      description: "As alterações foram salvas com sucesso."
    });
  };

  const handleDeleteCategory = (category) => {
    const productsInCategory = products.filter(p => p.category_id === category.id);
    if (productsInCategory.length > 0) {
      toast({
        title: "Não é possível excluir",
        description: "Esta categoria possui produtos. Remova os produtos primeiro.",
        variant: "destructive"
      });
      return;
    }
    
    deleteCategory(category.id);
    toast({
      title: "Categoria removida!",
      description: `A categoria "${category.name}" foi removida.`
    });
  };

  const getProductCount = (categoryId) => {
    return products.filter(p => p.category_id === categoryId).length;
  };

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Cardápio</h1>
        <p className="text-gray-600 mt-1">
          Organize suas categorias, produtos e adicionais.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Section */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Categorias</CardTitle>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-red-500 to-red-700"
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCategoryName('');
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="categoryName">Nome da Categoria</Label>
                    <Input
                      id="categoryName"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Ex: Pratos Principais, Bebidas..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          editingCategory ? handleUpdateCategory() : handleAddCategory();
                        }
                      }}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      disabled={!newCategoryName.trim()}
                    >
                      {editingCategory ? 'Atualizar' : 'Criar'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCategoryDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhuma categoria criada.</p>
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                      <div>
                        <h3 className="font-semibold text-gray-800">{category.name}</h3>
                        <p className="text-sm text-gray-500">{getProductCount(category.id)} produto(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category)} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add-ons Section */}
        <AddonGroupManager />
      </div>
    </div>
  );
}

export default MenuManager;