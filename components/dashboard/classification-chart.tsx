"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ClassificationChartProps {
  data: {
    harmful: number;
    harmless: number;
    unknown: number;
  };
}

const COLORS = {
  harmful: "#dc2626",
  harmless: "#16a34a",
  unknown: "#9333ea",
};

export function ClassificationChart({ data }: ClassificationChartProps) {
  const chartData = [
    { name: "Harmful", value: data.harmful, color: COLORS.harmful },
    { name: "Harmless", value: data.harmless, color: COLORS.harmless },
    { name: "Unknown", value: data.unknown, color: COLORS.unknown },
  ].filter((item) => item.value > 0);

  const total = chartData.reduce((acc, item) => acc + item.value, 0);

  if (total === 0) {
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Classification Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="flex h-[150px] sm:h-[200px] items-center justify-center">
            <p className="text-sm text-slate-500">No annotations yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Classification Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="h-[150px] sm:h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [value, "Count"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #475569",
                  backgroundColor: "#1e293b",
                  color: "#f1f5f9",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-xs sm:text-sm text-slate-400">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-4 text-center">
          {chartData.map((item) => (
            <div key={item.name}>
              <p className="text-lg sm:text-2xl font-bold" style={{ color: item.color }}>
                {item.value}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400">{item.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
