import React from 'react';
import { BADGE_URL } from '../constants';

export const Badge: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
        {/* 
            Using an image tag is more accurate for club crests.
            The URL is defined in constants.ts.
            Added a fallback in case the image fails to load.
        */}
        <img 
            src={BADGE_URL} 
            alt="London Titans FC Badge" 
            className="w-full h-full object-contain drop-shadow-md"
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement?.classList.add('bg-[#26241E]', 'rounded-full', 'border-2', 'border-white');
            }}
        />
        {/* Fallback text if image fails (handled by error handler hiding img) */}
        <span className="hidden absolute text-[#FFD102] font-bold text-xs text-center">TITANS</span>
    </div>
  );
};