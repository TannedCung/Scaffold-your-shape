import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface DistanceOverTimeData {
  date: string;
  distance: number;
  cumulative: number;
}

interface DistanceOverTimeChartProps {
  data: DistanceOverTimeData[];
  loading?: boolean;
}

const DistanceOverTimeChart: React.FC<DistanceOverTimeChartProps> = ({ data, loading }) => {
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
            <TrendingUpIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Distance Over Time
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
              Daily and cumulative distance trends over the last 30 days
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
            <TrendingUpIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Distance Over Time
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
              Daily and cumulative distance trends over the last 30 days
            </Typography>
          </Box>
        </Box>
        <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            No distance data available
          </Typography>
        </Box>
      </Box>
    );
  }

  // Process data for MUI X Charts
  const dates = data.map(item => item.date);
  const dailyDistances = data.map(item => item.distance);
  const cumulativeDistances = data.map(item => item.cumulative);
  
  // Calculate max values for domain with padding
  const maxDaily = Math.max(...dailyDistances, 1);
  const maxCumulative = Math.max(...cumulativeDistances, 1);

  // Calculate total distance for the period
  const totalDistance = data.reduce((sum, item) => sum + item.distance, 0);
  const avgDaily = totalDistance / data.length;

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
          <TrendingUpIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            Distance Over Time
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
            Daily and cumulative distance trends over the last 30 days
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ width: '100%', height: 350 }}>
        <LineChart
          xAxis={[
            {
              data: dates,
              scaleType: 'point',
              tickLabelStyle: {
                fontSize: 10,
                fontWeight: 600,
                fill: theme.palette.text.secondary,
                angle: -45,
                textAnchor: 'end'
              }
            }
          ]}
          yAxis={[
            {
              id: 'daily',
              scaleType: 'linear',
              tickLabelStyle: {
                fontSize: 11,
                fontWeight: 600,
                fill: theme.palette.text.primary
              },
              label: 'Daily Distance (km)',
              labelStyle: {
                fontSize: 11,
                fontWeight: 700,
                fill: theme.palette.primary.main
              },
              tickNumber: 6,
              min: 0,
              max: Math.ceil(maxDaily * 1.3),
              valueFormatter: (value: number) => `${value.toFixed(1)}km`
            },
            {
              id: 'cumulative',
              scaleType: 'linear',
              position: 'right',
              tickLabelStyle: {
                fontSize: 11,
                fontWeight: 600,
                fill: theme.palette.text.primary
              },
              label: 'Cumulative Distance (km)',
              labelStyle: {
                fontSize: 11,
                fontWeight: 700,
                fill: theme.palette.secondary.main
              },
              tickNumber: 6,
              min: 0,
              max: Math.ceil(maxCumulative * 1.1),
              valueFormatter: (value: number) => `${value.toFixed(1)}km`
            }
          ]}
          series={[
            {
              id: 'daily',
              data: dailyDistances,
              label: 'Daily Distance (km)',
              color: theme.palette.primary.main,
              yAxisId: 'daily',
              curve: 'linear',
              showMark: true,
              area: true
            },
            {
              id: 'cumulative',
              data: cumulativeDistances,
              label: 'Cumulative Distance (km)',
              color: theme.palette.secondary.main,
              yAxisId: 'cumulative',
              curve: 'linear',
              showMark: true
            }
          ]}
          width={800}
          height={350}
          margin={{
            top: 30,
            right: 110,
            bottom: 80,
            left: 90
          }}
          grid={{ horizontal: true, vertical: false }}
          sx={{
            '& .MuiLineElement-root': {
              strokeWidth: 3
            },
            '& .MuiMarkElement-root': {
              strokeWidth: 2,
              r: 4
            },
            '& .MuiAreaElement-root': {
              fillOpacity: 0.3
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
      
      {/* Distance summary stats */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
            {totalDistance.toFixed(1)}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
            TOTAL KM
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
            {avgDaily.toFixed(1)}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
            AVG/DAY
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
            {maxDaily.toFixed(1)}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
            PEAK DAY
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.secondary.main }}>
            {maxCumulative.toFixed(1)}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
            CUMULATIVE
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DistanceOverTimeChart; 