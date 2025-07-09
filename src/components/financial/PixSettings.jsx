import React from 'react';
import { motion } from 'framer-motion';
import { Key, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function PixSettings({ pixKey, setPixKey, handleSavePixKey, isSavingPix }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Recebimento</CardTitle>
          <CardDescription>Informe sua chave Pix para receber os repasses das suas vendas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pix_key">Sua Chave Pix</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="pix_key"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSavePixKey} disabled={isSavingPix}>
                {isSavingPix ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">Salvar Chave</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Esta chave será usada para transferir o saldo das suas vendas para sua conta.</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default PixSettings;