import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Key, Settings, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const AdminSettingsPage = () => {
  const { adminUser } = useAdminAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [credentials, setCredentials] = useState({
    publicKey: '',
    accessToken: ''
  });

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('key, value')
          .in('key', ['MERCADOPAGO_PUBLIC_KEY', 'MERCADOPAGO_ACCESS_TOKEN']);

        if (error) throw error;

        const fetchedPublicKey = data.find(item => item.key === 'MERCADOPAGO_PUBLIC_KEY')?.value || '';
        const fetchedAccessToken = data.find(item => item.key === 'MERCADOPAGO_ACCESS_TOKEN')?.value || '';

        if (fetchedPublicKey || fetchedAccessToken) {
           setCredentials({
             // Show placeholders if keys exist, but don't expose the actual keys
             publicKey: fetchedPublicKey ? '••••••••••••••••••••••••' : '',
             accessToken: fetchedAccessToken ? '••••••••••••••••••••••••' : ''
           });
        }

      } catch (error) {
        console.error('Error fetching MP credentials:', error);
        toast({
          title: "Erro ao carregar credenciais",
          description: "Não foi possível buscar as configurações do Mercado Pago.",
          variant: "destructive"
        });
      }
    };

    fetchCredentials();
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({...prev, [name]: value}));
  };

  const handleSave = async () => {
    if ((credentials.publicKey && credentials.publicKey.startsWith('••••')) || (credentials.accessToken && credentials.accessToken.startsWith('••••'))) {
        toast({
            title: "Credenciais não alteradas",
            description: "Para atualizar, insira as novas credenciais nos campos.",
        });
        return;
    }
      
    if (!credentials.publicKey || !credentials.accessToken) {
        toast({
            title: "Campos obrigatórios",
            description: "Por favor, preencha a Public Key e o Access Token.",
            variant: "destructive",
        });
        return;
    }

    setIsSaving(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('No active session found.');
      }
      const token = sessionData.session.access_token;

      const { data, error } = await supabase.functions.invoke('set-mp-secrets', {
        body: JSON.stringify({
          publicKey: credentials.publicKey,
          accessToken: credentials.accessToken,
        }),
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (error) {
          throw new Error(error.message);
      }
      
      if (data.error) {
          throw new Error(data.error);
      }

      toast({
        title: "Sucesso!",
        description: "Credenciais do Mercado Pago salvas com segurança.",
      });

      setCredentials({
        publicKey: '••••••••••••••••••••••••',
        accessToken: '••••••••••••••••••••••••'
      });

    } catch (error) {
      console.error('Failed to save credentials:', error);
      toast({
        title: "Erro ao salvar",
        description: `Não foi possível salvar as credenciais: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const motionProps = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay }
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div {...motionProps()} className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Configurações do Admin</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Gerencie as configurações globais da plataforma.</p>
        </div>
        <Button 
          onClick={handleSave} 
          className="bg-red-600 hover:bg-red-700 text-white mt-4 sm:mt-0"
          disabled={isSaving}
        >
          {isSaving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" />Salvar Alterações</>
          )}
        </Button>
      </motion.div>

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general"><Settings className="h-4 w-4 mr-2"/>Geral</TabsTrigger>
            <TabsTrigger value="payments"><CreditCard className="h-4 w-4 mr-2"/>Pagamentos</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
             <motion.div {...motionProps(0.2)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Configurações Gerais</CardTitle>
                        <CardDescription>Configurações gerais da plataforma (em breve).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Novas opções de configuração aparecerão aqui em breve.</p>
                    </CardContent>
                </Card>
            </motion.div>
        </TabsContent>
        <TabsContent value="payments">
            <motion.div {...motionProps(0.2)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Credenciais do Mercado Pago</CardTitle>
                        <CardDescription>
                            Estas são as credenciais principais da plataforma, usadas para todos os lojistas.
                            As chaves não são exibidas por segurança. Para atualizar, insira uma nova chave.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="publicKey">Public Key</Label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    id="publicKey"
                                    name="publicKey"
                                    type="password"
                                    value={credentials.publicKey}
                                    onChange={handleChange}
                                    placeholder="Insira a nova Public Key"
                                    className="pl-10"
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accessToken">Access Token</Label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    id="accessToken"
                                    name="accessToken"
                                    type="password"
                                    value={credentials.accessToken}
                                    onChange={handleChange}
                                    placeholder="Insira o novo Access Token"
                                    className="pl-10"
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </TabsContent>
       </Tabs>
    </div>
  );
};

export default AdminSettingsPage;