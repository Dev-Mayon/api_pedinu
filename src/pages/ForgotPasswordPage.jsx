import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { PedinuLogoAnimated } from '@/components/ui/PedinuLogo';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { sendPasswordResetEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await sendPasswordResetEmail(email);
    if (success) {
      setSubmitted(true);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
             <KeyRound className="h-12 w-12 text-orange-500" />
          </div>
          <CardTitle>Esqueceu sua senha?</CardTitle>
          <CardDescription className="text-gray-600">
            {submitted 
              ? "Se uma conta com este e-mail existir, um link para redefinir sua senha foi enviado."
              : "Sem problemas. Digite seu e-mail e enviaremos um link para você criar uma nova senha."
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium py-2.5"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Enviando..." : "Enviar Link de Recuperação"}
              </Button>
            </form>
          ) : (
             <div className="text-center">
                 <p className="text-gray-600">Verifique sua caixa de spam se não encontrar o e-mail.</p>
             </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar para o Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPasswordPage;