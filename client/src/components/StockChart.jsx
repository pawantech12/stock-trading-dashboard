import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

const StockChart = ({ data, loading }) => {
  const formatTime = (timestamp) => {
    return format(new Date(timestamp), "HH:mm:ss");
  };

  const formatTooltipValue = (value) => {
    return `₹${value.toFixed(2)}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className={`p-3 rounded-lg border shadow-lg bg-white border-gray-200 text-gray-900`}
        >
          <p className="text-sm font-medium">
            {format(new Date(data.timestamp), "MMM dd, HH:mm:ss")}
          </p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            Price: ₹{data.price.toFixed(2)}
          </p>
          <p
            className={`text-sm ${
              data.change >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            Change: {data.change >= 0 ? "+" : ""}₹{data.change.toFixed(2)} (
            {data.changePercent.toFixed(2)}%)
          </p>
          <p className="text-sm text-gray-500">
            Volume: {data.volume?.toLocaleString() || "N/A"}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">
                Loading chart data...
              </p>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No data available
            </p>
          )}
        </div>
      </div>
    );
  }

  const isPositiveTrend =
    data.length > 1 && data[data.length - 1].price > data[0].price;

  return (
    <div className="h-96">
      {/* Wrapper: enables horizontal scrolling on small screens */}
      <div className="w-full overflow-x-auto">
        <div className="mx-auto min-w-[800px] md:min-w-0 md:w-full">
          <ResponsiveContainer
            width="100%"
            height={window.innerWidth < 850 ? 400 : 384} // 384px ~ h-96
          >
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                opacity={0.5}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={{ stroke: "#d1d5db" }}
              />
              <YAxis
                domain={["dataMin - 10", "dataMax + 10"]}
                tickFormatter={(value) => `₹${value}`}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={{ stroke: "#d1d5db" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke={isPositiveTrend ? "#10b981" : "#ef4444"}
                strokeWidth={2.5}
                dot={{ r: 3, fill: isPositiveTrend ? "#10b981" : "#ef4444" }}
                activeDot={{
                  r: 5,
                  stroke: isPositiveTrend ? "#10b981" : "#ef4444",
                  strokeWidth: 2,
                  fill: "#ffffff",
                }}
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StockChart;
