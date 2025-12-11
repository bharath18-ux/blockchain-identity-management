import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const otpStore = {};
const OTP_TTL_MS = 5 * 60 * 1000;

// ⭐ NO SMTP — USING BREVO HTTPS API
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post("/send-otp", async (req, res) => {
  try {
    const { email, did, cid } = req.body;

    if (!email || !did || !cid)
      return res.json({ success: false, message: "Missing fields" });

    const otp = generateOTP();
    otpStore[email] = { otp, createdAt: Date.now() };

    const htmlContent = `
      <div style="font-family:Arial;padding:18px;">
        <h2>Your OTP</h2>
        <h1>${otp}</h1>
        <p>DID: ${did}</p>
        <p>Credential ID: ${cid}</p>
        <p>Valid for 5 minutes.</p>
      </div>
    `;

    // ⭐ BREVO EMAIL API (WORKS ON RENDER)
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "OTP Service", email: "no-reply@yourdomain.com" },
        to: [{ email }],
        subject: "Your OTP Code",
        htmlContent
      })
    });

    const data = await response.json();
    console.log("Brevo API:", data);

    if (!response.ok) {
      return res.json({ success: false, message: "Failed to send email" });
    }

    return res.json({ success: true });

  } catch (err) {
    console.log("send-otp error:", err.message);
    return res.json({ success: false, message: "Email error" });
  }
});

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

app.listen(5001, () =>
  console.log("🔥 OTP Backend USING BREVO API running on Render")
);
