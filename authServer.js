import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5900;

// ---------------- LOGIN DATABASE ----------------
const loginDB = {
  "99220040454@klu.ac.in": "99220040454",
  "99220040417@klu.ac.in": "99220040417",
  "99220040553@klu.ac.in": "99220040553",
  "99220040059@klu.ac.in": "99220040059"
};

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

// ---------------- OTP STORE ----------------
let otpStore = {};

// ---------------- BREVO OTP SEND FUNCTION ----------------
async function sendBrevoOTP(email, otp) {
  const htmlContent = `
    <p>Your OTP is:</p>
    <h1 style="letter-spacing:4px;">${otp}</h1>
    <p>Valid for 5 minutes.</p>
  `;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY
    },
    body: JSON.stringify({
      sender: { name: "OTP Service", email: process.env.SENDER_EMAIL },
      to: [{ email }],
      subject: "Your OTP Code",
      htmlContent
    })
  });

  return response.json();
}

// ---------------- SEND OTP ROUTE ----------------
app.post("/send-otp", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.json({ success: false, message: "Email & password required" });

  if (!loginDB[email])
    return res.json({ success: false, message: "User not found" });

  if (loginDB[email] !== password)
    return res.json({ success: false, message: "Incorrect password" });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  try {
    const result = await sendBrevoOTP(email, otp);

    if (result.messageId) {
      console.log(`📨 Brevo OTP sent to ${email}: ${otp}`);
      return res.json({ success: true, message: "OTP sent to email" });
    } else {
      console.log("❌ Brevo Error:", result);
      return res.json({ success: false, message: "Failed to send OTP" });
    }

  } catch (err) {
    console.log("❌ Brevo API Error:", err);
    return res.json({ success: false, message: "Email sending failed" });
  }
});

// ---------------- VERIFY OTP ROUTE ----------------
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.json({ success: false, message: "Email & OTP required" });

  if (otpStore[email] !== otp)
    return res.json({ success: false, message: "Invalid OTP" });

  delete otpStore[email];

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
