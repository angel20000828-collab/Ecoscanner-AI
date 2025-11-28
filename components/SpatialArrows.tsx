import React from 'react';
import { BinCategory, ScanItem, BIN_TEXT_COLORS } from '../types';

interface SpatialArrowsProps {
  results: ScanItem[];
  isVisible: boolean;
}

const ARROW_POSITIONS: Record<BinCategory, string> = {
  'Compost': 'left-[12%]',
  'Garbage': 'left-[37%]',
  'Recycle': 'left-[63%]',
  'Paper': 'left-[88%]',
};

export const SpatialArrows: React.FC<SpatialArrowsProps> = ({ results, isVisible }) => {
  if (!isVisible) return null;

  // Get unique bins detected
  const activeBins = Array.from(new Set(results.map(r => r.bin))) as BinCategory[];

  return (
    <div className="absolute bottom-0 left-0 w-full h-40 pointer-events-none z-40">
      {activeBins.map((bin) => (
        <div 
          key={bin}
          className={`absolute bottom-10 ${ARROW_POSITIONS[bin]} transform -translate-x-1/2 flex flex-col items-center animate-bounce-arrow transition-all duration-500`}
        >
          {/* Thick and Cute Arrow */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`w-24 h-24 ${BIN_TEXT_COLORS[bin]} drop-shadow-2xl`} 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
             <path d="M 12 24 L 3.5 15.5 C 2.8 14.8 3.3 13.5 4.3 13.5 L 9 13.5 L 9 3 C 9 1.3 10.3 0 12 0 C 13.7 0 15 1.3 15 3 L 15 13.5 L 19.7 13.5 C 20.7 13.5 21.2 14.8 20.5 15.5 L 12 24 Z" />
          </svg>

          <div className={`mt-2 px-6 py-2 rounded-full bg-white/90 backdrop-blur-xl text-base font-black uppercase tracking-widest shadow-xl border-2 border-white/50 ${BIN_TEXT_COLORS[bin]}`}>
            {bin}
          </div>
        </div>
      ))}
    </div>
  );
};