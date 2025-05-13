import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import PoolIcon from '@mui/icons-material/Pool';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import LandscapeIcon from '@mui/icons-material/Landscape';
import { SvgIconProps } from '@mui/material/SvgIcon';

export function getActivityIcon(type: string, props: SvgIconProps = {}) {
  switch (type) {
    case 'run':
      return <DirectionsRunIcon {...props} />;
    case 'walk':
      return <DirectionsWalkIcon {...props} />;
    case 'swim':
      return <PoolIcon {...props} />;
    case 'cycle':
      return <DirectionsBikeIcon {...props} />;
    case 'hike':
      return <LandscapeIcon {...props} />;
    case 'workout':
      return <FitnessCenterIcon {...props} />;
    default:
      return <FitnessCenterIcon {...props} />;
  }
}

export function getActivityColor(type: string): string {
  switch (type) {
    case 'run':
      return '#2da58e';
    case 'walk':
      return '#8b5cf6';
    case 'swim':
      return '#3b82f6';
    case 'cycle':
      return '#10b981';
    case 'hike':
      return '#ef4444';
    case 'workout':
      return '#24977e';
    default:
      return '#2da58e';
  }
} 