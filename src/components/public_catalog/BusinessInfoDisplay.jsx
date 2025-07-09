import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Info, Share2, MessageSquare as WhatsAppIcon, ImageOff as ImageIconPlaceholder } from 'lucide-react';
import { cn } from '@/lib/utils';

const BusinessInfoDisplay = ({ businessData, onShare, onWhatsAppClick, theme, primaryColor }) => {
  if (!businessData) return null;
  const { settings, businessName } = businessData;

  return (
    <div className="relative px-4 pt-4 pb-4 h-full flex flex-col justify-end">
      <div className="absolute top-3 right-3 md:top-4 md:right-4 flex flex-col items-end space-y-2">
        {settings.is_open !== undefined && (
          <div className={cn(
            "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold shadow-lg border-2",
            settings.is_open 
              ? "bg-green-500 text-white border-green-400 shadow-green-500/30" 
              : "bg-red-500 text-white border-red-400 shadow-red-500/30"
          )}>
            <Clock size={14} className="mr-1.5" />
            <span>{settings.is_open ? 'ABERTO' : 'FECHADO'}</span>
          </div>
        )}
        {(settings.whatsapp || settings.phone) && 
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onWhatsAppClick} 
            className="h-10 w-10 rounded-full text-white hover:text-green-400 bg-green-600 hover:bg-green-700 backdrop-blur-sm shadow-lg transition-all duration-200 hover:scale-110"
          >
            <WhatsAppIcon size={22} />
          </Button>
        }
      </div>
      
      <div className="flex items-end">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center mr-4 shadow-xl flex-shrink-0 border-4 bg-white border-white overflow-hidden">
          {settings?.logo_url && settings.logo_url.trim() !== '' ? (
            <img 
              src={settings.logo_url} 
              alt={`${businessName} logo`} 
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : (
            <ImageIconPlaceholder size={40} className="text-red-600" />
          )}
          <div className="w-full h-full items-center justify-center hidden">
            <ImageIconPlaceholder size={40} className="text-red-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0 lg:block hidden">
          <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg mb-1 leading-tight">
            {businessName}
          </h1>
          <div className="flex items-center space-x-4 mt-2">
            <button 
              onClick={() => alert("🚧 Funcionalidade não implementada — mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀")} 
              className="transition-all duration-200 hover:text-yellow-300 p-2 rounded-full hover:bg-white/20 text-white/90 hover:scale-110"
            >
              <Info size={20} />
            </button>
            <button 
              onClick={onShare} 
              className="transition-all duration-200 hover:text-yellow-300 p-2 rounded-full hover:bg-white/20 text-white/90 hover:scale-110"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInfoDisplay;