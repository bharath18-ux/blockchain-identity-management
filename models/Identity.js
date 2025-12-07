// models/Identity.js
import mongoose from "mongoose";
import crypto from "crypto";

const identitySchema = new mongoose.Schema({
  type: { type: String, required: true },      // aadhar|pan|dl|passport
  number: { type: String, required: true, unique: true },
  owner: { type: String, required: true },
  hash: { type: String },
  createdAt: { type: Date, default: Date.now },
});

identitySchema.pre("save", function (next) {
  if (!this.hash) {
    this.hash = crypto
      .createHash("sha256")
      .update(`${this.type}:${this.number}:${Date.now()}`)
      .digest("hex");
  }
  next();
});

export default mongoose.model("Identity", identitySchema);
