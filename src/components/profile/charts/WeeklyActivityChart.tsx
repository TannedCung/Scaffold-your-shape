import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography, useTheme } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface WeeklyActivityData {
  day: string;
  count: number;
}

interface WeeklyActivityChartProps {
  data: WeeklyActivityData[];
  loading?: boolean;
}

const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ data, loading }) => {
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
            <CalendarTodayIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Weekly Activity Pattern
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
              Your activity distribution throughout the week
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
            <CalendarTodayIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Weekly Activity Pattern
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
              Your activity distribution throughout the week
            </Typography>
          </Box>
        </Box>
        <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            No weekly activity data available
          </Typography>
        </Box>
      </Box>
    );
  }

  // Process data for MUI X Charts
  const days = data.map(item => item.day);
  const counts = data.map(item => item.count);
  
  const maxCount = Math.max(...counts, 1);
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const avgDaily = Math.round((totalCount / 7) * 10) / 10;
  const peakDay = data.find(d => d.count === maxCount)?.day || 'N/A';
  
  console.log('WeeklyActivityChart - MUI X Chart debugging:', {
    days,
    counts,
    maxCount,
    totalCount,
    avgDaily,
    peakDay,
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
          <CalendarTodayIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            Weekly Activity Pattern
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
            Your activity distribution throughout the week
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ width: '100%', height: 350 }}>
        <BarChart
          xAxis={[
            {
              data: days,
              scaleType: 'band',
              tickLabelStyle: {
                fontSize: 12,
                fontWeight: 600,
                fill: theme.palette.text.secondary
              }
            }
          ]}
          yAxis={[
            {
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
              max: Math.ceil(maxCount * 1.3)
            }
          ]}
          series={[
            {
              data: counts,
              label: 'Activities',
              color: theme.palette.primary.main
            }
          ]}
          width={800}
          height={300}
          margin={{
            top: 30,
            right: 40,
            bottom: 60,
            left: 80
          }}
          grid={{ horizontal: true, vertical: false }}
          sx={{
            '& .MuiBarElement-root': {
              rx: 4,
              ry: 4
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
      
      {/* Week summary stats */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
            {totalCount}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
            TOTAL
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
            {avgDaily}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
            AVG/DAY
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
            {peakDay}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
            PEAK DAY
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default WeeklyActivityChart; 