import React, { useRef, useMemo, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGame } from '../context/GameContext';
import { GestureType } from '../types';

// Fix for missing R3F JSX Intrinsic Elements types in some environments
declare global {
  namespace JSX {
    interface IntrinsicElements {
      instancedMesh: any;
      dodecahedronGeometry: any;
      meshStandardMaterial: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      instancedMesh: any;
      dodecahedronGeometry: any;
      meshStandardMaterial: any;
    }
  }
}

const COUNT = 6000; // Increased count for density
const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

export const Particles: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { gesture } = useGame();

  const { treePositions, nebulaPositions, colors, scales, phases, types } = useMemo(() => {
    const tPos = new Float32Array(COUNT * 3);
    const nPos = new Float32Array(COUNT * 3);
    const c = new Float32Array(COUNT * 3);
    const s = new Float32Array(COUNT);
    const p = new Float32Array(COUNT);
    const typeArr = new Uint8Array(COUNT); // 0 = Trunk, 1 = Leaf, 2 = Light

    for (let i = 0; i < COUNT; i++) {
      const isTrunk = i < COUNT * 0.08; // 8% Trunk
      let tx, ty, tz;

      if (isTrunk) {
        // Trunk: Cylinder
        const h = -14 + Math.random() * 9; // -14 to -5
        const theta = Math.random() * Math.PI * 2;
        // Concentrate trunk density
        const r = Math.random() * 1.5;
        tx = Math.cos(theta) * r;
        tz = Math.sin(theta) * r;
        ty = h;
        typeArr[i] = 0;
      } else {
        // Tree Body: Cone
        // Height from -10 to 12
        const h = -10 + Math.random() * 22;
        
        // Radius tapers as we go up
        // Base radius approx 9, Top radius 0
        const coneProgress = (h + 10) / 22;
        const maxR = 9 * (1 - coneProgress);

        // Volumetric distribution (Square root ensures uniform surface density)
        // Without sqrt, points cluster in the center, making the tree look thin/loose.
        const r = maxR * Math.sqrt(Math.random()); 
        
        // Golden Angle for distribution
        const theta = i * 2.39996;
        
        tx = Math.cos(theta) * r;
        tz = Math.sin(theta) * r;
        ty = h;
        
        // 15% Ornaments
        typeArr[i] = Math.random() < 0.15 ? 2 : 1; 
      }

      tPos[i * 3] = tx;
      tPos[i * 3 + 1] = ty;
      tPos[i * 3 + 2] = tz;

      // Nebula: Spiral Galaxy
      const spiralRadius = 5 + Math.random() * 25;
      const spiralAngle = i * 0.1 + (spiralRadius * 0.2);
      const nx = Math.cos(spiralAngle) * spiralRadius;
      const nz = Math.sin(spiralAngle) * spiralRadius;
      const ny = (Math.random() - 0.5) * 8;
      nPos[i * 3] = nx;
      nPos[i * 3 + 1] = ny;
      nPos[i * 3 + 2] = nz;

      // --- COLORS ---
      let scale = 0.2;
      
      if (typeArr[i] === 0) { // TRUNK (Brown)
        // Hue 25-35 (Browns)
        tempColor.setHSL(0.08, 0.5, 0.2 + Math.random() * 0.1); 
        scale = 0.25 + Math.random() * 0.1;
      } 
      else if (typeArr[i] === 1) { // LEAF (Green)
        // Forest Green: Hue 120-140. 
        // L > 0.2 to be visible against black background
        tempColor.setHSL(0.33 + Math.random() * 0.05, 0.8, 0.25 + Math.random() * 0.2);
        scale = 0.2 + Math.random() * 0.15;
      } 
      else { // LIGHT (HDR)
        const lightType = Math.random();
        if (lightType < 0.3) tempColor.setHSL(0.12, 1, 0.5).multiplyScalar(10); // Gold
        else if (lightType < 0.6) tempColor.setHSL(0.0, 1, 0.5).multiplyScalar(10); // Red
        else if (lightType < 0.8) tempColor.setHSL(0.6, 1, 0.6).multiplyScalar(8); // Blue
        else tempColor.setHSL(0.8, 1, 0.6).multiplyScalar(8); // Purple
        scale = 0.35 + Math.random() * 0.2;
      }

      c[i * 3] = tempColor.r;
      c[i * 3 + 1] = tempColor.g;
      c[i * 3 + 2] = tempColor.b;
      s[i] = scale;
      p[i] = Math.random() * Math.PI * 2;
    }

    return { treePositions: tPos, nebulaPositions: nPos, colors: c, scales: s, phases: p, types: typeArr };
  }, []);

  const currentPositions = useRef(new Float32Array(nebulaPositions));

  useLayoutEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < COUNT; i++) {
        tempColor.setRGB(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
        meshRef.current.setColorAt(i, tempColor);
      }
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [colors]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const isTree = gesture === GestureType.FIST;
    const isExplode = gesture === GestureType.OPEN_PALM;
    const lerpSpeed = isTree ? 0.08 : (isExplode ? 0.05 : 0.02);
    const targetArray = isTree ? treePositions : nebulaPositions;

    for (let i = 0; i < COUNT; i++) {
      const idx = i * 3;
      const type = types[i];
      
      let tx = targetArray[idx];
      let ty = targetArray[idx + 1];
      let tz = targetArray[idx + 2];

      if (isTree) {
        if (type !== 0) {
            // Spin the tree
            const rot = time * 0.2;
            const x = tx; const z = tz;
            tx = x * Math.cos(rot) - z * Math.sin(rot);
            tz = x * Math.sin(rot) + z * Math.cos(rot);
        }
      } else {
        // Nebula motion
        const rotSpeed = 0.05;
        const rot = time * rotSpeed;
        const x = tx; const z = tz;
        tx = x * Math.cos(rot) - z * Math.sin(rot);
        tz = x * Math.sin(rot) + z * Math.cos(rot);
        ty += Math.sin(time + x * 0.2) * 0.5;
      }

      currentPositions.current[idx] += (tx - currentPositions.current[idx]) * lerpSpeed;
      currentPositions.current[idx + 1] += (ty - currentPositions.current[idx + 1]) * lerpSpeed;
      currentPositions.current[idx + 2] += (tz - currentPositions.current[idx + 2]) * lerpSpeed;

      tempObject.position.set(currentPositions.current[idx], currentPositions.current[idx + 1], currentPositions.current[idx + 2]);
      
      let scale = scales[i];
      // Twinkle
      if (type === 2) {
        const blink = Math.sin(time * 3 + phases[i]);
        scale = scales[i] * (1 + (blink > 0.0 ? 0.4 : 0));
      } 
      if (isExplode) scale *= 1.2;

      tempObject.scale.set(scale, scale, scale);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <dodecahedronGeometry args={[0.2, 0]} />
      {/* 
        Material Adjustment:
        - roughness: 0.7 (More diffuse, less glossy)
        - metalness: 0.1 (Plastic/Wood/Leaf-like, not metallic)
        This ensures the Green colors are visible and not just reflecting the scene lights.
      */}
      <meshStandardMaterial 
        color="#ffffff" 
        roughness={0.7}
        metalness={0.1}
        toneMapped={false}
      />
    </instancedMesh>
  );
};