import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';

const Building = ({ position, height, color, delay }) => {
  const mesh = useRef();
  useFrame((state) => {
    mesh.current.position.y = Math.sin(state.clock.elapsedTime + delay) * 0.2 + height / 2;
  });
  return (
    <Box ref={mesh} position={[position[0], height / 2, position[2]]} args={[0.9, height, 0.9]}>
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
    </Box>
  );
};

export default function CommunityAdmin3D() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
      <Canvas camera={{ position: [5, 4, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 20, 10]} intensity={2} castShadow color="#c7d2fe" />
        
        {/* Simple grid of buildings */}
        <Building position={[-2, 0, -2]} height={2} color="#818cf8" delay={0} />
        <Building position={[0, 0, -2]} height={3.5} color="#6366f1" delay={1} />
        <Building position={[2, 0, -2]} height={1.5} color="#4f46e5" delay={2} />
        
        <Building position={[-2, 0, 0]} height={2.5} color="#4338ca" delay={3} />
        <Building position={[0, 0, 0]} height={4.5} color="#3730a3" delay={4} />
        <Building position={[2, 0, 0]} height={2} color="#312e81" delay={5} />
        
        <Building position={[-2, 0, 2]} height={1.2} color="#a5b4fc" delay={6} />
        <Building position={[0, 0, 2]} height={2.8} color="#818cf8" delay={7} />
        <Building position={[2, 0, 2]} height={3.2} color="#6366f1" delay={8} />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} enablePan={false} />
      </Canvas>
    </div>
  );
}
