import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, Eye, EyeOff, ShieldAlert, User as UserIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, Link } from 'react-router-dom';

const AdminCreateAdminPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createAdminUser } = useAdminAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        title: "Senha Muito Curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const success = await createAdminUser(name, email, password);
      if (success) {
        toast({
          title: "Administrador Criado!",
          description: `O administrador ${name} (${email}) foi criado com sucesso.`,
        });
        navigate('/admin/users'); 
      } else {
        // Toasts de erro específicos já são mostrados pelo createAdminUser no contexto
      }
    } catch (error) {
      console.error("Erro inesperado ao criar administrador:", error);
      toast({
        title: "Erro Inesperado",
        description: "Ocorreu um erro ao tentar criar o administrador.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <UserPlus className="h-8 w-8 admin-text" />
          <h1 className="text-3xl font-bold admin-text">Criar Novo Administrador</h1>
        </div>
        <Button variant="outline" asChild className="admin-button-outline">
          <Link to="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Usuários
          </Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="admin-card shadow-lg max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="admin-text text-2xl">Detalhes do Novo Administrador</CardTitle>
            <CardDescription>
              Preencha os campos abaixo para registrar um novo usuário com privilégios de administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="admin-name" className="admin-text">Nome Completo</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="admin-name"
                    type="text"
                    placeholder="Nome do Administrador"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 admin-input"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email" className="admin-text">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 admin-input"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password" className="admin-text">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Senha (mínimo 6 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 admin-input"
                    required
                    minLength={6}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">A senha deve ter no mínimo 6 caracteres.</p>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 dark:bg-yellow-500/20 border border-yellow-500/30 rounded-md">
                <ShieldAlert className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Atenção!</h4>
                  <p className="text-sm text-yellow-600 dark:text-yellow-500">
                    Este usuário terá acesso total ao painel de administração. Certifique-se de que as informações estão corretas e que esta pessoa é de confiança.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full admin-button-primary font-semibold py-3 text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Criando Administrador..." : "Criar Administrador"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminCreateAdminPage;