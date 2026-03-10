import './CharacterPanel.css';
import { Canvas } from '@react-three/fiber';
import { Suspense, useRef, useState, useEffect } from 'react';
import { OrbitControls, useGLTF, useAnimations, Html, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Platform, BackgroundGradient } from './SceneEnvironment';

const MODEL_PATH = '/models/aaronjpi.glb';

function AaronModel() {
  const group = useRef<any>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions, names } = useAnimations(animations, group);
  const [hasWaved, setHasWaved] = useState(false);
  const currentActionRef = useRef<any>(null);

  const idleName = names.find(n => n === 'Angry_Ground_Stomp') || null;
  const waveName = names.find(n => n === 'Big_Wave_Hello') || null;

  // Material Enhancement
  useEffect(() => {
    // Reset scene from any other page's modifications
    scene.position.set(0, 0, 0);
    scene.scale.set(1, 1, 1);
    scene.rotation.set(0, 0, 0);
    scene.visible = true;

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const targetHeight = 1.75;
    const rawScale = targetHeight / Math.max(size.y, 0.001);
    const scale = THREE.MathUtils.clamp(rawScale, 0.35, 1.25);

    scene.position.x = -center.x * scale;
    scene.position.y = -box.min.y * scale - 0.45;
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

  // Play wave greeting then settle into idle
  useEffect(() => {
    if (hasWaved) return;
    if (!actions) return;

    const idleAction = idleName ? actions[idleName] : null;
    const waveAction = waveName ? actions[waveName] : null;

    if (waveAction && idleAction) {
      setHasWaved(true);
      currentActionRef.current?.stop();

      // Play wave once, then crossfade to idle
      waveAction.reset();
      waveAction.setLoop(THREE.LoopOnce, 1);
      waveAction.clampWhenFinished = true;
      waveAction.play();
      currentActionRef.current = waveAction;

      const mixer = waveAction.getMixer();
      const onFinished = () => {
        mixer.removeEventListener('finished', onFinished);
        waveAction.fadeOut(0.4);
        idleAction.reset().fadeIn(0.4).play();
        idleAction.setLoop(THREE.LoopRepeat, Infinity);
        currentActionRef.current = idleAction;
      };
      mixer.addEventListener('finished', onFinished);
    } else if (idleAction) {
      setHasWaved(true);
      currentActionRef.current?.stop();
      idleAction.reset().play();
      idleAction.setLoop(THREE.LoopRepeat, Infinity);
      currentActionRef.current = idleAction;
    }
  }, [hasWaved, idleName, waveName, actions]);

  return (
    <>
      <group ref={group}>
        <primitive object={scene} />
      </group>
      <ContactShadows
        position={[0, -0.47, 0]}
        opacity={0.25}
        scale={8}
        blur={2}
        far={3}
      />
    </>
  );
}

export default function CharacterPanel() {
  return (
    <div className="character-panel">
      <Canvas
        camera={{ position: [0, 1.2, 3.5], fov: 40 }}
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

        {/* Background and Platform Elements */}
        <BackgroundGradient />
        <Platform />

        <Suspense fallback={<Html center><div style={{color: 'white'}}>Loading 3D Character...</div></Html>}>
          <AaronModel />
        </Suspense>

        {/* Cinematic Camera Controls - Fully Rotatable */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          autoRotate={false}
          target={[0, 0.6, 0]}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          rotateSpeed={1}
        />
      </Canvas>
    </div>
  );
}

// Drei GLTF loader
// @ts-ignore
useGLTF.preload(MODEL_PATH);
