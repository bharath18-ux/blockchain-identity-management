import express from "express";
import Identity from "../models/Identity.js";

const router = express.Router();

// POST /api/identity/verify
router.post("/verify", async (req, res) => {
  try {
    const { type, value } = req.body;

    if (!type || !value) {
      return res.json({ verified: false, message: "Missing fields" });
    }

    // Find matching identity in DB
    const identity = await Identity.findOne({
      type: type.toLowerCase(),
      value: value.trim(),
    });

    if (!identity) {
      return res.json({ verified: false });
    }

    return res.json({
      verified: true,
      hash: identity.hash,
      name: identity.name,
    });

  } catch (err) {
    console.error("Error verifying identity:", err);
    return res.status(500).json({ verified: false, message: "Server error" });
  }
});

export default router;
