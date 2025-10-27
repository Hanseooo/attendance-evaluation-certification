import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { EvaluationAnalytics, Evaluation } from "@/utils/types";

const COLORS = ["#0f172a", "#334155", "#475569", "#64748b", "#94a3b8"];

interface Props {
  chartType: "bar" | "pie" | "radar";
  category: string;
  analytics: EvaluationAnalytics;
  labels: string[];
  series: number[];
}

function buildCategoryDataset(
  analytics: EvaluationAnalytics,
  category: string,
  labels: string[],
  series: number[]
) {
  if (category === "all") {
    return labels.map((label, i) => ({ name: label, value: series[i] }));
  }

  const counts = [0, 0, 0, 0, 0];
  analytics.evaluations.forEach((e: Evaluation) => {
    const val = (e as any)[category] ?? 0;
    if (val >= 1 && val <= 5) counts[val - 1] += 1;
  });

  return counts.map((c, idx) => ({ name: String(idx + 1), value: c }));
}

export default function ChartSwitcher({
  chartType,
  category,
  analytics,
  labels,
  series,
}: Props) {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dataAll = buildCategoryDataset(analytics, category, labels, series);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setContainerWidth(entries[0].contentRect.width);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!dataAll?.length)
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        No data available.
      </div>
    );

  const isMobile = containerWidth < 640;

  // Dynamically calculate height — adds more vertical space on desktop
  const chartHeight =
    chartType === "bar"
      ? isMobile
        ? 280
        : 400
      : chartType === "pie"
        ? isMobile
          ? 300
          : 380
        : isMobile
          ? 300
          : 380;

  return (
    <motion.div
      ref={containerRef}
      className="w-full flex items-center justify-center py-3 px-2 sm:px-4 overflow-visible"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* === BAR CHART === */}
      {chartType === "bar" && (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={dataAll}
            margin={{ top: 12, right: 8, left: 8, bottom: isMobile ? 40 : 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis
              dataKey="name"
              tick={{
                fontSize: isMobile ? 10 : 12,
                fill: "hsl(var(--foreground))",
                // whiteSpace: "nowrap",
              }}
              interval={0}
              angle={isMobile ? -25 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 50 : 60}
            />
            <YAxis
              allowDecimals={false}
              tick={{
                fontSize: isMobile ? 10 : 12,
                fill: "hsl(var(--foreground))",
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                fontSize: "0.75rem",
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {dataAll.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* === PIE CHART === */}
      {chartType === "pie" && (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart margin={{ top: 10, bottom: 10 }}>
            <Pie
              data={dataAll}
              dataKey="value"
              nameKey="name"
              innerRadius={isMobile ? "35%" : "45%"}
              outerRadius={isMobile ? "75%" : "80%"}
              paddingAngle={3}
              labelLine={false}
              label={({ name, percent }) =>
                isMobile
                  ? `${name}`
                  : `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {dataAll.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            {!isMobile && (
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: "12px", paddingTop: "4px" }}
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                fontSize: "0.75rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}

      {/* === RADAR CHART === */}
      {chartType === "radar" && (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius={isMobile ? "65%" : "75%"}
            data={dataAll}
          >
            <PolarGrid strokeOpacity={0.2} />
            <PolarAngleAxis
              dataKey="name"
              tick={{
                fontSize: isMobile ? 10 : 12,
                fill: "hsl(var(--foreground))",
              }}
            />
            <PolarRadiusAxis
              tick={{
                fontSize: isMobile ? 9 : 11,
                fill: "hsl(var(--foreground))",
              }}
            />
            <Radar
              name="Average"
              dataKey="value"
              stroke="#0f172a"
              fill="#0f172a"
              fillOpacity={0.5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                fontSize: "0.75rem",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
