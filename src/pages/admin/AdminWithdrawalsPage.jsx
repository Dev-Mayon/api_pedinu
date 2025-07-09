import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Search, CheckCircle, XCircle, Filter, CalendarDays, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/customSupabaseClient';
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

const AdminWithdrawalsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [withdrawals, setWithdrawals] = useState([]);
  const [actionLoading, setActionLoading] = useState(null); // stores ID of item being processed
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data);
    } catch (error) {
      toast({
        title: "Erro ao buscar saques",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWithdrawals();

    const channel = supabase.channel('admin-withdrawal-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawal_requests' },
        () => fetchWithdrawals()
      ).subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWithdrawals]);
  

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter(w => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        w.business_name?.toLowerCase().includes(searchLower) || 
        w.user_name?.toLowerCase().includes(searchLower) ||
        w.id.toLowerCase().includes(searchLower);
      const matchesStatus = filterStatus === 'all' || w.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [withdrawals, searchTerm, filterStatus]);

  const handleUpdateStatus = async (id, userId, amount, newStatus, reason = '') => {
    setActionLoading(id);
    try {
      const { error } = await supabase.rpc('process_withdrawal', {
        p_request_id: id,
        p_user_id: userId,
        p_amount: amount,
        p_new_status: newStatus,
        p_rejection_reason: reason || null
      });

      if (error) throw error;
      
      toast({
        title: `Saque ${newStatus === 'approved' ? 'Aprovado' : 'Rejeitado'}`,
        description: `O saque ID ${id} foi atualizado com sucesso.`,
      });
      fetchWithdrawals(); // Refetch data
    } catch(error) {
      toast({
        title: "Erro ao processar saque",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setRejectionReason('');
    }
  };


  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">Pendente</Badge>;
      case 'approved': return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">Aprovado</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">Rejeitado</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex flex-col md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-2">
          <DollarSign className="h-8 w-8 admin-text" />
          <h1 className="text-3xl font-bold admin-text">Solicitações de Saque</h1>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="admin-card shadow-lg">
          <CardHeader>
            <CardTitle className="admin-text">Gerenciar Saques</CardTitle>
            <CardDescription>Aprove ou rejeite solicitações de saque dos usuários.</CardDescription>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, negócio ou ID..."
                  className="pl-10 admin-input w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="admin-input rounded-md p-2 text-sm"
                >
                  <option value="all">Todos Status</option>
                  <option value="pending">Pendentes</option>
                  <option value="approved">Aprovados</option>
                  <option value="rejected">Rejeitados</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário/Negócio</TableHead>
                  <TableHead>Chave Pix</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWithdrawals.length > 0 ? filteredWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="font-medium">{withdrawal.business_name}</div>
                      <div className="text-xs text-muted-foreground">{withdrawal.user_name}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{withdrawal.pix_key}</TableCell>
                    <TableCell className="text-right font-semibold">{formatPrice(withdrawal.amount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        {new Date(withdrawal.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-muted-foreground ml-5">
                        {new Date(withdrawal.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                    <TableCell className="text-center space-x-1">
                      {actionLoading === withdrawal.id ? (
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      ) : withdrawal.status === 'pending' ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-green-500 hover:text-green-700" 
                            onClick={() => handleUpdateStatus(withdrawal.id, withdrawal.user_id, withdrawal.amount, 'approved')}
                          >
                            <CheckCircle className="h-5 w-5" />
                          </Button>
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                                <XCircle className="h-5 w-5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Rejeitar Saque</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Por favor, informe o motivo da rejeição. Esta informação será visível para o usuário.
                                </AlertDialogDescription>
                                <Input 
                                  placeholder="Ex: Dados bancários inválidos" 
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  className="mt-2"
                                />
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setRejectionReason('')}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleUpdateStatus(withdrawal.id, withdrawal.user_id, withdrawal.amount, 'rejected', rejectionReason)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Confirmar Rejeição
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          {withdrawal.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      <Info className="h-8 w-8 mx-auto mb-2 text-gray-400"/>
                      Nenhuma solicitação de saque encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminWithdrawalsPage;