import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { cn, formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/customSupabaseClient';
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Mensal",
    price: 60,
    priceId: "plan_mensal",
    description: "Ideal para começar com flexibilidade.",
    features: ["Todos os recursos da plataforma", "Pagamento com Pix, Boleto e Cartão", "Suporte padrão por email"],
    billingCycle: "/mês",
  },
  {
    name: "Semestral",
    price: 280,
    priceId: "plan_semestral",
    description: "Economize com um plano de médio prazo.",
    features: ["Todos os recursos da plataforma", "Pagamento com Pix, Boleto e Cartão", "Economia de 22%", "Suporte prioritário"],
    billingCycle: "/semestre",
    isPopular: true,
  },
  {
    name: "Anual",
    price: 600,
    priceId: "plan_anual",
    description: "O melhor custo-benefício para seu negócio.",
    features: ["Todos os recursos da plataforma", "Pagamento com Pix, Boleto e Cartão", "Economia de 2 meses", "Suporte VIP", "Acesso antecipado a recursos"],
    billingCycle: "/ano",
  },
];

const SubscriptionPage = () => {
  const { user } = useAuth();
  const { businessSettings } = useData();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (plan) => {
    if (!businessSettings?.asaas_api_key) {
        toast({
            title: "Configuração de Pagamento Incompleta",
            description: "A chave de API do Asaas não foi configurada. Por favor, adicione-a nas configurações de pagamento.",
            variant: "destructive"
        });
        return;
    }
    
    setLoading(true);
    setSelectedPlan(plan.priceId);

    try {
        const { data, error } = await supabase.functions.invoke('create-asaas-subscription', {
            body: { 
                planId: plan.priceId,
                planDetails: plan,
                customerInfo: {
                    name: user.name,
                    email: user.email,
                    cpfCnpj: user.cpf_cnpj, // Supondo que você tenha essa informação
                },
                userId: user.id
            }
        });

        if (error) throw error;
        
        // Redireciona o usuário para a URL de pagamento do Asaas
        if (data.paymentUrl) {
            window.location.href = data.paymentUrl;
        } else {
            throw new Error("URL de pagamento não recebida do Asaas.");
        }

    } catch (error) {
        console.error("Erro ao criar assinatura Asaas:", error);
        toast({
            title: "Erro ao iniciar pagamento",
            description: "Não foi possível criar a assinatura. Tente novamente.",
            variant: "destructive"
        });
    } finally {
        setLoading(false);
        setSelectedPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "O portal do cliente Asaas será integrado em breve.",
    });
  };

  const renderSubscriptionStatus = () => {
    if (!user) return null;

    const trialEnds = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
    const isTrialing = user.subscription_status === 'trialing' && trialEnds && trialEnds > new Date();
    const daysLeft = isTrialing ? Math.ceil((trialEnds.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

    if (user.subscription_status === 'active') {
      const currentPlan = plans.find(p => p.priceId === user.plan_id);
      return (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900"><Crown/>Plano Ativo</CardTitle>
            <CardDescription className="text-green-800">
              Você está no plano <strong>{currentPlan?.name || user.plan_id}</strong>. Sua assinatura é válida até {new Date(user.subscription_ends_at).toLocaleDateString()}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleManageSubscription} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              Gerenciar Assinatura
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (isTrialing) {
      return (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Período de Teste</CardTitle>
            <CardDescription className="text-blue-800">
              Você está em seu período de teste gratuito. Restam <strong>{daysLeft} dias</strong>. Escolha um plano para não perder o acesso.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }

    return (
        <Card className="bg-red-50/60 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-red-100 rounded-full dark:bg-red-900/30">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-red-800 dark:text-red-200">
                        Sua assinatura expirou
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                        Para continuar usando a plataforma, por favor, escolha um dos planos abaixo.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
  };
  
  return (
    <div className="space-y-8 p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Planos e Assinatura</h1>
        <p className="text-muted-foreground">Escolha o plano ideal para o seu negócio e pague com Pix, Boleto ou Cartão.</p>
      </motion.div>

      {renderSubscriptionStatus()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className={cn(
              "h-full flex flex-col rounded-xl border-2 hover:border-orange-400 transition-all",
              plan.isPopular ? "border-orange-500 shadow-lg" : "border-gray-200",
              user.plan_id === plan.priceId ? "border-green-500 bg-green-50/30" : ""
            )}>
              {plan.isPopular && (
                <div className="bg-orange-500 text-white text-xs font-bold text-center py-1 rounded-t-lg">
                  MAIS POPULAR
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-800">{plan.name}</CardTitle>
                 <p className="text-sm text-gray-500 h-10">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow justify-between p-6 pt-0">
                <div className="space-y-6">
                    <div className="text-center">
                        <p className="text-4xl font-extrabold text-gray-900">
                           {formatPrice(plan.price)}
                            <span className="text-lg font-medium text-gray-500">{plan.billingCycle}</span>
                        </p>
                    </div>
                    <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center">
                                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                                <span className="text-gray-600 text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <Button 
                    onClick={() => handleSelectPlan(plan)} 
                    disabled={loading || user.subscription_status === 'active'}
                    className={cn(
                        "w-full mt-8",
                        plan.isPopular ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-800 hover:bg-gray-900",
                         user.plan_id === plan.priceId ? "bg-green-600 hover:bg-green-700" : ""
                    )}>
                    {loading && selectedPlan === plan.priceId && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    {user.plan_id === plan.priceId ? 'Plano Atual' : 'Assinar Agora'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;