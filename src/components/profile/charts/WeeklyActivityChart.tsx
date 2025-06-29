import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from 'recharts';
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
  
  // Add comprehensive logging
  console.log('WeeklyActivityChart - Component rendered with:', {
    loading,
    dataLength: data?.length || 0,
    data: data,
    hasData: !!data && data.length > 0
  });
  
  if (loading) {
    console.log('WeeklyActivityChart - Showing loading state');
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
    console.log('WeeklyActivityChart - Showing empty state', { data, hasData: !!data });
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

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const avgDaily = Math.round((totalCount / 7) * 10) / 10;
  const peakDay = data.find(d => d.count === maxCount)?.day || 'N/A';
  
  // Calculate proper domain with minimum visibility
  const countDomain = maxCount === 0 ? [0, 5] : [0, Math.ceil(maxCount * 1.3)];

  // Log data processing
  console.log('WeeklyActivityChart - Data processing:', {
    originalData: data,
    maxCount,
    totalCount,
    avgDaily,
    peakDay,
    countDomain,
    dataTypes: data.map(item => ({
      day: typeof item.day,
      count: typeof item.count,
      values: { day: item.day, count: item.count }
    }))
  });

  // Custom tooltip with Strava styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      console.log('WeeklyActivityChart - Tooltip active:', { label, value, payload });
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `3px solid ${theme.palette.primary.main}`,
            borderRadius: 2,
            p: 2.5,
            boxShadow: theme.shadows[8],
            minWidth: 180
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
            {label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.main,
                mr: 1,
                boxShadow: `0 0 8px ${theme.palette.primary.main}40`
              }}
            />
            <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              <strong>{Math.round(value)}</strong> activities
            </Typography>
          </Box>
        </Box>
      );
    }
    return null;
  };

  console.log('WeeklyActivityChart - Rendering chart with processed data');

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
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 30,
              right: 40,
              bottom: 30,
              left: 20,
            }}
            onMouseEnter={() => console.log('WeeklyActivityChart - Mouse entered chart area')}
            onMouseLeave={() => console.log('WeeklyActivityChart - Mouse left chart area')}
          >
            <defs>
              <linearGradient id="weeklyActivityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.9}/>
                <stop offset="50%" stopColor={theme.palette.primary.main} stopOpacity={0.4}/>
                <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="weeklyStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={theme.palette.primary.main} />
                <stop offset="100%" stopColor={theme.palette.primary.dark} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="2 4" 
              stroke={theme.palette.divider}
              opacity={0.4}
              strokeWidth={1.5}
            />
            <XAxis 
              dataKey="day" 
              stroke={theme.palette.text.secondary}
              fontSize={13}
              fontWeight={600}
              tick={{ fontSize: 12, fontWeight: 600 }}
              axisLine={{ stroke: theme.palette.divider, strokeWidth: 2 }}
              tickLine={{ stroke: theme.palette.divider, strokeWidth: 2 }}
              interval={0}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              fontSize={13}
              fontWeight={600}
              tick={{ fontSize: 12, fontWeight: 600 }}
              axisLine={{ stroke: theme.palette.divider, strokeWidth: 2 }}
              tickLine={{ stroke: theme.palette.divider, strokeWidth: 2 }}
              domain={countDomain}
              allowDecimals={false}
              tickCount={6}
              interval={0}
              label={{ 
                value: 'Activities', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: theme.palette.primary.main, fontWeight: '700', fontSize: '12px' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="url(#weeklyStrokeGradient)"
              strokeWidth={4}
              fill="url(#weeklyActivityGradient)"
              dot={{
                fill: theme.palette.primary.main,
                strokeWidth: 3,
                r: 6,
                stroke: theme.palette.background.paper
              }}
              activeDot={{
                r: 9,
                stroke: theme.palette.primary.main,
                strokeWidth: 4,
                fill: theme.palette.background.paper,
                filter: 'drop-shadow(0px 3px 6px rgba(0,0,0,0.3))'
              }}
              onAnimationStart={() => console.log('WeeklyActivityChart - Area animation started')}
              onAnimationEnd={() => console.log('WeeklyActivityChart - Area animation ended')}
            >
              <LabelList 
                dataKey="count" 
                position="top"
                style={{ 
                  fill: theme.palette.primary.main, 
                  fontWeight: '700', 
                  fontSize: '11px'
                }}
                formatter={(value: any) => value > 0 ? value : ''}
              />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
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