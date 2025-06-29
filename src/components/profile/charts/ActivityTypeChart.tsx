import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Typography, useTheme } from '@mui/material';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';

interface ActivityTypeData {
  type: string;
  count: number;
  percentage: number;
}

interface ActivityTypeChartProps {
  data: ActivityTypeData[];
  loading?: boolean;
}

const ActivityTypeChart: React.FC<ActivityTypeChartProps> = ({ data, loading }) => {
  const theme = useTheme();
  
  // Enhanced Strava-inspired colors with gradients
  const COLORS = [
    theme.palette.primary.main,      // Primary green
    theme.palette.primary.dark,      // Darker green
    theme.palette.secondary.main,    // Secondary color
    theme.palette.secondary.dark,    // Secondary dark
    '#16a085',  // Turquoise
    '#20b2aa',  // Light sea green
    '#48cae4',  // Sky blue
    '#0077be',  // Ocean blue
  ];
  
  if (loading) {
    return (
      <Box sx={{ p: 4, height: 450 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}
          >
            <DonutLargeIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Activity Type Distribution
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
              Breakdown of your activities by type
            </Typography>
          </Box>
        </Box>
        <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Loading chart data...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, height: 450 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}
          >
            <DonutLargeIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Activity Type Distribution
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
              Breakdown of your activities by type
            </Typography>
          </Box>
        </Box>
        <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            No activity type data available
          </Typography>
        </Box>
      </Box>
    );
  }

  const totalActivities = data.reduce((sum, item) => sum + item.count, 0);
  
  // Process data for MUI X Charts PieChart
  const pieData = data.map((item, index) => ({
    id: index,
    value: item.count,
    label: item.type,
    color: COLORS[index % COLORS.length]
  }));
  
  console.log('ActivityTypeChart - MUI X Pie Chart debugging:', {
    dataLength: data.length,
    totalActivities,
    pieData,
    colors: COLORS.slice(0, data.length)
  });

  return (
    <Box sx={{ p: 4, height: 450 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2
          }}
        >
          <DonutLargeIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            Activity Type Distribution
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
            Breakdown of your activities by type
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ width: '100%', height: 350, position: 'relative' }}>
        <PieChart
          series={[
            {
              data: pieData,
              innerRadius: 40,
              outerRadius: 120,
              paddingAngle: 1,
              cornerRadius: 2,
              startAngle: 0,
              endAngle: 360,
              cx: 218,
              cy: 145,
              arcLabel: (item) => {
                const percentage = (item.value / totalActivities) * 100;
                return percentage > 3 ? `${percentage.toFixed(1)}%` : '';
              },
              arcLabelMinAngle: 10,
              valueFormatter: (item) => `${item.value} activities`
            }
          ]}
          colors={COLORS}
          width={400}
          height={350}
          margin={{
            top: 30,
            right: 30,
            bottom: 60,
            left: 30
          }}
          sx={{
            '& .MuiPieArc-root': {
              stroke: theme.palette.background.paper,
              strokeWidth: 2,
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
            },
            '& .MuiPieArcLabel-root': {
              fill: 'white',
              fontSize: '12px',
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            },
            '& .MuiChartsLegend-root': {
              fontSize: '14px',
              fontWeight: 600
            }
          }}
        />
        
        {/* Center text with total activities */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
            {totalActivities}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mt: -0.5 }}>
            TOTAL
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ActivityTypeChart; 