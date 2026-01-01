import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { OrbitControls, KeyboardControls } from '@react-three/drei';
import { Ground, Ocean, Buildings, Palms, Lighting } from './components/World';
import { Player } from './components/Player';
import { Vehicle } from './components/Vehicle';
import { NPC } from './components/Npc';
import { UI } from './components/UI';
import { CameraController } from './components/CameraController';
import { useGameStore } from './store';

// Keyboard map
const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
  { name: 'run', keys: ['Shift'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'action', keys: ['e', 'E'] },
];

const GameScene = () => {
  const { dayNight } = useGameStore();
  const isNight = dayNight === 'night';

  return (
    <>
      <Lighting isNight={isNight} />
      
      {/* Physics World */}
      <Physics gravity={[0, -9.81, 0]}>
        <Ground />
        <Ocean />
        <Buildings />
        <Palms />
        
        {/* Entities */}
        <Player />
        <Vehicle position={[-5, 2, 10]} color="#ff00ff" />
        <Vehicle position={[15, 2, -20]} color="#00ffff" />
        <Vehicle position={[-20, 2, -40]} color="#ffff00" />
        
        <NPC position={[5, 1, 5]} />
        <NPC position={[-10, 1, 15]} />
        <NPC position={[20, 1, 0]} />
        <NPC position={[0, 1, -20]} />
        <NPC position={[-15, 1, -10]} />
      </Physics>

      {/* Logic */}
      <CameraController />

      {/* Default controls - CameraController manipulates the target of this */}
      <OrbitControls 
        makeDefault 
        enablePan={false} 
        enableZoom={true} 
        maxPolarAngle={Math.PI / 2 - 0.1}
        minDistance={3}
        maxDistance={12}
      />
    </>
  );
};

const App = () => {
  return (
    <div className="w-full h-full relative bg-gray-900">
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
          <Suspense fallback={null}>
            <GameScene />
          </Suspense>
        </Canvas>
        <UI />
      </KeyboardControls>
    </div>
  );
};

export default App;
