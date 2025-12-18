import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GestureType } from '../types';

interface GameContextType {
  gesture: GestureType;
  setGesture: (g: GestureType) => void;
  landmarks: any;
  setLandmarks: (l: any) => void;
  videoElement: HTMLVideoElement | null;
  setVideoElement: (v: HTMLVideoElement | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gesture, setGesture] = useState<GestureType>(GestureType.IDLE);
  const [landmarks, setLandmarks] = useState<any>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  return (
    <GameContext.Provider value={{ gesture, setGesture, landmarks, setLandmarks, videoElement, setVideoElement }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};