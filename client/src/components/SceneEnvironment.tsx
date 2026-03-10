import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function Platform() {
  return (
    <>
      {/* Background Grid Plane - Tech aesthetic */}
      <mesh position={[0, 0, -8]} scale={[12, 10, 1]} receiveShadow>
        <planeGeometry args={[10, 10, 32, 32]} />
        <meshStandardMaterial
          color="#0f1729"
          metalness={0.4}
          roughness={0.6}
          wireframe={false}
          emissive="#1a3a4a"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Subtle Grid Lines on Background */}
      <GridLines />

      {/* Main Platform - Large floating stage */}
      <mesh position={[0, -0.5, 0]} receiveShadow castShadow scale={[1.3, 1, 1.2]}>
        <cylinderGeometry args={[2, 2.5, 0.2, 64]} />
        <meshStandardMaterial
          color="#1a3a5a"
          metalness={0.7}
          roughness={0.25}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Inner Platform Ring - Depth */}
      <mesh position={[0, -0.45, 0]} scale={[1.15, 1, 1.15]}>
        <cylinderGeometry args={[1.6, 1.8, 0.08, 64]} />
        <meshStandardMaterial
          color="#1a2a4a"
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* ===== CENTER/FRONT VIEW OBJECTS (visible when facing forward) ===== */}
      
      {/* Large arc ring behind character - main focal point from front */}
      <mesh position={[0, 2, -4]} rotation={[0.2, 0, 0]} scale={[1.3, 1.3, 1]}>
        <torusGeometry args={[2.5, 0.1, 16, 100]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00a8ff"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.05}
        />
      </mesh>

      {/* Second arc ring behind - offset for depth */}
      <mesh position={[0, 2.5, -5]} rotation={[0.3, 0.1, 0.05]} scale={[1.1, 1.1, 1]}>
        <torusGeometry args={[2, 0.07, 16, 100]} />
        <meshStandardMaterial
          color="#0088ff"
          emissive="#0066ff"
          emissiveIntensity={0.4}
          metalness={0.85}
          roughness={0.1}
        />
      </mesh>

      {/* Floating objects behind character - visible from front */}
      <FloatingOctahedron position={[-1.5, 2.8, -5]} scale={0.35} delay={0} />
      <FloatingOctahedron position={[1.8, 2.6, -4.5]} scale={0.3} delay={1.2} />
      <FloatingCube position={[-2.2, 1.8, -4]} scale={0.28} delay={0.6} />
      <FloatingCube position={[2.5, 2, -4.2]} scale={0.25} delay={1.8} />
      <FloatingSphere position={[0, 3.2, -5.5]} scale={0.22} delay={2.2} />
      <FloatingSphere position={[-1, 3.5, -6]} scale={0.18} delay={2.8} />
      <FloatingSphere position={[1.2, 3.3, -5.8]} scale={0.2} delay={3.2} />
      <FloatingHexagon position={[-2, 3, -5]} scale={0.3} delay={0.4} />
      <FloatingHexagon position={[2.2, 2.8, -4.8]} scale={0.28} delay={1.6} />

      {/* ===== SIDE VIEW OBJECTS (visible when rotating) ===== */}

      {/* Large Glowing Ring - Upper left background */}
      <mesh position={[-3.5, 2.5, -4]} rotation={[0.3, 0.5, 0.2]} scale={[1, 1, 1]}>
        <torusGeometry args={[1.8, 0.08, 16, 100]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00a8ff"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.05}
        />
      </mesh>

      {/* Large Glowing Ring - Upper right background */}
      <mesh position={[4, 2.2, -3.5]} rotation={[0.4, -0.4, -0.15]} scale={[1, 1, 1]}>
        <torusGeometry args={[1.5, 0.06, 16, 100]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00a8ff"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.05}
        />
      </mesh>

      {/* Smaller accent ring - left side */}
      <mesh position={[-4.5, 1, -2.5]} rotation={[0.6, 0.3, 0.4]} scale={[0.7, 0.7, 1]}>
        <torusGeometry args={[1.2, 0.05, 16, 80]} />
        <meshStandardMaterial
          color="#0088ff"
          emissive="#0066ff"
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.1}
        />
      </mesh>

      {/* Smaller accent ring - right side */}
      <mesh position={[5, 0.8, -2]} rotation={[0.5, -0.6, 0.3]} scale={[0.6, 0.6, 1]}>
        <torusGeometry args={[1, 0.04, 16, 80]} />
        <meshStandardMaterial
          color="#0088ff"
          emissive="#0066ff"
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.1}
        />
      </mesh>

      {/* Ambient floating geometry - positioned far to the sides */}
      <FloatingHexagon position={[-5, 0.5, -2]} scale={0.5} delay={0} />
      <FloatingHexagon position={[5.5, 0.8, -2.5]} scale={0.45} delay={1} />
      <FloatingHexagon position={[-4, 2.2, -3.5]} scale={0.35} delay={3} />
      <FloatingOctahedron position={[-4.5, 1.8, -3]} scale={0.4} delay={0.5} />
      <FloatingOctahedron position={[4.5, 1.5, -2.8]} scale={0.38} delay={1.5} />
      <FloatingOctahedron position={[5.2, 2.5, -4]} scale={0.3} delay={3.5} />
      <FloatingCube position={[-5.5, 1.2, -1.5]} scale={0.35} delay={2} />
      <FloatingCube position={[5.8, 1.3, -1.8]} scale={0.32} delay={2.5} />
      <FloatingCube position={[-3.5, 3, -5]} scale={0.28} delay={4} />
      <FloatingCube position={[3.8, 3.2, -4.5]} scale={0.25} delay={4.5} />

      {/* Additional small floating spheres for depth */}
      <FloatingSphere position={[-6, 0.3, -1]} scale={0.2} delay={0.8} />
      <FloatingSphere position={[6.2, 0.5, -1.2]} scale={0.18} delay={1.8} />
      <FloatingSphere position={[-5.5, 2.8, -4]} scale={0.15} delay={2.8} />
      <FloatingSphere position={[5.8, 2.6, -3.8]} scale={0.16} delay={3.8} />

      {/* Background accent lights */}
      <pointLight position={[0, 3, -4]} color="#00d4ff" intensity={0.6} distance={15} />
      <pointLight position={[-4, 2, -3]} color="#0088ff" intensity={0.5} distance={12} />
      <pointLight position={[4, 2, -3]} color="#0088ff" intensity={0.5} distance={12} />
      <pointLight position={[-5, 0.5, -1]} color="#00d4ff" intensity={0.3} distance={8} />
      <pointLight position={[5, 0.5, -1]} color="#00d4ff" intensity={0.3} distance={8} />
    </>
  );
}

function GridLines() {
  return (
    <mesh position={[0, 0, -7.9]} scale={[12, 10, 1]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial
        map={new THREE.CanvasTexture(
          (() => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#0f1729';
            ctx.fillRect(0, 0, 512, 512);
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 16; i++) {
              const pos = (i / 16) * 512;
              ctx.beginPath();
              ctx.moveTo(pos, 0);
              ctx.lineTo(pos, 512);
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(0, pos);
              ctx.lineTo(512, pos);
              ctx.stroke();
            }
            return canvas;
          })()
        )}
        emissive="#1a3a4a"
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

function FloatingCube({
  position,
  scale,
  delay,
}: {
  position: [number, number, number];
  scale: number;
  delay: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    let time = delay;
    const animate = () => {
      time += 0.008;
      mesh.position.y = position[1] + Math.sin(time * 0.8) * 0.4;
      mesh.rotation.x += 0.002;
      mesh.rotation.y += 0.003;
      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [position, delay]);

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[scale, scale, scale]} />
      <meshStandardMaterial
        color="#00d4ff"
        emissive="#0088cc"
        emissiveIntensity={0.25}
        metalness={0.6}
        roughness={0.25}
        transparent
        opacity={0.6}
        envMapIntensity={0.8}
      />
    </mesh>
  );
}

function FloatingHexagon({
  position,
  scale,
  delay,
}: {
  position: [number, number, number];
  scale: number;
  delay: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    let time = delay;
    const animate = () => {
      time += 0.006;
      mesh.position.y = position[1] + Math.sin(time * 0.6) * 0.35;
      mesh.rotation.z += 0.004;
      mesh.rotation.y += 0.002;
      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [position, delay]);

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <cylinderGeometry args={[scale, scale, scale * 0.3, 6]} />
      <meshStandardMaterial
        color="#0066ff"
        emissive="#004488"
        emissiveIntensity={0.2}
        metalness={0.65}
        roughness={0.3}
        transparent
        opacity={0.65}
        envMapIntensity={0.9}
      />
    </mesh>
  );
}

function FloatingOctahedron({
  position,
  scale,
  delay,
}: {
  position: [number, number, number];
  scale: number;
  delay: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    let time = delay;
    const animate = () => {
      time += 0.007;
      mesh.position.y = position[1] + Math.sin(time * 0.7) * 0.38;
      mesh.rotation.x += 0.003;
      mesh.rotation.y += 0.004;
      mesh.rotation.z += 0.002;
      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [position, delay]);

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <octahedronGeometry args={[scale, 0]} />
      <meshStandardMaterial
        color="#00d4ff"
        emissive="#0088ff"
        emissiveIntensity={0.3}
        metalness={0.7}
        roughness={0.2}
        transparent
        opacity={0.7}
        envMapIntensity={1}
      />
    </mesh>
  );
}

function FloatingSphere({
  position,
  scale,
  delay,
}: {
  position: [number, number, number];
  scale: number;
  delay: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    let time = delay;
    const animate = () => {
      time += 0.009;
      mesh.position.y = position[1] + Math.sin(time * 0.9) * 0.3;
      mesh.position.x = position[0] + Math.cos(time * 0.5) * 0.15;
      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [position, delay]);

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <sphereGeometry args={[scale, 16, 16]} />
      <meshStandardMaterial
        color="#00d4ff"
        emissive="#00aaff"
        emissiveIntensity={0.4}
        metalness={0.8}
        roughness={0.15}
        transparent
        opacity={0.75}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

export function BackgroundGradient() {
  return null; // Handled by Platform component now
}

