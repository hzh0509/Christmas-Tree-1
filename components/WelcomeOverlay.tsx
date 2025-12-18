import React from 'react';

interface WelcomeOverlayProps {
  onStart: () => void;
}

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <div className="text-center space-y-8 animate-fade-in-up">
        <h1 className="text-6xl md:text-8xl font-bold text-gold tracking-widest drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
          MERRY<br />CHRISTMAS
        </h1>
        <p className="text-gray-400 font-serif-display text-xl tracking-wide">
          An Interactive 3D Experience
        </p>
        
        <div className="pt-8">
          <button
            onClick={onStart}
            className="group relative px-12 py-4 bg-transparent overflow-hidden rounded-full border border-red-800 transition-all duration-300 hover:border-red-500 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-900 to-red-700 opacity-60 group-hover:opacity-80 transition-opacity"></div>
            <span className="relative z-10 text-white font-serif-display text-2xl tracking-widest font-bold">
              START MAGIC
            </span>
            <div className="absolute inset-0 rounded-full ring-2 ring-red-500/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>

        <div className="mt-12 flex gap-8 text-gray-500 text-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border border-gray-700 rounded-lg flex items-center justify-center">
              🖐️
            </div>
            <span>Open Hand: EXPLODE</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border border-gray-700 rounded-lg flex items-center justify-center">
              ✊
            </div>
            <span>Fist: FORM TREE</span>
          </div>
        </div>
      </div>
    </div>
  );
};