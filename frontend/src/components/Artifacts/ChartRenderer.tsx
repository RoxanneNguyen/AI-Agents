/**
 * Chart Renderer Component - Renders Plotly charts from JSON
 */

import React, { useMemo } from "react";
import { createStyles } from "antd-style";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
} from "recharts";

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    width: 100%;
    height: 400px;
    padding: 16px;
  `,
  error: css`
    color: ${token.colorError};
    padding: 16px;
    text-align: center;
  `,
  fallback: css`
    background: ${token.colorFillSecondary};
    padding: 16px;
    border-radius: 8px;
    overflow: auto;
    font-family: monospace;
    font-size: 12px;
  `,
}));

interface ChartRendererProps {
  data: string;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00C49F",
  "#FFBB28",
];

export const ChartRenderer: React.FC<ChartRendererProps> = ({ data }) => {
  const { styles } = useStyles();

  const chartData = useMemo(() => {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, [data]);

  if (!chartData) {
    return (
      <div className={styles.fallback}>
        <pre>{data}</pre>
      </div>
    );
  }

  // Try to determine chart type and render
  const renderChart = () => {
    // If it's a Plotly spec
    if (chartData.data && Array.isArray(chartData.data)) {
      const trace = chartData.data[0];

      if (!trace) {
        return <div className={styles.error}>No chart data found</div>;
      }

      const chartType = trace.type || "bar";

      // Convert Plotly data to Recharts format
      const rechartsData =
        trace.x?.map((x: any, i: number) => ({
          name: x,
          value: trace.y?.[i] || 0,
        })) || [];

      switch (chartType) {
        case "scatter":
          return (
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid />
                <XAxis dataKey="name" name="X" />
                <YAxis dataKey="value" name="Y" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Legend />
                <Scatter name="Data" data={rechartsData} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          );

        case "line":
          return (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={rechartsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          );

        case "pie":
          return (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={rechartsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {rechartsData.map((_: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          );

        case "bar":
        default:
          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={rechartsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  {rechartsData.map((_: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          );
      }
    }

    // If it's direct array data
    if (Array.isArray(chartData)) {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Fallback - show raw JSON
    return (
      <div className={styles.fallback}>
        <pre>{JSON.stringify(chartData, null, 2)}</pre>
      </div>
    );
  };

  return <div className={styles.container}>{renderChart()}</div>;
};
