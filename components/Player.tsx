import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useRapier, RigidBody, CapsuleCollider, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useInput } from '../utils/input';
import { useGameStore } from '../store';
import { WeaponMode } from '../types';

const PLAYER_SPEED = 6;
const RUN_SPEED = 10;

export const Player = () => {
  const body = useRef<RapierRigidBody>(null);
  const mesh = useRef<THREE.Group>(null);
  const { camera } = useThree(); 
  const input = useInput();
  const { world, rapier } = useRapier();
  const lastActionTime = useRef(0);
  
  const { 
    mode, setMode, 
    setInteractionText, 
    inCar, enterVehicle, exitVehicle,
    toggleDayNight, toggleHelp,
    damageNpc
  } = useGameStore();

  const [attackAnim, setAttackAnim] = useState(0);

  // --- ONE-SHOT INPUTS ---
  useEffect(() => {
    if (input.mode1) setMode(WeaponMode.PUNCH);
    if (input.mode2) setMode(WeaponMode.GUN);
    if (input.night) toggleDayNight();
    if (input.help) toggleHelp();
  }, [input.mode1, input.mode2, input.night, input.help, setMode, toggleDayNight, toggleHelp]);

  useFrame((state, delta) => {
    if (!body.current || !mesh.current) return;

    // 1. CAR MODE: Hide Player & Handle Exit
    if (inCar) {
      // Keep player hidden
      body.current.setTranslation({ x: 0, y: -200, z: 0 }, true);
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);

      // Handle Exit with Debounce
      if (input.action && Date.now() - lastActionTime.current > 500) {
        lastActionTime.current = Date.now();
        exitVehicle();
        
        // Teleport player to safe spot near camera
        const camPos = camera.position;
        const spawnDir = new THREE.Vector3();
        camera.getWorldDirection(spawnDir);
        spawnDir.y = 0;
        spawnDir.normalize();
        
        // Spawn 3 units in front of camera, slightly above ground (y=2)
        body.current.setTranslation({ 
          x: camPos.x + spawnDir.x * 3, 
          y: 2, 
          z: camPos.z + spawnDir.z * 3 
        }, true);
        body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }
      return; 
    }

    const pos = body.current.translation();
    const vel = body.current.linvel();

    // 2. INTERACTION (Physics Proximity)
    let foundInteractable = false;
    
    // Only check if we are NOT in cooldown
    if (Date.now() - lastActionTime.current > 500) {
      const interactionShape = new THREE.Sphere(new THREE.Vector3(pos.x, pos.y, pos.z), 3.0);
      
      world.intersectionsWithShape(interactionShape.center, new THREE.Quaternion(), new rapier.Ball(3.0), (collider) => {
          const parent = collider.parent();
          if (parent && parent.userData) {
              const data = parent.userData as any;
              if (data.type === 'vehicle' && data.id) {
                  foundInteractable = true;
                  setInteractionText(`Press E to Drive`);
                  
                  if (input.action) {
                      lastActionTime.current = Date.now();
                      enterVehicle(data.id);
                      return false; // Stop iterating
                  }
              }
          }
          return true;
      });
    }

    if (!foundInteractable) {
        setInteractionText(null);
    }

    // 3. MOVEMENT
    const speed = input.shift ? RUN_SPEED : PLAYER_SPEED;
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, Number(input.backward) - Number(input.forward));
    const sideVector = new THREE.Vector3(Number(input.left) - Number(input.right), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed)
      .applyEuler(camera.rotation);

    body.current.setLinvel({ x: direction.x, y: vel.y, z: direction.z }, true);

    if (input.aim) {
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      camDir.y = 0; 
      camDir.normalize();
      const targetRot = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), camDir);
      mesh.current.quaternion.slerp(targetRot, 0.2);
    } else if (direction.length() > 0.1) {
      const angle = Math.atan2(direction.x, direction.z);
      const targetRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      mesh.current.quaternion.slerp(targetRot, 0.2);
    }

    // 4. COMBAT
    if (attackAnim > 0) setAttackAnim(Math.max(0, attackAnim - delta * 5));

    if (input.attack && attackAnim === 0 && !inCar) {
      setAttackAnim(1);
      
      const isPunch = mode === WeaponMode.PUNCH;
      const range = isPunch ? 3.0 : 60.0;
      
      const rayOrigin = new THREE.Vector3(pos.x, pos.y + 1.6, pos.z);
      const rayDir = new THREE.Vector3(0, 0, 1).applyQuaternion(mesh.current.quaternion);
      if (input.aim) camera.getWorldDirection(rayDir);

      const ray = new rapier.Ray(rayOrigin, rayDir);
      const hit = world.castRay(ray, range, true, undefined, undefined, undefined, body.current); 
      
      if (hit && hit.collider) {
         const parent = hit.collider.parent();
         if (parent && parent.handle !== body.current.handle) {
             if (parent.userData && (parent.userData as any).type === 'npc') {
                 damageNpc((parent.userData as any).id, isPunch ? 25 : 40);
             }
         }
      }
    }
  });

  const armRotation = attackAnim > 0 
    ? (mode === WeaponMode.PUNCH ? -Math.PI / 2 + Math.sin(attackAnim * Math.PI) * 2 : -Math.PI / 2) 
    : (input.aim && mode === WeaponMode.GUN ? -Math.PI / 2 : 0);
    
  const recoil = (attackAnim > 0 && mode === WeaponMode.GUN) ? 0.2 : 0;

  return (
    <RigidBody 
      ref={body} 
      colliders={false} 
      type="dynamic" 
      position={[0, 5, 0]} 
      enabledRotations={[false, false, false]}
      friction={0}
      lockRotations
    >
      <CapsuleCollider args={[0.75, 0.4]} position={[0, 1.15, 0]} />
      {/* Name this group PLAYER for CameraController */}
      <group ref={mesh} name="PLAYER">
        {/* Visuals */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.5, 0.7, 0.3]} />
          <meshStandardMaterial color="#0ea5e9" />
        </mesh>
        
        <mesh position={[0, 1.65, 0]} castShadow>
          <boxGeometry args={[0.25, 0.3, 0.25]} />
          <meshStandardMaterial color="#ffccaa" />
        </mesh>
        
        <mesh position={[-0.15, 0.4, 0]} castShadow>
          <boxGeometry args={[0.18, 0.8, 0.2]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.15, 0.4, 0]} castShadow>
          <boxGeometry args={[0.18, 0.8, 0.2]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        <group position={[0.35, 1.3, 0]} rotation={[armRotation - recoil, 0, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.15, 0.7, 0.15]} />
            <meshStandardMaterial color="#0ea5e9" />
          </mesh>
          <mesh position={[0, -0.7, 0]}>
             <boxGeometry args={[0.12, 0.15, 0.12]} />
             <meshStandardMaterial color="#ffccaa" />
          </mesh>
          {mode === WeaponMode.GUN && (
             <mesh position={[0, -0.8, 0.2]} rotation={[Math.PI/2, 0, 0]}>
               <boxGeometry args={[0.08, 0.4, 0.1]} />
               <meshStandardMaterial color="#333" />
             </mesh>
          )}
        </group>

        <group position={[-0.35, 1.3, 0]} rotation={[input.forward ? 0.5 : 0, 0, 0]}>
           <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.15, 0.7, 0.15]} />
            <meshStandardMaterial color="#0ea5e9" />
          </mesh>
           <mesh position={[0, -0.7, 0]}>
             <boxGeometry args={[0.12, 0.15, 0.12]} />
             <meshStandardMaterial color="#ffccaa" />
          </mesh>
        </group>
      </group>
    </RigidBody>
  );
};