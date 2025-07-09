import React from 'react';
import { cn } from '@/lib/utils';

const DecorativeShapes = ({ primaryColor }) => (
  <>
    <div className="absolute top-6 right-20 md:right-32 opacity-90">
      <div className="w-4 h-10 bg-gradient-to-b from-orange-400 to-red-500 rounded-full transform rotate-45 shadow-lg"></div>
    </div>
    <div className="absolute top-16 right-12 md:right-20 opacity-80">
      <div className="w-3 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full transform -rotate-30 shadow-md"></div>
    </div>
    <div className="absolute top-8 right-6 md:right-10 opacity-95">
      <div className="w-5 h-12 bg-gradient-to-b from-red-400 to-red-600 rounded-full transform rotate-12 shadow-lg"></div>
    </div>
    <div className="absolute top-20 right-28 md:right-40 opacity-70">
      <div className="w-2.5 h-6 bg-gradient-to-b from-pink-400 to-red-500 rounded-full transform rotate-60 shadow-sm"></div>
    </div>
    <div className="absolute top-4 right-40 md:right-52 opacity-85">
      <div className="w-3.5 h-9 bg-gradient-to-b from-orange-300 to-red-400 rounded-full transform -rotate-15 shadow-md"></div>
    </div>
  </>
);

const DigitalMenuBanner = ({ bannerUrl, children, theme, primaryColor, className }) => {
  return (
    <div className={cn("relative w-full h-32 lg:h-44 overflow-hidden", className)}>
      {bannerUrl && bannerUrl.trim() !== '' ? (
        <img 
          src={bannerUrl} 
          alt="Banner" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-red-500 via-red-600 to-red-700">
          <DecorativeShapes primaryColor={primaryColor} />
        </div>
      )}
      <div className="w-full h-full hidden bg-gradient-to-br from-red-500 via-red-600 to-red-700">
        <DecorativeShapes primaryColor={primaryColor} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent">
        {children}
      </div>
    </div>
  );
};

export default DigitalMenuBanner;