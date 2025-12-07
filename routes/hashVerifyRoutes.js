import express from "express";
import Identity from "../models/Identity.js";
import crypto from "crypto";

const router = express.Router();

// verify hash and generate proof
router.post("/verify-hash", async (req, res) => {
  try {
    const { hash } = req.body;

    if (!hash) return res.json({ success: false, message: "Hash missing" });

    const doc = await Identity.findOne({ hash });

    if (!doc) {
      return res.json({ success: false, message: "Invalid Hash" });
    }

    // generate 8-character alphanumeric password
    const proofPassword = crypto.randomBytes(4).toString("hex").toUpperCase();

    return res.json({
      success: true,
      name: doc.owner,
      identityType: doc.type.toUpperCase(),
      number: doc.number,
      hash: doc.hash,
      proofPassword,
      generatedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error("Error:", err);
    return res.json({ success: false, message: "Server error" });
  }
});

export default router;
