import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Box, Typography } from '@mui/material';

interface ActivityTypeData {
  type: string;
  count: number;
  percentage: number;
}

interface ActivityTypeChartProps {
  data: ActivityTypeData[];
  loading?: boolean;
}

// Colors following the app's green-blue theme
const COLORS = [
  '#2da58e',  // Primary green
  '#1a8a73',  // Darker green
  '#16a085',  // Turquoise
  '#20b2aa',  // Light sea green
  '#48cae4',  // Sky blue
  '#0077be',  // Ocean blue
  '#006494',  // Deep blue
  '#003566'   // Navy
];

const ActivityTypeChart: React.FC<ActivityTypeChartProps> = ({ data, loading }) => {
  
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
          No activity type data available
        </Typography>
      </Box>
    );
  }

  // Custom label function
  const renderCustomLabel = (props: { 
    cx?: number; 
    cy?: number; 
    midAngle?: number; 
    innerRadius?: number; 
    outerRadius?: number; 
    percent?: number;
  }) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    
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
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Box sx={{ width: '100%', height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
            nameKey="type"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number, name: string, props) => {
              const payload = props.payload as ActivityTypeData;
              return [
                `${Math.round(value)} activities (${payload.percentage.toFixed(1)}%)`,
                payload.type
              ];
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string, entry: { color?: string }) => (
              <span style={{ color: entry.color || '#666' }}>
                {value}
              </span>
            )}
            wrapperStyle={{ paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ActivityTypeChart; 