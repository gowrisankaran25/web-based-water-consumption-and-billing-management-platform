import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial, Sphere, Float } from '@react-three/drei';

const Droplet = () => {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1.8, 64, 64]}>
        <MeshDistortMaterial
          color="#38bdf8"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
};

export default function Resident3D() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#bae6fd" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#38bdf8" />
        <Droplet />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} enablePan={false} />
      </Canvas>
    </div>
  );
}
