import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Edit, Trash2, ChevronDown, ChevronUp, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/utils';
import { useAdminAuth } from '@/contexts/AdminAuthContext'; 
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
import EditUserSheet from '@/components/admin/EditUserSheet';

const AdminUsersPage = () => {
  const { toast } = useToast();
  const { fetchAllSystemUsers, deleteSystemUserAccount, loading: adminAuthLoading, operationLoading } = useAdminAuth(); 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
  const [users, setUsers] = useState([]);
  const [fetchErrorOccurred, setFetchErrorOccurred] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const isLoadingUsers = operationLoading['fetchAllSystemUsers'] || adminAuthLoading;

  const fetchUsers = useCallback(async () => {
    setFetchErrorOccurred(false);
    const result = await fetchAllSystemUsers();
    
    if (result.success) {
      setUsers(result.data.map(user => ({
        ...user,
        balance: user.balance || 0 
      })));
    } else {
      setUsers([]);
      setFetchErrorOccurred(true);
    }
  }, [fetchAllSystemUsers]);

  useEffect(() => {
    if (!adminAuthLoading) { 
        fetchUsers();
    }
  }, [fetchUsers, adminAuthLoading]);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsSheetOpen(true);
  };

  const handleUserUpdate = (updatedUser) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
    fetchUsers(); // Re-fetch to ensure data consistency
  };

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    let sortableUsers = [...users];
    if (searchTerm) {
      sortableUsers = sortableUsers.filter(user =>
        (user.business_name && user.business_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'business_name' || sortConfig.key === 'name') {
            valA = (a[sortConfig.key] || "").toLowerCase();
            valB = (b[sortConfig.key] || "").toLowerCase();
        } else if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        } else if (typeof valA === 'number' && typeof valB === 'number') {
            // No operation needed
        } else { 
            valA = valA === null || valA === undefined ? '' : String(valA);
            valB = valB === null || valB === undefined ? '' : String(valB);
        }
        
        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, searchTerm, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />;
  };

  const handleDeleteUser = async (userId) => {
    const success = await deleteSystemUserAccount(userId); 
    if (success) {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId)); 
    }
  };

  if (adminAuthLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="admin-text text-lg">Autenticando administrador...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex flex-col md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-2">
          <Users className="h-8 w-8 admin-text" />
          <h1 className="text-3xl font-bold admin-text">Gerenciamento de Usuários</h1>
        </div>
         <Button className="admin-button-secondary mt-4 md:mt-0" onClick={fetchUsers} disabled={isLoadingUsers}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingUsers ? 'animate-spin' : ''}`} />
          {isLoadingUsers ? 'Atualizando...' : 'Atualizar Lista'}
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="admin-card shadow-lg">
          <CardHeader>
            <CardTitle className="admin-text">Lista de Usuários Cadastrados</CardTitle>
            <CardDescription>Visualize e gerencie os usuários cadastrados no sistema. ({filteredUsers.length} usuários)</CardDescription>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 space-y-2 md:space-y-0">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, negócio ou e-mail..."
                  className="pl-10 admin-input w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoadingUsers}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingUsers && (
              <div className="flex items-center justify-center h-64">
                <p className="admin-text text-lg">Carregando usuários...</p>
              </div>
            )}
            {!isLoadingUsers && fetchErrorOccurred && (
              <div className="flex flex-col items-center justify-center h-64 text-center admin-text-destructive">
                <AlertTriangle className="h-12 w-12 mb-4" />
                <p className="text-xl font-semibold">Falha ao Carregar Usuários</p>
                <p className="text-muted-foreground">Não foi possível buscar os dados. Verifique sua conexão ou tente novamente.</p>
                <Button className="mt-4 admin-button-secondary" onClick={fetchUsers}>Tentar Novamente</Button>
              </div>
            )}
            {!isLoadingUsers && !fetchErrorOccurred && (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead onClick={() => requestSort('business_name')} className="cursor-pointer hover:text-foreground whitespace-nowrap">Estabelecimento {getSortIcon('business_name')}</TableHead>
                        <TableHead onClick={() => requestSort('email')} className="cursor-pointer hover:text-foreground whitespace-nowrap">E-mail {getSortIcon('email')}</TableHead>
                        <TableHead onClick={() => requestSort('balance')} className="cursor-pointer hover:text-foreground text-right whitespace-nowrap">Saldo {getSortIcon('balance')}</TableHead>
                        <TableHead onClick={() => requestSort('created_at')} className="cursor-pointer hover:text-foreground whitespace-nowrap">Desde {getSortIcon('created_at')}</TableHead>
                        <TableHead onClick={() => requestSort('status')} className="cursor-pointer hover:text-foreground whitespace-nowrap">Status {getSortIcon('status')}</TableHead>
                        <TableHead className="text-center whitespace-nowrap">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/20">
                          <TableCell className="font-medium">{user.business_name || 'N/A'}</TableCell>
                          <TableCell>{user.email || 'N/A'}</TableCell>
                          <TableCell className="text-right">{formatPrice(user.balance)}</TableCell>
                          <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300' :
                              user.status === 'inactive' ? 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300' :
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300'
                            }`}>
                              {user.status === 'active' ? 'Ativo' : user.status === 'inactive' ? 'Inativo' : 'Pendente'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center space-x-2">
                            <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700" onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="admin-card">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="admin-text">Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o usuário "{user.business_name || user.email}"? Esta ação não pode ser desfeita e removerá todos os dados associados.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="admin-button-outline">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction className="admin-button-primary bg-red-600 hover:bg-red-700" onClick={() => handleDeleteUser(user.id)}>
                                    Excluir Usuário
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            {users.length === 0 ? "Nenhum usuário cadastrado no sistema." : "Nenhum usuário encontrado com os critérios atuais."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={true} 
                    className="admin-input"
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={true} 
                    className="admin-input"
                  >
                    Próximo
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
      {editingUser && (
        <EditUserSheet
          isOpen={isSheetOpen}
          setIsOpen={setIsSheetOpen}
          user={editingUser}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;