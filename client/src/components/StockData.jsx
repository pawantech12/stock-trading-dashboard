import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Volume2,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

const StockCard = ({ stockData, loading }) => {
  if (loading || !stockData) {
    return (
      <div
        className={`rounded-xl shadow-lg p-6 border bg-white border-gray-200`}
      >
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const isPositive = (stockData.change ?? 0) >= 0;
  const formatCurrency = (value) =>
    value != null ? `₹${value.toFixed(2)}` : "N/A";
  const formatNumber = (value) =>
    value != null ? value.toLocaleString() : "N/A";

  return (
    <div
      className={`rounded-xl shadow-lg p-6 border transition-all duration-300 bg-white border-gray-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {stockData.name ?? "Unknown"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {stockData.symbol ?? "--"}
          </p>
        </div>
        <div
          className={`p-3 rounded-full ${
            isPositive
              ? "bg-green-100 dark:bg-green-900/30"
              : "bg-red-100 dark:bg-red-900/30"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
          ) : (
            <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
          )}
        </div>
      </div>

      {/* Current Price */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(stockData.price)}
        </div>
        <div
          className={`flex items-center space-x-2 text-sm ${
            isPositive
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          <span className="font-medium">
            {isPositive ? "+" : ""}
            {formatCurrency(stockData.change)}
          </span>
          <span className="font-medium">
            ({isPositive ? "+" : ""}
            {stockData.changePercent?.toFixed(2) ?? "0.00"}%)
          </span>
        </div>
      </div>

      {/* Stock Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Open
            </span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(stockData.open)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              High
            </span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(stockData.high)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Low
            </span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(stockData.low)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Volume
            </span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {stockData.volume ? formatNumber(stockData.volume) : "N/A"}
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Last Update
            </span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {stockData.timestamp
              ? format(new Date(stockData.timestamp), "HH:mm:ss")
              : "N/A"}
          </span>
        </div>
      </div>

      {/* Live Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            LIVE DATA
          </span>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
