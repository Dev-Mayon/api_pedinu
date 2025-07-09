import React from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const BusinessStatusToggle = ({ isOpen, onToggleStatus, isLoading }) => {
  const cardBorderColor = isOpen ? 'border-green-500' : 'border-red-500';
  const cardBgColor = isOpen ? 'bg-green-50/30 dark:bg-green-900/10' : 'bg-red-50/30 dark:bg-red-900/10';
  const textColor = isOpen ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';
  const iconColor = isOpen ? 'text-green-500' : 'text-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className={cn("transition-all", cardBorderColor, cardBgColor)}>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isOpen ? <Eye className={cn("mr-2 h-5 w-5", iconColor)} /> : <EyeOff className={cn("mr-2 h-5 w-5", iconColor)} />}
              <CardTitle className={cn("text-base font-semibold", isOpen ? "text-foreground" : "text-foreground")}>
                Status: <span className={cn("font-bold", textColor)}>{isOpen ? 'Aberto' : 'Fechado'}</span>
              </CardTitle>
            </div>
            <Switch
              id="business-status-toggle"
              checked={isOpen}
              onCheckedChange={onToggleStatus}
              disabled={isLoading}
              className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
              aria-label={isOpen ? "Desativar recebimento de pedidos" : "Ativar recebimento de pedidos"}
            />
          </div>
        </CardHeader>
        <CardContent className="py-2 px-4">
            <CardDescription className="text-xs text-muted-foreground text-center">
              {isOpen ? 'Seu estabelecimento está recebendo pedidos.' : 'Pedidos estão pausados. Alterne para abrir.'}
            </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BusinessStatusToggle;