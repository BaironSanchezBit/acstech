require('dotenv').config({ path: 'config.env' });
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_MONGO).then(async () => {
  const col = mongoose.connection.db.collection('inventarios');

  // Latest doc
  const latest = await col.find({}).sort({ _id: -1 }).limit(1).toArray();
  if (latest[0]) {
    const d = latest[0];
    console.log("Latest doc keys:", Object.keys(d).join(", "));
    console.log("consecutivo:", d.consecutivo);
    console.log("estadoInventario:", d.estadoInventario);
    if (d.vehiculo) console.log("vehiculo:", d.vehiculo);
  }

  // Find one with Phase 2 data
  const withP2 = await col.find({ documentosValoresIniciales: { $exists: true, $ne: null } }).sort({ _id: -1 }).limit(1).toArray();
  if (withP2[0]) {
    const d = withP2[0];
    console.log("\nWith Phase2 - consecutivo:", d.consecutivo, "_id:", d._id);
    const obj = d.documentosValoresIniciales;
    const keys = Object.keys(obj).filter(k => !k.startsWith('fotos') && k !== '_id');
    console.log("Phase2 fields (" + keys.length + "):");
    keys.forEach(k => {
      const v = obj[k];
      const display = typeof v === 'string' ? v.substring(0, 60) : JSON.stringify(v).substring(0, 60);
      console.log("  " + k + ": " + display);
    });

    // TEST SAVE
    const field = "estadoCuentaImpuestoValor";
    const original = obj[field] || "";
    const testVal = "TEST_999999";

    console.log("\n--- SAVE TEST ---");
    console.log("Field:", field, "| Original:", JSON.stringify(original));

    // Use updateOne to test save
    await col.updateOne(
      { _id: d._id },
      { $set: { ["documentosValoresIniciales." + field]: testVal } }
    );
    console.log("Written:", testVal);

    // Re-read
    const check = await col.findOne({ _id: d._id });
    const saved = check.documentosValoresIniciales[field];
    console.log("Re-read:", JSON.stringify(saved));
    console.log(saved === testVal ? "PASS: Save works!" : "FAIL: Mismatch!");

    // Restore
    await col.updateOne(
      { _id: d._id },
      { $set: { ["documentosValoresIniciales." + field]: original } }
    );
    const restored = await col.findOne({ _id: d._id });
    console.log("Restored:", JSON.stringify(restored.documentosValoresIniciales[field]));
  } else {
    console.log("No docs with Phase 2 data found");
  }

  console.log("\n=== DONE ===");
  mongoose.disconnect();
});
