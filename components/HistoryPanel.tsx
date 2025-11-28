import React from 'react';
import { ScanHistoryItem, BIN_COLORS, BIN_TEXT_COLORS } from '../types';

interface HistoryPanelProps {
  isOpen: boolean;
  history: ScanHistoryItem[];
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, history, onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white/90 backdrop-blur-3xl shadow-2xl z-50 transform transition-transform duration-300 ease-out p-6 overflow-y-auto no-scrollbar border-l border-white/50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">History</h2>
            <p className="text-sm text-gray-500">Recent scans</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            ✕
          </button>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <span className="text-4xl mb-2">📜</span>
            <p className="italic">No items scanned yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((entry) => {
              // Group items by bin for this specific entry
              const grouped = entry.items.reduce((acc, curr) => {
                if (!acc[curr.bin]) acc[curr.bin] = [];
                acc[curr.bin].push(curr.item);
                return acc;
              }, {} as Record<string, string[]>);

              return (
                <div key={entry.id} className="bg-white/60 rounded-2xl p-4 shadow-sm border border-white/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                      {entry.timestamp.toLocaleDateString()} • {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {entry.items.length} items
                    </span>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(grouped).map(([bin, items]) => (
                      <div key={bin} className="relative pl-3 border-l-2 border-gray-200">
                        {/* Bin Header */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${BIN_COLORS[bin as keyof typeof BIN_COLORS]}`}></div>
                          <h4 className={`text-xs font-black uppercase tracking-widest ${BIN_TEXT_COLORS[bin as keyof typeof BIN_TEXT_COLORS]}`}>
                            {bin}
                          </h4>
                        </div>
                        {/* Items List */}
                        <ul className="text-sm text-gray-700 font-medium leading-relaxed">
                          {(items as string[]).map((item, i) => (
                            <li key={i} className="block">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};