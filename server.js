// server.js
import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import Identity from "./models/Identity.js";

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// ➤ Add identity
app.post("/api/identity/add", async (req, res) => {
  try {
    const { type, number, owner } = req.body;
    const doc = new Identity({ type, number, owner });
    await doc.save();
    res.json({ success: true, hash: doc.hash });
  } catch (err) {
    res.json({ success: false, message: err.message || "error" });
  }
});

// ➤ Verify identity
app.post("/api/identity/verify", async (req, res) => {
  try {
    const { type, number } = req.body;
    const found = await Identity.findOne({ type, number });
    if (!found) return res.json({ success: false });

    return res.json({
      success: true,
      hash: found.hash,
      owner: found.owner
    });
  } catch (err) {
    return res.json({ success: false });
  }
});

// PORT FIX FOR RENDER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Identity Backend running on port ${PORT}`);
});
