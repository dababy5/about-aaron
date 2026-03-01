import './CharacterPanel.css';
import { Canvas } from '@react-three/fiber';
import { Suspense, useRef, useState, useEffect } from 'react';
import { OrbitControls, useGLTF, useAnimations, Html, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/models/Meshy_AI_Meshy_Merged_Animations.glb';

function AaronModel({ onClick, triggerClick }: { onClick: () => void; triggerClick: boolean }) {
  const group = useRef<any>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions, names } = useAnimations(animations, group);
  const [hasWaved, setHasWaved] = useState(false);
  const currentActionRef = useRef<any>(null);

  // Log available animations
  useEffect(() => {
    console.log('Available animations:', names);
  }, [names]);

  // Animation name helpers
  const getAnimationName = (keyword: string) => {
    return names.find(n => n.toLowerCase().includes(keyword.toLowerCase())) || null;
  };

  const idleName = getAnimationName('Dead');
  const actionName = getAnimationName('flinch') || getAnimationName('salute') || getAnimationName('punch');

  // Material Enhancement
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const targetHeight = 1.75;
    const rawScale = targetHeight / Math.max(size.y, 0.001);
    const scale = THREE.MathUtils.clamp(rawScale, 0.35, 1.25);

    scene.position.x = -center.x * scale;
    scene.position.y = -box.min.y * scale + (size.y * scale) * (0.3 / targetHeight);
    scene.position.z = -center.z * scale;
    scene.scale.setScalar(scale);

    // Enhance materials for better 3D appearance
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        
        if (obj.material) {
          obj.material.roughness = 0.7;
          obj.material.metalness = 0.1;
          obj.material.envMapIntensity = 0.15;
        }
      }
    });
  }, [scene, names]);

  // Start with Dead animation looping
  useEffect(() => {
    if (!hasWaved && idleName && actions[idleName]) {
      setHasWaved(true);
      const idleAction = actions[idleName]!;
      
      currentActionRef.current?.stop();
      currentActionRef.current = idleAction;
      (idleAction.play as any)();
      idleAction.setLoop(THREE.LoopRepeat, Infinity);
    }
  }, [hasWaved, idleName, actions]);

  // Handle click to trigger action animation
  useEffect(() => {
    if (triggerClick && actionName && actions[actionName] && idleName && actions[idleName]) {
      const actionNameStr = actionName;
      const actionAction = actions[actionNameStr]!;
      const idleAction = actions[idleName]!;
      
      currentActionRef.current?.stop();
      currentActionRef.current = actionAction;
      (actionAction.play as any)();
      actionAction.setLoop(THREE.LoopOnce, 1);
      actionAction.clampWhenFinished = true;
      
      // Estimate action duration (typical action is ~1-2 seconds)
      const actionTimer = setTimeout(() => {
        currentActionRef.current?.stop();
        currentActionRef.current = idleAction;
        (idleAction.play as any)();
        idleAction.setLoop(THREE.LoopRepeat, Infinity);
      }, 2000);
      
      return () => clearTimeout(actionTimer);
    }
  }, [triggerClick, actionName, idleName, actions]);

  return (
    <>
      <group ref={group} onClick={onClick}>
        <primitive object={scene} />
      </group>
      <ContactShadows
        position={[0, -0.02, 0]}
        opacity={0.4}
        scale={10}
        blur={2.5}
        far={4}
      />
    </>
  );
}

export default function CharacterPanel() {
  const [triggerClick, setTriggerClick] = useState(false);
  
  const handleClick = () => {
    setTriggerClick(true);
    setTimeout(() => setTriggerClick(false), 500);
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
          toneMappingExposure: 0.6,
        }}
        onCreated={(state) => {
          state.gl.toneMapping = THREE.ACESFilmicToneMapping;
          state.gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        {/* Professional Lighting Setup */}
        <ambientLight intensity={0.15} />
        
        {/* Key Light (Main) */}
        <directionalLight
          position={[3, 5, 4]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={15}
        />
        
        {/* Fill Light (Soft opposite side) */}
        <directionalLight
          position={[-3, 2, -2]}
          intensity={0.3}
        />
        
        {/* Rim Light (Backlight for outline) */}
        <directionalLight
          position={[0, 5, -6]}
          intensity={0.4}
        />

        {/* Environment Lighting */}
        <Environment preset="city" />

        <Suspense fallback={<Html center><div style={{color: 'white'}}>Loading 3D Character...</div></Html>}>
          <AaronModel onClick={handleClick} triggerClick={triggerClick} />
        </Suspense>

        {/* Cinematic Camera Controls - Fully Rotatable */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          target={[0, 1.25, 0]}
        />
      </Canvas>
    </div>
  );
}

// Drei GLTF loader
// @ts-ignore
useGLTF.preload(MODEL_PATH);
