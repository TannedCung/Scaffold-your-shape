import React from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography } from '@mui/material';

interface WeeklyActivityData {
  day: string;
  count: number;
}

interface WeeklyActivityChartProps {
  data: WeeklyActivityData[];
  loading?: boolean;
}

const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ data, loading }) => {
  
  if (loading) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Loading chart data...
        </Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No weekly activity data available
        </Typography>
      </Box>
    );
  }

  // Find the day with maximum activities for color highlighting
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="day" 
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
            domain={[0, maxCount > 0 ? maxCount : 5]}
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
            formatter={(value: number) => [`${value} activities`, 'Activities']}
            labelFormatter={(label) => `${label}`}
          />
          <Bar 
            dataKey="count" 
            radius={[4, 4, 0, 0]}
            minPointSize={2}
          >
            {/* Custom fill for each bar */}
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.count === maxCount ? '#1a8a73' : '#2da58e'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default WeeklyActivityChart; 