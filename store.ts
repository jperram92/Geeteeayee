import { create } from 'zustand';
import { GameState, WeaponMode } from './types';

export const useGameStore = create<GameState>((set) => ({
  health: 100,
  mode: WeaponMode.PUNCH,
  inCar: false,
  activeVehicleId: null,
  interactionText: null,
  dayNight: 'day',
  showHelp: true,
  npcHealths: {},

  setHealth: (health) => set({ health }),
  setMode: (mode) => set({ mode }),
  
  enterVehicle: (id) => set({ inCar: true, activeVehicleId: id }),
  exitVehicle: () => set({ inCar: false, activeVehicleId: null }),
  
  setInteractionText: (text) => set({ interactionText: text }),
  toggleDayNight: () => set((state) => ({ dayNight: state.dayNight === 'day' ? 'night' : 'day' })),
  toggleHelp: () => set((state) => ({ showHelp: !state.showHelp })),

  registerNpc: (id, initialHealth) => set((state) => ({
    npcHealths: { ...state.npcHealths, [id]: initialHealth }
  })),

  damageNpc: (id, amount) => set((state) => {
    const current = state.npcHealths[id];
    if (current === undefined || current <= 0) return state;
    return {
      npcHealths: { ...state.npcHealths, [id]: Math.max(0, current - amount) }
    };
  }),
}));
