import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { GestureType } from '../types';

export const UIInterface: React.FC = () => {
  const { gesture, landmarks, videoElement } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context for mirroring
    ctx.save();
    // Translate and scale to mirror the image horizontally
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    // 1. Draw Camera Feed (Background)
    if (videoElement && videoElement.readyState >= 2) {
      // Draw video to fill canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Tech Overlay (Green Tint) - drawn over the mirrored video
      ctx.fillStyle = 'rgba(0, 20, 0, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Scanlines
      ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
      for(let i=0; i<canvas.height; i+=4) {
        ctx.fillRect(0, i, canvas.width, 1);
      }
    } else {
      // No Signal Background
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 2. Draw Skeleton (Foreground)
    if (landmarks) {
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#00FF00'; // Bright Green Lines
      ctx.fillStyle = '#FF0000';   // Red Joints

      const drawLine = (startIdx: number, endIdx: number) => {
        const start = landmarks[startIdx];
        const end = landmarks[endIdx];
        if (start && end) {
          ctx.beginPath();
          ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
          ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
          ctx.stroke();
        }
      };

      // Connections
      // Thumb
      drawLine(0, 1); drawLine(1, 2); drawLine(2, 3); drawLine(3, 4);
      // Index
      drawLine(0, 5); drawLine(5, 6); drawLine(6, 7); drawLine(7, 8);
      // Middle
      drawLine(0, 9); drawLine(9, 10); drawLine(10, 11); drawLine(11, 12);
      // Ring
      drawLine(0, 13); drawLine(13, 14); drawLine(14, 15); drawLine(15, 16);
      // Pinky
      drawLine(0, 17); drawLine(17, 18); drawLine(18, 19); drawLine(19, 20);
      // Palm Base
      drawLine(5, 9); drawLine(9, 13); drawLine(13, 17); drawLine(0, 5); drawLine(0, 17);

      // Draw Joints
      for (const lm of landmarks) {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Restore context (stop mirroring)
    ctx.restore();

    // 3. Draw Text/HUD Overlay (Non-mirrored text)
    if (!videoElement || videoElement.readyState < 2) {
      ctx.fillStyle = '#333';
      ctx.font = '12px monospace';
      ctx.fillText("INITIALIZING SENSOR...", 20, 120);
    }

  }, [landmarks, videoElement]); 

  // Fallback animation loop for background when no landmarks are detected
  useEffect(() => {
    if (landmarks) return; 
    
    let animId: number;
    const renderLoop = () => {
      const canvas = canvasRef.current;
      if (canvas && videoElement && videoElement.readyState >= 2) {
         const ctx = canvas.getContext('2d');
         if(ctx) {
             ctx.save();
             ctx.translate(canvas.width, 0);
             ctx.scale(-1, 1);
             ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
             ctx.fillStyle = 'rgba(0, 20, 0, 0.4)';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
             for(let i=0; i<canvas.height; i+=4) {
               ctx.fillRect(0, i, canvas.width, 1);
             }
             ctx.restore();
         }
      }
      animId = requestAnimationFrame(renderLoop);
    };
    renderLoop();
    return () => cancelAnimationFrame(animId);
  }, [videoElement, landmarks]);


  const isTree = gesture === GestureType.FIST;
  const isExplode = gesture === GestureType.OPEN_PALM;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-8">
      {/* Top Header */}
      <div className="w-full text-center mt-4">
        <h2 className="text-4xl md:text-6xl text-gold font-bold drop-shadow-lg tracking-wider">
          MERRY CHRISTMAS
        </h2>
      </div>

      {/* Bottom Area */}
      <div className="flex items-end justify-between w-full">
        {/* Left Side: Monitor & Status */}
        <div className="flex flex-col gap-4">
          
          {/* Status Lights */}
          <div className="flex gap-4 mb-2">
            <div className={`
              px-6 py-2 rounded-lg border transition-all duration-300 flex items-center gap-2
              ${isExplode 
                ? 'bg-red-900/80 border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.6)] scale-110' 
                : 'bg-black/50 border-gray-800 text-gray-600'}
            `}>
              <div className={`w-3 h-3 rounded-full ${isExplode ? 'bg-red-500 animate-pulse' : 'bg-red-900'}`} />
              <span className={`font-mono font-bold ${isExplode ? 'text-white' : ''}`}>EXPLODE</span>
            </div>

            <div className={`
              px-6 py-2 rounded-lg border transition-all duration-300 flex items-center gap-2
              ${isTree 
                ? 'bg-green-900/80 border-green-500 shadow-[0_0_20px_rgba(0,255,0,0.6)] scale-110' 
                : 'bg-black/50 border-gray-800 text-gray-600'}
            `}>
              <div className={`w-3 h-3 rounded-full ${isTree ? 'bg-green-400 animate-pulse' : 'bg-green-900'}`} />
              <span className={`font-mono font-bold ${isTree ? 'text-white' : ''}`}>TREE</span>
            </div>
          </div>

          {/* Skeleton Monitor */}
          <div className="relative w-48 h-36 bg-black/60 border border-gray-700 rounded-lg overflow-hidden backdrop-blur-sm shadow-[0_0_10px_rgba(0,255,0,0.2)]">
            <canvas ref={canvasRef} width={320} height={240} className="w-full h-full opacity-90" />
            <div className="absolute top-1 left-2 text-[10px] text-green-500/80 font-mono tracking-widest">LIVE FEED</div>
            
            {/* Dynamic Status Text */}
            <div className={`absolute bottom-1 right-2 text-[10px] font-mono font-bold ${landmarks ? 'text-green-400 animate-pulse' : 'text-yellow-500'}`}>
              {landmarks ? 'HAND DETECTED' : 'SEARCHING...'}
            </div>
          </div>
        </div>

        {/* Right Side: Instructions */}
        <div className="hidden md:block text-right text-gray-500 text-sm font-serif-display">
          <p>Gesture Control Active</p>
          <p>Spread fingers to explode • Fist to build tree</p>
        </div>
      </div>
    </div>
  );
};