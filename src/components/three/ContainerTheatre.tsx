'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

// The main container model
function Container({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const doorRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
    if (doorRef.current) {
      const targetRotation = isOpen ? -Math.PI / 2 : 0;
      doorRef.current.rotation.y = THREE.MathUtils.lerp(
        doorRef.current.rotation.y,
        targetRotation,
        0.05
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Container walls - hollow box with door opening on left */}

      {/* Back wall */}
      <mesh position={[2.95, 0, 0]}>
        <boxGeometry args={[0.1, 2.5, 2.4]} />
        <meshBasicMaterial color="#4a6680" />
      </mesh>

      {/* Front wall */}
      <mesh position={[-2.95, 0, 0]}>
        <boxGeometry args={[0.1, 2.5, 2.4]} />
        <meshBasicMaterial color="#4a6680" />
      </mesh>

      {/* Top wall */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[6, 0.1, 2.4]} />
        <meshBasicMaterial color="#3a5670" />
      </mesh>

      {/* Bottom/Floor */}
      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[6, 0.1, 2.4]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>

      {/* Right side wall (solid) */}
      <mesh position={[0, 0, -1.15]}>
        <boxGeometry args={[6, 2.5, 0.1]} />
        <meshBasicMaterial color="#4a6680" />
      </mesh>

      {/* Left side wall - with door opening */}
      {/* Top part above door */}
      <mesh position={[0, 1.0, 1.15]}>
        <boxGeometry args={[6, 0.5, 0.1]} />
        <meshBasicMaterial color="#4a6680" />
      </mesh>
      {/* Right part of front wall */}
      <mesh position={[1.5, 0, 1.15]}>
        <boxGeometry args={[3, 2.5, 0.1]} />
        <meshBasicMaterial color="#4a6680" />
      </mesh>
      {/* Left part of front wall (beside door) */}
      <mesh position={[-2.4, 0, 1.15]}>
        <boxGeometry args={[1.2, 2.5, 0.1]} />
        <meshBasicMaterial color="#4a6680" />
      </mesh>

      {/* Container ridges on front */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0.3 + i * 0.5, 0, 1.21]}>
          <boxGeometry args={[0.06, 2.4, 0.06]} />
          <meshBasicMaterial color="#2d3d4d" />
        </mesh>
      ))}

      {/* Glowing bottom trim */}
      <mesh position={[0, -1.26, 0]}>
        <boxGeometry args={[6.1, 0.08, 2.5]} />
        <meshBasicMaterial color="#00FF41" />
      </mesh>

      {/* Corner posts */}
      {[[-3, 1.21], [3, 1.21], [-3, -1.21], [3, -1.21]].map(([x, z], i) => (
        <mesh key={`corner-${i}`} position={[x, 0, z]}>
          <boxGeometry args={[0.15, 2.5, 0.15]} />
          <meshBasicMaterial color="#6a8a9a" />
        </mesh>
      ))}

      {/* Door - swings outward */}
      <group ref={doorRef} position={[-1.25, -0.1, 1.15]}>
        <group position={[-0.55, 0, 0]}>
          {/* Door panel - clickable */}
          <mesh
            onClick={() => setIsOpen(!isOpen)}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'default'}
          >
            <boxGeometry args={[1.1, 2.2, 0.1]} />
            <meshBasicMaterial color="#5a7a90" />
          </mesh>
          {/* Door handle */}
          <mesh position={[-0.4, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.15]} />
            <meshBasicMaterial color="#00FF41" />
          </mesh>
          {/* Door window */}
          <mesh position={[0, 0.5, 0.06]}>
            <boxGeometry args={[0.7, 0.5, 0.02]} />
            <meshBasicMaterial color="#00D4FF" transparent opacity={0.5} />
          </mesh>
        </group>
      </group>

      {/* ===== INTERIOR ===== */}

      {/* Screen at back */}
      <mesh position={[2.5, 0.1, 0]}>
        <planeGeometry args={[0.1, 1.8, 2]} />
        <meshBasicMaterial color="#111122" />
      </mesh>
      {/* Screen display */}
      <mesh position={[2.45, 0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.8, 1.2]} />
        <meshBasicMaterial color="#00D4FF" />
      </mesh>

      {/* Carpet/floor covering */}
      <mesh position={[0, -1.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.8, 2.2]} />
        <meshBasicMaterial color="#2a1a3a" />
      </mesh>

      {/* Interior ceiling lights */}
      {[-1, 0, 1].map((x, i) => (
        <mesh key={`light-${i}`} position={[x, 1.1, 0]}>
          <boxGeometry args={[0.8, 0.05, 0.1]} />
          <meshBasicMaterial color="#ffdd88" />
        </mesh>
      ))}

      {/* Seats - 3 rows */}
      {[0.6, 0, -0.6].map((z, rowIndex) => (
        Array.from({ length: 5 }).map((_, seatIndex) => (
          <group
            key={`seat-${rowIndex}-${seatIndex}`}
            position={[-1.5 + seatIndex * 0.7, -0.9, z]}
          >
            {/* Seat base */}
            <mesh>
              <boxGeometry args={[0.5, 0.3, 0.45]} />
              <meshBasicMaterial color="#cc2244" />
            </mesh>
            {/* Seat back */}
            <mesh position={[0, 0.35, -0.15]}>
              <boxGeometry args={[0.5, 0.4, 0.15]} />
              <meshBasicMaterial color="#aa1133" />
            </mesh>
            {/* Arm rests */}
            <mesh position={[-0.28, 0.1, 0]}>
              <boxGeometry args={[0.06, 0.15, 0.4]} />
              <meshBasicMaterial color="#222222" />
            </mesh>
            <mesh position={[0.28, 0.1, 0]}>
              <boxGeometry args={[0.06, 0.15, 0.4]} />
              <meshBasicMaterial color="#222222" />
            </mesh>
          </group>
        ))
      ))}

      {/* Popcorn bucket decoration near door */}
      <mesh position={[-2.2, -0.8, 0.5]}>
        <cylinderGeometry args={[0.12, 0.08, 0.25]} />
        <meshBasicMaterial color="#ff6644" />
      </mesh>

      {/* Neon sign on front */}
      <mesh position={[0.5, 0.9, 1.22]}>
        <boxGeometry args={[2.5, 0.3, 0.05]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
      <mesh position={[0.5, 0.9, 1.25]}>
        <boxGeometry args={[2.2, 0.18, 0.02]} />
        <meshBasicMaterial color="#00FF41" />
      </mesh>
    </group>
  );
}

// Floating particles
function Particles() {
  const particlesRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const particleCount = 200;
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00FF41"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Simple stars background
function SimpleStars() {
  const starsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 50 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.5} color="#ffffff" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

// Ground grid
function Grid() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[50, 50, 50, 50]} />
      <meshStandardMaterial
        color="#0D0D0D"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

// Main scene component
export default function ContainerTheatre() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full h-[500px] md:h-[600px] relative">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[8, 4, 8]} fov={50} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={5}
          maxDistance={15}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate
          autoRotateSpeed={0.5}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight
          position={[-10, 5, -5]}
          intensity={0.8}
        />
        <pointLight position={[-5, 5, -5]} intensity={1} color="#00FF41" />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00D4FF" />
        <pointLight position={[0, 3, 5]} intensity={0.8} color="#ffffff" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          color="#BD00FF"
        />

        {/* Scene elements */}
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <Container isOpen={isOpen} setIsOpen={setIsOpen} />
        </Float>

        <Particles />
        <Grid />
        <SimpleStars />

        {/* Environment */}
        <fog attach="fog" args={['#0D0D0D', 10, 30]} />
      </Canvas>

      {/* Overlay instruction */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-terminal-green/60 text-sm font-mono">
        <span className="animate-pulse">{'>'} drag to rotate | scroll to zoom | click door to open</span>
      </div>
    </div>
  );
}
