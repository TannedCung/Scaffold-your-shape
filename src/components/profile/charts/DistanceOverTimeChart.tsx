import React from 'react';
import {
  ComposedChart,
  Area,
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
  
  // Add comprehensive logging
  console.log('DistanceOverTimeChart - Component rendered with:', {
    loading,
    dataLength: data?.length || 0,
    data: data,
    hasData: !!data && data.length > 0
  });
  
  if (loading) {
    console.log('DistanceOverTimeChart - Showing loading state');
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
    console.log('DistanceOverTimeChart - Showing empty state', { data, hasData: !!data });
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

  // Calculate max values for domain with padding
  const maxDaily = Math.max(...data.map(item => item.distance), 1);
  const maxCumulative = Math.max(...data.map(item => item.cumulative), 1);
  
  // Calculate proper domains with minimum visibility
  const dailyDomain = maxDaily === 0 ? [0, 10] : [0, Math.ceil(maxDaily * 1.3)];
  const cumulativeDomain = maxCumulative === 0 ? [0, 10] : [0, Math.ceil(maxCumulative * 1.1)];

  // Calculate total distance for the period
  const totalDistance = data.reduce((sum, item) => sum + item.distance, 0);
  const avgDaily = totalDistance / data.length;

  // Log data processing
  console.log('DistanceOverTimeChart - Data processing:', {
    originalData: data,
    dataLength: data.length,
    maxDaily,
    maxCumulative,
    dailyDomain,
    cumulativeDomain,
    totalDistance,
    avgDaily,
    sampleData: data.slice(0, 3),
    dataTypes: data.map(item => ({
      date: typeof item.date,
      distance: typeof item.distance,
      cumulative: typeof item.cumulative,
      values: { date: item.date, distance: item.distance, cumulative: item.cumulative }
    })).slice(0, 3)
  });

  // Custom tooltip with Strava styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      console.log('DistanceOverTimeChart - Tooltip active:', { label, payload });
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `3px solid ${theme.palette.primary.main}`,
            borderRadius: 2,
            p: 2.5,
            boxShadow: theme.shadows[8],
            minWidth: 240
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1.5 }}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: entry.color,
                  mr: 1.5,
                  boxShadow: `0 0 8px ${entry.color}40`
                }}
              />
              <Typography variant="body1" sx={{ fontWeight: 600, color: entry.color }}>
                {entry.name}: <strong>{entry.value.toFixed(2)} km</strong>
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  console.log('DistanceOverTimeChart - Rendering chart with processed data');

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
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 30,
              right: 40,
              bottom: 30,
              left: 20,
            }}
            onMouseEnter={() => console.log('DistanceOverTimeChart - Mouse entered chart area')}
            onMouseLeave={() => console.log('DistanceOverTimeChart - Mouse left chart area')}
          >
            <defs>
              <linearGradient id="dailyDistanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                <stop offset="50%" stopColor={theme.palette.primary.main} stopOpacity={0.4}/>
                <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="cumulativeStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={theme.palette.secondary.main} />
                <stop offset="100%" stopColor={theme.palette.secondary.dark} />
              </linearGradient>
              <linearGradient id="dailyStrokeGradient" x1="0" y1="0" x2="1" y2="0">
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
              dataKey="date" 
              stroke={theme.palette.text.secondary}
              fontSize={11}
              fontWeight={600}
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 10, fontWeight: 600 }}
              axisLine={{ stroke: theme.palette.divider, strokeWidth: 2 }}
              tickLine={{ stroke: theme.palette.divider, strokeWidth: 2 }}
              interval={'preserveStartEnd'}
            />
            <YAxis 
              yAxisId="left"
              stroke={theme.palette.primary.main}
              fontSize={12}
              fontWeight={600}
              domain={dailyDomain}
              tick={{ fontSize: 11, fontWeight: 600 }}
              axisLine={{ stroke: theme.palette.divider, strokeWidth: 2 }}
              tickLine={{ stroke: theme.palette.divider, strokeWidth: 2 }}
              allowDecimals={true}
              tickCount={6}
              interval={0}
              tickFormatter={(value) => `${Number(value).toFixed(1)}km`}
              label={{ 
                value: 'Daily Distance (km)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: theme.palette.primary.main, fontWeight: '700', fontSize: '11px' }
              }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              stroke={theme.palette.secondary.main}
              fontSize={12}
              fontWeight={600}
              domain={cumulativeDomain}
              tick={{ fontSize: 11, fontWeight: 600 }}
              axisLine={{ stroke: theme.palette.divider, strokeWidth: 2 }}
              tickLine={{ stroke: theme.palette.divider, strokeWidth: 2 }}
              allowDecimals={true}
              tickCount={6}
              interval={0}
              tickFormatter={(value) => `${Number(value).toFixed(1)}km`}
              label={{ 
                value: 'Cumulative Distance (km)', 
                angle: 90, 
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: theme.palette.secondary.main, fontWeight: '700', fontSize: '11px' }
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
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="distance"
              stroke="url(#dailyStrokeGradient)"
              strokeWidth={3}
              fill="url(#dailyDistanceGradient)"
              name="Daily Distance (km)"
              connectNulls={false}
              dot={{
                fill: theme.palette.primary.main,
                strokeWidth: 2,
                r: 4,
                stroke: theme.palette.background.paper
              }}
              activeDot={{
                r: 7,
                stroke: theme.palette.primary.main,
                strokeWidth: 3,
                fill: theme.palette.background.paper,
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
              }}
              onAnimationStart={() => console.log('DistanceOverTimeChart - Area animation started')}
              onAnimationEnd={() => console.log('DistanceOverTimeChart - Area animation ended')}
            >
              <LabelList 
                dataKey="distance" 
                position="top"
                style={{ 
                  fill: theme.palette.primary.main, 
                  fontWeight: '700', 
                  fontSize: '10px'
                }}
                formatter={(value: any) => Number(value) > 0 ? `${Number(value).toFixed(1)}` : ''}
              />
            </Area>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulative"
              stroke="url(#cumulativeStrokeGradient)"
              strokeWidth={4}
              dot={{ 
                fill: theme.palette.secondary.main, 
                strokeWidth: 3, 
                r: 5,
                stroke: theme.palette.background.paper
              }}
              activeDot={{ 
                r: 8, 
                stroke: theme.palette.secondary.main, 
                strokeWidth: 3,
                fill: theme.palette.background.paper,
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
              }}
              name="Cumulative Distance (km)"
              connectNulls={false}
              onAnimationStart={() => console.log('DistanceOverTimeChart - Line animation started')}
              onAnimationEnd={() => console.log('DistanceOverTimeChart - Line animation ended')}
            />
          </ComposedChart>
        </ResponsiveContainer>
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