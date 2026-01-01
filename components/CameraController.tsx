import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';

export const CameraController = () => {
  const { scene, controls } = useThree();
  const { inCar, activeVehicleId } = useGameStore();
  
  // Reusable vectors to reduce GC
  const targetPos = new THREE.Vector3();

  useFrame((state, delta) => {
    if (!controls) return;

    let target: THREE.Object3D | undefined;

    if (inCar && activeVehicleId) {
      // Find the specific vehicle by its unique name
      target = scene.getObjectByName(`VEHICLE_${activeVehicleId}`);
    } else {
      // Find player
      target = scene.getObjectByName('PLAYER');
    }

    if (target) {
      // Get world position of the target
      target.getWorldPosition(targetPos);
      
      // Offset target slightly up
      targetPos.y += inCar ? 1.0 : 1.5;

      const ctrl = controls as any;
      
      // Smoothly move the camera look-at target
      // We use a faster lerp for responsiveness
      ctrl.target.lerp(targetPos, 5 * delta);
      
      // Update the controls logic
      ctrl.update();
    }
  });

  return null;
};
