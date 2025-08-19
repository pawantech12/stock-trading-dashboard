// db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MongoURI = process.env.MONGODB_URI; // now it's loaded correctly
    if (!MongoURI) throw new Error("MONGODB_URI not found in .env");

    await mongoose.connect(MongoURI);
    console.log("✅ Connection successful to database");
  } catch (error) {
    console.error("❌ Database connection unsuccessful:", error.message);
    process.exit(1);
  }
};

export default connectDB;
