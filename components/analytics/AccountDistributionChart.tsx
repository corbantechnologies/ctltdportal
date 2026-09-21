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

const COLORS = ["#059669", "#0284c7", "#6366f1", "#d97706", "#475569", "#dc2626"];

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
    <div className="col-span-1 border border-slate-200 rounded-xl bg-white p-4 sm:p-5 transition-all">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Portfolio Distribution
        </h3>
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
          Ledger Book Allocation
        </p>
      </div>

      <div className="h-[240px] w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No active chart data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius="60%"
                outerRadius="80%"
                fill="#8884d8"
                paddingAngle={4}
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
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "0.5rem",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={32}
                formatter={(value) => (
                  <span className="text-[11px] font-medium text-slate-600">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
