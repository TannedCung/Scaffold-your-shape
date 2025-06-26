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
  ResponsiveContainer
} from 'recharts';
import { Box, Typography } from '@mui/material';

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
          No distance data available
        </Typography>
      </Box>
    );
  }

  // Calculate max values for domain
  const maxDaily = Math.max(...data.map(item => item.distance), 1);
  const maxCumulative = Math.max(...data.map(item => item.cumulative), 1);

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
          <defs>
            <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2da58e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2da58e" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            stroke="#666"
            fontSize={11}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="left"
            stroke="#2da58e"
            fontSize={12}
            domain={[0, maxDaily > 0 ? maxDaily : 5]}
            allowDataOverflow={false}
            tickCount={5}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            stroke="#1a8a73"
            fontSize={12}
            domain={[0, maxCumulative > 0 ? maxCumulative : 5]}
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
            formatter={(value: number, name: string) => [
              `${value.toFixed(2)} km`,
              name === 'distance' ? 'Daily Distance' : 'Cumulative Distance'
            ]}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="distance"
            stroke="#2da58e"
            strokeWidth={2}
            fill="url(#colorDistance)"
            name="Daily Distance (km)"
            connectNulls={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative"
            stroke="#1a8a73"
            strokeWidth={3}
            dot={{ fill: '#1a8a73', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#1a8a73', strokeWidth: 2 }}
            name="Cumulative Distance (km)"
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default DistanceOverTimeChart; 