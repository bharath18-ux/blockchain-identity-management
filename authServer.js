import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// ---------------- FRONTEND CONNECTION ----------------
app.use(cors());

// ---------------- PORT CONFIG ----------------
const PORT = 5900;

// ---------------- MONGO MODEL ----------------
const VerifiedSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  verifiedAt: { type: Date, default: Date.now }
});

const VerifiedEmail = mongoose.model("VerifiedEmail", VerifiedSchema);

// ---------------- CONNECT MONGO ----------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

// ---------------- OTP MEMORY STORE ----------------
let otpStore = {};   // otpStore[email] = "123456"

// ---------------- EMAIL TRANSPORT (ONLY THIS PART CHANGED) ----------------
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// ---------------- SEND OTP ROUTE ----------------
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.json({ success: false, message: "Email required" });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP temporarily in memory
  otpStore[email] = otp;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your OTP Code",
      html: `
        <p>Your OTP is:</p>
        <h1 style="letter-spacing:4px;">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `
    });

    return res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: "Failed to send OTP" });
  }
});

// ---------------- VERIFY OTP ROUTE ----------------
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.json({ success: false, message: "Email & OTP required" });

  if (otpStore[email] !== otp) {
    return res.json({ success: false, message: "Invalid OTP" });
  }

  // OTP matched → delete from memory
  delete otpStore[email];

  // Save email inside MongoDB
  await VerifiedEmail.updateOne(
    { email },
    { $set: { email, verifiedAt: new Date() } },
    { upsert: true }
  );

  return res.json({ success: true, message: "OTP verified" });
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



