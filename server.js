// server.js
import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import identityRoutes from "./routes/identityRoutes.js"; // we will include inline route below


const app = express();
app.use(cors());
app.use(express.json());

connectDB();

// inline routes file alternative (if you prefer single file)
import Identity from "./models/Identity.js";

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

app.post("/api/identity/verify", async (req, res) => {
  try {
    const { type, number } = req.body;
    const found = await Identity.findOne({ type, number });
    if (!found) return res.json({ success: false });
    return res.json({ success: true, hash: found.hash, owner: found.owner });
  } catch (err) {
    return res.json({ success: false });
  }
});

app.listen(5000, () => {
  console.log("🔥 Identity Backend running on http://localhost:5000");
});
