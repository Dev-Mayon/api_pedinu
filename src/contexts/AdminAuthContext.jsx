import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AdminAuthContext = createContext();

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth deve ser usado dentro de um AdminAuthProvider');
  }
  return context;
}

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState({});

  const navigate = useNavigate();
  const { toast } = useToast();

  const setSpecificLoading = (operation, isLoading) => {
    setOperationLoading(prev => ({ ...prev, [operation]: isLoading }));
  };

  const checkAdminUser = useCallback(async () => {
    setLoading(true);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error getting session:", sessionError);
        setAdminUser(null);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .eq('role', 'admin') 
          .maybeSingle();

        if (profileError) { 
          console.error("Error fetching admin profile:", profileError);
          toast({ 
            title: "Erro de Perfil Admin", 
            description: profileError.message, 
            variant: "destructive" 
          });
          setAdminUser(null);
        } else if (profile) {
          setAdminUser(profile);
        } else {
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
    } catch (e) {
      console.error("Unexpected error in checkAdminUser:", e);
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    checkAdminUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Admin auth state change:', event, session?.user?.id);
      
      try {
        if (event === 'SIGNED_OUT') {
          setAdminUser(null);
          if (window.location.pathname.startsWith('/admin/')) {
            navigate('/admin/login');
          }
        } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            await checkAdminUser();
          }
        }
      } catch (error) {
        console.error('Erro no admin auth state change:', error);
        setAdminUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [checkAdminUser, navigate]);

  const adminLogin = async (email, password) => {
    setSpecificLoading('adminLogin', true);
    
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (signInError) {
        console.error('Admin login error:', signInError);
        
        if (signInError.message?.includes('Invalid login credentials')) {
          toast({ 
            title: "Credenciais Inválidas", 
            description: "Email ou senha de administrador incorretos.", 
            variant: "destructive" 
          });
        } else if (signInError.message?.includes('Email not confirmed')) {
          toast({ 
            title: "Email não confirmado", 
            description: "Confirme seu email antes de fazer login como administrador.", 
            variant: "destructive" 
          });
        } else {
          toast({ 
            title: "Erro de Login", 
            description: signInError.message, 
            variant: "destructive" 
          });
        }
        
        return null;
      }

      if (signInData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signInData.user.id)
          .eq('role', 'admin')
          .single();

        if (profileError || !profile) {
          console.error('Admin profile error or not found:', profileError);
          toast({ 
            title: "Acesso Negado", 
            description: "Este usuário não é um administrador ou o perfil não foi encontrado.", 
            variant: "destructive" 
          });
          await supabase.auth.signOut({ scope: 'local' });
          setAdminUser(null);
          return null;
        }
        
        setAdminUser(profile);
        toast({ 
          title: "Login Bem-sucedido!", 
          description: `Bem-vindo, ${profile.name || profile.email}!` 
        });
        navigate('/admin/dashboard');
        return profile;
      }
      
      return null;
    } catch (e) {
      console.error("Unexpected error in adminLogin:", e);
      toast({ 
        title: "Erro Crítico de Login", 
        description: "Ocorreu um erro inesperado.", 
        variant: "destructive" 
      });
      return null;
    } finally {
      setSpecificLoading('adminLogin', false);
    }
  };

  const adminLogout = async () => {
    setSpecificLoading('adminLogout', true);
    
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error('Admin logout error:', error);
        
        if (!error.message.toLowerCase().includes('session not found') && 
            !error.message.toLowerCase().includes('session from session_id claim in jwt does not exist') &&
            !error.message.toLowerCase().includes('refresh_token_not_found')) {
          toast({ 
            title: "Erro ao Sair", 
            description: error.message, 
            variant: "destructive" 
          });
        }
      } else {
        toast({ 
          title: "Logout Efetuado", 
          description: "Você saiu do painel de administração." 
        });
      }
      
    } catch (e) {
      console.error("Unexpected error in adminLogout:", e);
      
      toast({ 
        title: "Erro Crítico ao Sair", 
        description: "Ocorreu um erro inesperado, mas você foi desconectado.", 
        variant: "destructive" 
      });
    } finally {
      setAdminUser(null);
      navigate('/admin/login');
      setSpecificLoading('adminLogout', false);
    }
  };

  const fetchAllSystemUsers = useCallback(async () => {
    if (!adminUser) {
      return { success: false, data: [] };
    }
    
    setSpecificLoading('fetchAllSystemUsers', true);
    
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, email, name, business_name, business_slug, role, status, joined_date, balance, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching all system users:", error);
        toast({ 
          title: "Erro ao buscar usuários", 
          description: `Falha na comunicação com o servidor: ${error.message}`, 
          variant: "destructive" 
        });
        return { success: false, data: [] };
      }
      
      return { success: true, data: users || [] };
    } catch (err) {
      console.error("Catch block: Error fetching all system users:", err);
      toast({ 
        title: "Erro Crítico ao Buscar Usuários", 
        description: `Ocorreu um erro inesperado: ${err.message}`, 
        variant: "destructive" 
      });
      return { success: false, data: [] };
    } finally {
      setSpecificLoading('fetchAllSystemUsers', false);
    }
  }, [adminUser, toast]);
  
  const deleteSystemUserAccount = useCallback(async (userIdToDelete) => {
    if (!adminUser || adminUser.role !== 'admin') {
      toast({ 
        title: "Não Autorizado", 
        description: "Apenas administradores podem excluir usuários.", 
        variant: "destructive" 
      });
      return false;
    }
    
    setSpecificLoading('deleteSystemUserAccount', true);
    
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('No active admin session found for user deletion.');
      }
      const token = sessionData.session.access_token;

      const { data, error } = await supabase.functions.invoke('delete-user-admin', {
        body: { userId: userIdToDelete },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (error || data?.error) {
        const errorMessage = error?.message || data?.error;
        console.error('Error deleting user account (admin):', errorMessage);
        toast({ 
          title: "Erro ao Excluir", 
          description: `Falha ao excluir usuário: ${errorMessage}`, 
          variant: "destructive" 
        });
        return false;
      }
      
      toast({ 
        title: "Usuário Excluído", 
        description: "A conta do usuário foi removida com sucesso." 
      });
      return true;
    } catch (err) {
      console.error('Unexpected error deleting user account (admin):', err);
      toast({ 
        title: "Erro Crítico ao Excluir", 
        description: "Ocorreu um erro inesperado.", 
        variant: "destructive" 
      });
      return false;
    } finally {
      setSpecificLoading('deleteSystemUserAccount', false);
    }
  }, [adminUser, toast]);

  const createAdminUser = useCallback(async (name, email, password) => {
    setSpecificLoading('createAdminUser', true);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            name: name,
            business_name: `${name} (Admin)`, 
            role_to_assign: 'admin' 
          }
        }
      });

      if (authError) {
        console.error('Erro ao criar usuário admin (Auth):', authError);
        
        if (authError.message?.includes('User already registered')) {
          toast({ 
            title: "Email já cadastrado", 
            description: "Este email já está em uso. Use outro email.", 
            variant: "destructive" 
          });
        } else if (authError.message?.includes('Password should be at least')) {
          toast({ 
            title: "Senha muito fraca", 
            description: "A senha deve ter pelo menos 6 caracteres.", 
            variant: "destructive" 
          });
        } else {
          toast({ 
            title: "Erro de Autenticação", 
            description: authError.message, 
            variant: "destructive" 
          });
        }
        
        return false;
      }

      if (!authData.user) {
        toast({ 
          title: "Erro Inesperado", 
          description: "Não foi possível criar o usuário no sistema de autenticação.", 
          variant: "destructive" 
        });
        return false;
      }
      
      toast({ 
        title: "Administrador Criado", 
        description: `Usuário ${name} (${email}) foi registrado. Verifique o e-mail para confirmação, se aplicável.` 
      });
      return true;

    } catch (err) {
      console.error('Erro inesperado ao criar administrador:', err);
      toast({ 
        title: "Erro Crítico ao Criar Admin", 
        description: "Ocorreu um erro inesperado.", 
        variant: "destructive" 
      });
      return false;
    } finally {
      setSpecificLoading('createAdminUser', false);
    }
  }, [toast]);

  const updateSystemUser = useCallback(async (userId, updates) => {
    setSpecificLoading(`updateUser-${userId}`, true);
    try {
      const { data, error } = await supabase.functions.invoke('update-user-admin', {
        body: { userId, updates },
      });

      if (error || data?.error) {
        throw new Error(error?.message || data?.error);
      }
      
      toast({ title: "Sucesso", description: "Usuário atualizado com sucesso." });
      return { success: true, data: data.data };
    } catch (err) {
      console.error('Error updating user:', err);
      toast({ title: "Erro ao Atualizar", description: err.message, variant: "destructive" });
      return { success: false };
    } finally {
      setSpecificLoading(`updateUser-${userId}`, false);
    }
  }, [toast]);

  const resetUserPassword = useCallback(async (userId) => {
    setSpecificLoading(`resetPassword-${userId}`, true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-user-password-admin', {
        body: { userId },
      });

      if (error || data?.error) {
        throw new Error(error?.message || data?.error);
      }
      
      toast({ title: "E-mail Enviado", description: "Um e-mail de redefinição de senha foi enviado para o usuário." });
      return { success: true };
    } catch (err) {
      console.error('Error resetting password:', err);
      toast({ title: "Erro ao Resetar Senha", description: err.message, variant: "destructive" });
      return { success: false };
    } finally {
      setSpecificLoading(`resetPassword-${userId}`, false);
    }
  }, [toast]);

  const value = {
    adminUser,
    loading, 
    operationLoading, 
    adminLogin,
    adminLogout,
    fetchAllSystemUsers,
    deleteSystemUserAccount,
    createAdminUser,
    updateSystemUser,
    resetUserPassword,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}