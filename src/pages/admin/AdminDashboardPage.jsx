import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, UserPlus, ListChecks, AlertTriangle, Settings, TrendingUp } from 'lucide-react';
import MetricCard from '@/components/admin/MetricCard';
import GrowthLineChart from '@/components/admin/GrowthLineChart';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subMonths, startOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const AdminDashboardPage = () => {
  const { fetchAllSystemUsers, adminUser, loading: adminAuthLoading, operationLoading } = useAdminAuth();
  const { toast } = useToast();
  const [totalUsers, setTotalUsers] = useState(0);
  const [registrationData, setRegistrationData] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [fetchErrorOccurred, setFetchErrorOccurred] = useState(false);

  const isLoadingDashboardData = operationLoading['fetchAllSystemUsers'] || adminAuthLoading;

  const processRegistrationData = useCallback((usersList) => {
    const emptyData = [];
    for (let i = 5; i >= 0; i--) {
      emptyData.push({
        name: format(subMonths(new Date(), i), 'MMM', { locale: ptBR }),
        cadastros: 0,
      });
    }

    if (!Array.isArray(usersList) || usersList.length === 0) {
      return emptyData;
    }

    const monthlyRegistrations = {};
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

    usersList.forEach(user => {
      if (user.created_at) {
        const registrationDate = parseISO(user.created_at);
        if (registrationDate >= sixMonthsAgo) {
          const monthYear = format(registrationDate, 'yyyy-MM');
          monthlyRegistrations[monthYear] = (monthlyRegistrations[monthYear] || 0) + 1;
        }
      }
    });

    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthYearKey = format(monthDate, 'yyyy-MM');
      chartData.push({
        name: format(monthDate, 'MMM', { locale: ptBR }),
        cadastros: monthlyRegistrations[monthYearKey] || 0,
      });
    }
    return chartData;
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!adminUser || adminAuthLoading) return;
    setFetchErrorOccurred(false);
    
    const result = await fetchAllSystemUsers();

    if (result.success) {
      const fetchedUsers = result.data;
      setTotalUsers(fetchedUsers.length);
      setRegistrationData(processRegistrationData(fetchedUsers));
      
      const sortedUsers = [...fetchedUsers].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRecentUsers(sortedUsers.slice(0, 3));
    } else {
      setTotalUsers(0);
      setRegistrationData(processRegistrationData([]));
      setRecentUsers([]);
      setFetchErrorOccurred(true);
    }
  }, [adminUser, adminAuthLoading, fetchAllSystemUsers, processRegistrationData, toast]);

  useEffect(() => {
    if (!adminAuthLoading) {
        fetchDashboardData();
    }
  }, [fetchDashboardData, adminAuthLoading]);

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'data indisponível';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds} seg atrás`;
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };
  
  const handleNotImplemented = (feature) => {
    toast({
      title: `🚧 ${feature || 'Funcionalidade'} não implementada`,
      description: "Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀",
    });
  };

  if (adminAuthLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="admin-text text-lg">Autenticando administrador...</p>
      </div>
    );
  }

  if (isLoadingDashboardData && recentUsers.length === 0) {
     return (
      <div className="flex items-center justify-center h-full">
        <p className="admin-text text-lg">Carregando dados do dashboard...</p>
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
        <h1 className="text-3xl font-bold admin-text">Dashboard Administrativo</h1>
      </motion.div>

      {fetchErrorOccurred && (
        <Card className="admin-card shadow-lg border-l-4 border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600"><AlertTriangle className="mr-2 h-5 w-5" /> Falha ao Carregar Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="admin-text">Não foi possível carregar alguns dados do dashboard. Verifique sua conexão ou tente atualizar.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total de Usuários" 
          value={totalUsers} 
          icon={Users} 
          color="text-blue-500"
          change={`+${registrationData.length > 0 ? registrationData[registrationData.length -1].cadastros : 0} este mês`}
          changeType="positive"
        />
        <MetricCard 
          title="Saldo Total (Simulado)" 
          value="Em breve" 
          icon={DollarSign} 
          color="text-green-500"
        />
        <MetricCard 
          title="Novos Cadastros (Mês)" 
          value={registrationData.length > 0 ? registrationData[registrationData.length -1].cadastros : 0} 
          icon={UserPlus} 
          color="text-purple-500"
        />
        <MetricCard 
          title="Saques Pendentes (Simulado)" 
          value="N/D" 
          icon={ListChecks} 
          color="text-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GrowthLineChart
            data={registrationData}
            isLoading={isLoadingDashboardData}
            error={fetchErrorOccurred}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="admin-card shadow-lg h-full min-h-[400px]">
            <CardHeader>
              <CardTitle className="admin-text">Novos Usuários Recentes</CardTitle>
              <CardDescription>Últimos 3 usuários cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDashboardData && recentUsers.length === 0 ? (
                 <div className="flex items-center justify-center h-full py-8">
                    <p className="admin-text">Carregando usuários...</p>
                 </div>
              ) : recentUsers.length > 0 && !fetchErrorOccurred ? (
                <ul className="space-y-3">
                  {recentUsers.map(user => (
                    <li key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-semibold admin-text text-sm">{user.business_name || user.name || 'Usuário Anônimo'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{getTimeAgo(user.created_at)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                 <div className="flex flex-col items-center justify-center text-center py-8">
                    <Users className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="admin-text">{fetchErrorOccurred ? "Erro ao carregar" : "Nenhum usuário recente."}</p>
                    <p className="text-sm text-muted-foreground">Os novos usuários aparecerão aqui.</p>
                </div>
              )}
              <Button asChild variant="link" className="admin-text-link w-full mt-4 text-sm">
                <Link to="/admin/users">Ver todos usuários</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="admin-card shadow-lg">
          <CardHeader>
            <CardTitle className="admin-text">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild className="admin-button-secondary h-20 flex-col">
              <Link to="/admin/users">
                <Users className="h-6 w-6 mb-1" /> Gerenciar Usuários
              </Link>
            </Button>
            <Button asChild className="admin-button-secondary h-20 flex-col">
              <Link to="/admin/settings">
                <Settings className="h-6 w-6 mb-1" /> Configurações
              </Link>
            </Button>
             <Button asChild className="admin-button-secondary h-20 flex-col">
              <Link to="/admin/withdrawals">
                <DollarSign className="h-6 w-6 mb-1" /> Gerenciar Saques
              </Link>
            </Button>
            <Button className="admin-button-secondary h-20 flex-col" onClick={() => handleNotImplemented('Relatórios Detalhados')}>
              <TrendingUp className="h-6 w-6 mb-1" /> Ver Relatórios
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboardPage;