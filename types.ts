
export enum AppStatus {
  IDLE = 'IDLE',
  STABILIZING = 'STABILIZING', // New phase: Watching for stillness
  SCANNING = 'SCANNING', // AI Processing
  SUCCESS = 'SUCCESS', // "Found it"
  TALKING = 'TALKING', // "Here is how to sort it"
}

export type BinCategory = 'Compost' | 'Garbage' | 'Recycle' | 'Paper';

export interface ScanItem {
  item: string;
  bin: BinCategory;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: Date;
  items: ScanItem[];
}

export const BIN_COLORS: Record<BinCategory, string> = {
  'Compost': 'bg-green-500',
  'Garbage': 'bg-gray-800',
  'Recycle': 'bg-blue-500',
  'Paper': 'bg-yellow-400',
};

export const BIN_TEXT_COLORS: Record<BinCategory, string> = {
  'Compost': 'text-green-600',
  'Garbage': 'text-gray-700',
  'Recycle': 'text-blue-600',
  'Paper': 'text-yellow-600',
};

// Placeholder constants - sources removed as requested
export const AVATAR_VIDEOS = {
  IDLE: '',
  SCANNING: '',
  SUCCESS: '',
  TALKING: '', 
};
