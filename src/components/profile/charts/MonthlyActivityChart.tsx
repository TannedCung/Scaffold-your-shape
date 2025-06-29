import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography, useTheme } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';

interface MonthlyActivityData {
  month: string;
  count: number;
  distance: number;
}

interface MonthlyActivityChartProps {
  data: MonthlyActivityData[];
  loading?: boolean;
}

const MonthlyActivityChart: React.FC<MonthlyActivityChartProps> = ({ data, loading }) => {
  const theme = useTheme();
  
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
            <BarChartIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Monthly Activity Trend
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
              Track your activity count and distance over the last 12 months
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
            <BarChartIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Monthly Activity Trend
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
              Track your activity count and distance over the last 12 months
            </Typography>
          </Box>
        </Box>
        <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            No activity data available
          </Typography>
        </Box>
      </Box>
    );
  }

  // Process data for MUI X Charts
  const months = data.map(item => item.month);
  const activitiesData = data.map(item => item.count);
  const distanceData = data.map(item => item.distance);
  
  // Calculate domains for better tick spacing
  const maxCount = Math.max(...activitiesData, 1);
  const maxDistance = Math.max(...distanceData, 1);
  
  console.log('MonthlyActivityChart - MUI X Chart debugging:', {
    months,
    activitiesData,
    distanceData,
    maxCount,
    maxDistance,
    dataLength: data.length
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
          <BarChartIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            Monthly Activity Trend
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
            Track your activity count and distance over the last 12 months
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ width: '100%', height: 350 }}>
        <LineChart
          xAxis={[
            {
              data: months,
              scaleType: 'point',
              tickLabelStyle: {
                fontSize: 12,
                fontWeight: 600,
                fill: theme.palette.text.secondary,
                angle: -45,
                textAnchor: 'end'
              }
            }
          ]}
          yAxis={[
            {
              id: 'activities',
              scaleType: 'linear',
              tickLabelStyle: {
                fontSize: 12,
                fontWeight: 600,
                fill: theme.palette.text.primary
              },
              label: 'Activities',
              labelStyle: {
                fontSize: 12,
                fontWeight: 700,
                fill: theme.palette.primary.main
              },
              tickNumber: 6,
              min: 0,
              max: Math.ceil(maxCount * 1.2)
            },
            {
              id: 'distance',
              scaleType: 'linear',
              position: 'right',
              tickLabelStyle: {
                fontSize: 12,
                fontWeight: 600,
                fill: theme.palette.text.primary
              },
              label: 'Distance (km)',
              labelStyle: {
                fontSize: 12,
                fontWeight: 700,
                fill: theme.palette.secondary.main
              },
              tickNumber: 6,
              min: 0,
              max: Math.ceil(maxDistance * 1.2),
              valueFormatter: (value: number) => `${value.toFixed(1)}km`
            }
          ]}
          series={[
            {
              id: 'activities',
              data: activitiesData,
              label: 'Activities',
              color: theme.palette.primary.main,
              yAxisId: 'activities',
              curve: 'linear',
              showMark: true
            },
            {
              id: 'distance',
              data: distanceData,
              label: 'Distance (km)',
              color: theme.palette.secondary.main,
              yAxisId: 'distance',
              curve: 'linear',
              showMark: true
            }
          ]}
          width={800}
          height={350}
          margin={{
            top: 30,
            right: 100,
            bottom: 80,
            left: 80
          }}
          grid={{ horizontal: true, vertical: false }}
          sx={{
            '& .MuiLineElement-root': {
              strokeWidth: 3
            },
            '& .MuiMarkElement-root': {
              strokeWidth: 2,
              r: 8
            },
            '& .MuiChartsGrid-line': {
              stroke: theme.palette.divider,
              strokeDasharray: '2 4',
              opacity: 0.4
            },
            '& .MuiChartsAxis-line': {
              stroke: theme.palette.divider,
              strokeWidth: 2
            },
            '& .MuiChartsAxis-tick': {
              stroke: theme.palette.divider,
              strokeWidth: 2
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default MonthlyActivityChart; 