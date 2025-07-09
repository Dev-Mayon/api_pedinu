import React from 'react';
import { cn } from '@/lib/utils';

const DigitalMenuLoading = ({ theme }) => {
  const bgColor = theme === 'light' ? 'bg-white' : 'bg-background';
  const textColor = theme === 'light' ? 'text-gray-700' : 'text-foreground';
  const spinnerColor = theme === 'light' ? 'border-red-500' : 'border-primary';

  return (
    <div className={cn("flex flex-col h-screen items-center justify-center", bgColor)}>
      <div className={cn("animate-spin rounded-full h-8 w-8 border-b-2 mb-3", spinnerColor)}></div>
      <p className={cn("text-base font-medium", textColor)}>Carregando...</p>
    </div>
  );
};

export default DigitalMenuLoading;