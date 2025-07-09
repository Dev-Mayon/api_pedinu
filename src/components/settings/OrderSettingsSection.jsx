import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const OrderSettingsSection = ({ settings, onUpdate, onSave, isSaving }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Pedidos</CardTitle>
        <CardDescription>Gerencie como os pedidos são recebidos e processados.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="auto-approve" className="text-base font-medium">
              Aprovar pedidos automaticamente
            </Label>
            <p className="text-sm text-muted-foreground">
              Quando ativado, novos pedidos irão direto para a produção.
            </p>
          </div>
          <Switch
            id="auto-approve"
            checked={settings.auto_approve_orders}
            onCheckedChange={(checked) => onUpdate('auto_approve_orders', checked)}
          />
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderSettingsSection;