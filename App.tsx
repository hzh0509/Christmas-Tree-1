import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { HandController } from './components/HandController';
import { WelcomeOverlay } from './components/WelcomeOverlay';
import { UIInterface } from './components/UIInterface';
import { GameProvider } from './context/GameContext';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <GameProvider>
      <div className="relative w-full h-screen bg-black overflow-hidden">
        {/* 3D Scene Background - Always mounted to preload/warmup, but hidden if not started if desired, 
            though keeping it visible behind welcome looks cool */}
        {hasStarted && (
          <div className="absolute inset-0 z-0">
            <Scene />
          </div>
        )}

        {/* Hand Controller (Camera & Logic) - Active only after start */}
        {hasStarted && <HandController />}

        {/* UI Overlay (Title, Status, Camera View) */}
        {hasStarted && <UIInterface />}

        {/* Welcome Screen */}
        {!hasStarted && <WelcomeOverlay onStart={() => setHasStarted(true)} />}
      </div>
    </GameProvider>
  );
};

export default App;