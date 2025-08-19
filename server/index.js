import dotenv from "dotenv";

// load .env variables
dotenv.config({ path: "./.env" });

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import axios from "axios";
import connectDB from "./config/db.js";
import Stock from "./models/Stock.js";
import StockLatest from "./models/StockLatest.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Popular Indian stock symbols
const STOCK_SYMBOLS = {
  "HDFCBANK.NS": "HDFC Bank",
  "SBIN.NS": "State Bank of India",
  "TCS.NS": "Tata Consultancy Services",
  "INFY.NS": "Infosys",
  "RELIANCE.NS": "Reliance Industries",
  "ICICIBANK.NS": "ICICI Bank",
  "KOTAKBANK.NS": "Kotak Mahindra Bank",
  "BHARTIARTL.NS": "Bharti Airtel",
  "ITC.NS": "ITC Limited",
  "WIPRO.NS": "Wipro",
};

// Store active connections and their subscribed symbols
const activeConnections = new Map();

// Fetch real-time stock data from Yahoo Finance API
async function fetchRealTimeStockData(symbol) {
  try {
    console.log(`Fetching real-time data for ${symbol}...`);

    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      {
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );

    const result = response.data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];
    const timestamps = result.timestamp;

    if (!timestamps || timestamps.length === 0) {
      throw new Error("No data available");
    }

    const latestIndex = timestamps.length - 1;
    const currentPrice = quote.close[latestIndex] || meta.regularMarketPrice;
    const volume = quote.volume[latestIndex] || meta.regularMarketVolume || 0;
    const high = quote.high[latestIndex] || meta.regularMarketDayHigh;
    const low = quote.low[latestIndex] || meta.regularMarketDayLow;
    const open = quote.open[latestIndex] || meta.regularMarketOpen;

    const stockData = {
      symbol,
      name: STOCK_SYMBOLS[symbol] || symbol,
      price: parseFloat(currentPrice.toFixed(2)),
      volume: volume,
      timestamp: new Date(),
      change: parseFloat((currentPrice - meta.previousClose).toFixed(2)),
      changePercent: parseFloat(
        (
          ((currentPrice - meta.previousClose) / meta.previousClose) *
          100
        ).toFixed(2)
      ),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      open: parseFloat(open.toFixed(2)),
      previousClose: parseFloat(meta.previousClose.toFixed(2)),
    };

    // 🔹 Save latest only if changed
    const lastLatest = await StockLatest.findOne({ symbol });
    if (
      !lastLatest ||
      lastLatest.price !== stockData.price ||
      lastLatest.volume !== stockData.volume
    ) {
      await StockLatest.findOneAndUpdate(
        { symbol },
        { $set: stockData },
        { upsert: true, new: true }
      );
      console.log(`✅ Updated latest for ${symbol}`);
    } else {
      console.log(`⚡ No change for ${symbol}, skipped latest update`);
    }

    // 🔹 Save history (rate-limited)
    const lastHistory = await Stock.findOne({ symbol }).sort({ timestamp: -1 });
    const now = new Date();
    const THRESHOLD_MINUTES = 1;
    const PRICE_DELTA_PERCENT = 0.2;

    if (
      !lastHistory ||
      now - lastHistory.timestamp > THRESHOLD_MINUTES * 60 * 1000 ||
      Math.abs(
        ((stockData.price - lastHistory.price) / lastHistory.price) * 100
      ) > PRICE_DELTA_PERCENT
    ) {
      const newHistory = await new Stock(stockData).save();
      console.log(`📊 Added history for ${symbol}`);

      // 🔹 Emit new historical entry to all subscribers
      for (const [socketId, symbols] of activeConnections.entries()) {
        if (symbols.has(symbol)) {
          io.to(socketId).emit("historicalData", {
            symbol,
            data: [newHistory], // just send the new point
          });
        }
      }
    } else {
      console.log(`⏭️ Skipped history for ${symbol}`);
    }

    console.log(
      `✅ Fetched data for ${symbol}: ₹${stockData.price} (${
        stockData.changePercent > 0 ? "+" : ""
      }${stockData.changePercent}%)`
    );

    return stockData;
  } catch (error) {
    console.error(`❌ Error fetching data for ${symbol}:`, error.message);
    throw error;
  }
}

// Real-time data fetching for subscribed symbols
async function fetchRealTimeData() {
  const subscribedSymbols = new Set();

  for (const symbols of activeConnections.values()) {
    symbols.forEach((symbol) => subscribedSymbols.add(symbol));
  }

  if (subscribedSymbols.size === 0) {
    console.log("No active subscriptions, skipping data fetch...");
    return;
  }

  console.log(
    `🔄 Fetching real-time data for ${
      subscribedSymbols.size
    } symbols: ${Array.from(subscribedSymbols).join(", ")}`
  );

  const fetchPromises = Array.from(subscribedSymbols).map(async (symbol) => {
    try {
      const stockData = await fetchRealTimeStockData(symbol);

      // Emit to all clients subscribed to this symbol
      for (const [socketId, symbols] of activeConnections.entries()) {
        if (symbols.has(symbol)) {
          io.to(socketId).emit("stockUpdate", stockData);
        }
      }

      return { symbol, success: true, data: stockData };
    } catch (error) {
      console.error(`Failed to fetch data for ${symbol}:`, error.message);

      for (const [socketId, symbols] of activeConnections.entries()) {
        if (symbols.has(symbol)) {
          io.to(socketId).emit("error", {
            message: `Failed to fetch data for ${symbol}: ${error.message}`,
            symbol,
          });
        }
      }

      return { symbol, success: false, error: error.message };
    }
  });

  const results = await Promise.allSettled(fetchPromises);
  const successful = results.filter(
    (r) => r.status === "fulfilled" && r.value.success
  ).length;
  const failed = results.length - successful;

  console.log(
    `📊 Data fetch complete: ${successful} successful, ${failed} failed`
  );
}

// Start real-time data fetching interval
console.log("🚀 Starting real-time data fetching service...");
const dataFetchInterval = setInterval(fetchRealTimeData, 5000);

// Socket.IO handling
io.on("connection", (socket) => {
  console.log("👤 Client connected:", socket.id);
  activeConnections.set(socket.id, new Set());

  socket.on("subscribe", async (symbol) => {
    console.log(`📈 Client ${socket.id} subscribed to ${symbol}`);
    activeConnections.get(socket.id).add(symbol);

    try {
      // Send current real-time data immediately
      console.log(`🔄 Fetching immediate data for new subscription: ${symbol}`);
      const currentData = await fetchRealTimeStockData(symbol);

      socket.emit("stockUpdate", currentData);

      // 🔹 Fetch and send historical data
      const history = await Stock.find({ symbol })
        .sort({ timestamp: -1 })
        .limit(50); // send last 50 data points

      socket.emit("historicalData", { symbol, data: history.reverse() });
    } catch (error) {
      console.error(
        `Error handling subscription for ${symbol}:`,
        error.message
      );
      socket.emit("error", {
        message: `Failed to fetch data for ${symbol}: ${error.message}`,
      });
    }
  });

  socket.on("unsubscribe", (symbol) => {
    console.log(`📉 Client ${socket.id} unsubscribed from ${symbol}`);
    activeConnections.get(socket.id).delete(symbol);
  });

  socket.on("disconnect", () => {
    console.log("👋 Client disconnected:", socket.id);
    activeConnections.delete(socket.id);
  });
});

// REST API endpoints
app.get("/api/stocks", (req, res) => {
  res.json(
    Object.entries(STOCK_SYMBOLS).map(([symbol, name]) => ({ symbol, name }))
  );
});

app.get("/api/stocks/:symbol/latest", async (req, res) => {
  try {
    const { symbol } = req.params;
    const latest = await StockLatest.findOne({ symbol });
    if (!latest) return res.status(404).json({ error: "No latest data found" });
    res.json(latest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Fetch historical data from MongoDB
app.get("/api/stocks/:symbol/history", async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 50 } = req.query; // Default: last 50 entries

    const history = await Stock.find({ symbol })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  const activeSubscriptions = Array.from(activeConnections.values()).reduce(
    (total, symbols) => total + symbols.size,
    0
  );

  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    activeConnections: activeConnections.size,
    activeSubscriptions,
    subscribedSymbols: Array.from(
      new Set(
        Array.from(activeConnections.values()).flatMap((symbols) =>
          Array.from(symbols)
        )
      )
    ),
  });
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("🛑 Shutting down server...");
  clearInterval(dataFetchInterval);
  server.close(() => {
    console.log("✅ Server shut down gracefully");
    process.exit(0);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🌟 Server running on port ${PORT}`);
  console.log(`📊 Real-time stock data service active`);
  console.log(`🔗 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🌐 API endpoint: http://localhost:${PORT}/api`);
});
