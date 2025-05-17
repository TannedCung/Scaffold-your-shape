'use client';

import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

interface ActivityMapProps {
  polyline: string;
  startPosition?: number[];
  endPosition?: number[];
}

const ActivityMap: React.FC<ActivityMapProps> = ({ polyline, startPosition, endPosition }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!polyline || !mapRef.current) return;
    
    // Dynamic import to prevent SSR issues
    import('leaflet').then((L) => {
      import('leaflet-polylinedecorator').then(() => {
        // Create map instance
        if (!mapRef.current) return;
        
        const map = L.map(mapRef.current).setView([0, 0], 13);
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add the styles needed for Leaflet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
        
        try {
          // Decode the polyline
          const coordinates = decodePolyline(polyline);
          
          if (coordinates.length === 0) {
            console.error('No coordinates found in polyline');
            return;
          }
          
          // Create a polyline from the coordinates
          const routeLine = L.polyline(coordinates, {
            color: '#2da58e',
            weight: 5,
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);
          
          // Add start and end markers if provided
          if (startPosition && startPosition.length === 2) {
            const startIcon = L.divIcon({
              html: `<div style="background-color: #2da58e; border-radius: 50%; width: 12px; height: 12px; border: 2px solid white;"></div>`,
              className: 'start-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });
            
            L.marker([startPosition[0], startPosition[1]], { icon: startIcon }).addTo(map);
          }
          
          if (endPosition && endPosition.length === 2) {
            const endIcon = L.divIcon({
              html: `<div style="background-color: #d22630; border-radius: 50%; width: 12px; height: 12px; border: 2px solid white;"></div>`,
              className: 'end-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });
            
            L.marker([endPosition[0], endPosition[1]], { icon: endIcon }).addTo(map);
          }
          
          // Fit the map to the bounds of the polyline
          map.fitBounds(routeLine.getBounds());
          
          // Note: Arrow decorations removed due to TypeScript compatibility issues
          
        } catch (error) {
          console.error('Error decoding or displaying polyline:', error);
        }
        
        // Cleanup function
        return () => {
          map.remove();
        };
      });
    });
  }, [polyline, startPosition, endPosition]);
  
  return (
    <Box 
      ref={mapRef} 
      sx={{ 
        width: '100%', 
        height: '100%', 
        bgcolor: '#f0f9f7', 
        borderRadius: 2,
        '& .leaflet-control-attribution': {
          fontSize: '8px'
        }
      }} 
    />
  );
};

// Decode Google polyline format
// Adapted from: https://github.com/mapbox/polyline
function decodePolyline(str: string, precision = 5) {
  const factor = Math.pow(10, precision);
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  
  while (index < str.length) {
    let result = 1;
    let shift = 0;
    let b;
    do {
      b = str.charCodeAt(index++) - 63;
      result += (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    
    result = 1;
    shift = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result += (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    
    coordinates.push([lat / factor, lng / factor]);
  }
  
  return coordinates;
}

export default ActivityMap; 