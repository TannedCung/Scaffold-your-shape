'use client';

import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Box, CircularProgress, Typography } from '@mui/material';

interface MuscleDiagram3DProps {
  activeMuscles: string[];
  size?: 'small' | 'medium' | 'large';
  autoRotate?: boolean;
}

/**
 * MUSCLE NAME MAPPING
 * 
 * After downloading your model, inspect it and map the mesh names to our muscle types.
 * Example: If your model has a mesh named "Pectoralis_Major_L", map it to 'chest'
 * 
 * To see your model's mesh names, uncomment the console.log in the useEffect below
 */
/**
 * MESH TO MUSCLE MAPPING
 * Maps the actual 3D model mesh names to our internal muscle type system
 * 
 * Currently split meshes in the model:
 * - Upper_chest, Middle_chest, Lower_chest
 * - Upper_trapezius, Middle_trapezius, Lower_trapezius
 * - Rhomboids
 * 
 * Other muscles use placeholder 'unsplit' until the model is further divided in Blender
 */
const MESH_TO_MUSCLE_MAP: Record<string, string> = {
  // ===== ACTUAL SPLIT MESHES (from your Blender model) =====
  
  // CHEST - Split into 3 parts ✅
  'Upper_chest': 'upperChest',
  'Middle_chest': 'midChest',
  'Lower_chest': 'lowerChest',
  
  // BACK - Trapezius split into 3 parts ✅
  'Upper_trapezius': 'upperTraps',
  'Middle_trapezius': 'midTraps',
  'Lower_trapezius': 'lowerTraps',
  
  // BACK - Rhomboids separated ✅
  'Rhomboids': 'rhomboids',
  
  // ===== PLACEHOLDER for unsplit meshes =====
  // These will all map to 'unsplit' until you separate them in Blender
  
  // Main body mesh that contains everything else:
  'Mesh_0': 'unsplit',
  'Body': 'unsplit',
  'mesh_0': 'unsplit',
  'default': 'unsplit',
};

// Map database muscle names to our internal muscle types
const muscleMap: Record<string, string[]> = {
  // CHEST
  'chest': ['upperChest', 'midChest', 'lowerChest'],
  'upper-chest': ['upperChest'],
  'upper chest': ['upperChest'],
  'mid-chest': ['midChest'],
  'mid chest': ['midChest'],
  'lower-chest': ['lowerChest'],
  'lower chest': ['lowerChest'],
  'serratus-anterior': ['unsplit'], // Not split yet
  'serratus anterior': ['unsplit'], // Not split yet
  
  // BACK
  'back': ['upperTraps', 'midTraps', 'lowerTraps', 'rhomboids', 'unsplit'], // lats, erector spinae not split yet
  'upper-back': ['upperTraps', 'midTraps', 'rhomboids'],
  'upper back': ['upperTraps', 'midTraps', 'rhomboids'],
  'trapezius': ['upperTraps', 'midTraps', 'lowerTraps'],
  'traps': ['upperTraps', 'midTraps', 'lowerTraps'],
  'rhomboids': ['rhomboids'],
  'lats': ['unsplit'], // Not split yet
  'latissimus': ['unsplit'], // Not split yet
  'lower-back': ['unsplit'], // Not split yet
  'lower back': ['unsplit'], // Not split yet
  'erector-spinae': ['unsplit'], // Not split yet
  'erector spinae': ['unsplit'], // Not split yet
  'teres-major': ['unsplit'], // Not split yet
  'teres major': ['unsplit'], // Not split yet
  'teres-minor': ['unsplit'], // Not split yet
  'teres minor': ['unsplit'], // Not split yet
  
  // SHOULDERS - Not split yet
  'shoulders': ['unsplit'],
  'anterior-deltoid': ['unsplit'],
  'anterior deltoid': ['unsplit'],
  'lateral-deltoid': ['unsplit'],
  'lateral deltoid': ['unsplit'],
  'posterior-deltoid': ['unsplit'],
  'posterior deltoid': ['unsplit'],
  
  // ARMS - Not split yet
  'biceps': ['unsplit'],
  'biceps-long-head': ['unsplit'],
  'biceps long head': ['unsplit'],
  'biceps-short-head': ['unsplit'],
  'biceps short head': ['unsplit'],
  'brachialis': ['unsplit'],
  'triceps': ['unsplit'],
  'triceps-long-head': ['unsplit'],
  'triceps long head': ['unsplit'],
  'triceps-lateral-head': ['unsplit'],
  'triceps lateral head': ['unsplit'],
  'triceps-medial-head': ['unsplit'],
  'triceps medial head': ['unsplit'],
  'forearms': ['unsplit'],
  'forearm-flexors': ['unsplit'],
  'forearm flexors': ['unsplit'],
  'forearm-extensors': ['unsplit'],
  'forearm extensors': ['unsplit'],
  'arms': ['unsplit'],
  
  // CORE - Not split yet
  'core': ['unsplit'],
  'abs': ['unsplit'],
  'abdomen': ['unsplit'],
  'rectus-abdominis': ['unsplit'],
  'rectus abdominis': ['unsplit'],
  'obliques': ['unsplit'],
  'transverse-abdominis': ['unsplit'],
  'transverse abdominis': ['unsplit'],
  
  // LEGS - Not split yet
  'quadriceps': ['unsplit'],
  'quads': ['unsplit'],
  'rectus-femoris': ['unsplit'],
  'rectus femoris': ['unsplit'],
  'vastus-lateralis': ['unsplit'],
  'vastus lateralis': ['unsplit'],
  'vastus-medialis': ['unsplit'],
  'vastus medialis': ['unsplit'],
  'vastus-intermedius': ['unsplit'],
  'vastus intermedius': ['unsplit'],
  'hamstrings': ['unsplit'],
  'biceps-femoris': ['unsplit'],
  'biceps femoris': ['unsplit'],
  'semitendinosus': ['unsplit'],
  'semimembranosus': ['unsplit'],
  'glutes': ['unsplit'],
  'gluteus-maximus': ['unsplit'],
  'gluteus maximus': ['unsplit'],
  'gluteus-medius': ['unsplit'],
  'gluteus medius': ['unsplit'],
  'gluteus-minimus': ['unsplit'],
  'gluteus minimus': ['unsplit'],
  'calves': ['unsplit'],
  'gastrocnemius': ['unsplit'],
  'soleus': ['unsplit'],
  
  // GENERAL
  'legs': ['unsplit'],
  'hip-flexors': ['unsplit'],
  'hip flexors': ['unsplit'],
  'cardiovascular': ['upperChest', 'midChest', 'lowerChest', 'unsplit'],
  'full-body': ['upperChest', 'midChest', 'lowerChest', 'upperTraps', 'midTraps', 'lowerTraps', 'rhomboids', 'unsplit'],
  'full body': ['upperChest', 'midChest', 'lowerChest', 'upperTraps', 'midTraps', 'lowerTraps', 'rhomboids', 'unsplit'],
};

function LoadedMuscleModel({ 
  activeMuscles,
  modelPath = '/models/human-anatomy.glb' 
}: { 
  activeMuscles: string[];
  modelPath?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Load the 3D model
  const { scene } = useGLTF(modelPath);
  
  // Smooth auto-rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.4;
    }
  });

  // Determine which muscles should be highlighted
  const highlightedMuscles = useMemo(() => {
    const muscles = new Set<string>();
    activeMuscles.forEach(muscle => {
      const normalized = muscle.toLowerCase().trim();
      const mappedMuscles = muscleMap[normalized] || [];
      mappedMuscles.forEach(m => {
        // Only add split muscles, ignore 'unsplit' placeholder
        // Unsplit parts should remain dim, not highlighted
        if (m !== 'unsplit') {
          muscles.add(m);
        }
      });
    });
    return muscles;
  }, [activeMuscles]);

  // Apply materials to model meshes based on active muscles
  useEffect(() => {
    const activeColor = new THREE.Color('#2da58e');
    const inactiveColor = new THREE.Color('#cbd5e1');
    const unsplitColor = new THREE.Color('#94a3b8');
    
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║         APPLYING MATERIALS TO 3D MODEL                    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('📍 Active muscles requested:', Array.from(highlightedMuscles));
    console.log('');
    
    // First pass: collect all meshes
    const allMeshes: string[] = [];
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        allMeshes.push((child as THREE.Mesh).name || 'unnamed');
      }
    });
    
    console.log('🔍 Found', allMeshes.length, 'meshes in model:', allMeshes);
    console.log('');
    
    // Second pass: apply materials
    let highlightCount = 0;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        
        // Find which muscle group this mesh belongs to
        let muscleType: string | null = null;
        
        // Exact match or contains check
        for (const [meshName, muscle] of Object.entries(MESH_TO_MUSCLE_MAP)) {
          if (mesh.name === meshName || mesh.name.includes(meshName)) {
            muscleType = muscle;
            break;
          }
        }
        
        // If no match found, treat as unsplit
        if (!muscleType) {
          muscleType = 'unsplit';
        }
        
        const isHighlighted = highlightedMuscles.has(muscleType);
        const isUnsplit = muscleType === 'unsplit';
        
        if (isHighlighted) {
          highlightCount++;
          console.log(`✅ "${mesh.name}" → ${muscleType} → 🟢 HIGHLIGHTED`);
        } else if (isUnsplit) {
          console.log(`⚪ "${mesh.name}" → ${muscleType} → (unsplit placeholder)`);
        } else {
          console.log(`⚪ "${mesh.name}" → ${muscleType} → (inactive)`);
        }
        
        // Apply material
        mesh.material = new THREE.MeshStandardMaterial({
          color: isHighlighted ? activeColor : (isUnsplit ? unsplitColor : inactiveColor),
          emissive: isHighlighted ? activeColor : new THREE.Color('#64748b'),
          emissiveIntensity: isHighlighted ? 0.7 : 0.05,
          metalness: 0.3,
          roughness: 0.6,
          transparent: true,
          opacity: isHighlighted ? 1.0 : (isUnsplit ? 0.4 : 0.6),
        });
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    
    console.log('');
    console.log('📊 Result: Highlighted', highlightCount, 'out of', allMeshes.length, 'meshes');
    console.log('═══════════════════════════════════════════════════════════\n');
  }, [scene, highlightedMuscles]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1} />
    </group>
  );
}

function ModelLoadError() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.5, 1.5, 0.3]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* Error indicator */}
    </group>
  );
}

function LoadingIndicator() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.5, 1.5, 0.3]} />
        <meshStandardMaterial color="#94a3b8" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}

export default function MuscleDiagram3DWithModel({ 
  activeMuscles, 
  size = 'medium',
  autoRotate = true 
}: MuscleDiagram3DProps) {
  const sizeMap = {
    small: { width: 200, height: 280 },
    medium: { width: 300, height: 400 },
    large: { width: 400, height: 500 }
  };

  const dimensions = sizeMap[size];
  const [modelExists, setModelExists] = React.useState<boolean | null>(null);

  // Check if model file exists
  React.useEffect(() => {
    fetch('/models/human-anatomy.glb', { method: 'HEAD' })
      .then(res => setModelExists(res.ok))
      .catch(() => setModelExists(false));
  }, []);

  if (modelExists === false) {
    return (
      <Box 
        sx={{ 
          width: dimensions.width, 
          height: dimensions.height,
          margin: '0 auto',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          padding: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          Model Not Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Place your 3D model at:<br />
          <code style={{ 
            background: '#fff', 
            padding: '4px 8px', 
            borderRadius: '4px',
            fontSize: '0.75rem'
          }}>
            public/models/human-anatomy.glb
          </code>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
          See MUSCLE_MODEL_GUIDE.md for download sources
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        width: dimensions.width, 
        height: dimensions.height,
        margin: '0 auto',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        position: 'relative',
      }}
    >
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 1, 3]} fov={45} />
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
          autoRotate={autoRotate}
          autoRotateSpeed={0.8}
          dampingFactor={0.05}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-3, 3, -3]} intensity={0.5} />
        <pointLight position={[0, 2, 2]} intensity={0.5} color="#60a5fa" />
        
        {/* Environment */}
        <Environment preset="studio" />
        
        {/* Model */}
        <Suspense fallback={<LoadingIndicator />}>
          <LoadedMuscleModel activeMuscles={activeMuscles} />
        </Suspense>
        
        {/* Ground */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -1, 0]} 
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.3} />
        </mesh>
      </Canvas>
      
      {modelExists === null && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <CircularProgress size={40} sx={{ color: '#2da58e' }} />
        </Box>
      )}
    </Box>
  );
}

// Preload the model
if (typeof window !== 'undefined') {
  useGLTF.preload('/models/human-anatomy.glb');
}
