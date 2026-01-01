import React from 'react';
import { useGameStore } from '../store';

export const UI = () => {
  const { health, mode, inCar, interactionText, showHelp } = useGameStore();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Help Overlay */}
      {showHelp && (
        <div className="absolute top-4 right-4 bg-black/70 text-white p-4 rounded max-w-sm backdrop-blur-sm">
          <h2 className="font-bold mb-2 text-cyan-400">CONTROLS (Toggle H)</h2>
          <ul className="text-sm space-y-1">
            <li><span className="font-mono text-yellow-300">WASD</span> Move / Drive</li>
            <li><span className="font-mono text-yellow-300">SHIFT</span> Run</li>
            <li><span className="font-mono text-yellow-300">MOUSE</span> Camera Orbit</li>
            <li><span className="font-mono text-yellow-300">R-CLICK</span> Aim Mode</li>
            <li><span className="font-mono text-yellow-300">L-CLICK</span> Attack</li>
            <li><span className="font-mono text-yellow-300">E</span> Enter/Exit Car</li>
            <li><span className="font-mono text-yellow-300">1 / 2</span> Switch Weapon</li>
            <li><span className="font-mono text-yellow-300">N</span> Toggle Day/Night</li>
          </ul>
        </div>
      )}

      {/* Interaction Prompt */}
      {interactionText && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-12">
          <div className="bg-black/80 text-white px-4 py-2 rounded font-bold border border-white animate-pulse">
            {interactionText}
          </div>
        </div>
      )}

      {/* Crosshair (Aim Mode) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_4px_#fff]" />
      </div>

      {/* HUD Bottom Left */}
      <div className="absolute bottom-8 left-8 flex flex-col gap-2">
        {/* Health */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 flex items-center justify-center rounded font-bold text-white">HP</div>
          <div className="w-48 h-4 bg-gray-800 border border-gray-600 skew-x-[-12deg]">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300" 
              style={{ width: `${health}%` }}
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-black/60 backdrop-blur-md p-3 rounded-tr-xl border-l-4 border-cyan-400 text-white w-64">
           <div className="flex justify-between items-baseline">
             <span className="text-sm text-gray-300">MODE</span>
             <span className="font-bold text-cyan-300">{mode}</span>
           </div>
           <div className="flex justify-between items-baseline">
             <span className="text-sm text-gray-300">STATUS</span>
             <span className="font-bold text-yellow-300">{inCar ? 'DRIVING' : 'ON FOOT'}</span>
           </div>
        </div>
      </div>
    </div>
  );
};
