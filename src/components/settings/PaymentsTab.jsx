import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, AlertCircle } from 'lucide-react';

const PaymentsTab = ({ formData, onChange }) => {
  const motionProps = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay }
  });

  return (
    <motion.div {...motionProps()} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Credenciais do Asaas</CardTitle>
          <CardDescription>Conecte sua conta Asaas para gerenciar assinaturas. A chave não fica visível após salva por segurança.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asaas_api_key">Chave de API Asaas</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="asaas_api_key"
                type="password"
                value={formData.asaas_api_key}
                onChange={(e) => onChange('asaas_api_key', e.target.value)}
                placeholder="Sua chave de API do Asaas"
                className="pl-10"
              />
            </div>
             <p className="text-xs text-muted-foreground">Sua chave de API do Asaas, que começa com "$aact_".</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="flex flex-row items-center gap-3">
          <AlertCircle className="h-6 w-6 text-blue-600" />
          <div>
            <CardTitle className="text-blue-900">Onde encontrar sua Chave de API Asaas?</CardTitle>
            <CardDescription className="text-blue-700">
              Acesse o painel do Asaas para obter sua chave de API.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Acesse sua conta do <a href="https://www.asaas.com/" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Asaas</a>.</li>
            <li>No menu, vá para <strong>Minha Conta &gt; Integrações &gt; Gerar API Key</strong>.</li>
            <li>Copie a <strong>Chave de API</strong>.</li>
            <li>Cole a chave no campo acima e salve as alterações.</li>
          </ol>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PaymentsTab;