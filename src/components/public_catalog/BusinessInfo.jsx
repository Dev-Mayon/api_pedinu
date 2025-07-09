import React from 'react';
import { Store, Clock, MapPin, Phone, Share2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const BusinessInfo = ({ businessData, onShare }) => {
  const { toast } = useToast();
  if (!businessData || !businessData.settings) {
    return null; 
  }
  return (
    <div className="p-3 sm:p-4 border-b border-gray-200">
      <div className="flex items-center space-x-3 mb-2.5">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-2xl font-bold shadow-md overflow-hidden flex-shrink-0">
          {businessData.settings.logo_url ?
            <img-replace src={businessData.settings.logo_url} alt={`${businessData.businessName} logo`} className="w-full h-full object-cover" />
            : <Store size={28} />}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate" title={businessData.businessName}>{businessData.businessName}</h1>
          <div className={`flex items-center space-x-1.5 text-xs mt-1 ${businessData.settings.is_open ? 'text-green-600' : 'text-red-600'}`}>
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium">{businessData.settings.is_open ? 'Aberto agora' : 'Fechado'}</span>
          </div>
        </div>
      </div>
      {businessData.settings.description && <p className="text-xs text-gray-600 mb-2 line-clamp-3">{businessData.settings.description}</p>}
      
      <div className="space-y-1 text-xs text-gray-500">
        {businessData.settings.address && (
          <div className="flex items-start space-x-1.5">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-px text-gray-400" />
            <span className="line-clamp-2">{businessData.settings.address}</span>
          </div>
        )}
        {businessData.settings.phone && (
          <div className="flex items-center space-x-1.5">
            <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
            <span>{businessData.settings.phone}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex space-x-2">
        <Button variant="outline" size="sm" onClick={onShare} className="flex-1 border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-gray-700 text-xs h-8">
          <Share2 className="h-3.5 w-3.5 mr-1.5" /> Compartilhar
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast({ title: "🚧 Em breve!", description: "Informações detalhadas do estabelecimento." })} className="flex-1 border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-gray-700 text-xs h-8">
          <Info className="h-3.5 w-3.5 mr-1.5" /> Info
        </Button>
      </div>
    </div>
  );
};

export default BusinessInfo;