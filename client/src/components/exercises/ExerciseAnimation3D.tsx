import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCw,
  Eye,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Wind,
  Gauge,
  Sliders,
} from 'lucide-react';
import { Exercise } from '../../types';

interface ExerciseAnimation3DProps {
  exercise: Exercise;
  isPlaying?: boolean;
}

export const ExerciseAnimation3D: React.FC<ExerciseAnimation3DProps> = ({
  exercise,
  isPlaying = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [animating, setAnimating] = useState(isPlaying);
  const [cameraAngle, setCameraAngle] = useState<'angle' | 'front' | 'side' | 'back'>('angle');
  const [targetMuscle, setTargetMuscle] = useState<string>('Cervical Spine & Postural Stabilizers');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0); // 0.5x, 1.0x, 1.5x
  const [viewMode, setViewMode] = useState<'proper' | 'mistake'>('proper'); // 'proper' vs 'mistake'
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mannequinGroupRef = useRef<THREE.Group | null>(null);
  const chairGroupRef = useRef<THREE.Group | null>(null);

  // Body parts refs for procedural anatomical kinematics
  const headMeshRef = useRef<THREE.Group | null>(null);
  const neckMeshRef = useRef<THREE.Mesh | null>(null);
  const chestMeshRef = useRef<THREE.Mesh | null>(null);
  const spineGroupRef = useRef<THREE.Group | null>(null);
  const leftClavicleRef = useRef<THREE.Group | null>(null);
  const rightClavicleRef = useRef<THREE.Group | null>(null);
  const leftUpperArmRef = useRef<THREE.Group | null>(null);
  const rightUpperArmRef = useRef<THREE.Group | null>(null);
  const leftForearmRef = useRef<THREE.Group | null>(null);
  const rightForearmRef = useRef<THREE.Group | null>(null);
  const leftHandRef = useRef<THREE.Mesh | null>(null);
  const rightHandRef = useRef<THREE.Mesh | null>(null);
  const pelvisMeshRef = useRef<THREE.Mesh | null>(null);
  const leftThighRef = useRef<THREE.Group | null>(null);
  const rightThighRef = useRef<THREE.Group | null>(null);
  const leftShinRef = useRef<THREE.Group | null>(null);
  const rightShinRef = useRef<THREE.Group | null>(null);
  const focusBeaconRef = useRef<THREE.Mesh | null>(null);
  const contactShadowRef = useRef<THREE.Mesh | null>(null);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setAnimating(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = 320;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Crisp modern neutral off-white
    sceneRef.current = scene;

    // 2. Camera Setup (Perspective focused on anatomical center)
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(2.2, 1.6, 2.9);
    camera.lookAt(0, 1.05, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer with High DPI antialiasing and shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    // Key directional light (soft sunlight from top right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(4, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Warm fill light (softening shadows on opposite side)
    const fillLight = new THREE.DirectionalLight(0xccfbf1, 0.6);
    fillLight.position.set(-4, 3, 2);
    scene.add(fillLight);

    // Cyan/Teal Rim Light (creates muscular contour silhouette)
    const rimLight = new THREE.DirectionalLight(0x0d9488, 0.8);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // 5. Floor Studio Stage & Grid
    const floorPlateGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.02, 36);
    const floorPlateMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.9,
    });
    const floorPlate = new THREE.Mesh(floorPlateGeo, floorPlateMat);
    floorPlate.position.y = -0.01;
    floorPlate.receiveShadow = true;
    scene.add(floorPlate);

    const gridHelper = new THREE.GridHelper(3.2, 16, 0x14b8a6, 0xe2e8f0);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // Soft Contact Shadow plate under figure
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = Math.PI / 2;
    contactShadow.position.y = 0.01;
    scene.add(contactShadow);
    contactShadowRef.current = contactShadow;

    // 6. Realistic Anatomical Materials
    // Primary athletic charcoal fabric
    const athleteMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      metalness: 0.1,
    });

    // Vibrant teal posture alignment stripes
    const postureLaserMat = new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      roughness: 0.25,
      metalness: 0.35,
      emissive: new THREE.Color(0x042f2e),
    });

    // Joint articulation pivot spheres (titanium finish)
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.6,
    });

    // Vertebrae spine markers
    const spineMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      roughness: 0.3,
      emissive: new THREE.Color(0x0f766e),
      emissiveIntensity: 0.3,
    });

    // Modern ergonomic mesh chair materials
    const chairFrameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const chairCushionMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });

    // 7. Mannequin Root Assembly
    const mannequin = new THREE.Group();
    mannequinGroupRef.current = mannequin;
    scene.add(mannequin);

    // Determine standing vs seated exercise
    const titleLower = exercise.title.toLowerCase();
    const isStanding =
      exercise.category === 'standing_breaks' ||
      titleLower.includes('squat') ||
      titleLower.includes('calf') ||
      titleLower.includes('windmill') ||
      titleLower.includes('balance') ||
      titleLower.includes('doorway') ||
      titleLower.includes('wall angel');

    // ----------------------------------------------------
    // ERGONOMIC CHAIR (Rendered for Seated Exercises)
    // ----------------------------------------------------
    const chairGroup = new THREE.Group();
    chairGroupRef.current = chairGroup;
    scene.add(chairGroup);

    if (!isStanding) {
      // Seat cushion (ergonomic contoured waterfall edge)
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.09, 0.65), chairCushionMat);
      seat.position.set(0, 0.58, 0);
      seat.castShadow = true;
      chairGroup.add(seat);

      // Ergonomic Lumbar Mesh Backrest
      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.68, 0.06), chairFrameMat);
      backrest.position.set(0, 1.02, -0.32);
      backrest.rotation.x = -0.06;
      backrest.castShadow = true;
      chairGroup.add(backrest);

      // Lumbar support contour bar
      const lumbar = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.12, 0.08), postureLaserMat);
      lumbar.position.set(0, 0.88, -0.29);
      chairGroup.add(lumbar);

      // Pneumatic piston & Star Base
      const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55), chairFrameMat);
      cylinder.position.set(0, 0.28, 0);
      chairGroup.add(cylinder);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.04, 5), chairFrameMat);
      base.position.set(0, 0.02, 0);
      chairGroup.add(base);
    }

    // ----------------------------------------------------
    // ANATOMICAL HUMANOID BODY ASSEMBLY
    // ----------------------------------------------------
    const pelvisY = isStanding ? 0.95 : 0.68;

    // Pelvis (anatomical wedge)
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.22, 0.32), athleteMat);
    pelvis.position.set(0, pelvisY, 0);
    pelvis.castShadow = true;
    mannequin.add(pelvis);
    pelvisMeshRef.current = pelvis;

    // Dorsal Spine Column (5 articulate vertebrae)
    const spineGroup = new THREE.Group();
    spineGroup.position.set(0, pelvisY + 0.12, 0);
    mannequin.add(spineGroup);
    spineGroupRef.current = spineGroup;

    for (let i = 0; i < 5; i++) {
      const vert = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.065, 0.18), spineMat);
      vert.position.set(0, i * 0.08, -0.02);
      vert.castShadow = true;
      spineGroup.add(vert);
    }

    // Chest & Ribcage (athletic trapezoid with pectoral contours)
    const chestY = pelvisY + 0.52;
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.38, 0.32), athleteMat);
    chest.position.set(0, chestY, 0);
    chest.castShadow = true;
    mannequin.add(chest);
    chestMeshRef.current = chest;

    // Chest posture alignment strip
    const chestStripe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 0.33), postureLaserMat);
    chestStripe.position.set(0, 0, 0);
    chest.add(chestStripe);

    // Clavicle & Shoulder Girdle Pivots
    const leftClavicle = new THREE.Group();
    leftClavicle.position.set(-0.28, chestY + 0.14, 0);
    mannequin.add(leftClavicle);
    leftClavicleRef.current = leftClavicle;

    const leftDeltoid = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), jointMat);
    leftClavicle.add(leftDeltoid);

    const rightClavicle = new THREE.Group();
    rightClavicle.position.set(0.28, chestY + 0.14, 0);
    mannequin.add(rightClavicle);
    rightClavicleRef.current = rightClavicle;

    const rightDeltoid = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), jointMat);
    rightClavicle.add(rightDeltoid);

    // Cervical Spine (Neck)
    const neckY = chestY + 0.24;
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.16, 16), jointMat);
    neck.position.set(0, neckY, 0.02);
    neck.castShadow = true;
    mannequin.add(neck);
    neckMeshRef.current = neck;

    // Head Group (Smooth humanoid head with facial orientation & visor)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, neckY + 0.22, 0.03);
    mannequin.add(headGroup);
    headMeshRef.current = headGroup;

    // Cranium
    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.18, 28, 28), athleteMat);
    cranium.castShadow = true;
    headGroup.add(cranium);

    // Athletic Face Visor / Horizon Gaze plane
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.1), postureLaserMat);
    visor.position.set(0, 0.02, 0.14);
    headGroup.add(visor);

    // Chin landmark
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), athleteMat);
    chin.position.set(0, -0.12, 0.11);
    headGroup.add(chin);

    // Left Arm Hierarchy (Upper arm -> Elbow -> Forearm -> Hand)
    const leftUpperArm = new THREE.Group();
    leftClavicle.add(leftUpperArm);
    leftUpperArmRef.current = leftUpperArm;

    const leftBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.32, 16), athleteMat);
    leftBicep.position.set(0, -0.18, 0);
    leftBicep.castShadow = true;
    leftUpperArm.add(leftBicep);

    const leftElbow = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), jointMat);
    leftElbow.position.set(0, -0.34, 0);
    leftUpperArm.add(leftElbow);

    const leftForearm = new THREE.Group();
    leftForearm.position.set(0, -0.34, 0);
    leftUpperArm.add(leftForearm);
    leftForearmRef.current = leftForearm;

    const leftRadius = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.28, 16), athleteMat);
    leftRadius.position.set(0, -0.16, 0);
    leftRadius.castShadow = true;
    leftForearm.add(leftRadius);

    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.035), jointMat);
    leftHand.position.set(0, -0.35, 0);
    leftForearm.add(leftHand);
    leftHandRef.current = leftHand;

    // Right Arm Hierarchy (Upper arm -> Elbow -> Forearm -> Hand)
    const rightUpperArm = new THREE.Group();
    rightClavicle.add(rightUpperArm);
    rightUpperArmRef.current = rightUpperArm;

    const rightBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.32, 16), athleteMat);
    rightBicep.position.set(0, -0.18, 0);
    rightBicep.castShadow = true;
    rightUpperArm.add(rightBicep);

    const rightElbow = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), jointMat);
    rightElbow.position.set(0, -0.34, 0);
    rightUpperArm.add(rightElbow);

    const rightForearm = new THREE.Group();
    rightForearm.position.set(0, -0.34, 0);
    rightUpperArm.add(rightForearm);
    rightForearmRef.current = rightForearm;

    const rightRadius = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.28, 16), athleteMat);
    rightRadius.position.set(0, -0.16, 0);
    rightRadius.castShadow = true;
    rightForearm.add(rightRadius);

    const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.035), jointMat);
    rightHand.position.set(0, -0.35, 0);
    rightForearm.add(rightHand);
    rightHandRef.current = rightHand;

    // Legs & Feet Hierarchy
    const leftThigh = new THREE.Group();
    leftThigh.position.set(-0.16, pelvisY - 0.08, isStanding ? 0 : 0.06);
    mannequin.add(leftThigh);
    leftThighRef.current = leftThigh;

    const rightThigh = new THREE.Group();
    rightThigh.position.set(0.16, pelvisY - 0.08, isStanding ? 0 : 0.06);
    mannequin.add(rightThigh);
    rightThighRef.current = rightThigh;

    if (isStanding) {
      // Standing Quad & Knee & Calf
      const leftQuad = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.42, 16), athleteMat);
      leftQuad.position.set(0, -0.22, 0);
      leftQuad.castShadow = true;
      leftThigh.add(leftQuad);

      const leftKnee = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), jointMat);
      leftKnee.position.set(0, -0.44, 0);
      leftThigh.add(leftKnee);

      const leftShin = new THREE.Group();
      leftShin.position.set(0, -0.44, 0);
      leftThigh.add(leftShin);
      leftShinRef.current = leftShin;

      const leftCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.05, 0.42, 16), athleteMat);
      leftCalf.position.set(0, -0.22, 0);
      leftCalf.castShadow = true;
      leftShin.add(leftCalf);

      const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.24), jointMat);
      leftShoe.position.set(0, -0.44, 0.05);
      leftShin.add(leftShoe);

      // Right Leg (Standing)
      const rightQuad = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.42, 16), athleteMat);
      rightQuad.position.set(0, -0.22, 0);
      rightQuad.castShadow = true;
      rightThigh.add(rightQuad);

      const rightKnee = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), jointMat);
      rightKnee.position.set(0, -0.44, 0);
      rightThigh.add(rightKnee);

      const rightShin = new THREE.Group();
      rightShin.position.set(0, -0.44, 0);
      rightThigh.add(rightShin);
      rightShinRef.current = rightShin;

      const rightCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.05, 0.42, 16), athleteMat);
      rightCalf.position.set(0, -0.22, 0);
      rightCalf.castShadow = true;
      rightShin.add(rightCalf);

      const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.24), jointMat);
      rightShoe.position.set(0, -0.44, 0.05);
      rightShin.add(rightShoe);
    } else {
      // Seated 90-degree thigh & shins
      const leftQuad = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.48), athleteMat);
      leftQuad.position.set(0, 0, 0.24);
      leftQuad.castShadow = true;
      leftThigh.add(leftQuad);

      const leftKnee = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), jointMat);
      leftKnee.position.set(0, 0, 0.48);
      leftThigh.add(leftKnee);

      const leftShin = new THREE.Group();
      leftShin.position.set(0, 0, 0.48);
      leftThigh.add(leftShin);
      leftShinRef.current = leftShin;

      const leftCalf = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.52, 0.11), athleteMat);
      leftCalf.position.set(0, -0.28, 0);
      leftCalf.castShadow = true;
      leftShin.add(leftCalf);

      const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.22), jointMat);
      leftShoe.position.set(0, -0.56, 0.06);
      leftShin.add(leftShoe);

      // Right Leg (Seated)
      const rightQuad = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.48), athleteMat);
      rightQuad.position.set(0, 0, 0.24);
      rightQuad.castShadow = true;
      rightThigh.add(rightQuad);

      const rightKnee = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), jointMat);
      rightKnee.position.set(0, 0, 0.48);
      rightThigh.add(rightKnee);

      const rightShin = new THREE.Group();
      rightShin.position.set(0, 0, 0.48);
      rightThigh.add(rightShin);
      rightShinRef.current = rightShin;

      const rightCalf = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.52, 0.11), athleteMat);
      rightCalf.position.set(0, -0.28, 0);
      rightCalf.castShadow = true;
      rightShin.add(rightCalf);

      const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.22), jointMat);
      rightShoe.position.set(0, -0.56, 0.06);
      rightShin.add(rightShoe);
    }

    // ----------------------------------------------------
    // GLOWING ANATOMICAL FOCUS BEACON
    // ----------------------------------------------------
    const beaconGeo = new THREE.TorusGeometry(0.14, 0.02, 16, 32);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.rotation.x = Math.PI / 2;
    mannequin.add(beacon);
    focusBeaconRef.current = beacon;

    // Position beacon & configure target muscle name
    if (titleLower.includes('chin tuck') || titleLower.includes('cervical')) {
      beacon.position.set(0, neckY + 0.08, 0);
      setTargetMuscle('Deep Cervical Flexors & Suboccipitals');
    } else if (titleLower.includes('side reach') || titleLower.includes('intercostal')) {
      beacon.position.set(0.22, chestY + 0.04, 0);
      setTargetMuscle('Intercostal Muscles & Latissimus Dorsi');
    } else if (titleLower.includes('chair back') || titleLower.includes('thoracic extension')) {
      beacon.position.set(0, chestY + 0.08, -0.12);
      setTargetMuscle('Thoracic Spine Extensors & Pectorals');
    } else if (titleLower.includes('trap') || titleLower.includes('levator')) {
      beacon.position.set(0.18, neckY + 0.06, -0.06);
      setTargetMuscle('Upper Trapezius & Levator Scapulae');
    } else if (titleLower.includes('shoulder') || titleLower.includes('scapular') || titleLower.includes('cobra')) {
      beacon.position.set(0, chestY + 0.08, -0.16);
      setTargetMuscle('Rhomboids & Mid/Lower Trapezius');
    } else if (titleLower.includes('prayer') || titleLower.includes('reverse wrist')) {
      beacon.position.set(0, isStanding ? 1.05 : 0.85, 0.28);
      setTargetMuscle('Carpal Tunnel, Flexor Digitorum & Pronators');
    } else if (titleLower.includes('wrist') || titleLower.includes('finger') || titleLower.includes('carpal')) {
      beacon.position.set(0.32, isStanding ? 1.05 : 0.82, 0.28);
      setTargetMuscle('Forearm Flexors, Extensors & Carpal Tunnel');
    } else if (titleLower.includes('pec') || titleLower.includes('chest') || titleLower.includes('open-book')) {
      beacon.position.set(0, chestY + 0.06, 0.18);
      setTargetMuscle('Pectoralis Major & Anterior Deltoid');
    } else if (titleLower.includes('cat-cow') || titleLower.includes('rotation') || titleLower.includes('spinal')) {
      beacon.position.set(0, chestY - 0.1, 0);
      setTargetMuscle('Thoracolumbar Spine & Facet Joints');
    } else if (titleLower.includes('quad')) {
      beacon.position.set(0.14, pelvisY - 0.18, 0);
      setTargetMuscle('Rectus Femoris & Psoas Major');
    } else if (titleLower.includes('hip') || titleLower.includes('lunge') || titleLower.includes('figure-4')) {
      beacon.position.set(0, pelvisY + 0.04, 0);
      setTargetMuscle('Iliopsoas, Gluteus Medius & Piriformis');
    } else if (titleLower.includes('calf') || titleLower.includes('ankle')) {
      beacon.position.set(0, 0.32, 0);
      setTargetMuscle('Gastrocnemius & Soleus Venous Pump');
    } else if (titleLower.includes('squat')) {
      beacon.position.set(0, pelvisY, 0);
      setTargetMuscle('Quadriceps, Glutes & Erector Spinae');
    } else {
      beacon.position.set(0, chestY, 0);
      setTargetMuscle('Core Postural Stabilizers');
    }

    // ----------------------------------------------------
    // BIOMECHANICAL PROCEDURAL ANIMATION LOOP
    // ----------------------------------------------------
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime() * playbackSpeed;

      // Pulsing target beacon animation
      if (focusBeaconRef.current) {
        const pulse = 1 + Math.sin(elapsed * 4) * 0.18;
        focusBeaconRef.current.scale.set(pulse, pulse, pulse);
      }

      // Breathing Cycle phase calculation (4s Inhale, 2s Hold, 4s Exhale)
      const breathTime = elapsed % 10;
      if (breathTime < 4) setBreathPhase('Inhale');
      else if (breathTime < 6) setBreathPhase('Hold');
      else setBreathPhase('Exhale');

      // --------------------------------------------------
      // MISTAKE / SLOUCH FORM DEMONSTRATION MODE
      // --------------------------------------------------
      if (viewMode === 'mistake') {
        // Demonstrate severe computer slouch (Forward head + rounded kyphotic shoulders)
        if (headMeshRef.current) {
          headMeshRef.current.position.z = 0.18; // Head jutting forward 4 inches
          headMeshRef.current.position.y = neckY + 0.14; // Collapsed downward
          headMeshRef.current.rotation.x = 0.22; // Chin pointing up/jaw extended
        }
        if (neckMeshRef.current) {
          neckMeshRef.current.rotation.x = 0.35; // Neck craning forward
        }
        if (chestMeshRef.current) {
          chestMeshRef.current.rotation.x = 0.15; // Upper back hunched
        }
        if (leftClavicleRef.current && rightClavicleRef.current) {
          leftClavicleRef.current.position.z = 0.12; // Shoulders slumped forward
          rightClavicleRef.current.position.z = 0.12;
        }
        renderer.render(scene, camera);
        return;
      }

      // --------------------------------------------------
      // PROPER EXERCISE KINEMATICS ANIMATION
      // --------------------------------------------------
      if (animating) {
        const wave = Math.sin(elapsed * 1.8);
        const smooth01 = (wave + 1) / 2; // Smooth 0 to 1 cycle
        const smoothWave = Math.sin(elapsed * 1.4);

        // Reset base transforms
        if (headMeshRef.current) {
          headMeshRef.current.position.set(0, neckY + 0.22, 0.03);
          headMeshRef.current.rotation.set(0, 0, 0);
        }
        if (neckMeshRef.current) {
          neckMeshRef.current.position.set(0, neckY, 0.02);
          neckMeshRef.current.rotation.set(0, 0, 0);
        }
        if (chestMeshRef.current) {
          chestMeshRef.current.position.set(0, chestY, 0);
          chestMeshRef.current.rotation.set(0, 0, 0);
        }
        if (spineGroupRef.current) {
          spineGroupRef.current.rotation.set(0, 0, 0);
        }
        if (leftUpperArmRef.current && rightUpperArmRef.current) {
          leftUpperArmRef.current.rotation.set(0, 0, 0);
          rightUpperArmRef.current.rotation.set(0, 0, 0);
        }
        if (leftClavicleRef.current && rightClavicleRef.current) {
          leftClavicleRef.current.position.set(-0.28, chestY + 0.14, 0);
          rightClavicleRef.current.position.set(0.28, chestY + 0.14, 0);
        }

        // 1. Chin Tucks & Cervical Retraction
        if (titleLower.includes('chin tuck') || titleLower.includes('cervical')) {
          if (headMeshRef.current) {
            // Horizontal glide backward along Z axis
            headMeshRef.current.position.z = 0.03 - smooth01 * 0.18;
            headMeshRef.current.position.y = neckY + 0.22 + smooth01 * 0.03; // Spine lengthening
          }
          if (neckMeshRef.current) {
            neckMeshRef.current.position.z = 0.02 - smooth01 * 0.09;
          }
        }
        // 2. Lateral Neck & Trapezius Stretches
        else if (titleLower.includes('trap') || titleLower.includes('lateral stretch') || titleLower.includes('levator')) {
          if (headMeshRef.current) {
            headMeshRef.current.rotation.z = smoothWave * 0.35; // Ear to shoulder tilt
            headMeshRef.current.rotation.y = smoothWave * 0.2;
          }
          if (neckMeshRef.current) {
            neckMeshRef.current.rotation.z = smoothWave * 0.15;
          }
        }
        // 3. Scapular Squeeze & Shoulder Blade Retraction
        else if (titleLower.includes('scapular') || titleLower.includes('shoulder blade') || titleLower.includes('cobra')) {
          if (leftClavicleRef.current && rightClavicleRef.current) {
            leftClavicleRef.current.position.z = -smooth01 * 0.12;
            rightClavicleRef.current.position.z = -smooth01 * 0.12;
          }
          if (leftUpperArmRef.current && rightUpperArmRef.current) {
            leftUpperArmRef.current.rotation.y = smooth01 * 0.6; // External rotation
            leftUpperArmRef.current.rotation.z = -smooth01 * 0.25;
            rightUpperArmRef.current.rotation.y = -smooth01 * 0.6;
            rightUpperArmRef.current.rotation.z = smooth01 * 0.25;
          }
          if (chestMeshRef.current) {
            chestMeshRef.current.position.z = smooth01 * 0.06; // Proud chest
          }
        }
        // 4. Seated Thoracic Cat-Cow Flow
        else if (titleLower.includes('cat-cow') || titleLower.includes('thoracic flow')) {
          const arch = (smooth01 - 0.5) * 0.5;
          if (spineGroupRef.current) {
            spineGroupRef.current.rotation.x = arch;
          }
          if (chestMeshRef.current) {
            chestMeshRef.current.rotation.x = arch * 0.8;
          }
          if (headMeshRef.current) {
            headMeshRef.current.rotation.x = arch * 0.7;
          }
        }
        // 5. Seated Torso & Spinal Rotation
        else if (titleLower.includes('rotation') || titleLower.includes('twist') || titleLower.includes('windmill')) {
          const twist = smoothWave * 0.55; // 35 degrees left and right
          if (chestMeshRef.current) {
            chestMeshRef.current.rotation.y = twist;
          }
          if (headMeshRef.current) {
            headMeshRef.current.rotation.y = twist * 1.1;
          }
          if (leftClavicleRef.current && rightClavicleRef.current) {
            leftClavicleRef.current.rotation.y = twist;
            rightClavicleRef.current.rotation.y = twist;
          }
        }
        // 6. Wrist & Forearm Glides / Carpal Reset & Reverse Prayer
        else if (titleLower.includes('prayer') || titleLower.includes('reverse wrist')) {
          if (leftUpperArmRef.current && rightUpperArmRef.current) {
            // Bring elbows and hands together in prayer position
            leftUpperArmRef.current.rotation.set(-1.1, 0.45, -0.45);
            rightUpperArmRef.current.rotation.set(-1.1, -0.45, 0.45);
          }
          if (leftHandRef.current && rightHandRef.current) {
            // Wrist gliding vertically in prayer extension
            leftHandRef.current.rotation.x = (smooth01 - 0.5) * 0.9;
            rightHandRef.current.rotation.x = (smooth01 - 0.5) * 0.9;
          }
        }
        else if (titleLower.includes('wrist') || titleLower.includes('tendon') || titleLower.includes('carpal')) {
          if (rightUpperArmRef.current) {
            rightUpperArmRef.current.rotation.x = -1.35; // Arm elevated forward
          }
          if (rightHandRef.current) {
            rightHandRef.current.rotation.x = (smooth01 - 0.5) * 1.4; // Wrist flexing & extending
          }
        }
        // 7. Thoracic Extension over Chair Back
        else if (titleLower.includes('chair back') || titleLower.includes('thoracic extension')) {
          const archBack = -smooth01 * 0.45; // Gentle 25-degree backward arc
          if (spineGroupRef.current) {
            spineGroupRef.current.rotation.x = archBack;
          }
          if (chestMeshRef.current) {
            chestMeshRef.current.rotation.x = archBack * 0.9;
            chestMeshRef.current.position.z = smooth01 * 0.08;
          }
          if (headMeshRef.current) {
            headMeshRef.current.rotation.x = archBack * 0.8;
          }
          if (leftClavicleRef.current && rightClavicleRef.current) {
            leftClavicleRef.current.position.z = -smooth01 * 0.1;
            rightClavicleRef.current.position.z = -smooth01 * 0.1;
          }
        }
        // 8. Seated Torso Side Reach & Intercostal Expansion
        else if (titleLower.includes('side reach') || titleLower.includes('intercostal')) {
          const lateralBend = smoothWave * 0.38; // Smooth side bend
          if (spineGroupRef.current) {
            spineGroupRef.current.rotation.z = lateralBend;
          }
          if (rightUpperArmRef.current) {
            // Right arm arcs gracefully overhead
            rightUpperArmRef.current.rotation.z = 2.4 + smooth01 * 0.4;
            rightUpperArmRef.current.rotation.x = 0.2;
          }
          if (chestMeshRef.current) {
            chestMeshRef.current.rotation.z = lateralBend * 0.85;
          }
        }
        // 9. Standing Quad & Psoas Stretch with Chair Balance
        else if (titleLower.includes('quad')) {
          if (rightShinRef.current) {
            // Right knee flexes backward in quad stretch
            rightShinRef.current.rotation.x = 1.8 + smooth01 * 0.2;
          }
          if (rightUpperArmRef.current) {
            // Right hand reaches back to grasp foot
            rightUpperArmRef.current.rotation.x = 0.8;
            rightUpperArmRef.current.rotation.y = -0.3;
          }
        }
        // 10. Wall Angels & W-to-Y Posture Pulses
        else if (titleLower.includes('wall angel') || titleLower.includes('w-to-y') || titleLower.includes('open-book')) {
          if (leftUpperArmRef.current && rightUpperArmRef.current) {
            // Glide from W (folded) to Y (overhead reach)
            leftUpperArmRef.current.rotation.z = -1.1 - smooth01 * 1.2;
            rightUpperArmRef.current.rotation.z = 1.1 + smooth01 * 1.2;
            leftUpperArmRef.current.rotation.y = 0.3;
            rightUpperArmRef.current.rotation.y = -0.3;
          }
        }
        // 8. Standing Desk Squats
        else if (titleLower.includes('squat')) {
          if (mannequinGroupRef.current) {
            mannequinGroupRef.current.position.y = -smooth01 * 0.36; // Hinge down to seat
          }
          if (leftUpperArmRef.current && rightUpperArmRef.current) {
            // Arms reach forward for balance
            leftUpperArmRef.current.rotation.x = -smooth01 * 1.2;
            rightUpperArmRef.current.rotation.x = -smooth01 * 1.2;
          }
        }
        // 9. Standing Calf Raises & Heel Pumps
        else if (titleLower.includes('calf') || titleLower.includes('ankle') || titleLower.includes('heel')) {
          if (mannequinGroupRef.current) {
            mannequinGroupRef.current.position.y = smooth01 * 0.24; // Elevate onto toes
          }
        }
        // 10. Diaphragmatic Breath & Posture Reset
        else {
          // Subtle rhythmic expansion of chest and spinal lengthening
          if (chestMeshRef.current) {
            chestMeshRef.current.scale.set(
              1 + smooth01 * 0.06,
              1 + smooth01 * 0.04,
              1 + smooth01 * 0.08
            );
          }
          if (headMeshRef.current) {
            headMeshRef.current.position.y = neckY + 0.22 + smooth01 * 0.02;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Responsive Canvas Resize Listener
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      cameraRef.current.aspect = w / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [exercise, animating, playbackSpeed, viewMode]);

  // Mouse 360-degree Orbit Interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !mannequinGroupRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    mannequinGroupRef.current.rotation.y += deltaX * 0.015;
    if (chairGroupRef.current) {
      chairGroupRef.current.rotation.y += deltaX * 0.015;
    }
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Camera Presets
  const setViewAngle = (angle: 'angle' | 'front' | 'side' | 'back') => {
    setCameraAngle(angle);
    if (!cameraRef.current || !mannequinGroupRef.current) return;
    mannequinGroupRef.current.rotation.y = 0;
    if (chairGroupRef.current) chairGroupRef.current.rotation.y = 0;

    if (angle === 'front') {
      cameraRef.current.position.set(0, 1.35, 3.1);
    } else if (angle === 'side') {
      cameraRef.current.position.set(3.2, 1.35, 0); // Side profile - critical for posture checks!
    } else if (angle === 'back') {
      cameraRef.current.position.set(0, 1.35, -3.1); // Back - critical for scapula & spine!
    } else {
      cameraRef.current.position.set(2.2, 1.6, 2.9); // 45-degree Hero angle
    }
    cameraRef.current.lookAt(0, 1.05, 0);
  };

  return (
    <div className="bg-gradient-to-b from-brand-50/70 via-white to-surface-subtle rounded-3xl p-4 sm:p-5 border border-brand-200/90 shadow-sm relative overflow-hidden select-none">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        {/* Title and Active indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-black text-brand-950 uppercase tracking-wider">
            3D Anatomical Humanoid Guide
          </span>
        </div>

        {/* View Perspective Buttons */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-surface-border shadow-2xs text-[11px]">
          {(['angle', 'front', 'side', 'back'] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setViewAngle(view)}
              className={`px-2 py-0.5 rounded-lg capitalize font-bold transition-all ${
                cameraAngle === view
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : 'text-charcoal-muted hover:text-charcoal-heading'
              }`}
            >
              {view === 'angle' ? '📐 45°' : view === 'front' ? '👤 Front' : view === 'side' ? '↔️ Side' : '🔙 Back'}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-[300px] sm:h-[320px] rounded-2xl cursor-grab active:cursor-grabbing relative overflow-hidden bg-gradient-to-tr from-slate-100 via-brand-50/40 to-teal-50/50 border border-brand-100"
        title="Click and drag horizontally with mouse to orbit 360°"
      />

      {/* Floating Mode Overlay: Proper Form vs Slouch Mistake */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {/* Form Comparison Selector */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-surface-border text-xs">
          <button
            type="button"
            onClick={() => setViewMode('proper')}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
              viewMode === 'proper'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-charcoal-muted hover:text-charcoal-heading'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Proper Form</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('mistake')}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
              viewMode === 'mistake'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-charcoal-muted hover:text-charcoal-heading'
            }`}
            title="See what the common posture mistake looks like"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Common Mistake</span>
          </button>
        </div>

        {/* Speed Adjustment (0.5x, 1x, 1.5x) */}
        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-surface-border text-[11px] font-bold text-charcoal-muted">
          <Gauge className="w-3.5 h-3.5 text-brand-600" />
          <span>Speed:</span>
          {([0.5, 1.0, 1.5] as const).map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-1.5 py-0.5 rounded-md ${
                playbackSpeed === spd
                  ? 'bg-brand-100 text-brand-900 font-black'
                  : 'hover:text-charcoal-heading'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Alert when in 'Mistake' mode */}
      {viewMode === 'mistake' && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p>
            <strong>Common Mistake Shown:</strong> Jutting chin forward, rounded kyphotic shoulders, and collapsed chest. Click <strong>Proper Form</strong> to see correct spinal alignment!
          </p>
        </div>
      )}

      {/* Footer Info: Target Muscle Beacon, Breathing Phase & Controls */}
      <div className="mt-3 pt-3 border-t border-brand-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Target Focus Muscle */}
        <div className="flex items-center gap-1.5 text-brand-900 font-semibold">
          <Sparkles className="w-4 h-4 text-accent-amber" />
          <span>
            Targeted Anatomy: <strong className="text-brand-950 font-bold">{targetMuscle}</strong>
          </span>
        </div>

        {/* Breathing Sync Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 font-bold text-[11px]">
            <Wind className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>Breath: {breathPhase}</span>
          </div>

          {/* Pause / Play */}
          <button
            type="button"
            onClick={() => setAnimating(!animating)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-brand-200 text-brand-800 hover:bg-brand-50 text-xs font-bold transition-all shadow-2xs"
          >
            {animating ? <Pause className="w-3.5 h-3.5 text-brand-600" /> : <Play className="w-3.5 h-3.5 text-brand-600 fill-brand-600" />}
            <span>{animating ? 'Pause' : 'Play'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
