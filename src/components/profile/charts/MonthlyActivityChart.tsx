import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography } from '@mui/material';

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
  
  if (loading) {
    return (
      <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Loading chart data...
        </Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No activity data available
        </Typography>
      </Box>
    );
  }

  // Calculate max values for domain
  const maxCount = Math.max(...data.map(item => item.count), 1);
  const maxDistance = Math.max(...data.map(item => item.distance), 1);

  return (
    <Box sx={{ width: '100%', height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="month" 
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            yAxisId="left"
            stroke="#2da58e"
            fontSize={12}
            domain={[0, maxCount > 0 ? maxCount : 5]}
            allowDataOverflow={false}
            tickCount={5}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            stroke="#1a8a73"
            fontSize={12}
            domain={[0, maxDistance > 0 ? maxDistance : 5]}
            allowDataOverflow={false}
            tickCount={5}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'Activities') {
                return [`${Math.round(value)} activities`, 'Activities'];
              } else if (name === 'Distance (km)') {
                return [`${value.toFixed(2)} km`, 'Distance'];
              }
              return [value.toFixed(2), name];
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
          />
          <Bar 
            yAxisId="left"
            dataKey="count" 
            fill="#2da58e" 
            name="Activities"
            radius={[2, 2, 0, 0]}
            minPointSize={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="distance"
            stroke="#1a8a73"
            strokeWidth={3}
            dot={{ fill: '#1a8a73', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#1a8a73', strokeWidth: 2 }}
            name="Distance (km)"
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default MonthlyActivityChart; 