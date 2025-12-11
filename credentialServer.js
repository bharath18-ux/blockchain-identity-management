import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config(); // Load .env

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5600;

// ------------------ FUNCTION TO SEND EMAIL VIA BREVO ------------------
async function sendBrevoEmail(toEmail, subject, htmlContent) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: "Credential Service", email: process.env.SENDER_EMAIL },
        to: [{ email: toEmail }],
        subject,
        htmlContent
      })
    });

    const data = await response.json();
    console.log("Brevo Response:", data);

    if (data.messageId) return true;
    return false;

  } catch (err) {
    console.log("Brevo error:", err);
    return false;
  }
}

// ------------------ GENERATE CREDENTIAL ID ROUTE ------------------
app.post("/generate", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.json({ success: false, message: "Email missing" });

    // Generate Credential ID
    const random = Math.random().toString(36).substring(2, 15).toUpperCase();
    const credentialID = "CID-" + random;

    // Email HTML
    const html = `
      <div style="font-family:Arial;padding:15px;">
        <h2>Your Credential ID</h2>
        <p>Your generated Credential ID is:</p>
        <h1>${credentialID}</h1>
        <p>Save this ID securely.</p>
      </div>
    `;

    // Send Email via Brevo
    const sent = await sendBrevoEmail(email, "Your Credential ID", html);

    if (!sent) {
      return res.json({ success: false, message: "Failed to send email" });
    }

    // Success Response
    return res.json({ success: true, credentialID });

  } catch (err) {
    console.log("Server error:", err);
    return res.json({ success: false, message: "Internal error" });
  }
});

// ------------------ START SERVER ------------------
app.listen(PORT, () =>
  console.log(`credentialServer running on port ${PORT}`)
);
