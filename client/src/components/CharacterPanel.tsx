import './CharacterPanel.css';
import { Canvas } from '@react-three/fiber';
import { Suspense, useRef, useState } from 'react';
import { OrbitControls, useGLTF, useAnimations, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

function ChillMotion({ groupRef }: { groupRef: React.RefObject<any> }) {
  // Subtle chill motion using smoothed random
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Perlin/simple noise replacement: sin/cos based
    const sway = Math.sin(t * 0.7) * 0.03;
    const bob = Math.sin(t * 0.9) * 0.04;
    const nod = Math.sin(t * 0.5) * 0.02;
    groupRef.current.position.y = bob;
    groupRef.current.rotation.y = sway;
    groupRef.current.rotation.x = nod;
  });
  return null;
}

function AaronModel({ onClick }: { onClick: () => void }) {
  const group = useRef<any>();
  const { scene, animations } = useGLTF('/models/aaron.glb');
  const { actions, names } = useAnimations(animations, group);
  const [flinch, setFlinch] = useState(false);

  // Animation name logic
  const idleName = names.find(n => n.toLowerCase() === 'idle') || names[0];
  const flinchName = names.find(n => n.toLowerCase() === 'flinch') || names[1];

  // Animation switching
  useFrame(() => {
    if (flinch && actions[flinchName]) {
      actions[flinchName]?.reset().play();
      setTimeout(() => {
        actions[flinchName]?.fadeOut(0.2);
        actions[idleName]?.reset().fadeIn(0.2).play();
        setFlinch(false);
      }, 250);
    } else if (actions[idleName] && !flinch) {
      actions[idleName]?.play();
    }
  });

  return (
    <group ref={group} onPointerOver={e => {
      e.stopPropagation();
      group.current.traverse((obj: any) => {
        if (obj.material && obj.material.emissive) {
          obj.material.emissive.set('#5CC8FF');
        }
      });
    }}
    onPointerOut={e => {
      e.stopPropagation();
      group.current.traverse((obj: any) => {
        if (obj.material && obj.material.emissive) {
          obj.material.emissive.set('#000');
        }
      });
    }}
    onClick={onClick}
    >
      <primitive object={scene} />
      <ChillMotion groupRef={group} />
    </group>
  );
}

export default function CharacterPanel() {
  const [flinch, setFlinch] = useState(false);
  const handleClick = () => {
    setFlinch(true);
    setTimeout(() => setFlinch(false), 250);
  };
  return (
    <div className="character-panel">
      <Canvas camera={{ position: [0, 1.2, 2.5], fov: 40 }} shadows>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 8, 5]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <Suspense fallback={<Html center>Loading...</Html>}>
          <AaronModel onClick={handleClick} />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.8} maxPolarAngle={1.5} />
      </Canvas>
      <button className="pill-btn">Click Me</button>
    </div>
  );
}

// Drei GLTF loader
// @ts-ignore
useGLTF.preload('/models/aaron.glb');
