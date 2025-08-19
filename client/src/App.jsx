import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import StockChart from "./components/StockChart";
import StockSelector from "./components/StockSelector";
import StockCard from "./components/StockData";
import { Moon, Sun, Activity } from "lucide-react";

function App() {
  const [socket, setSocket] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState("");
  const [stockData, setStockData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io("https://stock-trading-dashboard-qvs7.onrender.com");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    newSocket.on("stockUpdate", (data) => {
      setStockData(data);
      setHistoricalData((prev) => [...prev.slice(-49), data]);
    });

    newSocket.on("historicalData", ({ symbol, data }) => {
      if (symbol === selectedStock) {
        setHistoricalData(data);
      }
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error.message);
    });

    // Fetch available stocks
    fetchStocks();

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (selectedStock && socket) {
      setLoading(true);
      socket.emit("subscribe", selectedStock);

      // Clear previous data
      setStockData(null);
      setHistoricalData([]);

      // Set loading to false after a delay
      setTimeout(() => setLoading(false), 1000);
    }
  }, [selectedStock, socket]);

  const fetchStocks = async () => {
    try {
      const response = await fetch(
        "https://stock-trading-dashboard-qvs7.onrender.com/api/stocks"
      );
      const stockList = await response.json();
      setStocks(stockList);
      if (stockList.length > 0) {
        setSelectedStock(stockList[0].symbol);
      }
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
    }
  };

  const handleStockChange = (symbol) => {
    if (socket && selectedStock) {
      socket.emit("unsubscribe", selectedStock);
    }
    setSelectedStock(symbol);
  };

  console.log("Historical Data:", historicalData);

  return (
    <div className={`min-h-screen transition-colors duration-300 bg-gray-50`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Stock Trading Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* Stock Selector */}
        <div className="mb-6">
          <StockSelector
            stocks={stocks}
            selectedStock={selectedStock}
            onStockChange={handleStockChange}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Info Card */}
          <div className="lg:col-span-1">
            <StockCard stockData={stockData} loading={loading} />
          </div>

          {/* Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Price Chart
                </h2>
                {loading && (
                  <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm">Loading...</span>
                  </div>
                )}
              </div>

              <StockChart data={historicalData} loading={loading} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Real-time stock data updates every 5 seconds • Data provided by
            Yahoo Finance API
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
