// Test: Verify Phase 2 (documentosValoresIniciales) save works correctly
// Run from /app inside Docker container

require('dotenv').config({ path: 'config.env' });
const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect(process.env.DB_MONGO);
    console.log("MongoDB connected:", mongoose.connection.db.databaseName);

    // The model file exports the schema, not the model
    const schema = require("./inventarios/inventarios.model");
    const Inventories = mongoose.model("Inventories", schema);

    // Find inventory #1158 (Volvo XC90)
    let inv = await Inventories.findOne({ consecutivo: 1158 });
    if (!inv) {
      inv = await Inventories.findOne({ "documentosValoresIniciales": { $exists: true, $ne: null } }).sort({ _id: -1 });
    }
    if (!inv) { console.log("No inventory found"); process.exit(1); }

    console.log("\n=== TEST: Phase 2 Save - Inv #" + inv.consecutivo + " ===");

    // Show current Phase 2 fields
    if (inv.documentosValoresIniciales) {
      const obj = inv.documentosValoresIniciales.toObject ? inv.documentosValoresIniciales.toObject() : inv.documentosValoresIniciales;
      const keys = Object.keys(obj);
      console.log("Phase 2 fields (" + keys.length + "):");
      keys.forEach(k => {
        if (!k.startsWith('fotos') && !k.startsWith('_')) {
          const v = obj[k];
          const display = typeof v === 'string' ? v.substring(0, 50) : JSON.stringify(v);
          console.log("  " + k + ": " + display);
        }
      });
    }

    // TEST: Write a value, re-read, verify, restore
    const field = "estadoCuentaImpuestoValor";
    const original = inv.documentosValoresIniciales ? inv.documentosValoresIniciales[field] : "";
    const testVal = "TEST_SAVE_999999";

    console.log("\n--- Save Test ---");
    console.log("Field: " + field);
    console.log("Original: " + JSON.stringify(original));

    // Save test value (same pattern as controller)
    const doc = await Inventories.findById(inv._id);
    if (!doc.documentosValoresIniciales) doc.documentosValoresIniciales = {};
    doc.documentosValoresIniciales[field] = testVal;
    doc.markModified("documentosValoresIniciales");
    await doc.save();
    console.log("Saved: " + testVal);

    // Re-read
    const verify = await Inventories.findById(inv._id);
    const savedVal = verify.documentosValoresIniciales[field];
    console.log("Re-read: " + JSON.stringify(savedVal));
    console.log(savedVal === testVal ? "PASS: Save works correctly!" : "FAIL: Value mismatch!");

    // Restore
    verify.documentosValoresIniciales[field] = original || "";
    verify.markModified("documentosValoresIniciales");
    await verify.save();
    console.log("Restored to: " + JSON.stringify(original || ""));

    console.log("\n=== TEST COMPLETE ===");
    await mongoose.disconnect();
    process.exit(0);
  } catch(err) {
    console.log("ERROR:", err.message);
    console.log(err.stack);
    process.exit(1);
  }
}

test();
