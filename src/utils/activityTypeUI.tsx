import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import PoolIcon from '@mui/icons-material/Pool';
import PedalBikeIcon from '@mui/icons-material/PedalBike';
import HikingIcon from '@mui/icons-material/Hiking';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import SportsIcon from '@mui/icons-material/Sports';
import { SvgIconProps } from '@mui/material/SvgIcon';

export function getActivityIcon(type: string, props: SvgIconProps = {}) {
  switch (type) {
    case 'run':
      return <SportsScoreIcon {...props} />;
    case 'walk':
      return <SelfImprovementIcon {...props} />;
    case 'swim':
      return <PoolIcon {...props} />;
    case 'cycle':
      return <PedalBikeIcon {...props} />;
    case 'hike':
      return <HikingIcon {...props} />;
    case 'workout':
      return <FitnessCenterIcon {...props} />;
    case 'yoga':
      return <SportsGymnasticsIcon {...props} />;
    default:
      return <SportsIcon {...props} />;
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
    case 'yoga':
      return '#f59e0b';
    default:
      return '#2da58e';
  }
} 