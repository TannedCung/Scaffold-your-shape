import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
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
  
  // Add comprehensive logging
  console.log('ActivityTypeChart - Component rendered with:', {
    loading,
    dataLength: data?.length || 0,
    data: data,
    hasData: !!data && data.length > 0
  });
  
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
  
  console.log('ActivityTypeChart - Colors generated:', COLORS);
  
  if (loading) {
    console.log('ActivityTypeChart - Showing loading state');
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
    console.log('ActivityTypeChart - Showing empty state', { data, hasData: !!data });
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

  // Log data validation
  console.log('ActivityTypeChart - Data validation:', {
    dataLength: data.length,
    sampleData: data.slice(0, 3),
    totalCount: data.reduce((sum, item) => sum + item.count, 0),
    dataTypes: data.map(item => ({
      type: typeof item.type,
      count: typeof item.count,
      percentage: typeof item.percentage,
      values: { type: item.type, count: item.count, percentage: item.percentage }
    }))
  });

  // Enhanced label function with bold styling
  const renderCustomLabel = (props: { 
    cx?: number; 
    cy?: number; 
    midAngle?: number; 
    innerRadius?: number; 
    outerRadius?: number; 
    percent?: number;
    index?: number;
  }) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index } = props;
    
    console.log('ActivityTypeChart - Label render called:', { cx, cy, midAngle, innerRadius, outerRadius, percent });
    
    if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent) return null;
    if (percent < 0.05) return null; // Don't show labels for slices less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="13"
        fontWeight="800"
        style={{
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
        }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Custom tooltip with Strava styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      console.log('ActivityTypeChart - Tooltip active:', { payload, data });
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `3px solid ${payload[0].color}`,
            borderRadius: 2,
            p: 2.5,
            boxShadow: theme.shadows[8],
            minWidth: 220
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: payload[0].color,
                mr: 1.5,
                boxShadow: `0 0 8px ${payload[0].color}40`
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {data.type}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mb: 0.5 }}>
            <strong style={{ color: payload[0].color }}>{data.count}</strong> activities
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
            <strong style={{ color: payload[0].color }}>{data.percentage.toFixed(1)}%</strong> of total
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const totalActivities = data.reduce((sum, item) => sum + item.count, 0);
  console.log('ActivityTypeChart - Rendering chart:', { totalActivities, dataForChart: data });

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
        <ResponsiveContainer width="100%" height="100%">
          <PieChart
            onMouseEnter={() => console.log('ActivityTypeChart - Mouse entered chart area')}
            onMouseLeave={() => console.log('ActivityTypeChart - Mouse left chart area')}
          >
            <defs>
              {COLORS.map((color, index) => (
                <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={color} />
                  <stop offset="100%" stopColor={`${color}CC`} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={120}
              innerRadius={40}
              fill="#8884d8"
              dataKey="count"
              nameKey="type"
              stroke={theme.palette.background.paper}
              strokeWidth={3}
              onAnimationStart={() => console.log('ActivityTypeChart - Pie animation started')}
              onAnimationEnd={() => console.log('ActivityTypeChart - Pie animation ended')}
              minAngle={1}
            >
              {data.map((entry, index) => {
                const color = `url(#gradient-${index % COLORS.length})`;
                console.log(`ActivityTypeChart - Rendering pie slice ${index}:`, { entry, color, colorIndex: index % COLORS.length });
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={color}
                    style={{
                      filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
                    }}
                  />
                );
              })}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={60}
              formatter={(value: string, entry: { color?: string }) => (
                <span style={{ 
                  color: entry.color || theme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: '14px'
                }}>
                  {value}
                </span>
              )}
              wrapperStyle={{ 
                paddingTop: '20px',
                fontWeight: 600
              }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
        
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