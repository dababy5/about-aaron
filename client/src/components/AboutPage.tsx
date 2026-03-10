import './AboutPage.css';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { useGLTF, useAnimations, Html, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Sidebar from './Sidebar';

const MODEL_PATH = '/models/aaronjpi.glb';
const MOVE_SPEED = 4.5;
const ROTATION_SPEED = 8;

// ─── LEVEL DATA ─────────────────────────────────────────────────────────────
interface Obstacle {
  pos: [number, number, number];
  scale: [number, number, number];
  color: string;
}

interface Hazard {
  type: 'spinner' | 'pendulum';
  pos: [number, number, number];
  radius: number;       // arm length
  speed: number;        // radians per second
  color: string;
  armWidth?: number;    // thickness of the arm
}

interface LevelData {
  id: number;
  name: string;
  category: string;
  fact: string;
  icon: string;
  color: string;
  groundColor: string;
  envPreset: 'night' | 'sunset' | 'dawn' | 'warehouse' | 'forest' | 'city';
  portalPos: [number, number, number];
  orbPositions: [number, number, number][];
  obstacles: Obstacle[];
  hazards: Hazard[];
  worldSize: number;
}

const LEVELS: LevelData[] = [
  // ── LEVEL 1: ROOFTOP RUN ──────────────────────────────────────────────
  {
    id: 1, name: 'Rooftop Run', category: 'Where I\'m From',
    fact: '19-year-old Bolivian raised in Arlington, VA — started my career straight out of high school in 2024',
    icon: 'I', color: '#ff6b6b', groundColor: '#0d1117',
    envPreset: 'night',
    portalPos: [10, 1.5, -8],
    orbPositions: [[3, 1.5, 2], [-4, 2.5, -3], [8, 3.0, 0]],
    hazards: [
      { type: 'spinner', pos: [5, 1.6, 0.5], radius: 2, speed: 1.5, color: '#ff4444' },
      { type: 'spinner', pos: [9.5, 2.0, -4.5], radius: 1.8, speed: -2, color: '#ff6644' },
    ],
    obstacles: [
      // Staircase platforms going up
      { pos: [2, 0.3, 2], scale: [2.5, 0.6, 2.5], color: '#2a3a5a' },
      { pos: [4, 0.6, 1], scale: [2, 0.6, 2], color: '#2a3a5a' },
      { pos: [6, 0.9, 0], scale: [2, 0.6, 2], color: '#2a3a5a' },
      { pos: [8, 1.2, 0], scale: [2.5, 0.6, 2.5], color: '#3a4a6a' },
      // Left branch — higher platforms
      { pos: [-2, 0.5, -1], scale: [2, 0.4, 2], color: '#2a3a5a' },
      { pos: [-4, 1.0, -3], scale: [2.5, 0.5, 2.5], color: '#3a4a6a' },
      { pos: [-3, 1.5, -5], scale: [2, 0.4, 2], color: '#2a3a5a' },
      // Bridge connecting to portal platform
      { pos: [9, 1.3, -3], scale: [1.2, 0.3, 5], color: '#4a5a7a' },
      { pos: [10, 1.3, -6], scale: [2, 0.3, 2], color: '#4a5a7a' },
      { pos: [10, 1.3, -8], scale: [3, 0.3, 3], color: '#5a6a8a' },
      // Ground walls to force platforming
      { pos: [0, 0.7, -3], scale: [8, 1.4, 0.4], color: '#1a2a4a' },
      { pos: [5, 0.7, 4], scale: [0.4, 1.4, 6], color: '#1a2a4a' },
    ],
    worldSize: 22,
  },
  // ── LEVEL 2: THE LIBRARY ──────────────────────────────────────────────
  {
    id: 2, name: 'The Library', category: 'Education',
    fact: 'Never applied to in-person college — couldn\'t afford it and needed to earn. Amazon pays for my CS degree at WGU while I work full-time',
    icon: 'II', color: '#4ecdc4', groundColor: '#0a1a15',
    envPreset: 'dawn',
    portalPos: [0, 3.0, -10],
    orbPositions: [[-6, 1.5, 4], [7, 2.5, -2], [0, 3.5, -6]],
    hazards: [
      { type: 'spinner', pos: [0, 2.0, -4.5], radius: 2, speed: 1.2, color: '#44ddcc' },
      { type: 'spinner', pos: [6, 2.2, -2], radius: 1.8, speed: -1.8, color: '#44ddcc' },
      { type: 'spinner', pos: [0, 3.4, -8.5], radius: 1.8, speed: 2.2, color: '#44bbaa' },
    ],
    obstacles: [
      // Book-stack tower (left)
      { pos: [-6, 0.4, 4], scale: [3, 0.8, 3], color: '#3a5a4a' },
      { pos: [-6, 1.1, 3.5], scale: [2.5, 0.6, 2.5], color: '#4a6a5a' },
      // Ascending shelves (right)
      { pos: [5, 0.4, 0], scale: [3, 0.4, 2], color: '#3a5a4a' },
      { pos: [6, 0.8, -1], scale: [2.5, 0.4, 2], color: '#3a5a4a' },
      { pos: [7, 1.2, -2], scale: [2, 0.4, 2], color: '#4a6a5a' },
      { pos: [6, 1.6, -3], scale: [2, 0.4, 2], color: '#3a5a4a' },
      { pos: [5, 2.0, -5], scale: [2.5, 0.4, 2.5], color: '#4a6a5a' },
      // Central spiral staircase
      { pos: [-1, 0.5, -3], scale: [2, 0.4, 2], color: '#4a6a5a' },
      { pos: [1, 1.0, -4], scale: [2, 0.4, 2], color: '#3a5a4a' },
      { pos: [-1, 1.5, -5], scale: [2, 0.4, 2], color: '#4a6a5a' },
      { pos: [1, 2.0, -6], scale: [2, 0.4, 2], color: '#3a5a4a' },
      { pos: [0, 2.5, -7], scale: [2, 0.4, 2], color: '#4a6a5a' },
      // Top platform (portal)
      { pos: [0, 2.8, -10], scale: [3, 0.4, 3], color: '#5a7a6a' },
      // Walls
      { pos: [2, 0.7, 3], scale: [6, 1.4, 0.4], color: '#2a3a2a' },
      { pos: [-3, 0.7, 0], scale: [0.4, 1.4, 6], color: '#2a3a2a' },
    ],
    worldSize: 20,
  },
  // ── LEVEL 3: THE SKYSCRAPER ───────────────────────────────────────────
  {
    id: 3, name: 'The Skyscraper', category: 'Experience',
    fact: 'Working at Amazon at 19 — backend systems, automation tooling, and production-grade code. Had real engineering experience before I ever started college',
    icon: 'III', color: '#ffe66d', groundColor: '#1a1a0a',
    envPreset: 'sunset',
    portalPos: [0, 5.5, 0],
    orbPositions: [[3, 1.2, -2], [-3, 2.8, 2], [2, 4.5, 1]],
    hazards: [
      // Guards the path between tiers 2 and 3
      { type: 'spinner', pos: [0, 1.8, 0], radius: 2, speed: 1.8, color: '#ffaa00' },
      // Guards the upper tiers
      { type: 'spinner', pos: [0, 4.3, 0], radius: 2, speed: -2.0, color: '#ff6600' },
    ],
    obstacles: [
      // Tier 1 — ground level ramp start (walk straight onto these)
      { pos: [2, 0.25, 0], scale: [2.5, 0.5, 2.5], color: '#5a5a2a' },
      { pos: [3.5, 0.25, -2], scale: [2.5, 0.5, 2.5], color: '#6a6a3a' },
      // Tier 2 — step up (short hop)
      { pos: [2, 0.75, -3.5], scale: [2.5, 0.5, 2.5], color: '#5a5a2a' },
      { pos: [0, 0.75, -3], scale: [2.5, 0.5, 2.5], color: '#6a6a3a' },
      // Tier 3 — spiral inward (past spinner 1)
      { pos: [-2, 1.25, -2], scale: [2.5, 0.5, 2.5], color: '#5a5a2a' },
      { pos: [-3.5, 1.25, 0], scale: [2.5, 0.5, 2.5], color: '#6a6a3a' },
      // Tier 4 — continue up
      { pos: [-3, 1.75, 2], scale: [2.5, 0.5, 2.5], color: '#5a5a2a' },
      { pos: [-1, 1.75, 3.5], scale: [2.5, 0.5, 2.5], color: '#6a6a3a' },
      // Tier 5 — crossing back
      { pos: [1, 2.25, 3], scale: [2.5, 0.5, 2.5], color: '#5a5a2a' },
      { pos: [3, 2.25, 2], scale: [2.5, 0.5, 2.5], color: '#6a6a3a' },
      // Tier 6 — tighter spiral
      { pos: [3, 2.75, 0], scale: [2.5, 0.5, 2.5], color: '#5a5a2a' },
      { pos: [2, 2.75, -2], scale: [2.5, 0.5, 2.5], color: '#6a6a3a' },
      // Tier 7 — approaching center (past spinner 2)
      { pos: [0, 3.25, -2], scale: [2.5, 0.5, 2.5], color: '#5a5a2a' },
      { pos: [-2, 3.25, -1], scale: [2.5, 0.5, 2.5], color: '#6a6a3a' },
      // Tier 8 — final spiral
      { pos: [-2, 3.75, 1], scale: [2.5, 0.5, 2.5], color: '#7a7a4a' },
      { pos: [0, 3.75, 2], scale: [2.5, 0.5, 2.5], color: '#6a6a3a' },
      // Tier 9 — last steps
      { pos: [2, 4.25, 1], scale: [2.5, 0.5, 2.5], color: '#7a7a4a' },
      { pos: [1, 4.75, -1], scale: [2.5, 0.5, 2.5], color: '#6a6a3a' },
      // Summit platform — big landing zone
      { pos: [0, 5.2, 0], scale: [4, 0.5, 4], color: '#8a8a5a' },
    ],
    worldSize: 18,
  },
  // ── LEVEL 4: THE ARENA ────────────────────────────────────────────────
  {
    id: 4, name: 'The Arena', category: 'Off the Clock',
    fact: 'Hardware modding, reverse engineering, reading assembly, competitive gaming, gym, and basketball — I break things apart to understand how they work',
    icon: 'IV', color: '#95e1d3', groundColor: '#0a1a1a',
    envPreset: 'forest',
    portalPos: [0, 0.3, -9],
    orbPositions: [[-7, 0.8, 6], [7, 0.8, -4], [0, 2.5, 0], [-6, 1.5, -6]],
    hazards: [
      { type: 'spinner', pos: [0, 1.9, 0], radius: 3.5, speed: 1.0, color: '#ff4488', armWidth: 0.4 },
      { type: 'spinner', pos: [0, 1.9, 0], radius: 3.5, speed: -1.0, color: '#44ff88', armWidth: 0.4 },
      { type: 'spinner', pos: [-5.5, 1.2, -5.5], radius: 2, speed: 2.5, color: '#ff8844' },
      { type: 'spinner', pos: [0, 0.8, -6], radius: 2, speed: -2.5, color: '#4488ff' },
    ],
    obstacles: [
      // Central elevated platform (orb on top)
      { pos: [0, 0.6, 0], scale: [2.5, 1.2, 2.5], color: '#2a4a4a' },
      { pos: [0, 1.4, 0], scale: [2, 0.4, 2], color: '#3a5a5a' },
      // Corner safe zones — where orbs are
      { pos: [-7, 0.2, 6], scale: [2.5, 0.4, 2.5], color: '#3a5a5a' },
      { pos: [7, 0.2, -4], scale: [2.5, 0.4, 2.5], color: '#3a5a5a' },
      { pos: [-6, 0.4, -6], scale: [3, 0.8, 3], color: '#3a5a5a' },
      // Stepping stones through spinner zone
      { pos: [3, 0.2, 1], scale: [1.2, 0.4, 1.2], color: '#2a4a3a' },
      { pos: [-3, 0.2, -1], scale: [1.2, 0.4, 1.2], color: '#2a4a3a' },
      { pos: [1, 0.2, -3], scale: [1.2, 0.4, 1.2], color: '#2a4a3a' },
      { pos: [-1, 0.2, 3], scale: [1.2, 0.4, 1.2], color: '#2a4a3a' },
      // Walls around edges
      { pos: [0, 0.7, 8.5], scale: [18, 1.4, 0.4], color: '#1a3a3a' },
      { pos: [0, 0.7, -8.5], scale: [18, 1.4, 0.4], color: '#1a3a3a' },
      { pos: [8.5, 0.7, 0], scale: [0.4, 1.4, 18], color: '#1a3a3a' },
      { pos: [-8.5, 0.7, 0], scale: [0.4, 1.4, 18], color: '#1a3a3a' },
      // Bridge to portal
      { pos: [0, 0.15, -7], scale: [1.5, 0.3, 3], color: '#4a5a5a' },
    ],
    worldSize: 20,
  },
  // ── LEVEL 5: THE FACTORY ──────────────────────────────────────────────
  {
    id: 5, name: 'The Factory', category: 'Engineering Philosophy',
    fact: 'If it can be automated, it should be — I\'ve built internal tools, optimized CI/CD pipelines, and own my code end-to-end',
    icon: 'V', color: '#a8e6cf', groundColor: '#0a0a1a',
    envPreset: 'warehouse',
    portalPos: [8, 2.5, -8],
    orbPositions: [[-6, 1.5, 5], [6, 1.0, 4], [-5, 3.0, -6], [7, 2.8, -4]],
    hazards: [
      { type: 'spinner', pos: [-4.5, 2.0, -1], radius: 2, speed: 2.0, color: '#44ff44' },
      { type: 'spinner', pos: [4.5, 1.5, 0], radius: 2, speed: -1.5, color: '#ff4444' },
      { type: 'spinner', pos: [-4.5, 2.9, -5], radius: 1.8, speed: 2.5, color: '#ffaa00' },
      { type: 'spinner', pos: [7.5, 2.7, -5.5], radius: 1.8, speed: -2.5, color: '#ff00ff' },
    ],
    obstacles: [
      // Assembly line platforms  (left branch)
      { pos: [-6, 0.4, 5], scale: [3, 0.8, 3], color: '#3a3a5a' },
      { pos: [-5, 0.8, 2], scale: [2, 0.4, 2], color: '#3a3a5a' },
      { pos: [-4, 1.2, 0], scale: [2, 0.4, 2], color: '#4a4a6a' },
      { pos: [-5, 1.6, -2], scale: [2, 0.4, 2], color: '#3a3a5a' },
      { pos: [-4, 2.0, -4], scale: [2, 0.4, 2], color: '#4a4a6a' },
      { pos: [-5, 2.4, -6], scale: [3, 0.5, 3], color: '#3a3a5a' },
      // Conveyor belt area (right branch)
      { pos: [5, 0.3, 4], scale: [3, 0.6, 3], color: '#4a4a6a' },
      { pos: [4, 0.6, 1], scale: [2, 0.4, 2], color: '#3a3a5a' },
      { pos: [5, 1.0, -1], scale: [2, 0.4, 2], color: '#4a4a6a' },
      { pos: [6, 1.4, -3], scale: [2, 0.4, 2], color: '#3a3a5a' },
      { pos: [7, 1.8, -4], scale: [2, 0.4, 2], color: '#4a4a6a' },
      // Final platform
      { pos: [8, 2.2, -7], scale: [3, 0.5, 3], color: '#5a5a7a' },
      // Ground barriers to force paths
      { pos: [0, 0.7, 3], scale: [0.4, 1.4, 8], color: '#2a2a3a' },
      { pos: [0, 0.7, -5], scale: [0.4, 1.4, 6], color: '#2a2a3a' },
      { pos: [3, 0.7, -8], scale: [6, 1.4, 0.4], color: '#2a2a3a' },
    ],
    worldSize: 22,
  },
  // ── LEVEL 6: THE SUMMIT ───────────────────────────────────────────────
  {
    id: 6, name: 'The Summit', category: 'What Drives Me',
    fact: 'I never planned for college — money was the barrier, not ability. Got into Amazon first, and now they\'re funding my CS degree at WGU. Discipline and hunger got me here.',
    icon: 'VI', color: '#dda0dd', groundColor: '#1a0a1a',
    envPreset: 'city',
    portalPos: [0, 5.5, -2],
    orbPositions: [[5, 0.8, -2], [1, 2.0, 2], [-1, 3.5, -5], [1, 5.0, -1]],
    hazards: [
      { type: 'spinner', pos: [4, 1.8, 0], radius: 2, speed: 0.8, color: '#ff44ff', armWidth: 0.3 },
      { type: 'spinner', pos: [-1, 3.4, -4.5], radius: 2, speed: -1.5, color: '#44ffff', armWidth: 0.3 },
    ],
    obstacles: [
      // Tier 1 — south of spawn, walkable from ground
      { pos: [2, 0.25, -3], scale: [2.5, 0.5, 2.5], color: '#5a3a5a' },
      { pos: [4.5, 0.25, -4.5], scale: [2.5, 0.5, 2.5], color: '#5a3a5a' },
      // Tier 2 — east side, short jump up
      { pos: [6, 0.75, -3], scale: [2.5, 0.5, 2.5], color: '#6a4a6a' },
      { pos: [6, 0.75, -1], scale: [2.5, 0.5, 2.5], color: '#6a4a6a' },
      // Tier 3 — crossing back west (past spinner 1)
      { pos: [4, 1.25, 1], scale: [2.5, 0.5, 2.5], color: '#5a3a5a' },
      { pos: [2, 1.25, 2], scale: [2.5, 0.5, 2.5], color: '#5a3a5a' },
      // Tier 4 — west side
      { pos: [0, 1.75, 2], scale: [2.5, 0.5, 2.5], color: '#6a4a6a' },
      { pos: [-2, 1.75, 1], scale: [2.5, 0.5, 2.5], color: '#6a4a6a' },
      // Tier 5 — south-west
      { pos: [-3.5, 2.25, -1], scale: [2.5, 0.5, 2.5], color: '#5a3a5a' },
      { pos: [-3.5, 2.25, -3], scale: [2.5, 0.5, 2.5], color: '#5a3a5a' },
      // Tier 6 — crossing back east (past spinner 2)
      { pos: [-2, 2.75, -5], scale: [2.5, 0.5, 2.5], color: '#6a4a6a' },
      { pos: [0, 2.75, -5.5], scale: [2.5, 0.5, 2.5], color: '#6a4a6a' },
      // Tier 7 — east side higher
      { pos: [2, 3.25, -5], scale: [2.5, 0.5, 2.5], color: '#7a5a7a' },
      { pos: [4, 3.25, -4], scale: [2.5, 0.5, 2.5], color: '#7a5a7a' },
      // Tier 8 — back north
      { pos: [4.5, 3.75, -2], scale: [2.5, 0.5, 2.5], color: '#6a4a6a' },
      { pos: [3.5, 3.75, 0], scale: [2.5, 0.5, 2.5], color: '#6a4a6a' },
      // Tier 9 — approach summit
      { pos: [2, 4.25, 1], scale: [2.5, 0.5, 2.5], color: '#7a5a7a' },
      { pos: [0, 4.25, 0.5], scale: [2.5, 0.5, 2.5], color: '#7a5a7a' },
      // Tier 10 — final approach
      { pos: [-1, 4.75, -1], scale: [2.5, 0.5, 2.5], color: '#6a4a6a' },
      { pos: [0, 4.75, -2.5], scale: [2.5, 0.5, 2.5], color: '#6a4a6a' },
      // Summit — large landing
      { pos: [0, 5.2, -2], scale: [4, 0.6, 4], color: '#8a6a8a' },
    ],
    worldSize: 18,
  },
];

// ─── KEYBOARD HOOK ──────────────────────────────────────────────────────────
function useKeyboard() {
  const keys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      keys.current.add(e.key.toLowerCase());
    };
    const handleUp = (e: KeyboardEvent) => {
      keys.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  return keys;
}

// ─── ORBIT CAMERA THAT FOLLOWS PLAYER ───────────────────────────────────────
function FollowOrbitControls({ target }: { target: React.RefObject<THREE.Group | null> }) {
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (!target.current || !controlsRef.current) return;
    const p = target.current.position;
    controlsRef.current.target.lerp(new THREE.Vector3(p.x, p.y + 0.5, p.z), 0.1);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      minDistance={3}
      maxDistance={16}
      minPolarAngle={0.4}
      maxPolarAngle={Math.PI / 2.3}
      enableDamping
      dampingFactor={0.1}
    />
  );
}

// ─── FIRST-PERSON CAMERA ────────────────────────────────────────────────────
function FirstPersonCamera({ target }: { target: React.RefObject<THREE.Group | null> }) {
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const isLocked = useRef(false);
  const initialized = useRef(false);

  useEffect(() => {
    const canvas = gl.domElement;
    const onMouseMove = (e: MouseEvent) => {
      if (!isLocked.current) return;
      yaw.current -= e.movementX * 0.002;
      pitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 4, pitch.current - e.movementY * 0.002));
    };
    const onClick = () => {
      if (!isLocked.current) canvas.requestPointerLock();
    };
    const onLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas;
    };
    canvas.addEventListener('click', onClick);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onLockChange);
    return () => {
      canvas.removeEventListener('click', onClick);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onLockChange);
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    };
  }, [gl]);

  useFrame(() => {
    if (!target.current) return;
    if (!initialized.current) {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      yaw.current = Math.atan2(-dir.x, -dir.z);
      pitch.current = Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1));
      initialized.current = true;
    }
    const p = target.current.position;
    camera.position.set(p.x, p.y + 1.5, p.z);
    const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);
    target.current.rotation.y = yaw.current;
  });

  return null;
}

// ─── PLAYER CHARACTER ───────────────────────────────────────────────────────
interface PlayerProps {
  playerRef: React.RefObject<THREE.Group | null>;
  worldSize: number;
  obstacles: Obstacle[];
  hazards: Hazard[];
  viewMode: 'first' | 'third';
}

// AABB collision check: does a circle at (px,pz) with radius r overlap a box obstacle?
function collidesWithObstacle(px: number, pz: number, r: number, obs: Obstacle): boolean {
  const [ox, , oz] = obs.pos;
  const [sx, , sz] = obs.scale;
  const halfX = sx / 2;
  const halfZ = sz / 2;
  // closest point on box to circle center
  const cx = Math.max(ox - halfX, Math.min(px, ox + halfX));
  const cz = Math.max(oz - halfZ, Math.min(pz, oz + halfZ));
  const dx = px - cx;
  const dz = pz - cz;
  return dx * dx + dz * dz < r * r;
}

function Player({ playerRef, worldSize, obstacles, hazards, viewMode }: PlayerProps) {
  const innerGroup = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions, names } = useAnimations(animations, innerGroup);
  const keys = useKeyboard();
  const isMoving = useRef(false);
  const isJumping = useRef(false);
  const jumpVelocity = useRef(0);
  const velocity = useRef(new THREE.Vector3());
  const rootBoneRef = useRef<THREE.Object3D | null>(null);
  const sceneInitPos = useRef(new THREE.Vector3());
  const groundY = useRef(0); // current floor height (0 = ground, or top of platform)
  const PLAYER_RADIUS = 0.45;

  const idleName = names.find(n => n === 'Angry_Ground_Stomp') || names[0];
  const runName = names.find(n => n === 'Crouch_and_Step_Back') || names[1] || idleName;
  const jumpName = names.find(n => n === 'Chair_Sit_Idle_M') || null;  // jump in place
  const jumpRunName = names.find(n => n === 'Arise') || jumpName;       // jump while running

  // Setup model
  useEffect(() => {
    // Reset scene from any other page's modifications
    scene.position.set(0, 0, 0);
    scene.scale.set(1, 1, 1);
    scene.rotation.set(0, 0, 0);
    scene.visible = true;

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const targetHeight = 1.4;
    const scale = THREE.MathUtils.clamp(targetHeight / Math.max(size.y, 0.001), 0.3, 1.5);

    scene.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    scene.scale.setScalar(scale);

    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
          obj.material.roughness = 0.7;
          obj.material.metalness = 0.1;
        }
      }
      if (obj.isBone && (!obj.parent || !(obj.parent as any).isBone)) {
        rootBoneRef.current = obj;
      }
    });
    sceneInitPos.current.copy(scene.position);
  }, [scene]);

  // Start idle anim
  useEffect(() => {
    if (idleName && actions[idleName]) {
      actions[idleName]!.reset().fadeIn(0.1).play();
    }
  }, [idleName, actions]);

  // Cleanup on unmount - reset scene for other pages
  useEffect(() => {
    return () => {
      scene.visible = true;
      scene.position.set(0, 0, 0);
      scene.scale.set(1, 1, 1);
      scene.rotation.set(0, 0, 0);
    };
  }, [scene]);

  // WASD movement + jump + collision
  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const k = keys.current;

    // Camera-relative movement
    const camForward = new THREE.Vector3();
    state.camera.getWorldDirection(camForward);
    camForward.y = 0;
    camForward.normalize();
    const camRight = new THREE.Vector3();
    camRight.crossVectors(camForward, new THREE.Vector3(0, 1, 0)).normalize();

    const moveDir = new THREE.Vector3();
    if (k.has('w') || k.has('arrowup')) moveDir.add(camForward);
    if (k.has('s') || k.has('arrowdown')) moveDir.sub(camForward);
    if (k.has('d') || k.has('arrowright')) moveDir.add(camRight);
    if (k.has('a') || k.has('arrowleft')) moveDir.sub(camRight);

    const moving = moveDir.lengthSq() > 0;

    // Jump
    if ((k.has(' ') || k.has('spacebar')) && !isJumping.current) {
      isJumping.current = true;
      jumpVelocity.current = 6;
      // Pick jump anim based on whether moving
      const jAnim = (isMoving.current && jumpRunName) ? jumpRunName : jumpName;
      if (jAnim && actions[jAnim]) {
        if (isMoving.current && runName && actions[runName]) actions[runName]!.fadeOut(0.15);
        else if (idleName && actions[idleName]) actions[idleName]!.fadeOut(0.15);
        actions[jAnim]!.reset().fadeIn(0.15).play();
        actions[jAnim]!.setLoop(THREE.LoopOnce, 1);
        actions[jAnim]!.clampWhenFinished = true;
      }
    }

    // ── GRAVITY + PLATFORM LANDING ──
    if (isJumping.current) {
      jumpVelocity.current -= 15 * delta;
      playerRef.current.position.y += jumpVelocity.current * delta;
    }

    if (moving) {
      moveDir.normalize();
      velocity.current.lerp(moveDir.multiplyScalar(MOVE_SPEED), 0.15);

      // Face movement direction (3rd person only — FP camera controls rotation)
      if (viewMode === 'third') {
        const targetAngle = Math.atan2(velocity.current.x, velocity.current.z);
        const currentAngle = playerRef.current.rotation.y;
        let angleDiff = targetAngle - currentAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        playerRef.current.rotation.y += angleDiff * ROTATION_SPEED * delta;
      }

      if (!isMoving.current && !isJumping.current) {
        isMoving.current = true;
        if (runName && actions[runName] && idleName && actions[idleName]) {
          actions[idleName]!.fadeOut(0.2);
          actions[runName]!.reset().fadeIn(0.2).play();
        }
      }
    } else {
      velocity.current.lerp(new THREE.Vector3(0, 0, 0), 0.2);

      if (isMoving.current && velocity.current.length() < 0.1 && !isJumping.current) {
        isMoving.current = false;
        if (runName && actions[runName] && idleName && actions[idleName]) {
          actions[runName]!.fadeOut(0.2);
          actions[idleName]!.reset().fadeIn(0.2).play();
        }
      }
    }

    // Calculate new position
    let newX = playerRef.current.position.x + velocity.current.x * delta;
    let newZ = playerRef.current.position.z + velocity.current.z * delta;

    // Clamp to world bounds
    const bound = worldSize / 2 - 0.5;
    newX = THREE.MathUtils.clamp(newX, -bound, bound);
    newZ = THREE.MathUtils.clamp(newZ, -bound, bound);

    // Side collision — only walls the player can't step onto
    // Use a generous threshold: only block if player feet are well below the top
    const playerFeetY = playerRef.current.position.y;
    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      const obsTop = obs.pos[1] + obs.scale[1] / 2;
      const obsBottom = obs.pos[1] - obs.scale[1] / 2;
      // Skip if player can step onto this platform
      if (playerFeetY >= obsTop - 0.55) continue;
      // Skip if obstacle is far above the player (not a wall at this height)
      if (obsBottom > playerFeetY + 1.8) continue;

      if (collidesWithObstacle(newX, newZ, PLAYER_RADIUS, obs)) {
        const oldX = playerRef.current.position.x;
        const oldZ = playerRef.current.position.z;

        const bX = collidesWithObstacle(newX, oldZ, PLAYER_RADIUS, obs);
        const bZ = collidesWithObstacle(oldX, newZ, PLAYER_RADIUS, obs);

        if (!bX && bZ) {
          newZ = oldZ;
        } else if (bX && !bZ) {
          newX = oldX;
        } else {
          // Push out along shortest axis
          const [ox, , oz] = obs.pos;
          const [sx, , sz] = obs.scale;
          const halfX = sx / 2 + PLAYER_RADIUS;
          const halfZ = sz / 2 + PLAYER_RADIUS;
          const pushRight = (ox + halfX) - newX;
          const pushLeft = newX - (ox - halfX);
          const pushFront = (oz + halfZ) - newZ;
          const pushBack = newZ - (oz - halfZ);
          const minPush = Math.min(pushRight, pushLeft, pushFront, pushBack);
          if (minPush === pushRight) newX = ox + halfX;
          else if (minPush === pushLeft) newX = ox - halfX;
          else if (minPush === pushFront) newZ = oz + halfZ;
          else newZ = oz - halfZ;
          velocity.current.set(0, 0, 0);
        }
      }
    }

    playerRef.current.position.x = newX;
    playerRef.current.position.z = newZ;

    // Now compute floor AFTER final XZ is known
    let floorY = 0;
    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      const [ox, oy, oz] = obs.pos;
      const [sx, sy, sz] = obs.scale;
      const obsTop = oy + sy / 2;
      // Use final player position for footprint check (generous margin)
      if (newX > ox - sx / 2 - 0.1 && newX < ox + sx / 2 + 0.1 &&
          newZ > oz - sz / 2 - 0.1 && newZ < oz + sz / 2 + 0.1) {
        if (playerFeetY >= obsTop - 0.6 && obsTop > floorY) {
          floorY = obsTop;
        }
      }
    }

    // Walked off edge — fall
    if (!isJumping.current && playerRef.current.position.y > floorY + 0.02) {
      isJumping.current = true;
      jumpVelocity.current = 0;
    }

    // Land
    if (playerRef.current.position.y <= floorY && jumpVelocity.current <= 0) {
      playerRef.current.position.y = floorY;
      groundY.current = floorY;
      if (isJumping.current) {
        isJumping.current = false;
        jumpVelocity.current = 0;
        if (jumpName && actions[jumpName]) actions[jumpName]!.fadeOut(0.15);
        if (jumpRunName && jumpRunName !== jumpName && actions[jumpRunName]) actions[jumpRunName]!.fadeOut(0.15);
        if (moving && runName && actions[runName]) {
          actions[runName]!.reset().fadeIn(0.15).play();
        } else if (idleName && actions[idleName]) {
          actions[idleName]!.reset().fadeIn(0.15).play();
        }
      }
    }

    // ── HAZARD ARM COLLISION (solid obstacle — blocks like a wall) ──
    for (let hi = 0; hi < hazards.length; hi++) {
      const h = hazards[hi];
      const armW = h.armWidth || 0.35;
      const playerY = playerRef.current.position.y;
      // Only collide if player is at spinner height (+/- arm thickness + body height)
      if (Math.abs(playerY - h.pos[1]) > armW * 0.5 + 1.2) continue;

      const angle = state.clock.elapsedTime * h.speed;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const hitR = armW * 0.5 + PLAYER_RADIUS;

      for (let t = 0.3; t <= 1.0; t += 0.15) {
        for (let sign = -1; sign <= 1; sign += 2) {
          const armX = h.pos[0] + cosA * h.radius * t * sign;
          const armZ = h.pos[2] - sinA * h.radius * t * sign;
          const dx = playerRef.current.position.x - armX;
          const dz = playerRef.current.position.z - armZ;
          const distSq = dx * dx + dz * dz;

          if (distSq < hitR * hitR) {
            // Push player just outside the arm, like a wall
            const dist = Math.sqrt(distSq) || 0.01;
            playerRef.current.position.x = armX + (dx / dist) * hitR;
            playerRef.current.position.z = armZ + (dz / dist) * hitR;
          }
        }
      }
    }

    // Lock scene position & root bone to prevent animation root-motion drift
    scene.position.copy(sceneInitPos.current);
    if (rootBoneRef.current) {
      rootBoneRef.current.position.x = 0;
      rootBoneRef.current.position.z = 0;
    }
  });

  // Hide model in first-person view
  useEffect(() => {
    scene.visible = viewMode !== 'first';
  }, [viewMode, scene]);

  return (
    <group ref={innerGroup}>
      <primitive object={scene} />
    </group>
  );
}

// ─── COLLECTIBLE ORB ────────────────────────────────────────────────────────
function Orb({ position, color, collected, onCollect }: {
  position: [number, number, number];
  color: string;
  collected: boolean;
  onCollect: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.rotation.y += 0.03;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2.5) * 0.15;
    }
    if (glowRef.current && !collected) {
      glowRef.current.rotation.y -= 0.02;
      glowRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
    }
  });

  if (collected) return null;

  return (
    <group position={position}>
      <mesh ref={ref} onClick={onCollect}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh ref={glowRef}>
        <torusGeometry args={[0.55, 0.04, 16, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.5} />
      </mesh>
      <pointLight color={color} intensity={2} distance={4} />
    </group>
  );
}

// ─── PORTAL TO NEXT LEVEL ───────────────────────────────────────────────────
function Portal({ position, color, active }: {
  position: [number, number, number];
  color: string;
  active: boolean;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.02;
      ref.current.children.forEach((child, i) => {
        child.position.y = 1 + Math.sin(state.clock.elapsedTime * 2 + i * 0.8) * 0.15;
      });
    }
  });

  if (!active) return null;

  return (
    <group position={position} ref={ref}>
      <mesh>
        <torusGeometry args={[1.2, 0.08, 16, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} metalness={1} roughness={0} transparent opacity={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.06, 16, 64]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={0.8} transparent opacity={0.6} />
      </mesh>
      <mesh>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color={color} intensity={4} distance={8} />
      <Html center position={[0, 2, 0]}>
        <div className="portal-label">NEXT LEVEL →</div>
      </Html>
    </group>
  );
}

// ─── SPINNING HAZARD ────────────────────────────────────────────────────────
function SpinningHazard({ hazard }: { hazard: Hazard }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * hazard.speed;
    }
  });

  const armW = hazard.armWidth || 0.35;

  return (
    <group position={hazard.pos} ref={ref}>
      {/* Short stem below hub */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.5, 8]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Spinner hub */}
      <mesh castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.4, 12]} />
        <meshStandardMaterial color={hazard.color} emissive={hazard.color} emissiveIntensity={0.3} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Arm */}
      <mesh position={[hazard.radius / 2, 0, 0]} castShadow>
        <boxGeometry args={[hazard.radius, armW, armW]} />
        <meshStandardMaterial color={hazard.color} emissive={hazard.color} emissiveIntensity={0.4} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-hazard.radius / 2, 0, 0]} castShadow>
        <boxGeometry args={[hazard.radius, armW, armW]} />
        <meshStandardMaterial color={hazard.color} emissive={hazard.color} emissiveIntensity={0.4} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Tip glow balls */}
      <mesh position={[hazard.radius, 0, 0]}>
        <sphereGeometry args={[armW * 0.8, 12, 12]} />
        <meshStandardMaterial color={hazard.color} emissive={hazard.color} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-hazard.radius, 0, 0]}>
        <sphereGeometry args={[armW * 0.8, 12, 12]} />
        <meshStandardMaterial color={hazard.color} emissive={hazard.color} emissiveIntensity={0.8} />
      </mesh>
      <pointLight color={hazard.color} intensity={1.5} distance={3} />
    </group>
  );
}

// ─── LEVEL GROUND + OBSTACLES ───────────────────────────────────────────────
function LevelWorld({ level }: { level: LevelData }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[level.worldSize, level.worldSize]} />
        <meshStandardMaterial color={level.groundColor} metalness={0.2} roughness={0.9} />
      </mesh>

      <gridHelper args={[level.worldSize, level.worldSize, 0x222233, 0x1a1a2a]} position={[0, 0.01, 0]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[level.worldSize / 2 - 0.3, level.worldSize / 2, 64]} />
        <meshStandardMaterial color={level.color} emissive={level.color} emissiveIntensity={0.6} transparent opacity={0.4} />
      </mesh>

      {level.obstacles.map((obs, i) => (
        <mesh key={i} position={obs.pos} castShadow receiveShadow>
          <boxGeometry args={obs.scale} />
          <meshStandardMaterial color={obs.color} metalness={0.4} roughness={0.6} />
        </mesh>
      ))}

      {level.obstacles.map((obs, i) => (
        <mesh key={`deco-${i}`} position={[obs.pos[0], obs.pos[1] + obs.scale[1] + 0.3, obs.pos[2]]}>
          <dodecahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial color={level.color} emissive={level.color} emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* Spinning hazards */}
      {level.hazards.map((h, i) => (
        <SpinningHazard key={`hazard-${i}`} hazard={h} />
      ))}
    </>
  );
}

// ─── MAIN GAME SCENE ────────────────────────────────────────────────────────
interface GameSceneProps {
  level: LevelData;
  collectedOrbs: Set<string>;
  onCollectOrb: (orbKey: string) => void;
  portalActive: boolean;
  onPortalEnter: () => void;
  playerRef: React.RefObject<THREE.Group | null>;
  viewMode: 'first' | 'third';
}

// ─── PROXIMITY CHECKER (runs in useFrame, no state = no lag) ────────────────
function ProximityChecker({ playerRef, level, collectedOrbs, onCollectOrb, portalActive, onPortalEnter }: {
  playerRef: React.RefObject<THREE.Group | null>;
  level: LevelData;
  collectedOrbs: React.MutableRefObject<Set<string>>;
  onCollectOrb: (key: string) => void;
  portalActive: React.MutableRefObject<boolean>;
  onPortalEnter: () => void;
}) {
  const portalFired = useRef(false);

  // Reset portal guard on level change
  useEffect(() => { portalFired.current = false; }, [level.id]);

  useFrame(() => {
    if (!playerRef.current) return;
    const px = playerRef.current.position.x;
    const pz = playerRef.current.position.z;

    // Check orbs
    level.orbPositions.forEach((orbPos, i) => {
      const key = `${level.id}-${i}`;
      if (collectedOrbs.current.has(key)) return;
      const dx = px - orbPos[0];
      const dz = pz - orbPos[2];
      if (dx * dx + dz * dz < 1.44) { // 1.2^2
        onCollectOrb(key);
      }
    });

    // Check portal
    if (portalActive.current && !portalFired.current) {
      const dx = px - level.portalPos[0];
      const dz = pz - level.portalPos[2];
      if (dx * dx + dz * dz < 3.24) { // 1.8^2
        portalFired.current = true;
        onPortalEnter();
      }
    }
  });

  return null;
}

function GameScene({ level, collectedOrbs, onCollectOrb, portalActive, onPortalEnter, playerRef, viewMode }: GameSceneProps) {
  // keep refs in sync for the proximity checker (no re-renders)
  const collectedRef = useRef(collectedOrbs);
  collectedRef.current = collectedOrbs;
  const portalRef = useRef(portalActive);
  portalRef.current = portalActive;

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[8, 12, 8]}
        intensity={0.9}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={30}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.2} />
      <hemisphereLight args={['#88ccff', level.groundColor, 0.3]} />
      <Environment preset={level.envPreset} />
      <LevelWorld level={level} />

      {level.orbPositions.map((pos, i) => {
        const orbKey = `${level.id}-${i}`;
        return (
          <Orb
            key={orbKey}
            position={pos}
            color={level.color}
            collected={collectedOrbs.has(orbKey)}
            onCollect={() => onCollectOrb(orbKey)}
          />
        );
      })}

      <Portal position={level.portalPos} color={level.color} active={portalActive} />

      <group ref={playerRef as React.RefObject<THREE.Group>}>
        <Player playerRef={playerRef} worldSize={level.worldSize} obstacles={level.obstacles} hazards={level.hazards} viewMode={viewMode} />
      </group>

      <ProximityChecker
        playerRef={playerRef}
        level={level}
        collectedOrbs={collectedRef}
        onCollectOrb={onCollectOrb}
        portalActive={portalRef}
        onPortalEnter={onPortalEnter}
      />

      {viewMode === 'third' ? (
        <FollowOrbitControls target={playerRef} />
      ) : (
        <FirstPersonCamera target={playerRef} />
      )}
    </>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function AboutPage() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [collectedOrbs, setCollectedOrbs] = useState<Set<string>>(new Set());
  const [discoveredFacts, setDiscoveredFacts] = useState<LevelData[]>([]);
  const [showFactModal, setShowFactModal] = useState(false);
  const [currentFact, setCurrentFact] = useState<LevelData | null>(null);
  const [showLevelIntro, setShowLevelIntro] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);
  const [viewMode, setViewMode] = useState<'first' | 'third'>('first');
  const playerRef = useRef<THREE.Group>(null);

  const handleResetLevel = useCallback(() => {
    // Clear orbs for current level only
    setCollectedOrbs(prev => {
      const next = new Set(prev);
      const lvl = LEVELS[currentLevel];
      lvl.orbPositions.forEach((_, i) => next.delete(`${lvl.id}-${i}`));
      return next;
    });
    if (playerRef.current) {
      playerRef.current.position.set(0, 0, 0);
    }
  }, [currentLevel]);

  // Toggle view mode with V key, reset with R
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'v') {
        setViewMode(v => v === 'first' ? 'third' : 'first');
      }
      if (e.key.toLowerCase() === 'r') {
        handleResetLevel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleResetLevel]);

  const level = LEVELS[currentLevel];

  const levelOrbsCollected = level.orbPositions.filter((_, i) =>
    collectedOrbs.has(`${level.id}-${i}`)
  ).length;
  const allOrbsCollected = levelOrbsCollected >= level.orbPositions.length;

  useEffect(() => {
    setShowLevelIntro(true);
    const timer = setTimeout(() => setShowLevelIntro(false), 2500);
    return () => clearTimeout(timer);
  }, [currentLevel]);

  const handleCollectOrb = useCallback((orbKey: string) => {
    setCollectedOrbs(prev => {
      const next = new Set(prev);
      next.add(orbKey);
      return next;
    });
  }, []);

  const handlePortalEnter = useCallback(() => {
    setCurrentFact(level);
    setDiscoveredFacts(prev => [...prev, level]);
    setShowFactModal(true);
    // Exit pointer lock so modal is visible
    if (document.pointerLockElement) document.exitPointerLock();
  }, [level]);

  const advanceLevel = useCallback(() => {
    setShowFactModal(false);
    if (currentLevel < LEVELS.length - 1) {
      setCurrentLevel(prev => prev + 1);
      if (playerRef.current) {
        playerRef.current.position.set(0, 0, 0);
      }
      // Re-request pointer lock after a short delay (let React re-render first)
      setTimeout(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) canvas.requestPointerLock();
      }, 200);
    } else {
      setGameComplete(true);
    }
  }, [currentLevel]);

  // Auto-advance after showing the fact modal for 3 seconds
  useEffect(() => {
    if (!showFactModal) return;
    const timer = setTimeout(() => {
      advanceLevel();
    }, 3000);
    return () => clearTimeout(timer);
  }, [showFactModal, advanceLevel]);

  return (
    <>
      <Sidebar />
      <div className="about-page">
        {/* ─── GAME HUD ─── */}
        <div className="game-hud">
          <div className="hud-left">
            <div className="level-badge" style={{ borderColor: level.color }}>
              <span className="level-num">LVL {level.id}</span>
              <span className="level-name">{level.name}</span>
            </div>
          </div>
          <div className="hud-center">
            <div className="orb-counter">
              <span className="orb-icon" style={{ color: level.color }}>◆</span>
              <span>{levelOrbsCollected} / {level.orbPositions.length}</span>
              {allOrbsCollected && <span className="portal-hint">Portal open!</span>}
            </div>
          </div>
          <div className="hud-right">
            <button className="reset-level-btn" onClick={handleResetLevel}>
              <span className="reset-level-label">Reset Level</span>
              <span className="reset-level-key">R</span>
            </button>
            <button
              className="view-toggle-btn"
              onClick={() => setViewMode(v => v === 'first' ? 'third' : 'first')}
            >
              <span className="view-toggle-icon">{viewMode === 'first' ? '3P' : '1P'}</span>
              <span className="view-toggle-label">{viewMode === 'first' ? '3rd Person' : '1st Person'}</span>
              <span className="view-toggle-key">V</span>
            </button>
            <div className="facts-collected">
              {LEVELS.map(l => (
                <span
                  key={l.id}
                  className={`fact-pip ${discoveredFacts.find(d => d.id === l.id) ? 'filled' : ''}`}
                  style={{ backgroundColor: discoveredFacts.find(d => d.id === l.id) ? l.color : undefined }}
                  title={l.category}
                />
              ))}
            </div>
          </div>
        </div>

        {/* WASD controls hint */}
        <div className="controls-hint">
          <div className="key-row"><span className="key">W</span></div>
          <div className="key-row">
            <span className="key">A</span>
            <span className="key">S</span>
            <span className="key">D</span>
          </div>
          <div className="key-row"><span className="key space-key">SPACE</span></div>
          <div className="controls-label">MOVE &middot; JUMP</div>
          <div className="controls-extra">
            {viewMode === 'first' ? 'Click to look · ESC to release · V to switch view' : 'Scroll to zoom · Drag to rotate · V to switch view'}
          </div>
        </div>

        {/* Crosshair in first-person mode */}
        {viewMode === 'first' && <div className="crosshair">+</div>}

        {/* ─── 3D CANVAS ─── */}
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} camera={{ position: [0, 1.5, 0.5], fov: 50 }}>
          <Suspense fallback={<Html center><div className="loading-game">Loading Level...</div></Html>}>
            <GameScene
              level={level}
              collectedOrbs={collectedOrbs}
              onCollectOrb={handleCollectOrb}
              portalActive={allOrbsCollected}
              onPortalEnter={handlePortalEnter}
              playerRef={playerRef}
              viewMode={viewMode}
            />
          </Suspense>
        </Canvas>

        {/* ─── LEVEL INTRO OVERLAY ─── */}
        {showLevelIntro && (
          <div className="level-intro-overlay">
            <div className="level-intro" style={{ borderColor: level.color }}>
              <span className="intro-icon">{level.icon}</span>
              <h2>Level {level.id}</h2>
              <h1 style={{ color: level.color }}>{level.name}</h1>
              <p>Collect all orbs to unlock the portal</p>
            </div>
          </div>
        )}

        {/* ─── FACT MODAL ─── */}
        {showFactModal && currentFact && (
          <div className="fact-modal-overlay">
            <div className="fact-modal">
              <div className="fact-icon" style={{ backgroundColor: currentFact.color }}>
                {currentFact.icon}
              </div>
              <h3>{currentFact.category}</h3>
              <p>{currentFact.fact}</p>
              {currentLevel < LEVELS.length - 1 ? (
                <button onClick={advanceLevel} style={{ background: `linear-gradient(135deg, ${currentFact.color}, ${currentFact.color}88)` }}>
                  Next Level →
                </button>
              ) : (
                <p style={{ opacity: 0.5, fontSize: '0.85rem', marginTop: '0.5rem' }}>Finishing...</p>
              )}
            </div>
          </div>
        )}

        {/* ─── GAME COMPLETE ─── */}
        {gameComplete && (
          <div className="game-complete-overlay">
            <div className="game-complete">
              <h1>QUEST COMPLETE</h1>
              <p>You discovered everything about Aaron!</p>
              <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>19 · Bolivian · Arlington, VA · WGU CS Student · Software Engineer @ Amazon</p>
              <div className="complete-facts">
                {discoveredFacts.map(f => (
                  <div key={f.id} className="complete-fact-row">
                    <span>{f.icon}</span>
                    <span>{f.category}:</span>
                    <span>{f.fact}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => {
                setCurrentLevel(0);
                setCollectedOrbs(new Set());
                setDiscoveredFacts([]);
                setGameComplete(false);
                if (playerRef.current) playerRef.current.position.set(0, 0, 0);
              }}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

useGLTF.preload(MODEL_PATH);
