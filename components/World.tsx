import React, { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Instance, Instances, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';

export const Ground = () => {
  return (
    <group>
       <RigidBody type="fixed" colliders="cuboid" friction={2}>
        {/* Main Road/Asphalt */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[500, 500]} />
          <meshStandardMaterial color="#1e1e24" roughness={0.9} />
        </mesh>
        
        {/* Beach Sand */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[80, -0.05, 0]} receiveShadow>
          <planeGeometry args={[100, 500]} />
          <meshStandardMaterial color="#e6c288" roughness={1} />
        </mesh>
      </RigidBody>

      {/* Road Markings (Visual Only) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
         <planeGeometry args={[2, 500]} />
         <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-20, 0, 0]}>
         <planeGeometry args={[1, 500]} />
         <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
      </mesh>
    </group>
  );
};

export const Ocean = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[200, -1.5, 0]}>
      <planeGeometry args={[250, 1000]} />
      <meshStandardMaterial 
        color="#06b6d4" 
        roughness={0.1} 
        metalness={0.5} 
        transparent 
        opacity={0.9} 
      />
    </mesh>
  );
};

const BUILDING_COLORS = ["#f472b6", "#22d3ee", "#facc15", "#c084fc", "#ffffff"];

export const Buildings = () => {
  const buildings = useMemo(() => {
    const items: any[] = [];
    for (let i = 0; i < 30; i++) {
      const width = 10 + Math.random() * 15;
      const depth = 10 + Math.random() * 15;
      const height = 20 + Math.random() * 40;
      // Scatter them on the left side of the road
      const x = -50 - Math.random() * 80;
      const z = (Math.random() - 0.5) * 400;
      items.push({ 
        position: [x, height / 2, z], 
        args: [width, height, depth], 
        color: BUILDING_COLORS[Math.floor(Math.random() * BUILDING_COLORS.length)] 
      });
    }
    return items;
  }, []);

  return (
    <>
      {buildings.map((b, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={b.position}>
          <group>
            <mesh castShadow receiveShadow>
              <boxGeometry args={b.args} />
              <meshStandardMaterial color={b.color} roughness={0.2} />
            </mesh>
            {/* Windows Pattern */}
            <mesh position={[b.args[0]/2 + 0.1, 0, 0]} rotation={[0, Math.PI/2, 0]}>
               <planeGeometry args={[b.args[2] - 2, b.args[1] - 2]} />
               <meshStandardMaterial color="#000" emissive="#111" />
            </mesh>
            {/* Neon Accent */}
            <mesh position={[0, b.args[1]/2 - 1, b.args[2]/2 + 0.1]}>
              <boxGeometry args={[b.args[0], 0.5, 0.2]} />
              <meshBasicMaterial color={b.color} toneMapped={false} />
            </mesh>
          </group>
        </RigidBody>
      ))}
    </>
  );
};

export const Palms = () => {
  const palms = useMemo(() => {
    const items: any[] = [];
    // Line the beach transition
    for (let i = -15; i < 15; i++) {
      items.push([30 + Math.random() * 5, 0, i * 15 + Math.random() * 5]);
    }
    return items;
  }, []);

  return (
    <group>
      {palms.map((pos, i) => (
        <group key={i} position={pos}>
          <RigidBody type="fixed" colliders="hull">
            <mesh position={[0, 2.5, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.3, 5, 8]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          </RigidBody>
          {/* Leaves */}
          <group position={[0, 5, 0]}>
             {[0, 1, 2, 3, 4].map(r => (
               <mesh key={r} rotation={[0, r * (Math.PI*2/5), 0.5]} position={[0, 0, 0]}>
                 <coneGeometry args={[0.8, 3, 4]} />
                 <meshStandardMaterial color="#4ade80" />
               </mesh>
             ))}
          </group>
        </group>
      ))}
    </group>
  );
};

export const Lighting = ({ isNight }: { isNight: boolean }) => {
  return (
    <>
      <ambientLight intensity={isNight ? 0.3 : 0.7} color={isNight ? "#4c1d95" : "#ffffff"} />
      {isNight ? (
        <>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          {/* Purple/Pink Haze */}
          <fog attach="fog" args={['#2e1065', 5, 80]} />
          <pointLight position={[0, 10, 0]} intensity={1} color="#d946ef" distance={50} />
          <directionalLight position={[-50, 50, -50]} intensity={0.5} color="#4c1d95" />
        </>
      ) : (
        <>
          <Sky sunPosition={[100, 20, 100]} />
          <directionalLight 
            position={[50, 50, 25]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
          >
             <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50]} />
          </directionalLight>
          <fog attach="fog" args={['#bae6fd', 10, 150]} />
        </>
      )}
    </>
  );
};
