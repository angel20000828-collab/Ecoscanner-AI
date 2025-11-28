import React, { useEffect, useState } from 'react';
import { ScanItem, BIN_COLORS, BIN_TEXT_COLORS } from '../types';

interface ResultModalProps {
  results: ScanItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ results, isOpen, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    let timer: number;
    if (isOpen) {
      setTimeLeft(10);
      timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Group items by bin
  const groupedItems = results.reduce((acc, curr) => {
    if (!acc[curr.bin]) acc[curr.bin] = [];
    acc[curr.bin].push(curr.item);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="absolute right-10 bottom-40 w-[400px] z-50 transition-all duration-500 transform animate-[float_4s_ease-in-out_infinite]">
      {/* Glass Container */}
      <div className="bg-white/60 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Scan Results</h2>
          <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded-full text-gray-500">
            Closing in {timeLeft}s
          </span>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedItems).map(([bin, items]) => (
            <div key={bin} className="bg-white/40 rounded-xl p-3 border border-white/30">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${BIN_COLORS[bin as keyof typeof BIN_COLORS]}`}></div>
                <h3 className={`font-bold uppercase tracking-wider text-sm ${BIN_TEXT_COLORS[bin as keyof typeof BIN_TEXT_COLORS]}`}>
                  {bin}
                </h3>
              </div>
              <ul className="pl-6 list-disc text-gray-700 text-lg font-medium">
                {(items as string[]).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Background Decorative Blur */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      </div>
    </div>
  );
};