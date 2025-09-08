import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import SportsScoreOutlinedIcon from '@mui/icons-material/SportsScoreOutlined';
import SelfImprovementOutlinedIcon from '@mui/icons-material/SelfImprovementOutlined';
import PoolOutlinedIcon from '@mui/icons-material/PoolOutlined';
import PedalBikeOutlinedIcon from '@mui/icons-material/PedalBikeOutlined';
import HikingOutlinedIcon from '@mui/icons-material/HikingOutlined';
import SportsGymnasticsOutlinedIcon from '@mui/icons-material/SportsGymnasticsOutlined';
import SportsOutlinedIcon from '@mui/icons-material/SportsOutlined';
import { SvgIconProps } from '@mui/material/SvgIcon';

export function getActivityIcon(type: string, props: SvgIconProps = {}) {
  switch (type) {
    case 'run':
      return <SportsScoreOutlinedIcon {...props} />;
    case 'walk':
      return <SelfImprovementOutlinedIcon {...props} />;
    case 'swim':
      return <PoolOutlinedIcon {...props} />;
    case 'cycle':
      return <PedalBikeOutlinedIcon {...props} />;
    case 'hike':
      return <HikingOutlinedIcon {...props} />;
    case 'workout':
      return <FitnessCenterOutlinedIcon {...props} />;
    case 'yoga':
      return <SportsGymnasticsOutlinedIcon {...props} />;
    default:
      return <SportsOutlinedIcon {...props} />;
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