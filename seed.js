// seed.js
import connectDB from "./db.js";
import Identity from "./models/Identity.js";

const seedData = [
  // Bharath
  { type: "aadhar", number: "111122223333", owner: "Bharath" },
  { type: "pan", number: "BHRTB1234A", owner: "Bharath" },
  { type: "dl", number: "TN14-2029-1122", owner: "Bharath" },
  { type: "passport", number: "B1234567", owner: "Bharath" },

  // Ajay
  { type: "aadhar", number: "222233334444", owner: "Ajay" },
  { type: "pan", number: "AJAYP5678Q", owner: "Ajay" },
  { type: "dl", number: "TN10-2027-3344", owner: "Ajay" },
  { type: "passport", number: "A7654321", owner: "Ajay" },

  // Kabilash
  { type: "aadhar", number: "333344445555", owner: "Kabilash" },
  { type: "pan", number: "KABLQ9988M", owner: "Kabilash" },
  { type: "dl", number: "TN07-2031-5566", owner: "Kabilash" },
  { type: "passport", number: "K4455667", owner: "Kabilash" },

  // Hari
  { type: "aadhar", number: "444455556666", owner: "Hari" },
  { type: "pan", number: "HARIP1122Z", owner: "Hari" },
  { type: "dl", number: "TN02-2030-7788", owner: "Hari" },
  { type: "passport", number: "H9988776", owner: "Hari" },

  // Jacob
  { type: "aadhar", number: "555566667777", owner: "James" },
  { type: "pan", number: "JACOJ3344L", owner: "James" },
  { type: "dl", number: "TN01-2028-9900", owner: "James" },
  { type: "passport", number: "J1122334", owner: "James" },
];

const seedDatabase = async () => {
  await connectDB();
  for (const item of seedData) {
    try {
      const exists = await Identity.findOne({ number: item.number });
      if (exists) {
        console.log("⚠️ Already exists:", item.number);
        continue;
      }
      const doc = new Identity(item);
      await doc.save();
      console.log("✅ Inserted:", item.owner, item.type, item.number, "hash:", doc.hash);
    } catch (err) {
      console.error("❌ Seed error:", err.message || err);
    }
  }
  console.log("🎉 Seeding complete");
  process.exit();
};

seedDatabase();
