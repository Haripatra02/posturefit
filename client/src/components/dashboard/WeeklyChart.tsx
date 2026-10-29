import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Card } from '../common/Card';

interface WeeklyChartProps {
  data: {
    date: string;
    day: string;
    activities: number;
    breaks: number;
    points: number;
  }[];
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-base text-charcoal-heading">Weekly Activity Trends</h3>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Your posture activities and movement breaks over the past 7 days
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              iconType="circle"
            />
            <Bar
              dataKey="activities"
              name="Exercises Completed"
              fill="#0d9488"
              radius={[4, 4, 0, 0]}
              barSize={16}
            />
            <Bar
              dataKey="breaks"
              name="Breaks Taken"
              fill="#38bdf8"
              radius={[4, 4, 0, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
