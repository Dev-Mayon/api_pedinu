import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Added Link import
import { motion } from 'framer-motion';
import { MessageSquare, Settings2, Save, Trash2, PlusCircle, AlertTriangle, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';

const AdminWhatsAppSettingsPage = () => {
  const { toast } = useToast();
  const { businessSettings, updateBusinessSettings } = useData();

  const [zapiInstanceId, setZapiInstanceId] = useState('');
  const [zapiToken, setZapiToken] = useState('');
  const [zapiWebhookUrl, setZapiWebhookUrl] = useState('');
  const [quickReplies, setQuickReplies] = useState([{ id: Date.now(), keyword: '', response: '', action: 'reply' }]);
  const [whatsAppNumber, setWhatsAppNumber] = useState('');


  useEffect(() => {
    if (businessSettings) {
      setZapiInstanceId(businessSettings.zapiInstanceId || '');
      setZapiToken(businessSettings.zapiToken || '');
      setZapiWebhookUrl(businessSettings.zapiWebhookUrl || '');
      setQuickReplies(businessSettings.whatsappQuickReplies?.length > 0 ? businessSettings.whatsappQuickReplies : [{ id: Date.now(), keyword: '', response: '', action: 'reply' }]);
      setWhatsAppNumber(businessSettings.whatsappBotNumber || '');
    }
  }, [businessSettings]);

  const handleSaveSettings = () => {
    updateBusinessSettings({
      zapiInstanceId,
      zapiToken,
      zapiWebhookUrl,
      whatsappQuickReplies: quickReplies.filter(qr => qr.keyword.trim() !== '' || qr.response.trim() !== ''),
    });
    toast({
      title: "Configurações Salvas!",
      description: "As configurações do Bot do WhatsApp foram atualizadas.",
      className: "bg-green-500 text-white",
    });
  };
  
  const handleAddQuickReply = () => {
    setQuickReplies([...quickReplies, { id: Date.now(), keyword: '', response: '', action: 'reply' }]);
  };

  const handleQuickReplyChange = (id, field, value) => {
    setQuickReplies(quickReplies.map(qr => qr.id === id ? { ...qr, [field]: value } : qr));
  };

  const handleRemoveQuickReply = (id) => {
    setQuickReplies(quickReplies.filter(qr => qr.id !== id));
  };

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex items-center space-x-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Bot className="h-8 w-8 admin-text" />
        <div>
          <h1 className="text-3xl font-bold admin-text">Configurações do Bot WhatsApp</h1>
          <p className="text-muted-foreground">
            Gerencie a integração com API (Z-API) e defina respostas automáticas.
            {whatsAppNumber && <span className="block text-sm">Número conectado: <strong className="admin-text">{whatsAppNumber}</strong></span>}
            {!whatsAppNumber && <span className="block text-sm text-orange-500">Nenhum número de WhatsApp conectado. Conecte na <Link to="/whatsapp" className="underline admin-link">página do Bot</Link>.</span>}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="admin-card shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center admin-text"><MessageSquare className="mr-2 h-5 w-5 text-green-500" /> Configuração da API (Z-API)</CardTitle>
            <CardDescription>
              Insira suas credenciais da Z-API para habilitar o envio e recebimento de mensagens.
              Requer um backend para processar webhooks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="zapiInstanceId" className="font-medium admin-text">Z-API Instance ID</Label>
              <Input id="zapiInstanceId" value={zapiInstanceId} onChange={(e) => setZapiInstanceId(e.target.value)} placeholder="Sua Instance ID da Z-API" className="mt-1 admin-input" />
            </div>
            <div>
              <Label htmlFor="zapiToken" className="font-medium admin-text">Z-API Token</Label>
              <Input id="zapiToken" type="password" value={zapiToken} onChange={(e) => setZapiToken(e.target.value)} placeholder="Seu Token da Z-API" className="mt-1 admin-input" />
            </div>
            <div>
              <Label htmlFor="zapiWebhookUrl" className="font-medium admin-text">URL do Webhook (Seu Backend)</Label>
              <Input id="zapiWebhookUrl" value={zapiWebhookUrl} onChange={(e) => setZapiWebhookUrl(e.target.value)} placeholder="Ex: https://seu-servidor.com/webhook/zapi" className="mt-1 admin-input" />
              <p className="text-xs text-muted-foreground mt-1">Seu backend deve estar preparado para receber notificações da Z-API nesta URL.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="admin-card shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center admin-text"><Settings2 className="mr-2 h-5 w-5" /> Planejador de Respostas Automáticas</CardTitle>
            <CardDescription>
              Defina palavras-chave e as respostas ou ações correspondentes. A lógica de execução ocorre no seu backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickReplies.map((qr, index) => (
              <motion.div 
                key={qr.id} 
                className="p-4 border rounded-lg admin-input space-y-3 bg-background/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold admin-text">Resposta Automática #{index + 1}</p>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveQuickReply(qr.id)} className="text-red-500 hover:text-red-700 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <Label htmlFor={`qr-keyword-${qr.id}`} className="text-xs font-medium admin-text">Palavra-chave Gatilho</Label>
                  <Input 
                    id={`qr-keyword-${qr.id}`} 
                    value={qr.keyword} 
                    onChange={(e) => handleQuickReplyChange(qr.id, 'keyword', e.target.value)} 
                    placeholder="Ex: cardapio, horario, promocao" 
                    className="mt-1 admin-input" 
                  />
                </div>
                <div>
                  <Label htmlFor={`qr-action-${qr.id}`} className="text-xs font-medium admin-text">Ação do Bot (Lógica no Backend)</Label>
                  <select 
                    id={`qr-action-${qr.id}`}
                    value={qr.action} 
                    onChange={(e) => handleQuickReplyChange(qr.id, 'action', e.target.value)} 
                    className="mt-1 block w-full text-sm rounded-md admin-input focus:border-red-500 focus:ring-red-500"
                  >
                    <option value="reply">Enviar Resposta de Texto</option>
                    <option value="show_menu">Mostrar Cardápio</option>
                    <option value="check_status">Verificar Status do Pedido</option>
                    <option value="forward_to_human">Encaminhar para Atendente</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor={`qr-response-${qr.id}`} className="text-xs font-medium admin-text">Texto da Resposta (se aplicável)</Label>
                  <Textarea 
                    id={`qr-response-${qr.id}`}
                    value={qr.response} 
                    onChange={(e) => handleQuickReplyChange(qr.id, 'response', e.target.value)} 
                    placeholder="Digite a mensagem de resposta aqui..." 
                    rows={3} 
                    className="mt-1 admin-input" 
                  />
                </div>
              </motion.div>
            ))}
            <Button variant="outline" onClick={handleAddQuickReply} className="w-full admin-button-outline hover:bg-red-500/10 hover:text-red-600">
              <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Nova Resposta Automática
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="flex justify-end pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button size="lg" onClick={handleSaveSettings} className="admin-button-primary">
          <Save className="h-5 w-5 mr-2" /> Salvar Todas as Configurações do Bot
        </Button>
      </motion.div>

      <Card className="mt-8 admin-card border-l-4 border-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-600"><AlertTriangle className="mr-2 h-5 w-5" /> Importante: Lógica de Backend</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>As configurações de API e o planejador de respostas definidos aqui servem como um <strong className="admin-text">guia de configuração</strong> para o seu sistema de backend.</p>
          <p>A <strong className="admin-text">execução real</strong> das respostas automáticas, o processamento de palavras-chave e a interação com a Z-API (ou qualquer outra API de WhatsApp) devem ser implementados no seu servidor (backend).</p>
          <p>Este painel ajuda a organizar e armazenar essas configurações, mas não executa a lógica do bot diretamente no frontend.</p>
        </CardContent>
      </Card>

    </div>
  );
};

export default AdminWhatsAppSettingsPage;