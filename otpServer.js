import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const otpStore = {};
const OTP_TTL_MS = 5 * 60 * 1000;

// ⭐ BREVO SMTP CONFIG (NOT GMAIL)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,   // smtp-relay.brevo.com
  port: process.env.SMTP_PORT,   // 587
  secure: false,                 // Brevo requires false for port 587
  auth: {
    user: process.env.SMTP_USER, // Brevo SMTP login
    pass: process.env.SMTP_PASS  // Brevo SMTP password
  }
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------------- SEND OTP ----------------
app.post("/send-otp", async (req, res) => {
  try {
    const { email, did, cid } = req.body;

    if (!email || !did || !cid)
      return res.json({ success: false, message: "Missing fields" });

    const otp = generateOTP();
    otpStore[email] = { otp, createdAt: Date.now() };

    const html = `
      <div style="font-family:Arial;padding:18px;">
        <h2>Your OTP</h2>
        <h1>${otp}</h1>
        <p>DID: ${did}</p>
        <p>Credential ID: ${cid}</p>
        <p>Valid for 5 minutes.</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_USER,  // MUST MATCH BREVO LOGIN
      to: email,
      subject: "Your OTP Code",
      html
    });

    console.log("📨 OTP sent to:", email, "=>", otp);

    return res.json({ success: true });

  } catch (err) {
    console.log("❌ send-otp error:", err);
    return res.json({ success: false, message: "Failed to send OTP" });
  }
});

// ---------------- VERIFY OTP ----------------
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const entry = otpStore[email];

  if (!entry)
    return res.json({ success: false, message: "No OTP requested" });

  if (Date.now() - entry.createdAt > OTP_TTL_MS) {
    delete otpStore[email];
    return res.json({ success: false, message: "OTP expired" });
  }

  if (entry.otp === otp) {
    delete otpStore[email];
    return res.json({ success: true });
  }

  return res.json({ success: false, message: "Invalid OTP" });
});

// ---------------- START SERVER ----------------
app.listen(5001, () =>
  console.log("🔥 OTP Backend running on http://localhost:5001")
);
