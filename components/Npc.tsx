import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';

export const NPC = ({ position }: { position: [number, number, number] }) => {
  const body = useRef<RapierRigidBody>(null);
  const id = useMemo(() => `npc_${Math.random().toString(36).substr(2, 9)}`, []);
  
  const { registerNpc, npcHealths } = useGameStore();
  const [state, setState] = useState<'wander' | 'chase' | 'dead'>('wander');
  
  useEffect(() => {
    registerNpc(id, 100);
  }, [id, registerNpc]);

  const health = npcHealths[id] ?? 100;
  const isDead = health <= 0;

  useEffect(() => {
    if (isDead) setState('dead');
  }, [isDead]);
  
  const wanderTarget = useRef(new THREE.Vector3(
    position[0] + (Math.random() - 0.5) * 20,
    position[1],
    position[2] + (Math.random() - 0.5) * 20
  ));

  useFrame((ctx, delta) => {
    if (!body.current) return;
    
    if (isDead) {
      // Simple death handling
      return;
    }

    const pos = body.current.translation();
    const currentPos = new THREE.Vector3(pos.x, pos.y, pos.z);
    
    // AI: Simple Wander
    let target = wanderTarget.current;
    let speed = 2;
    
    if (currentPos.distanceTo(target) < 1.5) {
       wanderTarget.current.set(
          pos.x + (Math.random() - 0.5) * 30,
          pos.y,
          pos.z + (Math.random() - 0.5) * 30
       );
    }
    
    const dir = new THREE.Vector3().subVectors(target, currentPos).normalize();
    const move = dir.multiplyScalar(speed);
    body.current.setLinvel({ x: move.x, y: body.current.linvel().y, z: move.z }, true);
    
    if (move.length() > 0.1) {
      const angle = Math.atan2(move.x, move.z);
      const rot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), angle);
      body.current.setRotation(rot, true);
    }
  });

  const skinColor = isDead ? "#111111" : "#e11d48";

  return (
    <RigidBody 
      ref={body} 
      position={position} 
      colliders={false} 
      type="dynamic" 
      lockRotations 
      userData={{ type: 'npc', id }}
    >
       <CapsuleCollider args={[0.5, 0.4]} position={[0, 0.9, 0]} />
       
       <group rotation={[isDead ? -Math.PI/2 : 0, 0, 0]} position={[0, isDead ? 0.2 : 0, 0]}>
          {/* Torso */}
          <mesh position={[0, 0.9, 0]} castShadow>
             <boxGeometry args={[0.45, 0.7, 0.25]} />
             <meshStandardMaterial color={skinColor} />
          </mesh>
          
          {/* Head */}
          <mesh position={[0, 1.45, 0]} castShadow>
             <boxGeometry args={[0.25, 0.3, 0.25]} />
             <meshStandardMaterial color="#fca5a5" />
          </mesh>
          
          {/* Arms */}
          <mesh position={[-0.3, 0.9, 0]} castShadow>
             <boxGeometry args={[0.15, 0.7, 0.15]} />
             <meshStandardMaterial color={skinColor} />
          </mesh>
          <mesh position={[0.3, 0.9, 0]} castShadow>
             <boxGeometry args={[0.15, 0.7, 0.15]} />
             <meshStandardMaterial color={skinColor} />
          </mesh>
          
          {/* Legs */}
          <mesh position={[-0.12, 0.35, 0]} castShadow>
             <boxGeometry args={[0.18, 0.7, 0.18]} />
             <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0.12, 0.35, 0]} castShadow>
             <boxGeometry args={[0.18, 0.7, 0.18]} />
             <meshStandardMaterial color="#1e293b" />
          </mesh>
       </group>

       {!isDead && (
         <Html position={[0, 2.2, 0]} center distanceFactor={10}>
           <div className="w-16 h-2 bg-gray-800 border border-white/50">
              <div 
                className="h-full bg-green-500 transition-all duration-200" 
                style={{ width: `${health}%` }}
              ></div>
           </div>
         </Html>
       )}
    </RigidBody>
  );
};
