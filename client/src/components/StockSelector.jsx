import React from "react";
import { ChevronDown, Search } from "lucide-react";

const StockSelector = ({ stocks, selectedStock, onStockChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStockData = stocks.find(
    (stock) => stock.symbol === selectedStock
  );

  const handleStockSelect = (symbol) => {
    onStockChange(symbol);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Stock Symbol
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full max-w-md flex items-center justify-between px-4 py-3 rounded-lg border transition-colors bg-white border-gray-300 text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {selectedStockData?.symbol.charAt(0) || "S"}
            </span>
          </div>
          <div className="text-left">
            <div className="font-medium">
              {selectedStockData?.name || "Select a stock"}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selectedStockData?.symbol || ""}
            </div>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 w-full max-w-md mt-2 rounded-lg border shadow-lg bg-white border-gray-200`}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-md border text-sm transition-colors bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
              />
            </div>
          </div>

          {/* Stock List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleStockSelect(stock.symbol)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3 ${
                    selectedStock === stock.symbol
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedStock === stock.symbol
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${
                        selectedStock === stock.symbol
                          ? "text-white"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {stock.symbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{stock.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {stock.symbol}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                No stocks found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default StockSelector;
