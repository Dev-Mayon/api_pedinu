import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Smartphone, TrendingUp, Users, Zap, Star, Shield, Menu, X, Clock, Mail, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PedinuLogo from '@/components/ui/PedinuLogo';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const features = [
    { icon: Smartphone, title: "Cardápio Digital Moderno", description: "Interface intuitiva e responsiva para seus clientes" },
    { icon: TrendingUp, title: "Aumente suas Vendas", description: "Plataforma otimizada para conversão e vendas" },
    { icon: Users, title: "Gestão de Clientes", description: "Controle completo da sua base de clientes" },
    { icon: Zap, title: "Configuração Rápida", description: "Comece a vender em poucos minutos" }
  ];
  
  const plans = [
    {
      name: "Mensal",
      price: "60",
      priceId: "price_mensal_id",
      description: "Ideal para começar e testar o mercado.",
      features: [
        "Cardápio digital profissional",
        "Pedidos via WhatsApp",
        "Gestão de produtos e categorias",
        "Dashboard de métricas",
        "Suporte técnico"
      ]
    },
    {
      name: "Semestral",
      price: "280",
      originalPrice: "360",
      priceId: "price_semestral_id",
      description: "Economize com um compromisso de médio prazo.",
      features: [
        "Todos os benefícios do plano Mensal",
        "Desconto especial",
        "Prioridade no suporte"
      ],
      isPopular: true
    },
    {
      name: "Anual",
      price: "600",
      originalPrice: "720",
      priceId: "price_anual_id",
      description: "O melhor custo-benefício para o seu negócio.",
      features: [
        "Todos os benefícios do plano Semestral",
        "Maior desconto",
        "Acesso a novas funcionalidades em primeira mão"
      ]
    }
  ];

  const handleGetStarted = () => { window.location.href = '/register'; };
  const handleLogin = () => { window.location.href = '/login'; };

  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "🚧 Funcionalidade em desenvolvimento",
      description: "O formulário de contato será implementado em breve!",
    });
  };

  const mobileMenuVariants = {
    open: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { opacity: 0, y: "-100%", transition: { duration: 0.2 } },
  };

  const navLinks = [
    { name: "Funcionalidades", id: "features" },
    { name: "Nossos Preços", id: "pricing" },
    { name: "Contato", id: "contact" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <PedinuLogo size="md" />
            
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map(link => (
                <button key={link.id} onClick={() => handleScrollTo(link.id)} className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
                  {link.name}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={handleLogin} className="text-gray-600 hover:text-orange-600">
                Entrar
              </Button>
              <Button onClick={handleGetStarted} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                Teste 14 dias grátis
              </Button>
            </div>
            
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg border-t border-orange-100"
            >
              <div className="px-4 pt-2 pb-4 space-y-2">
                {navLinks.map(link => (
                  <Button key={link.id} variant="ghost" onClick={() => handleScrollTo(link.id)} className="w-full justify-start text-lg">
                    {link.name}
                  </Button>
                ))}
                <hr className="my-2"/>
                <Button variant="ghost" onClick={handleLogin} className="w-full justify-start text-lg">
                  Entrar
                </Button>
                <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-lg">
                  Teste 14 dias grátis
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 md:space-y-8 text-center lg:text-left"
            >
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Transforme seu
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"> negócio </span>
                  com cardápios digitais
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Crie seu cardápio digital profissional e comece a receber pedidos pelo WhatsApp. Simples, rápido e sem complicações.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-lg px-8 py-6"
                >
                  Teste 14 dias Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>Avaliação 4.9/5</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>100% Seguro</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <motion.div 
                className="relative z-10"
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <img 
                  src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b17929dc-42b1-4351-82e3-5a502047181e/22c61d115bc9775c570b80897a92c83c.png"
                  alt="Cardápio digital do Pedinu em smartphone"
                  className="w-full max-w-sm sm:max-w-md mx-auto drop-shadow-2xl cursor-pointer"
                />
              </motion.div>
              <div className="absolute inset-8 md:inset-4 lg:inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 blur-3xl transform rotate-6"></div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Tudo que você precisa para
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"> vender online</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma completa para restaurantes, pizzarias e lanchonetes criarem seus cardápios digitais
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-orange-100 hover:border-orange-200 transition-colors">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mx-auto">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16 md:py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Planos para todos os tamanhos de negócio
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Comece com 14 dias grátis e escolha o plano que melhor se adapta a você. Cancele quando quiser.
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={cn("h-full flex flex-col rounded-2xl border-2", plan.isPopular ? "border-orange-500" : "border-gray-200")}>
                  {plan.isPopular && (
                    <div className="bg-orange-500 text-white text-sm font-semibold text-center py-1.5 rounded-t-xl">
                      MAIS POPULAR
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <p className="text-gray-500">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between p-6 pt-0">
                    <div className="space-y-6">
                      <div className="text-center">
                        {plan.originalPrice && <p className="text-gray-500 line-through">De R${plan.originalPrice}</p>}
                        <p className="text-4xl font-extrabold text-gray-900">R${plan.price}<span className="text-lg font-medium text-gray-500">/{plan.name === 'Mensal' ? 'mês' : plan.name === 'Semestral' ? 'semestre' : 'ano'}</span></p>
                      </div>
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      onClick={handleGetStarted}
                      size="lg"
                      className={cn("w-full mt-8", plan.isPopular ? "bg-gradient-to-r from-orange-500 to-red-600" : "bg-gray-800 hover:bg-gray-900" )}
                    >
                      Escolher Plano
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Fale Conosco
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Tem alguma dúvida? Nossa equipe está pronta para ajudar.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Email</h3>
                  <p className="text-gray-600">Nosso time de suporte responderá em até 24 horas.</p>
                  <a href="mailto:contato@pedinu.com.br" className="text-orange-600 hover:underline font-medium">contato@pedinu.com.br</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Telefone</h3>
                  <p className="text-gray-600">De segunda a sexta, das 9h às 18h.</p>
                  <a href="tel:+5511999998888" className="text-orange-600 hover:underline font-medium">(11) 99999-8888</a>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 sm:p-8 border-orange-100 shadow-lg">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Nome</Label>
                      <Input id="contact-name" placeholder="Seu nome" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email</Label>
                      <Input id="contact-email" type="email" placeholder="seu@email.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Mensagem</Label>
                    <Textarea id="contact-message" placeholder="Como podemos ajudar?" rows={5} required />
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-orange-500 to-red-600">
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Mensagem
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Pronto para começar?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Junte-se a centenas de restaurantes que já estão vendendo mais com o Pedinu
            </p>
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-lg px-8 py-6"
            >
              Comece seus 14 dias Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <PedinuLogo size="sm" />
            <div className="flex items-center space-x-6 text-sm text-gray-600 text-center md:text-left">
              <span>© 2025 Pedinu. Todos os direitos reservados.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;