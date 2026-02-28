import './CharacterPanel.css';
import { Canvas } from '@react-three/fiber';
import { Suspense, useRef, useState, useEffect } from 'react';
import { OrbitControls, useGLTF, useAnimations, Html, Environment, ContactShadows } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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

function AaronModel({ onClick, triggerFlinch }: { onClick: () => void; triggerFlinch: boolean }) {
  const group = useRef<any>();
  const { scene, animations } = useGLTF('/models/aaron.glb');
  const { actions, names } = useAnimations(animations, group);
  const animationPlayedRef = useRef(false);

  // Animation name logic
  const idleName = names.find(n => n.toLowerCase() === 'idle') || names[0];
  const flinchName = names.find(n => n.toLowerCase() === 'flinch') || names[1];

  // Debug logging & Material Enhancement
  useEffect(() => {
    console.log('GLB loaded. Animations available:', names);
    console.log('Idle:', idleName, 'Flinch:', flinchName);

    // Enhance materials for better 3D appearance
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        
        if (obj.material) {
          obj.material.roughness = 0.7;
          obj.material.metalness = 0.1;
          obj.material.envMapIntensity = 1.2;
        }
      }
    });
  }, [scene, names, idleName, flinchName]);

  // Handle flinch trigger from parent
  useEffect(() => {
    if (triggerFlinch && flinchName && actions[flinchName]) {
      console.log('Playing flinch animation:', flinchName);
      actions[flinchName]?.reset().play();
      animationPlayedRef.current = true;
    }
  }, [triggerFlinch, flinchName, actions]);

  // Animation switching
  useFrame(() => {
    if (idleName && actions[idleName] && !actions[flinchName]?.isRunning()) {
      actions[idleName]?.play();
    }
  });

  return (
    <>
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
      <ContactShadows
        position={[0, -1.4, 0]}
        opacity={0.4}
        scale={10}
        blur={2.5}
        far={4}
      />
    </>
  );
}

export default function CharacterPanel() {
  const [triggerFlinch, setTriggerFlinch] = useState(false);
  
  const handleClick = () => {
    setTriggerFlinch(true);
    setTimeout(() => setTriggerFlinch(false), 500);
  };

  return (
    <div className="character-panel">
      <Canvas
        camera={{ position: [0, 1.4, 3.5], fov: 35 }}
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          toneMappingExposure: 1,
        }}
        onCreated={(state) => {
          state.gl.toneMapping = THREE.ACESFilmicToneMapping;
          state.gl.outputColorSpace = THREE.SRGBColorSpace;
          console.log('Canvas initialized with cinematic rendering');
        }}
      >
        {/* Professional Lighting Setup */}
        <ambientLight intensity={0.5} />
        
        {/* Key Light (Main) */}
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.6}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={15}
        />
        
        {/* Fill Light (Soft opposite side) */}
        <directionalLight
          position={[-3, 2, -2]}
          intensity={0.6}
        />
        
        {/* Rim Light (Backlight for outline) */}
        <directionalLight
          position={[0, 5, -6]}
          intensity={1.2}
        />

        {/* Environment Lighting */}
        <Environment preset="city" />

        <Suspense fallback={<Html center><div style={{color: 'white'}}>Loading 3D Character...</div></Html>}>
          <AaronModel onClick={handleClick} triggerFlinch={triggerFlinch} />
        </Suspense>

        {/* Cinematic Camera Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minAzimuthAngle={-0.4}
          maxAzimuthAngle={0.4}
        />
      </Canvas>
      <button className="pill-btn" onClick={handleClick}>Click Me</button>
    </div>
  );
}

// Drei GLTF loader
// @ts-ignore
useGLTF.preload('/models/aaron.glb');
