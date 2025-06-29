import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';
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
  
  // Add comprehensive logging
  console.log('MonthlyActivityChart - Component rendered with:', {
    loading,
    dataLength: data?.length || 0,
    data: data,
    hasData: !!data && data.length > 0
  });
  
  if (loading) {
    console.log('MonthlyActivityChart - Showing loading state');
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
    console.log('MonthlyActivityChart - Showing empty state', { data, hasData: !!data });
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

  // Process data for dual-line chart
  const maxCount = Math.max(...data.map(item => item.count), 1);
  const maxDistance = Math.max(...data.map(item => item.distance), 1);
  
  // Calculate proper domains with padding, ensuring minimum visibility
  const countDomain = maxCount === 0 ? [0, 5] : [0, Math.ceil(maxCount * 1.2)];
  const distanceDomain = maxDistance === 0 ? [0, 10] : [0, Math.ceil(maxDistance * 1.2)];
  
  const chartData = data.map(item => ({
    month: item.month,
    activities: item.count,
    distance: item.distance,
  }));

  // Log processed data
  console.log('MonthlyActivityChart - Data processing:', {
    originalData: data,
    maxCount,
    maxDistance,
    countDomain,
    distanceDomain,
    chartData,
    chartDataSample: chartData.slice(0, 3),
    dataTypes: {
      firstItem: chartData[0] ? {
        month: typeof chartData[0].month,
        activities: typeof chartData[0].activities,
        distance: typeof chartData[0].distance,
        activitiesValue: chartData[0].activities,
        distanceValue: chartData[0].distance
      } : null
    }
  });

  // Custom tooltip component with Strava styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      console.log('MonthlyActivityChart - Tooltip active:', { label, payload });
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: 2,
            p: 2,
            boxShadow: theme.shadows[8],
            minWidth: 200
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: entry.color,
                  mr: 1
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600, color: entry.color }}>
                {entry.name}: <strong>{entry.name === 'Activities' ? Math.round(entry.value) : entry.value.toFixed(2)} {entry.name === 'Activities' ? 'activities' : 'km'}</strong>
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  console.log('MonthlyActivityChart - Rendering chart with processed data');

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
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            key={`monthly-chart-${data.length}-${maxCount}-${maxDistance}`}
            width={800}
            height={350}
            data={chartData}
            margin={{
              top: 30,
              right: 40,
              bottom: 60,
              left: 20,
            }}
            onMouseEnter={() => console.log('MonthlyActivityChart - Mouse entered chart area')}
            onMouseLeave={() => console.log('MonthlyActivityChart - Mouse left chart area')}
          >
            <defs>
              <linearGradient id="activitiesGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={theme.palette.primary.main} />
                <stop offset="100%" stopColor={theme.palette.primary.dark} />
              </linearGradient>
              <linearGradient id="distanceGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={theme.palette.secondary.main} />
                <stop offset="100%" stopColor={theme.palette.secondary.dark} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="2 4" 
              stroke={theme.palette.divider}
              opacity={0.4}
              strokeWidth={1.5}
            />
            <XAxis 
              dataKey="month" 
              stroke={theme.palette.text.secondary}
              fontSize={13}
              fontWeight={600}
              tick={{ fontSize: 12, fontWeight: 600 }}
              axisLine={{ stroke: theme.palette.divider, strokeWidth: 2 }}
              tickLine={{ stroke: theme.palette.divider, strokeWidth: 2 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke={theme.palette.primary.main}
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
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke={theme.palette.secondary.main}
              fontSize={13}
              fontWeight={600}
              tick={{ fontSize: 12, fontWeight: 600 }}
              axisLine={{ stroke: theme.palette.divider, strokeWidth: 2 }}
              tickLine={{ stroke: theme.palette.divider, strokeWidth: 2 }}
              domain={distanceDomain}
              allowDecimals={true}
              tickCount={6}
              interval={0}
              tickFormatter={(value) => `${Number(value).toFixed(1)}km`}
              label={{ 
                value: 'Distance (km)', 
                angle: 90, 
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: theme.palette.secondary.main, fontWeight: '700', fontSize: '12px' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontWeight: 600
              }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="activities"
              stroke="url(#activitiesGradient)"
              strokeWidth={4}
              dot={{ 
                fill: theme.palette.primary.main, 
                strokeWidth: 3, 
                r: 8,
                stroke: theme.palette.background.paper
              }}
              activeDot={{ 
                r: 10, 
                stroke: theme.palette.primary.main, 
                strokeWidth: 4,
                fill: theme.palette.background.paper,
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
              }}
              name="Activities"
              connectNulls={false}
              strokeDasharray="0"
            >
              <LabelList 
                dataKey="activities" 
                position="top"
                style={{ 
                  fill: theme.palette.primary.main, 
                  fontWeight: '700', 
                  fontSize: '11px'
                }}
                formatter={(value: any) => value > 0 ? value : ''}
              />
            </Line>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="distance"
              stroke="url(#distanceGradient)"
              strokeWidth={4}
              dot={{ 
                fill: theme.palette.secondary.main, 
                strokeWidth: 3, 
                r: 8,
                stroke: theme.palette.background.paper
              }}
              activeDot={{ 
                r: 10, 
                stroke: theme.palette.secondary.main, 
                strokeWidth: 4,
                fill: theme.palette.background.paper,
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
              }}
              name="Distance (km)"
              connectNulls={false}
              strokeDasharray="0"
            >
              <LabelList 
                dataKey="distance" 
                position="bottom"
                style={{ 
                  fill: theme.palette.secondary.main, 
                  fontWeight: '700', 
                  fontSize: '11px'
                }}
                formatter={(value: any) => value > 0 ? `${Number(value).toFixed(1)}km` : ''}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default MonthlyActivityChart; 