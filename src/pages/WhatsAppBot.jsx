import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Power, PowerOff, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';

function WhatsAppBot() {
  const { toast } = useToast();
  const { businessSettings, updateBusinessSettings } = useData();

  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [tempWhatsAppNumber, setTempWhatsAppNumber] = useState('');

  useEffect(() => {
    if (businessSettings) {
      const connectedNumber = businessSettings.whatsappBotNumber;
      if (connectedNumber) {
        setWhatsAppNumber(connectedNumber);
        setTempWhatsAppNumber(connectedNumber);
        setIsWhatsAppConnected(true);
      } else {
        setIsWhatsAppConnected(false);
        setWhatsAppNumber('');
        setTempWhatsAppNumber('');
      }
    }
  }, [businessSettings]);

  const handleConnectWhatsApp = () => {
    if (!tempWhatsAppNumber.trim()) {
      toast({
        title: "Número Necessário",
        description: "Por favor, insira seu número do WhatsApp Business.",
        variant: "destructive",
      });
      return;
    }
    setWhatsAppNumber(tempWhatsAppNumber);
    updateBusinessSettings({ whatsappBotNumber: tempWhatsAppNumber });
    setIsWhatsAppConnected(true);
    toast({
      title: "WhatsApp Conectado!",
      description: `Seu número ${tempWhatsAppNumber} foi vinculado com sucesso.`,
    });
  };

  const handleDisconnectWhatsApp = () => {
    updateBusinessSettings({ whatsappBotNumber: '' });
    setWhatsAppNumber('');
    setTempWhatsAppNumber('');
    setIsWhatsAppConnected(false);
    toast({
      title: "WhatsApp Desconectado",
      description: "Seu número do WhatsApp foi desvinculado.",
    });
  };

  return (
    <div className="space-y-8 p-4 md:p-6 user-dashboard-bg">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b user-dashboard-border"
      >
        <div className="flex items-center space-x-3">
          <Zap className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold user-dashboard-text">Automatize seu Atendimento</h1>
            <p className="text-sm text-gray-500 user-dashboard-muted-text">Conecte seu WhatsApp Business e deixe nosso robô trabalhar por você!</p>
          </div>
        </div>
      </motion.div>

      <Card className="shadow-xl border-green-300 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 user-dashboard-card">
        <CardHeader className="items-center text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
            <img-replace alt="WhatsApp Bot illustration" className="w-40 h-40 mx-auto mb-4" />
          </motion.div>
          <CardTitle className="text-2xl font-bold text-green-700 user-dashboard-text">
            {isWhatsAppConnected ? `Conectado com: ${whatsAppNumber}` : "Conecte seu WhatsApp Business"}
          </CardTitle>
          <CardDescription className="text-gray-600 user-dashboard-muted-text px-4">
            {isWhatsAppConnected 
              ? "Seu WhatsApp está vinculado! As configurações de automação são gerenciadas no Painel de Administração."
              : "Vincule seu número do WhatsApp para começar a automatizar mensagens, receber pedidos e muito mais."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 pt-6 pb-8">
          {!isWhatsAppConnected && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white text-lg py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Power className="h-5 w-5 mr-2" /> Conectar WhatsApp
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] user-dashboard-card">
                <DialogHeader>
                  <DialogTitle className="user-dashboard-text">Conectar seu WhatsApp Business</DialogTitle>
                  <DialogDescription className="user-dashboard-muted-text">
                    Insira o número do WhatsApp que você usa para seu negócio. Este número será usado para automações.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="wa-number" className="text-right user-dashboard-text">
                      Número
                    </Label>
                    <Input
                      id="wa-number"
                      value={tempWhatsAppNumber}
                      onChange={(e) => setTempWhatsAppNumber(e.target.value)}
                      placeholder="(XX) XXXXX-XXXX"
                      className="col-span-3 user-dashboard-input"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="user-dashboard-button">Cancelar</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button type="button" onClick={handleConnectWhatsApp} className="bg-green-500 hover:bg-green-600">Salvar Número</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {isWhatsAppConnected && (
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 user-dashboard-button">
                    <Edit3 className="h-4 w-4 mr-2" /> Alterar Número
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] user-dashboard-card">
                  <DialogHeader>
                    <DialogTitle className="user-dashboard-text">Alterar Número do WhatsApp</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Label htmlFor="wa-number-edit" className="user-dashboard-text">Novo número</Label>
                    <Input
                      id="wa-number-edit"
                      value={tempWhatsAppNumber}
                      onChange={(e) => setTempWhatsAppNumber(e.target.value)}
                      className="user-dashboard-input"
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline" className="user-dashboard-button">Cancelar</Button></DialogClose>
                    <DialogClose asChild><Button onClick={handleConnectWhatsApp} className="bg-green-500 hover:bg-green-600">Salvar Alterações</Button></DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="destructive" onClick={handleDisconnectWhatsApp}>
                <PowerOff className="h-4 w-4 mr-2" /> Desconectar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default WhatsAppBot;