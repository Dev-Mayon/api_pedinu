import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2, KeyRound, UserX, UserCheck, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const EditUserSheet = ({ isOpen, setIsOpen, user, onUserUpdate }) => {
  const { updateSystemUser, resetUserPassword, deleteSystemUserAccount, operationLoading } = useAdminAuth();
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        business_name: user.business_name || '',
        status: user.status || 'active',
        role: user.role || 'user',
      });
    }
  }, [user]);

  if (!user) return null;

  const isLoading = operationLoading[`updateUser-${user.id}`] || operationLoading[`resetPassword-${user.id}`] || operationLoading[`deleteSystemUserAccount`];

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updates = {};
    if (formData.name !== user.name) updates.name = formData.name;
    if (formData.business_name !== user.business_name) updates.business_name = formData.business_name;
    if (formData.status !== user.status) updates.status = formData.status;
    if (formData.role !== user.role) updates.role = formData.role;

    if (Object.keys(updates).length > 0) {
      const result = await updateSystemUser(user.id, updates);
      if (result.success) {
        onUserUpdate(result.data);
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
    setIsSaving(false);
  };

  const handleResetPassword = async () => {
    await resetUserPassword(user.id);
  };

  const handleToggleStatus = async () => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const result = await updateSystemUser(user.id, { status: newStatus });
    if (result.success) {
      onUserUpdate(result.data);
    }
  };

  const handleDelete = async () => {
    const success = await deleteSystemUserAccount(user.id);
    if (success) {
      setIsOpen(false);
      onUserUpdate({ id: user.id, deleted: true }); // Signal deletion
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Usuário</SheetTitle>
          <SheetDescription>
            Altere os dados do usuário. Clique em salvar quando terminar.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="business_name" className="text-right">
              Negócio
            </Label>
            <Input id="business_name" value={formData.business_name} onChange={(e) => handleInputChange('business_name', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              E-mail
            </Label>
            <Input id="email" value={user.email} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Papel
            </Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold text-muted-foreground">Ações Rápidas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleResetPassword} disabled={isLoading}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    {operationLoading[`resetPassword-${user.id}`] ? 'Enviando...' : 'Resetar Senha'}
                </Button>
                <Button variant="outline" onClick={handleToggleStatus} disabled={isLoading}>
                    {user.status === 'active' ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                    {operationLoading[`updateUser-${user.id}`] ? 'Alterando...' : (user.status === 'active' ? 'Desativar' : 'Ativar')}
                </Button>
            </div>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" disabled={isLoading}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir Usuário Permanentemente
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão Permanente</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação é irreversível. Todos os dados do usuário "{user.business_name}" serão permanentemente excluídos, incluindo pedidos, produtos e configurações. Tem certeza?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                            {operationLoading.deleteSystemUserAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Sim, excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>

        <SheetFooter className="mt-8">
          <SheetClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </SheetClose>
          <Button type="submit" onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving || isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar Alterações
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditUserSheet;