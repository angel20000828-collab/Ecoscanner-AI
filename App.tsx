
import React, { useState, useRef, useCallback } from 'react';
import { AppStatus, ScanItem, ScanHistoryItem } from './types';
import { Avatar } from './components/Avatar';
import { Scanner, ScannerHandle } from './components/Scanner';
import { ResultModal } from './components/ResultModal';
import { SpatialArrows } from './components/SpatialArrows';
import { HistoryPanel } from './components/HistoryPanel';
import { identifyTrash } from './services/geminiService';

export default function App() {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [results, setResults] = useState<ScanItem[]>([]);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Track real-time motion state from scanner for UI feedback
  const [isUserMoving, setIsUserMoving] = useState(false);
  
  const scannerRef = useRef<ScannerHandle>(null);
  const autoCloseTimerRef = useRef<number | null>(null);

  // Reset function to go back to Idle (Stop/Cancel)
  const resetToIdle = useCallback(() => {
    setStatus(AppStatus.IDLE);
    setResults([]);
    setIsUserMoving(false);
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  // Function to loop back to scanning (Continuous Mode)
  const startNextScan = useCallback(() => {
    setStatus(AppStatus.STABILIZING);
    setResults([]);
    setIsUserMoving(false);
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  // 1. User clicks Button -> Enter Stabilizing Mode
  const startScanningProcess = () => {
    if (status !== AppStatus.IDLE) return;
    setStatus(AppStatus.STABILIZING);
  };

  // 2. Scanner reports motion state changes (for Avatar feedback)
  const handleMotionChange = (isMoving: boolean) => {
    setIsUserMoving(isMoving);
  };

  // 3. Scanner Auto-Captures when stable -> Start AI
  const handleAutoCapture = async (base64Image: string) => {
    if (!base64Image) return;

    // Transition to AI Processing
    setStatus(AppStatus.SCANNING);

    try {
      const items = await identifyTrash(base64Image);
      
      // Success
      setResults(items);
      setStatus(AppStatus.SUCCESS);

      // Add to history
      const newHistoryItem: ScanHistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date(),
        items: items
      };
      setHistory(prev => [newHistoryItem, ...prev]);

      // Wait 0.4 seconds then switch to Talking
      setTimeout(() => {
        setStatus(AppStatus.TALKING);
        
        // Start 10s auto-close timer that LOOPS back to scanning
        if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = window.setTimeout(() => {
          startNextScan(); 
        }, 10000);
        
      }, 400);

    } catch (error) {
      console.error(error);
      // On error, loop back to scanning anyway (or idle? defaulting to scanning for continuity)
      startNextScan();
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden flex flex-col items-center">
      
      {/* --- LAYER 1: BACK (AVATAR) --- */}
      {/* Increased height to 85% to give the avatar more room */}
      <div className="absolute top-0 left-0 w-full h-[85%] z-0">
        <Avatar status={status} isMoving={isUserMoving} />
      </div>

      {/* --- TOP RIGHT CONTROLS --- */}
      <div className="absolute top-8 right-8 z-40 flex items-center gap-4">
        
        {/* Stop/Cancel Button - Visible when Scanner is Active OR Showing Results (Loop active) */}
        {(status === AppStatus.STABILIZING || status === AppStatus.TALKING) && (
          <button 
            onClick={resetToIdle}
            className="w-14 h-14 bg-red-500/80 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-105 transition-all group"
            title="Stop Scanner"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* History Button */}
        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="w-14 h-14 bg-white/30 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center shadow-lg hover:bg-white/50 transition-all group"
          title="View History"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* --- LAYER 2: FRONT (SCANNER & CONTROLS) --- */}
      <div className="absolute bottom-0 w-full h-[40%] flex flex-col items-center justify-end pb-8 z-10">
        
        {/* Scanner Circle */}
        <div className="mb-4 translate-y-6">
           <Scanner 
              ref={scannerRef} 
              isScanningEnabled={true} // Camera always on for transitions
              isDetecting={status === AppStatus.STABILIZING} // Only detect motion in this phase
              onCapture={handleAutoCapture}
              onMotionChange={handleMotionChange}
           />
        </div>

        {/* Manual Scan Button - Only visible in IDLE */}
        <div className={`transition-all duration-500 transform ${status === AppStatus.IDLE ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
           <button
              onClick={startScanningProcess}
              className="px-12 py-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xl tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(168,85,247,0.7)] active:scale-95 transition-all duration-300 border border-white/20 backdrop-blur-xl flex items-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              SCAN TRASH
           </button>
        </div>

      </div>

      {/* --- OVERLAYS --- */}
      
      {/* Result Modal - closes to Next Scan */}
      <ResultModal 
        isOpen={status === AppStatus.TALKING} 
        results={results} 
        onClose={startNextScan} 
      />

      {/* Spatial Arrows */}
      <SpatialArrows 
        results={results} 
        isVisible={status === AppStatus.TALKING} 
      />

      {/* History Side Panel */}
      <HistoryPanel 
        isOpen={isHistoryOpen} 
        history={history} 
        onClose={() => setIsHistoryOpen(false)} 
      />

    </main>
  );
}
