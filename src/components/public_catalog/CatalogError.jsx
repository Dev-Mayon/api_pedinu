import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DigitalMenuError = ({ message = "Não foi possível carregar o cardápio.", theme, onRetry }) => {
  const bgColor = theme === 'light' ? 'bg-white' : 'bg-background';
  const textColor = theme === 'light' ? 'text-gray-700' : 'text-foreground';
  const iconColor = theme === 'light' ? 'text-red-500' : 'text-destructive';
  const buttonClasses = theme === 'light' 
    ? 'bg-red-500 hover:bg-red-600 text-white' 
    : 'bg-primary hover:bg-primary/90 text-primary-foreground';

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className={cn("flex flex-col h-screen items-center justify-center text-center p-4", bgColor)}>
      <AlertTriangle className={cn("h-16 w-16 mb-4", iconColor)} />
      <h2 className={cn("text-2xl font-semibold mb-2", textColor)}>Oops! Algo deu errado.</h2>
      <p className={cn("text-md mb-6 max-w-md", textColor)}>{message}</p>
      <Button onClick={handleRetry} className={cn("flex items-center gap-2", buttonClasses)}>
        <RefreshCw size={16} />
        Tentar Novamente
      </Button>
    </div>
  );
};

export default DigitalMenuError;