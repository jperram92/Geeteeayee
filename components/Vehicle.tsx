import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '../store';
import { useInput } from '../utils/input';
import * as THREE from 'three';

type VehicleProps = {
  position: [number, number, number];
  color: string;
};

export const Vehicle = ({ position, color }: VehicleProps) => {
  const body = useRef<RapierRigidBody>(null);
  
  // Visual refs for animation
  const chassis = useRef<THREE.Group>(null);
  const wheels = [
    useRef<THREE.Group>(null), // FL
    useRef<THREE.Group>(null), // FR
    useRef<THREE.Group>(null), // BL
    useRef<THREE.Group>(null)  // BR
  ];

  const vehicleId = useMemo(() => `car_${Math.random().toString(36).substr(2, 9)}`, []);
  
  const { activeVehicleId, inCar } = useGameStore();
  const input = useInput();

  const isDriven = inCar && activeVehicleId === vehicleId;

  // Smoothing values
  const currentSteering = useRef(0);

  // Sync userData
  useEffect(() => {
    if (body.current) {
      body.current.userData = { type: 'vehicle', id: vehicleId };
    }
  }, [vehicleId]);

  useFrame((state, delta) => {
    if (!body.current) return;

    // --- PHYSICS & LOGIC ---
    
    // Wake up physics if driving
    if (isDriven) body.current.wakeUp();
    
    // Get current velocity relative to car
    const vel = body.current.linvel();
    const rot = body.current.rotation();
    const q = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
    
    // Convert world velocity to local to measure forward speed
    const velVec = new THREE.Vector3(vel.x, vel.y, vel.z);
    const forwardSpeed = velVec.clone().applyQuaternion(q.clone().invert()).z;
    
    if (isDriven) {
        const forward = (input.forward ? 1 : 0) - (input.backward ? 1 : 0);
        const turn = (input.left ? 1 : 0) - (input.right ? 1 : 0);
        
        // Power: Higher when holding shift
        const speedMultiplier = input.shift ? 140 : 100;
        
        // Physics: Apply force (Acceleration)
        // We use a local forward vector transformed to world space
        const forwardDir = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
        const impulse = forwardDir.multiplyScalar(forward * speedMultiplier * delta * 100);
        body.current.applyImpulse({ x: impulse.x, y: 0, z: impulse.z }, true);
        
        // Physics: Steering (Torque)
        // Only steer if moving (realistic) or if just starting
        if (Math.abs(forwardSpeed) > 0.5 || forward !== 0) {
            // Reverse steering direction if going backward for natural feel
            const dirMultiplier = forwardSpeed < -1 ? -1 : 1; 
            const steerForce = turn * 800 * delta * dirMultiplier;
            body.current.applyTorqueImpulse({ x: 0, y: steerForce, z: 0 }, true);
        }
        
        // --- VISUAL ANIMATIONS ---
        
        // 1. Wheel Steering
        const targetSteer = turn * 0.5; // Max 0.5 radians (approx 30 deg)
        currentSteering.current = THREE.MathUtils.lerp(currentSteering.current, targetSteer, delta * 10);
        
        // Apply steer to front wheels (0 and 1)
        if (wheels[0].current) wheels[0].current.rotation.y = currentSteering.current;
        if (wheels[1].current) wheels[1].current.rotation.y = currentSteering.current;
        
        // 2. Wheel Spin
        // Rotate the inner mesh of the wheel group
        const spinAmount = forwardSpeed * delta * 2;
        wheels.forEach(ref => {
            if (ref.current && ref.current.children[0]) {
                // The cylinder is the first child
                ref.current.children[0].rotation.x += spinAmount;
            }
        });

        // 3. Chassis Suspension (Tilt)
        if (chassis.current) {
            // Pitch: Dip nose when braking/decelerating, raise when accelerating
            // We approximate this using input
            const targetPitch = forward * -0.05; 
            
            // Roll: Lean sideways when turning
            // More speed = more lean
            const speedFactor = Math.min(Math.abs(forwardSpeed) / 20, 1);
            const targetRoll = -currentSteering.current * 0.3 * speedFactor;

            chassis.current.rotation.x = THREE.MathUtils.lerp(chassis.current.rotation.x, targetPitch, delta * 5);
            chassis.current.rotation.z = THREE.MathUtils.lerp(chassis.current.rotation.z, targetRoll, delta * 5);
        }
    }
  });

  // Wheel sub-component to keep code clean
  const Wheel = ({ index, x, z }: { index: number, x: number, z: number }) => (
    <group ref={wheels[index]} position={[x, 0.4, z]}>
        <mesh rotation={[0, 0, Math.PI/2]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.6, 24]} />
            <meshStandardMaterial color="#111" />
        </mesh>
        {/* Hubcap */}
        <mesh rotation={[0, 0, Math.PI/2]} position={[index % 2 === 0 ? -0.31 : 0.31, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.05, 12]} />
            <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
        </mesh>
    </group>
  );

  return (
    <RigidBody 
      ref={body} 
      position={position} 
      colliders="hull" 
      mass={1200}
      type="dynamic"
      linearDamping={0.8} // Higher damping for less slippery feel
      angularDamping={1.5} // Stabilize rotation
      userData={{ type: 'vehicle', id: vehicleId }}
    >
      <group name={`VEHICLE_${vehicleId}`}>
        
        {/* CHASSIS GROUP (Suspension Tilt) */}
        <group ref={chassis} position={[0, 0, 0]}>
            <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
                <boxGeometry args={[2.2, 0.8, 4.4]} />
                <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
            </mesh>
            
            <mesh castShadow position={[0, 1.3, -0.2]}>
                <boxGeometry args={[1.9, 0.7, 2.2]} />
                <meshStandardMaterial color="#111" />
            </mesh>

            <mesh position={[0, 1.01, 1.2]} rotation={[-0.1, 0, 0]}>
                <boxGeometry args={[1.8, 0.1, 1.8]} />
                <meshStandardMaterial color={color} metalness={0.6} />
            </mesh>
            
            {/* Lights */}
            <mesh position={[-0.7, 0.6, 2.2]}>
                <boxGeometry args={[0.4, 0.2, 0.1]} />
                <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
            </mesh>
            <mesh position={[0.7, 0.6, 2.2]}>
                <boxGeometry args={[0.4, 0.2, 0.1]} />
                <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
            </mesh>
            <mesh position={[0, 0.7, -2.2]}>
                <boxGeometry args={[1.5, 0.2, 0.1]} />
                <meshStandardMaterial color="#f00" emissive="#f00" emissiveIntensity={input.backward && isDriven ? 3 : 0.5} />
            </mesh>
        </group>

        {/* WHEELS (Separate from chassis to avoid suspension tilt affecting them incorrectly) */}
        {/* Front Left */}
        <Wheel index={0} x={-1.1} z={1.4} />
        {/* Front Right */}
        <Wheel index={1} x={1.1} z={1.4} />
        {/* Back Left */}
        <Wheel index={2} x={-1.1} z={-1.4} />
        {/* Back Right */}
        <Wheel index={3} x={1.1} z={-1.4} />

      </group>
    </RigidBody>
  );
};
