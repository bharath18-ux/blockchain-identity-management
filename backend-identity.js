import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/verify-identity", (req, res) => {
  const { identityName, identityValue } = req.body;

  if (!identityName || !identityValue) {
    return res.json({ success: false, message: "Missing fields" });
  }

  console.log("Identity:", identityName, "Value:", identityValue);

  return res.json({
    success: true,
    message: `${identityName} verified successfully.`,
    number: identityValue
  });
});

app.listen(6000, () => {
  console.log("🔥 Identity Backend running at http://localhost:6000");
});
