import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Particles } from './Particles';
import { useGame } from '../context/GameContext';
import { GestureType } from '../types';
import * as THREE from 'three';

// Fix for missing R3F JSX Intrinsic Elements types in some environments
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      icosahedronGeometry: any;
      meshStandardMaterial: any;
      pointLight: any;
      ambientLight: any;
      directionalLight: any;
      color: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      icosahedronGeometry: any;
      meshStandardMaterial: any;
      pointLight: any;
      ambientLight: any;
      directionalLight: any;
      color: any;
    }
  }
}

const ChristmasStar: React.FC = () => {
  const { gesture } = useGame();
  const ref = useRef<THREE.Group>(null);
  const isTree = gesture === GestureType.FIST;

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
      
      const targetScale = isTree ? 1.0 : 0;
      ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group ref={ref} position={[0, 11.5, 0]}>
      <mesh>
        <icosahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial 
          color="#FFD700" 
          emissive="#FFD700"
          emissiveIntensity={4}
          toneMapped={false}
        />
      </mesh>
      
      <mesh scale={[1.4, 1.4, 1.4]} rotation={[0.5, 0, 0]}>
         <icosahedronGeometry args={[1.2, 0]} />
         <meshStandardMaterial 
            color="#FFA500"
            transparent
            opacity={0.3}
            emissive="#FFA500"
            emissiveIntensity={2}
            toneMapped={false}
         />
      </mesh>

      <pointLight color="#FFD700" intensity={isTree ? 10 : 0} distance={30} decay={2} />
    </group>
  );
};

export const Scene: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 35], fov: 60 }}
      gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
      dpr={[1, 2]} 
    >
      <color attach="background" args={['#000000']} />
      
      <OrbitControls 
        enablePan={false} 
        minDistance={20} 
        maxDistance={50} 
        autoRotate={false}
        enableZoom={true}
      />

      {/* 
        LIGHTING SETUP
        Changed from colored lights (Red/Green) to White/Warm lights.
        This fixes the "Purple Tree" issue by allowing the green particle color to show naturally.
      */}
      <ambientLight intensity={0.4} />
      
      {/* Main Warm Light */}
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#fff8e7" />
      
      {/* Fill Light (Cooler) */}
      <directionalLight position={[-10, 0, 10]} intensity={0.8} color="#e7f8ff" />
      
      {/* Backlight for edge definition */}
      <pointLight position={[0, 10, -10]} intensity={1} color="#ffffff" />

      <Particles />
      <ChristmasStar />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <EffectComposer enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={1.1} 
          mipmapBlur 
          intensity={1.0} 
          radius={0.6}
        />
      </EffectComposer>
    </Canvas>
  );
};