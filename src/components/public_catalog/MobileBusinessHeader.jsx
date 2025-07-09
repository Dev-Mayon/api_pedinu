import React from 'react';
import { Clock, MessageSquare as WhatsAppIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MobileBusinessHeader = ({ businessData, onWhatsAppClick }) => {
  if (!businessData) return null;
  const { settings, businessName } = businessData;

  return (
    <div className="lg:hidden">
      {settings?.banner_url && settings.banner_url.trim() !== '' && (
        <div className="relative w-full h-32 overflow-hidden">
          <img 
            src={settings.banner_url} 
            alt="Banner do estabelecimento" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
        </div>
      )}
      
      <div className="bg-white border-b border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {settings?.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={`${businessName} logo`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-500 font-bold text-lg">{businessName?.charAt(0)}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{businessName}</h1>
              <div className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                settings.is_open 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              )}>
                <Clock size={10} className="mr-1" />
                <span>{settings.is_open ? 'Aberto' : 'Fechado'}</span>
              </div>
            </div>
          </div>
          
          {(settings.whatsapp || settings.phone) && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onWhatsAppClick} 
              className="h-10 w-10 rounded-full bg-green-500 hover:bg-green-600 text-white"
            >
              <WhatsAppIcon size={18} />
            </Button>
          )}
        </div>
        
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center justify-between">
            <span>Tempo médio de entrega:</span>
            <span className="font-medium">30-45 min</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Valor mínimo por entrega:</span>
            <span className="font-medium">R$ 15,00</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileBusinessHeader;