# 📈 Real-Time Stock Trade Visualization (MERN Stack)

A **MERN stack web application** for real-time stock market trade visualization.
The app fetches live stock data (e.g., **HDFC, SBI, or any stock symbol**) from a public API, stores it in **MongoDB**, and displays it in **real-time** on the frontend with interactive charts.

## 🚀 Features

- 🔄 **Real-Time Data Streaming** – Live stock price updates using **Socket.IO **.
- 📊 **Interactive Charts** – Line chart chart to visualize stock movement.
- 🗂️ **Database Integration** – All stock trades are saved in **MongoDB** for historical access.
- 🔍 **Stock Symbol Selection** – Users can choose different stock symbols (HDFC, SBI, etc.).
- 🕒 **Historical Data** – Fetch stored trade data from the database for analysis.
- 🌐 **Full-Stack MERN Application** – Node.js + Express + MongoDB backend, React frontend.

## 🏗️ Tech Stack

### Backend:

- **Node.js + Express.js**
- **MongoDB + Mongoose**
- **Socket.IO** (real-time communication)
- **Axios / Fetch** (API integration)

### Frontend:

- **React.js (Vite)**
- **Socket.IO Client**
- **Recharts** (visualization)
- **TailwindCSS ** (styling)

## ⚙️ Project Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/pawantech12/stock-trading-dashboard.git
cd stock-trading-dashboard
```

### 2️⃣ Backend Setup

```bash
cd server
pnpm install
```

Create a **.env** file inside `/server`:

```env
MONGO_URI=your_mongodb_connection_string

```

Run backend:

```bash
nodemon index.js
```

### 3️⃣ Frontend Setup

```bash
cd client
pnpm install
pnpm run dev
```

## 📡 API Used

This project uses free stock/crypto APIs such as:

- [Yahoo Finance API](https://query1.finance.yahoo.com/v8/finance/chart/HDFCBANK.NS)

## 🛠️ How It Works

1. Backend fetches real-time stock data from API.
2. Data is stored in **MongoDB**.
3. Backend streams live updates via **Socket.IO**.
4. Frontend React app receives updates and dynamically updates charts.

## 📌 Future Enhancements

- 🔑 User Authentication & Watchlist
- 📈 Multiple Stocks Comparison in Chart
- 📤 Export Historical Data as CSV/Excel
