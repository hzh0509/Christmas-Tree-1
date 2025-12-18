export enum GestureType {
  IDLE = 'IDLE',
  OPEN_PALM = 'EXPLODE',
  FIST = 'TREE'
}

export interface ParticleData {
  id: number;
  initialPos: [number, number, number];
  color: string;
  scale: number;
  phase: number;
}
