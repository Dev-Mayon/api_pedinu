import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const SettingsSwitchCard = ({ title, description, switchId, isChecked, onCheckedChange, children }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor={switchId} className="text-base font-medium">
              Aprovar pedidos automaticamente
            </Label>
            <p className="text-sm text-muted-foreground">
              Quando ativado, novos pedidos irão direto para a produção.
            </p>
          </div>
          <Switch
            id={switchId}
            checked={isChecked}
            onCheckedChange={onCheckedChange}
          />
        </div>
        {children}
      </CardContent>
    </Card>
  );
};

export default SettingsSwitchCard;