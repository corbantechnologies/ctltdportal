/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface AccountDistributionChartProps {
  data: any[]; // Expecting COAs with books
}

const COLORS = ["#D0402B", "#1E293B", "#64748B", "#F97316", "#0F172A"];

export default function AccountDistributionChart({
  data,
}: AccountDistributionChartProps) {
  const chartData: ChartData[] = data
    .map((coa) => ({
      name: coa.name,
      value: coa.books?.length || 0,
    }))
    .filter((item) => item.value > 0);

  return (
    <div className="col-span-1 shadow shadow-slate-200/50 border border-slate-200 rounded bg-white p-8 relative overflow-hidden group hover:shadow-corporate-primary/5 transition-all duration-500">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-corporate-primary/5 transition-colors" />

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
          Portfolio Distribution
        </h3>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
          Ledger Book Allocation
        </p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="90%"
              fill="#8884d8"
              paddingAngle={8}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
