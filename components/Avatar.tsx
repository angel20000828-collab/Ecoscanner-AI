
import React from 'react';
import { AppStatus } from '../types';

interface AvatarProps {
  status: AppStatus;
  isMoving?: boolean;
}

// High-quality 3D Raccoon Asset
const RACCOON_IMG = "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Raccoon.png";

export const Avatar: React.FC<AvatarProps> = ({ status, isMoving }) => {
  // Map status to speech text
  const getSpeechText = () => {
    switch (status) {
      case AppStatus.STABILIZING:
        return isMoving ? "Hold still..." : "Steady...";
      case AppStatus.SCANNING: return "Hmm... let me see...";
      case AppStatus.SUCCESS: return "Aha! Found it!";
      case AppStatus.TALKING: return "Here is how to sort it.";
      case AppStatus.IDLE:
      default: return "I am Raccoon... Show me your trash!";
    }
  };

  // Dynamic animation classes for the character container
  const getContainerAnimation = () => {
    switch (status) {
      case AppStatus.STABILIZING:
        // Lean in/out based on motion
        return isMoving 
          ? 'scale-95 brightness-90 rotate-[-2deg] transition-all duration-300' 
          : 'scale-105 brightness-110 rotate-0 transition-all duration-500';
      case AppStatus.SCANNING:
        return 'animate-pulse scale-105 duration-700';
      case AppStatus.SUCCESS:
        return 'animate-bounce';
      case AppStatus.TALKING:
        return 'animate-[bounce_2s_infinite]'; // Gentle bobbing while talking
      case AppStatus.IDLE:
      default:
        return 'animate-float'; // Standard floating idle
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
      <div className="relative group">
        
        {/* Raccoon Circle Frame */}
        <div className={`w-[600px] h-[600px] rounded-full border-[10px] border-white/20 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden flex items-center justify-center relative z-10 ${getContainerAnimation()}`}>
           
           {/* Inner Glow/Reflection */}
           <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-30 pointer-events-none z-20"></div>
           
           {/* The Image */}
           <img 
             src={RACCOON_IMG} 
             alt="Raccoon Avatar" 
             className="w-[90%] h-[90%] object-contain drop-shadow-2xl z-10"
           />
        </div>

        {/* Speech Bubble */}
        <div className="absolute -right-24 top-16 max-w-sm z-30 transition-all duration-500 ease-out transform">
           <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[2rem] rounded-bl-none shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-white/60 relative animate-in fade-in slide-in-from-bottom-2 duration-700">
              <p className={`text-3xl font-bold leading-tight ${isMoving && status === AppStatus.STABILIZING ? 'text-red-500' : 'text-gray-800'}`}>
                {getSpeechText()}
              </p>
              
              {/* Bubble Tail */}
              <div className="absolute -left-3 bottom-0 w-8 h-8 bg-white/90 backdrop-blur-2xl transform skew-x-12 rounded-bl-full shadow-sm"></div>
           </div>
        </div>

      </div>
    </div>
  );
};
