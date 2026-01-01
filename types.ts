import { Vector3 } from 'three';

export enum WeaponMode {
  PUNCH = 'PUNCH',
  GUN = 'GUN',
}

export type GameState = {
  health: number;
  mode: WeaponMode;
  inCar: boolean;
  activeVehicleId: string | null;
  interactionText: string | null;
  dayNight: 'day' | 'night';
  showHelp: boolean;
  
  // NPC State Map (id -> health)
  npcHealths: Record<string, number>;
  
  // Actions
  setHealth: (h: number) => void;
  setMode: (m: WeaponMode) => void;
  enterVehicle: (id: string) => void;
  exitVehicle: () => void;
  setInteractionText: (t: string | null) => void;
  toggleDayNight: () => void;
  toggleHelp: () => void;
  
  // Combat
  registerNpc: (id: string, initialHealth: number) => void;
  damageNpc: (id: string, amount: number) => void;
};
