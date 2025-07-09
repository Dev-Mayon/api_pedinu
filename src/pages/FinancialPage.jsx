import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { addDays } from "date-fns";
import { Loader2, TrendingUp, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { formatPrice } from '@/lib/utils';
import { generatePdfReport } from '@/lib/generatePdfReport';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialHeader from '@/components/financial/FinancialHeader';
import StatCards from '@/components/financial/StatCards';
import TransactionsHistory from '@/components/financial/TransactionsHistory';
import FinancialSettings from '@/components/financial/FinancialSettings';

function FinancialPage() {
  const { toast } = useToast();
  const { user, fetchUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSavingPix, setIsSavingPix] = useState(false);
  const [isRequestingWithdrawal, setIsRequestingWithdrawal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [allTransactions, setAllTransactions] = useState([]);
  const [pixKey, setPixKey] = useState('');
  const [date, setDate] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [stats, setStats] = useState({
    balance: 0,
    salesInPeriod: 0,
    pendingWithdrawal: 0,
  });

  const filteredTransactions = useMemo(() => {
    if (!date?.from) return allTransactions;
    const fromDate = date.from;
    const toDate = date.to ? addDays(date.to, 1) : addDays(date.from, 1);

    return allTransactions.filter(t => {
      const transactionDate = new Date(t.created_at);
      return transactionDate >= fromDate && transactionDate < toDate;
    });
  }, [allTransactions, date]);

  const fetchFinancialData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('balance, pending_withdrawal')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        if (profileError.code !== 'PGRST116') {
            throw profileError;
        }
      }
      
      const [transactionsRes, paymentSettingsRes] = await Promise.all([
        supabase
          .from('financial_transactions')
          .select('*')
          .eq('store_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('payment_settings')
          .select('pix_key')
          .eq('user_id', user.id)
          .single(),
      ]);

      if (transactionsRes.error) throw transactionsRes.error;
      setAllTransactions(transactionsRes.data);

      if (paymentSettingsRes.data) {
        setPixKey(paymentSettingsRes.data.pix_key || '');
      }
      
      if (profileData) {
        setStats(prev => ({
          ...prev,
          balance: profileData.balance,
          pendingWithdrawal: profileData.pending_withdrawal,
        }));
      }

    } catch (error) {
      console.error("Error fetching financial data:", error);
      toast({ title: "Erro ao buscar dados financeiros", description: "Não foi possível carregar os dados financeiros. Tente recarregar a página.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user?.id) {
        fetchFinancialData();
    } else {
        setLoading(false);
    }
    
    const channel = supabase
      .channel(`financial-updates-for-user-${user?.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_transactions', filter: `store_id=eq.${user?.id}` }, () => fetchFinancialData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user?.id}` }, () => fetchFinancialData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawal_requests', filter: `user_id=eq.${user?.id}` }, () => fetchFinancialData())
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };

  }, [user, fetchFinancialData]);

  const handleSavePixKey = async () => {
    setIsSavingPix(true);
    try {
      const { error } = await supabase
        .from('payment_settings')
        .upsert({ user_id: user.id, pix_key: pixKey }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Chave Pix salva!",
        description: "Sua chave Pix foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar chave Pix",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSavingPix(false);
    }
  };

  const handleWithdrawalRequest = async () => {
    setIsRequestingWithdrawal(true);
    try {
      const amountToWithdraw = stats.balance;
      
      if (!pixKey) {
        toast({ title: "Chave Pix necessária", description: "Por favor, salve sua chave Pix na aba de configurações antes de solicitar um saque.", variant: "destructive" });
        return;
      }
      if (amountToWithdraw <= 0) {
        toast({ title: "Saldo insuficiente", description: "Você não tem saldo disponível para sacar.", variant: "destructive" });
        return;
      }

      const { error } = await supabase.rpc('request_withdrawal', {
        p_amount: amountToWithdraw,
        p_pix_key: pixKey,
        p_user_name: user.name,
        p_business_name: user.business_name
      });
      
      if (error) throw error;

      toast({
        title: "Solicitação de Saque Enviada!",
        description: `Sua solicitação de ${formatPrice(amountToWithdraw)} foi enviada para análise.`,
      });
      await fetchFinancialData();
      await fetchUserProfile(user);

    } catch (error) {
      toast({
        title: "Erro ao solicitar saque",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRequestingWithdrawal(false);
    }
  };

  const handleGenerateReport = () => {
    if (filteredTransactions.length === 0) {
      toast({
        title: "Nenhuma transação",
        description: "Não há dados para gerar um relatório no período selecionado.",
        variant: "destructive"
      });
      return;
    }
    setIsGeneratingReport(true);
    try {
      generatePdfReport(filteredTransactions, date, stats, user);
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <FinancialHeader 
        balance={stats.balance}
        loading={loading}
        pixKey={pixKey}
        isRequestingWithdrawal={isRequestingWithdrawal}
        handleWithdrawalRequest={handleWithdrawalRequest}
      />

      {loading ? (
        <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">
              <TrendingUp className="mr-2 h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <StatCards stats={stats} />
            <TransactionsHistory 
              transactions={filteredTransactions}
              date={date}
              setDate={setDate}
              onGenerateReport={handleGenerateReport}
              isGeneratingReport={isGeneratingReport}
            />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <FinancialSettings 
              pixKey={pixKey}
              setPixKey={setPixKey}
              handleSavePixKey={handleSavePixKey}
              isSavingPix={isSavingPix}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default FinancialPage;