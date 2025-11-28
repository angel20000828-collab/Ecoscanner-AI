
import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';

export interface ScannerHandle {
  capture: () => string | null;
}

interface ScannerProps {
  isScanningEnabled: boolean; // Controls video stream active state
  isDetecting: boolean;       // Controls motion detection logic
  onCapture?: (base64: string) => void;
  onMotionChange?: (isMoving: boolean) => void;
}

export const Scanner = forwardRef<ScannerHandle, ScannerProps>(({ 
  isScanningEnabled, 
  isDetecting, 
  onCapture,
  onMotionChange 
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isMoving, setIsMoving] = useState(false);

  // State to track stability
  const lastMotionTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);

  // 1. Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1080 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    };
    startCamera();
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // 2. Motion Detection Loop
  useEffect(() => {
    if (!isDetecting) {
      setIsMoving(false);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const checkMotion = () => {
      if (!videoRef.current || !motionCanvasRef.current) return;

      const video = videoRef.current;
      const canvas = motionCanvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx || video.readyState !== 4) {
        requestRef.current = requestAnimationFrame(checkMotion);
        return;
      }

      // Use small dimensions for performance
      const w = 50; 
      const h = 50;
      canvas.width = w;
      canvas.height = h;

      // Draw current frame
      ctx.drawImage(video, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      if (prevFrameRef.current) {
        let diffScore = 0;
        const threshold = 30; // Pixel difference threshold
        let changedPixels = 0;

        // Compare pixels (Green channel is usually sufficient for brightness)
        for (let i = 0; i < data.length; i += 4) {
          const diff = Math.abs(data[i + 1] - prevFrameRef.current[i + 1]);
          if (diff > threshold) {
            changedPixels++;
          }
        }

        // Calculate motion percentage
        diffScore = changedPixels / (w * h);

        // Logic: Is it moving?
        const isCurrentlyMoving = diffScore > 0.02; // 2% of pixels changed

        if (isCurrentlyMoving) {
          lastMotionTimeRef.current = Date.now();
          if (!isMoving) {
            setIsMoving(true);
            onMotionChange?.(true);
          }
        } else {
          // Check how long it has been stable
          const timeStable = Date.now() - lastMotionTimeRef.current;
          
          if (timeStable > 150) { // Buffer to prevent flickering
             if (isMoving) {
               setIsMoving(false);
               onMotionChange?.(false);
             }
          }

          // TRIGGER: If stable for 1 second (1000ms)
          if (timeStable > 1000 && !isMoving) {
             const capture = captureImage();
             if (capture && onCapture) {
               onCapture(capture);
               return; // Stop loop after capture
             }
          }
        }
      }

      // Save current frame for next comparison
      prevFrameRef.current = new Uint8ClampedArray(data);
      requestRef.current = requestAnimationFrame(checkMotion);
    };

    // Initialize loop
    lastMotionTimeRef.current = Date.now(); // Reset timer on start
    requestRef.current = requestAnimationFrame(checkMotion);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isDetecting, isMoving, onCapture, onMotionChange]);

  // 3. Capture Logic
  useImperativeHandle(ref, () => ({
    capture: captureImage
  }));

  const captureImage = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const context = canvasRef.current.getContext('2d');
    if (!context) return null;

    const { videoWidth, videoHeight } = videoRef.current;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    
    // Draw and flip logic (mirroring for user experience)
    context.save();
    context.scale(-1, 1);
    context.drawImage(videoRef.current, -videoWidth, 0, videoWidth, videoHeight);
    context.restore();
    
    return canvasRef.current.toDataURL('image/jpeg', 0.9).split(',')[1];
  };

  // 4. Visuals
  // Dynamic border color based on state
  const getBorderColor = () => {
    if (!isDetecting) return 'border-white/60'; // Idle
    if (isMoving) return 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]'; // Moving (Warning)
    return 'border-teal-400 shadow-[0_0_30px_rgba(45,212,191,0.6)]'; // Stable (Locked)
  };

  return (
    <div className="relative w-[240px] h-[240px] group">
      
      {/* Ambient Glow - Changes with motion */}
      <div className={`absolute -inset-6 rounded-full blur-2xl transition-all duration-500 
        ${isDetecting && isMoving ? 'bg-red-500/40' : ''}
        ${isDetecting && !isMoving ? 'bg-teal-400/40' : ''}
        ${!isDetecting ? 'bg-gradient-to-tr from-pink-200 to-blue-200 opacity-40' : ''}
      `}></div>

      {/* Main Container */}
      <div className={`relative w-full h-full rounded-full p-2 bg-white/40 backdrop-blur-xl transition-all duration-300 border-4 ${getBorderColor()} overflow-hidden z-0`}>
        <div className="w-full h-full rounded-full overflow-hidden relative shadow-inner bg-black/20 ring-1 ring-white/30">
           <video 
             ref={videoRef}
             autoPlay 
             muted 
             playsInline
             className="w-full h-full object-cover transform scale-x-[-1]" 
           />
           
           {/* Locking Overlay */}
           {isDetecting && !isMoving && (
             <div className="absolute inset-0 border-[10px] border-teal-400/30 rounded-full animate-pulse"></div>
           )}
        </div>
      </div>
      
      {/* Hidden Canvases */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={motionCanvasRef} className="hidden" />
    </div>
  );
});

Scanner.displayName = 'Scanner';
