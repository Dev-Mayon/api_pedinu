import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Store, Loader2, ArrowLeft, Shield, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { PedinuLogoAnimated } from '@/components/ui/PedinuLogo';
import InputMask from 'react-input-mask';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    documentNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentChange = (e) => {
    const { name, value } = e.target;
    const onlyNumbers = value.replace(/[^\d]/g, '');
    setFormData(prev => ({
      ...prev,
      [name]: onlyNumbers
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await register(formData);
      if (result.success) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Você será redirecionado para o painel.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado durante o cadastro.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentMask = formData.documentNumber.length > 11 ? "99.999.999/9999-99" : "999.999.999-999";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 p-4 relative">
       <Link to="/" className="absolute top-6 left-6 text-gray-500 hover:text-orange-600 transition-colors z-10" aria-label="Voltar para o site">
        <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-white/50 backdrop-blur-sm border-orange-200 hover:bg-orange-50">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>
      
       <Button variant="ghost" size="sm" className="absolute bottom-6 left-6 text-gray-400 hover:text-gray-600 transition-colors z-10" onClick={() => navigate('/admin/login')}>
        <Shield className="h-4 w-4 mr-2" />
        Painel Admin
      </Button>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <PedinuLogoAnimated size="lg" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-700 bg-clip-text text-transparent">
            Crie sua conta
          </CardTitle>
          <CardDescription className="text-gray-600 flex items-center justify-center gap-2">
            <Clock className="h-4 w-4 text-green-600"/>
            Comece com 14 dias de teste grátis!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="reg-name"
                  name="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-businessName">Nome do Negócio</Label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="reg-businessName"
                  name="businessName"
                  type="text"
                  placeholder="Ex: Pizzaria do João"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-documentNumber">CPF ou CNPJ</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <InputMask
                  mask={documentMask}
                  value={formData.documentNumber}
                  onChange={handleDocumentChange}
                  disabled={isSubmitting}
                >
                  {(inputProps) => (
                    <Input
                      {...inputProps}
                      id="reg-documentNumber"
                      name="documentNumber"
                      type="text"
                      placeholder="Seu CPF ou CNPJ"
                      className="pl-10"
                      required
                    />
                  )}
                </InputMask>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  minLength={6}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium py-2.5"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Criando conta..." : "Começar teste grátis"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium text-orange-600 hover:text-orange-700">
                Entrar
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterPage;