import { useEffect } from 'react';

const useTawkTo = (propertyId, widgetId) => {
  useEffect(() => {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = function() {
        window.Tawk_API.hideWidget();
    };
    window.Tawk_LoadStart = new Date();
    
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      
      if (window.Tawk_API && window.Tawk_API.hideWidget) {
        try {
          window.Tawk_API.hideWidget();
        } catch (error) {
          // Widget might already be gone
        }
      }
      delete window.Tawk_API;
      delete window.Tawk_LoadStart;
    };
  }, [propertyId, widgetId]);
};

export default useTawkTo;