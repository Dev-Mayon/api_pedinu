import React from 'react';
import { cn } from '@/lib/utils';

const PedinuLogo = ({ 
  size = 'md', 
  variant = 'full', 
  theme = 'light',
  className 
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8', 
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const LogoIcon = ({ className: iconClassName }) => (
    <div
      className={cn(
        "relative rounded-xl flex items-center justify-center overflow-hidden",
        sizeClasses[size],
        iconClassName
      )}
    >
      {/* Fundo gradiente limpo */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600" />
      
      {/* Ícone minimalista - Círculo com "P" */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <span className="text-white font-black text-lg leading-none">
          P
        </span>
      </div>
    </div>
  );

  const LogoText = ({ className: textClassName }) => (
    <span
      className={cn(
        "font-bold bg-gradient-to-r from-orange-600 to-red-700 bg-clip-text text-transparent",
        textSizes[size],
        textClassName
      )}
    >
      Pedinu
    </span>
  );

  if (variant === 'icon') {
    return <LogoIcon className={className} />;
  }

  if (variant === 'text') {
    return <LogoText className={className} />;
  }

  // Variant 'full' - ícone + texto
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <LogoIcon />
      <LogoText />
    </div>
  );
};

// Componente alternativo para logo minimalista
export const PedinuLogoMinimal = ({ 
  size = 'md', 
  theme = 'light',
  className 
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm', 
    md: 'h-12 w-12 text-lg',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-20 w-20 text-2xl'
  };

  return (
    <div className={cn(
      "relative rounded-lg flex items-center justify-center font-bold text-white overflow-hidden border-2 border-orange-200",
      sizeClasses[size],
      className
    )}>
      {/* Fundo simples */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500" />
      
      {/* Texto */}
      <span className="relative z-10 font-black tracking-tight">
        P
      </span>
    </div>
  );
};

// Componente para logo sem animação (anteriormente animado)
export const PedinuLogoAnimated = ({ 
  size = 'md',
  className 
}) => {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <PedinuLogo variant="icon" size={size} />
      <PedinuLogo variant="text" size={size} />
    </div>
  );
};

export default PedinuLogo;