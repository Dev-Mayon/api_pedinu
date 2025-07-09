import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const KitchenHeader = ({ searchTerm, onSearchTermChange, businessSettings, onAutoApproveChange }) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="auto-approve-switch" className="text-sm font-medium text-muted-foreground whitespace-nowrap">Aprovação Automática</Label>
            <Switch
              id="auto-approve-switch"
              checked={businessSettings.auto_approve_orders}
              onCheckedChange={onAutoApproveChange}
            />
          </div>
        </div>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar pelo cliente ou ID"
          className="pl-10 h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default KitchenHeader;