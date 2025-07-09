import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Loader2, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PrintingSection = ({ settings, onChange, onSave, isSaving }) => {
  const { toast } = useToast();

  const handleTestPrint = () => {
    toast({
      title: "Recurso em desenvolvimento 🚧",
      description: "A funcionalidade de impressão de teste estará disponível em breve!",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impressão de Pedidos</CardTitle>
        <CardDescription>Configure a impressora térmica para imprimir cupons de pedidos automaticamente.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="auto_print" className="text-base font-medium">
              Imprimir pedidos automaticamente
            </Label>
            <p className="text-sm text-muted-foreground">
              Quando ativado, novos pedidos aprovados serão impressos.
            </p>
          </div>
          <Switch
            id="auto_print"
            checked={settings.auto_print}
            onCheckedChange={(checked) => onChange('auto_print', checked)}
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="printer_name">Nome da Impressora</Label>
          <Input 
            id="printer_name"
            placeholder="Ex: Impressora da Cozinha"
            value={settings.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">Dê um nome para identificar sua impressora.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="printer_type">Tipo de Conexão</Label>
          <Select disabled>
            <SelectTrigger id="printer_type">
              <SelectValue placeholder="Selecione o tipo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="network">Rede (IP)</SelectItem>
              <SelectItem value="usb">USB</SelectItem>
            </SelectContent>
          </Select>
           <p className="text-xs text-muted-foreground">A seleção do tipo de conexão será habilitada em breve.</p>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                A integração com impressoras requer um pequeno aplicativo auxiliar instalado em seu computador. Mais informações serão disponibilizadas em breve.
              </p>
            </div>
          </div>
        </div>

      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <Button variant="outline" onClick={handleTestPrint}>
          <Printer className="mr-2 h-4 w-4" />
          Testar Impressão
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PrintingSection;