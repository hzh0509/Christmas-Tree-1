import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { GestureType } from '../types';

export const HandController: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setGesture, setLandmarks, setVideoElement } = useGame();
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (videoRef.current) {
      setVideoElement(videoRef.current);
    }
  }, [setVideoElement]);

  useEffect(() => {
    const Hands = (window as any).Hands;

    if (!Hands) {
      console.error("MediaPipe Hands script not loaded. Check index.html");
      return;
    }

    const hands = new Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults((results: any) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        setLandmarks(landmarks);
        
        const detectedGesture = detectGesture(landmarks);
        setGesture(detectedGesture);
      } else {
        setLandmarks(null);
        setGesture(GestureType.IDLE);
      }
    });

    const onFrame = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        try {
          if (videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
             await hands.send({ image: videoRef.current });
          }
        } catch (e) {
          console.error("MediaPipe processing error:", e);
        }
      }
      requestRef.current = requestAnimationFrame(onFrame);
    };

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error("Browser API unavailable");
          return;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
             videoRef.current?.play().then(() => {
                requestRef.current = requestAnimationFrame(onFrame);
             }).catch(e => console.error("Video play error:", e));
          };
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startCamera();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      try { hands.close(); } catch(e) {}
    };
  }, [setGesture, setLandmarks]);

  return (
    <video 
      ref={videoRef} 
      className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none"
      playsInline
      muted
      width="640"
      height="480"
    />
  );
};

// Improved Gesture Detection Logic
function detectGesture(landmarks: any[]): GestureType {
  const wrist = landmarks[0];
  const tips = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky
  
  let extendedFingers = 0;

  // Check 4 fingers
  tips.forEach(tipIdx => {
    const pipIdx = tipIdx - 2; // PIP joint
    const mcpIdx = tipIdx - 3; // MCP joint
    
    // Calculate distance from wrist
    const tipDist = dist(landmarks[tipIdx], wrist);
    const pipDist = dist(landmarks[pipIdx], wrist);
    
    // If tip is further from wrist than PIP is, it is likely extended.
    // Removed the "0.05" buffer to allow detection at further distances.
    if (tipDist > pipDist) {
      extendedFingers++;
    }
  });

  // Thumb Check
  // Compare Thumb Tip (4) distance to wrist vs Thumb IP (3) distance to wrist
  const thumbTip = 4;
  const thumbIp = 3;
  if (dist(landmarks[thumbTip], wrist) > dist(landmarks[thumbIp], wrist)) {
     extendedFingers++;
  }

  // Logic mapping
  // 0-1 fingers extended = Fist (Tree)
  if (extendedFingers <= 1) return GestureType.FIST;
  
  // 4-5 fingers extended = Open Palm (Explode)
  if (extendedFingers >= 4) return GestureType.OPEN_PALM;

  return GestureType.IDLE;
}

function dist(p1: any, p2: any) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}