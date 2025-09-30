'use client';

import React from 'react';
import { Box } from '@mui/material';

interface MuscleDiagramProps {
  activeMuscles: string[];
  size?: 'small' | 'medium' | 'large';
}

// Map database muscle names to diagram regions
const muscleMap: Record<string, string[]> = {
  // Upper body
  'chest': ['chest-left', 'chest-right'],
  'upper chest': ['chest-left', 'chest-right'],
  'shoulders': ['shoulder-left', 'shoulder-right'],
  'back': ['back-upper', 'back-lower'],
  'upper back': ['back-upper'],
  'lower back': ['back-lower'],
  'triceps': ['tricep-left', 'tricep-right'],
  'biceps': ['bicep-left', 'bicep-right'],
  'forearms': ['forearm-left', 'forearm-right'],
  'arms': ['bicep-left', 'bicep-right', 'tricep-left', 'tricep-right'],
  
  // Core
  'core': ['abs', 'obliques'],
  'abs': ['abs'],
  'abdomen': ['abs'],
  'obliques': ['obliques'],
  'spine': ['back-upper', 'back-lower'],
  
  // Lower body
  'quadriceps': ['quad-left', 'quad-right'],
  'quads': ['quad-left', 'quad-right'],
  'hamstrings': ['hamstring-left', 'hamstring-right'],
  'glutes': ['glute-left', 'glute-right'],
  'calves': ['calf-left', 'calf-right'],
  'legs': ['quad-left', 'quad-right', 'hamstring-left', 'hamstring-right', 'calf-left', 'calf-right'],
  'hip flexors': ['hip-left', 'hip-right'],
  'hips': ['hip-left', 'hip-right'],
  
  // Full body
  'cardiovascular': ['heart'],
  'full body': ['chest-left', 'chest-right', 'abs', 'quad-left', 'quad-right', 'back-upper', 'back-lower'],
};

export default function MuscleDiagram({ activeMuscles, size = 'medium' }: MuscleDiagramProps) {
  const sizeMap = {
    small: { width: 120, height: 280 },
    medium: { width: 180, height: 380 },
    large: { width: 240, height: 480 }
  };

  const dimensions = sizeMap[size];

  // Get all diagram parts that should be highlighted
  const highlightedParts = new Set<string>();
  activeMuscles.forEach(muscle => {
    const normalized = muscle.toLowerCase().trim();
    const parts = muscleMap[normalized] || [];
    parts.forEach(part => highlightedParts.add(part));
  });

  const isHighlighted = (part: string) => highlightedParts.has(part);
  
  const getColor = (part: string) => {
    return isHighlighted(part) ? '#2da58e' : '#d1d5db';
  };

  const getOpacity = (part: string) => {
    return isHighlighted(part) ? 0.9 : 0.2;
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
      {/* Front View */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 200 400"
        style={{ transition: 'all 0.3s ease' }}
      >
        {/* Head */}
        <ellipse cx="100" cy="30" rx="25" ry="30" fill="#e5e7eb" opacity="0.3" />
        
        {/* Neck */}
        <rect x="85" y="55" width="30" height="20" fill="#e5e7eb" opacity="0.3" />
        
        {/* Shoulders */}
        <ellipse cx="60" cy="90" rx="22" ry="18" fill={getColor('shoulder-left')} opacity={getOpacity('shoulder-left')} stroke="#6b7280" strokeWidth="1" />
        <ellipse cx="140" cy="90" rx="22" ry="18" fill={getColor('shoulder-right')} opacity={getOpacity('shoulder-right')} stroke="#6b7280" strokeWidth="1" />
        
        {/* Chest */}
        <path d="M 70 95 Q 80 100 100 105 Q 80 125 75 140 L 70 110 Z" fill={getColor('chest-left')} opacity={getOpacity('chest-left')} stroke="#6b7280" strokeWidth="1" />
        <path d="M 130 95 Q 120 100 100 105 Q 120 125 125 140 L 130 110 Z" fill={getColor('chest-right')} opacity={getOpacity('chest-right')} stroke="#6b7280" strokeWidth="1" />
        
        {/* Heart (Cardiovascular) */}
        {isHighlighted('heart') && (
          <path d="M 100 115 L 105 108 Q 108 103 112 105 Q 115 108 113 112 L 100 125 L 87 112 Q 85 108 88 105 Q 92 103 95 108 Z" fill="#ef4444" opacity="0.8" />
        )}
        
        {/* Abs */}
        <rect x="85" y="140" width="30" height="50" rx="5" fill={getColor('abs')} opacity={getOpacity('abs')} stroke="#6b7280" strokeWidth="1" />
        
        {/* Obliques */}
        <path d="M 70 145 Q 65 160 70 180 L 85 175 L 85 145 Z" fill={getColor('obliques')} opacity={getOpacity('obliques')} stroke="#6b7280" strokeWidth="1" />
        <path d="M 130 145 Q 135 160 130 180 L 115 175 L 115 145 Z" fill={getColor('obliques')} opacity={getOpacity('obliques')} stroke="#6b7280" strokeWidth="1" />
        
        {/* Hip/Groin Area */}
        <ellipse cx="85" cy="195" rx="15" ry="10" fill={getColor('hip-left')} opacity={getOpacity('hip-left')} stroke="#6b7280" strokeWidth="1" />
        <ellipse cx="115" cy="195" rx="15" ry="10" fill={getColor('hip-right')} opacity={getOpacity('hip-right')} stroke="#6b7280" strokeWidth="1" />
        
        {/* Biceps */}
        <ellipse cx="45" cy="120" rx="10" ry="20" fill={getColor('bicep-left')} opacity={getOpacity('bicep-left')} stroke="#6b7280" strokeWidth="1" />
        <ellipse cx="155" cy="120" rx="10" ry="20" fill={getColor('bicep-right')} opacity={getOpacity('bicep-right')} stroke="#6b7280" strokeWidth="1" />
        
        {/* Forearms */}
        <rect x="38" y="145" width="14" height="40" rx="7" fill={getColor('forearm-left')} opacity={getOpacity('forearm-left')} stroke="#6b7280" strokeWidth="1" />
        <rect x="148" y="145" width="14" height="40" rx="7" fill={getColor('forearm-right')} opacity={getOpacity('forearm-right')} stroke="#6b7280" strokeWidth="1" />
        
        {/* Quadriceps */}
        <rect x="70" y="205" width="20" height="80" rx="8" fill={getColor('quad-left')} opacity={getOpacity('quad-left')} stroke="#6b7280" strokeWidth="1" />
        <rect x="110" y="205" width="20" height="80" rx="8" fill={getColor('quad-right')} opacity={getOpacity('quad-right')} stroke="#6b7280" strokeWidth="1" />
        
        {/* Calves */}
        <ellipse cx="80" cy="330" rx="12" ry="35" fill={getColor('calf-left')} opacity={getOpacity('calf-left')} stroke="#6b7280" strokeWidth="1" />
        <ellipse cx="120" cy="330" rx="12" ry="35" fill={getColor('calf-right')} opacity={getOpacity('calf-right')} stroke="#6b7280" strokeWidth="1" />
      </svg>

      {/* Back View */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 200 400"
        style={{ transition: 'all 0.3s ease' }}
      >
        {/* Head */}
        <ellipse cx="100" cy="30" rx="25" ry="30" fill="#e5e7eb" opacity="0.3" />
        
        {/* Neck */}
        <rect x="85" y="55" width="30" height="20" fill="#e5e7eb" opacity="0.3" />
        
        {/* Shoulders (back) */}
        <ellipse cx="60" cy="90" rx="22" ry="18" fill={getColor('shoulder-left')} opacity={getOpacity('shoulder-left') * 0.7} stroke="#6b7280" strokeWidth="1" />
        <ellipse cx="140" cy="90" rx="22" ry="18" fill={getColor('shoulder-right')} opacity={getOpacity('shoulder-right') * 0.7} stroke="#6b7280" strokeWidth="1" />
        
        {/* Upper Back */}
        <path d="M 70 95 L 75 105 L 85 140 L 100 145 L 115 140 L 125 105 L 130 95 Q 120 85 100 82 Q 80 85 70 95 Z" fill={getColor('back-upper')} opacity={getOpacity('back-upper')} stroke="#6b7280" strokeWidth="1" />
        
        {/* Lower Back */}
        <path d="M 85 145 L 80 175 Q 78 185 82 195 L 100 200 L 118 195 Q 122 185 120 175 L 115 145 Z" fill={getColor('back-lower')} opacity={getOpacity('back-lower')} stroke="#6b7280" strokeWidth="1" />
        
        {/* Triceps */}
        <ellipse cx="45" cy="120" rx="10" ry="20" fill={getColor('tricep-left')} opacity={getOpacity('tricep-left')} stroke="#6b7280" strokeWidth="1" />
        <ellipse cx="155" cy="120" rx="10" ry="20" fill={getColor('tricep-right')} opacity={getOpacity('tricep-right')} stroke="#6b7280" strokeWidth="1" />
        
        {/* Forearms (back) */}
        <rect x="38" y="145" width="14" height="40" rx="7" fill={getColor('forearm-left')} opacity={getOpacity('forearm-left') * 0.7} stroke="#6b7280" strokeWidth="1" />
        <rect x="148" y="145" width="14" height="40" rx="7" fill={getColor('forearm-right')} opacity={getOpacity('forearm-right') * 0.7} stroke="#6b7280" strokeWidth="1" />
        
        {/* Glutes */}
        <ellipse cx="85" cy="205" rx="18" ry="22" fill={getColor('glute-left')} opacity={getOpacity('glute-left')} stroke="#6b7280" strokeWidth="1" />
        <ellipse cx="115" cy="205" rx="18" ry="22" fill={getColor('glute-right')} opacity={getOpacity('glute-right')} stroke="#6b7280" strokeWidth="1" />
        
        {/* Hamstrings */}
        <rect x="70" y="230" width="20" height="70" rx="8" fill={getColor('hamstring-left')} opacity={getOpacity('hamstring-left')} stroke="#6b7280" strokeWidth="1" />
        <rect x="110" y="230" width="20" height="70" rx="8" fill={getColor('hamstring-right')} opacity={getOpacity('hamstring-right')} stroke="#6b7280" strokeWidth="1" />
        
        {/* Calves (back) */}
        <ellipse cx="80" cy="330" rx="12" ry="35" fill={getColor('calf-left')} opacity={getOpacity('calf-left')} stroke="#6b7280" strokeWidth="1" />
        <ellipse cx="120" cy="330" rx="12" ry="35" fill={getColor('calf-right')} opacity={getOpacity('calf-right')} stroke="#6b7280" strokeWidth="1" />
      </svg>
    </Box>
  );
}
