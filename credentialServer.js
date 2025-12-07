import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // ⭐ Load .env values

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5600;   // 🔥 NO CHANGE HERE

// ⭐ GMAIL SMTP USING APP PASSWORD (ONLY THIS PART UPDATED)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,   // Gmail from .env
        pass: process.env.SMTP_PASS    // App Password from .env
    }
});

// Route: generate credential ID
app.post("/generate", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.json({ success: false, message: "Email missing" });

        // create random credential ID
        const random = Math.random().toString(36).substring(2, 15);
        const credentialID = "CID-" + random.toUpperCase();

        // Mail the credential
        await transporter.sendMail({
            from: process.env.SMTP_USER,  // same Gmail sender
            to: email,
            subject: "Your Credential ID",
            text: `Your Credential ID is: ${credentialID}`
        });

        res.json({ success: true, credentialID });

    } catch (err) {
        console.log("Email error:", err);
        return res.json({ success: false, message: "Error sending email" });
    }
});

app.listen(PORT, () =>
    console.log(`credentialServer running on port ${PORT}`)
);
