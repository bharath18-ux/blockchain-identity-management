import express from "express";
import cors from "cors";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import QRCode from "qrcode";

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------
// Hash Database (JSON Storage)
// -----------------------------
const hashDB = {
  // Bharath
  "0d16d926fdda03448371f487cb3272097968f7439eda9412b1374a0857120eab": { name: "Bharath", identity: "aadhar" },
  "4c37eb171764ebbcf2b06e760bf9a404436d46726cfd885e9cb4b5a7908daf1a": { name: "Bharath", identity: "pan" },
  "032312be9b55e8c169373360042125ef847b42ee5a6d0530c1d5729e7ad72480": { name: "Bharath", identity: "dl" },
  "29eb61ce2fc93a1da875dbe1043e136952d9972ed10a2f56dbec4369fb5d1643": { name: "Bharath", identity: "passport" },

  // Ajay
  "36c7692bdaa91944ca3a9e6690efa7b68288680cd830328e5cf0c676bdd9e0f3": { name: "Ajay", identity: "aadhar" },
  "fdcafe51800eacc6b43fc0030717f4c4ceebdbe5f19fcf3555346c07b01d7271": { name: "Ajay", identity: "pan" },
  "7d45762dacd6ee0e8c9c6beffd90783190788711e85c3dc1967fde86f9184e0e": { name: "Ajay", identity: "dl" },
  "3c1cb079446ace309390455b0fc98710c8b084b37d3371dcf8a70bfe08d2fa80": { name: "Ajay", identity: "passport" },

  // Kabilash
  "b0deb2954b76a2a409409a2ec35ae1a94ba61cf1b18a7f5f338c355515f85d45": { name: "Kabilash", identity: "aadhar" },
  "735245f2116bd2cf8c100537fb588756796b8e2378b0bb36dbf1604fb713f436": { name: "Kabilash", identity: "pan" },
  "d3bc09f96857b288957d262a164815668b0f5f3fedb881ff898414ef6f3e5e46": { name: "Kabilash", identity: "dl" },
  "1843622430334929e9f0edd9e47e081222267a963883527053c701781c00028c": { name: "Kabilash", identity: "passport" },

  // Hari
  "88d64c8e93643f3b9f395e61b7a401c8ec2b8afaead70fedffe13a02d8c1869a": { name: "Hari", identity: "aadhar" },
  "871a13cf6a5685048d1d7dc229e11640ede89c03818b558849d68f832917d714": { name: "Hari", identity: "pan" },
  "2e7f3ae2605ef12e084f4fc38f3fbc8d276e6251605ce71d841db4898b42360c": { name: "Hari", identity: "dl" },
  "6f9fba7ddc997d8d79364ceeed61e9ce7172e18040f9f240e98e2dc2f43ece6c": { name: "Hari", identity: "passport" },

  // James
  "f015e7fccddea5735c8015854dbbbbb93b4fb5b0cdd88ad045e8225f15454d36": { name: "James", identity: "aadhar" },
  "00ec149a1416a41e61db7ac6161f84528bbce94e40fdda530b8ba750c25ad7a9": { name: "James", identity: "pan" },
  "d7ba1210ca748668f6a4b4c7e74df26d611fa6972ebf4c68f66f2da8bd0a6d07": { name: "James", identity: "dl" },
  "cf9031f451751152429284bbb201c2270ae9e99539d5803da29f214c991862f3": { name: "James", identity: "passport" }
};

// ------------------------------------------------------
// Verify Hash
// ------------------------------------------------------
app.post("/verify-hash", (req, res) => {
  const { hash } = req.body;

  if (!hash || !hashDB[hash]) {
    return res.json({ success: false, message: "Invalid Hash" });
  }

  const data = hashDB[hash];
  const timestamp = new Date().toLocaleString();

  res.json({
    success: true,
    verified: true,
    triggerMetaMask: true,
    name: data.name,
    identity: data.identity,
    timestamp,
    hash
  });
});

// ------------------------------------------------------
// MODERN COLORFUL PDF WITH QR CODE & FULL HASH
// ------------------------------------------------------
app.post("/generate-pdf", async (req, res) => {
  const { name, identity, timestamp, hash } = req.body;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 page

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Colors
  const primary = rgb(0.48, 0.12, 0.64);
  const textDark = rgb(0.1, 0.1, 0.1);
  const grey = rgb(0.6, 0.6, 0.6);

  // ------------------------------------------
  // HEADER
  // ------------------------------------------
  page.drawRectangle({
    x: 0,
    y: 780,
    width: 595,
    height: 60,
    color: primary
  });

  page.drawText("VERIFICATION PROOF", {
    x: 40,
    y: 800,
    size: 26,
    font: bold,
    color: rgb(1, 1, 1)
  });

  // ------------------------------------------
  // DETAILS
  // ------------------------------------------
  let y = 740;

  page.drawText("DETAILS", {
    x: 40,
    y,
    size: 16,
    font: bold,
    color: primary
  });

  y -= 25;

  // Columns
  function row(label, value) {
    page.drawText(label, {
      x: 40,
      y,
      size: 12,
      font: bold,
      color: grey
    });

    // full hash visible using width & lineBreak
    page.drawText(value, {
      x: 150,
      y,
      size: 12,
      font,
      color: textDark,
      maxWidth: 400
    });

    y -= 20;
  }

  row("Name:", name);
  row("Identity Type:", identity);
  row("Hash:", hash);
  row("Verified At:", timestamp);

  y -= 10;

  page.drawLine({
    start: { x: 40, y },
    end: { x: 555, y },
    thickness: 1,
    color: grey
  });

  y -= 40;

  // ------------------------------------------
  // STATUS BLOCK
  // ------------------------------------------
  page.drawText("STATUS", {
    x: 40,
    y,
    size: 16,
    font: bold,
    color: primary
  });

  y -= 25;

  page.drawRectangle({
    x: 40,
    y: y - 40,
    width: 515,
    height: 40,
    color: rgb(0.95, 0.95, 1)
  });

  page.drawText("Verified Successfully", {
    x: 60,
    y: y - 15,
    size: 14,
    font: bold,
    color: rgb(0.1, 0.5, 0.1)
  });

  // ------------------------------------------------
  // QR CODE (FULL DETAILS JSON)
  // ------------------------------------------------
  const qrPayload = {
    name,
    identity,
    hash,
    verifiedAt: timestamp,
    status: "Verified Successfully"
  };

  const qrDataURL = await QRCode.toDataURL(JSON.stringify(qrPayload));
  const qrImageBytes = Buffer.from(qrDataURL.split(",")[1], "base64");
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  page.drawImage(qrImage, {
    x: 420,
    y: 300,
    width: 140,
    height: 140
  });

  // ------------------------------------------
  // FOOTER
  // ------------------------------------------
  page.drawText("THANK YOU", {
    x: 420,
    y: 200,
    size: 14,
    font: bold,
    color: primary
  });

  page.drawText("- Identity Management Team", {
    x: 420,
    y: 180,
    size: 12,
    font,
    color: grey
  });

  // Send PDF
  const pdfBytes = await pdfDoc.save();
  res.setHeader("Content-Type", "application/pdf");
  res.send(Buffer.from(pdfBytes));
});

// ------------------------------------------------------
app.listen(7200, () =>
  console.log("Hash Verification Backend running at http://localhost:7200")
);0
