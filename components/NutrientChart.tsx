
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { NutritionInfo } from '../types';

interface NutrientChartProps {
  nutrition: NutritionInfo;
}

const NutrientChart: React.FC<NutrientChartProps> = ({ nutrition }) => {
  const data = [
    { name: 'Proteína', value: nutrition.protein, color: '#3b82f6' }, // blue-500
    { name: 'Carboidratos', value: nutrition.carbs, color: '#06b6d4' }, // cyan-500
    { name: 'Gorduras', value: nutrition.fats, color: '#f59e0b' }, // amber-500
  ];

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={10}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-blue-100 text-xs font-bold uppercase tracking-widest ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NutrientChart;
