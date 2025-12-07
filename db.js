// db.js
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/identityDB";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🔥 MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB connect error:", err.message || err);
    process.exit(1);
  }
};

export default connectDB;
