import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Float } from '@react-three/drei';

const Globe = () => {
  const mesh1 = useRef();
  const mesh2 = useRef();
  
  useFrame((state) => {
    mesh1.current.rotation.y += 0.005;
    mesh1.current.rotation.x += 0.002;
    mesh2.current.rotation.y -= 0.003;
    mesh2.current.rotation.z -= 0.002;
  });
  
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={mesh1} args={[2, 32, 32]}>
        <meshStandardMaterial color="#3b82f6" wireframe transparent opacity={0.4} />
      </Sphere>
      <Sphere ref={mesh2} args={[1.9, 16, 16]}>
         <meshStandardMaterial color="#60a5fa" wireframe transparent opacity={0.6} />
      </Sphere>
      <Sphere args={[1.7, 32, 32]}>
         <meshStandardMaterial color="#1e3a8a" roughness={0.1} metalness={0.8} />
      </Sphere>
    </Float>
  );
};

export default function SuperAdmin3D() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-50">
      <Canvas camera={{ position: [0, 0, 6] }}>
        <ambientLight intensity={2} />
        <pointLight position={[10, 10, 10]} intensity={3} color="#93c5fd" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#6366f1" />
        <Globe />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} enablePan={false} />
      </Canvas>
    </div>
  );
}
