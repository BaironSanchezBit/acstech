const mongoose = require("mongoose");
require("dotenv").config({ path: "config.env" });
mongoose.connect(process.env.DB_MONGO).then(async () => {
  const d = new Date(Date.now() - 15*24*60*60*1000);
  const r = await mongoose.connection.db.collection("inventarios").find({ createdAt: { $gte: d } }).sort({ createdAt: -1 }).toArray();
  console.log("Total ultimos 15 dias: " + r.length);
  // Ver estructura del vehiculo del mas reciente
  if (r.length > 0) {
    const v = r[0].vehiculo;
    console.log("=== VEHICULO KEYS ===");
    console.log(JSON.stringify(v ? Object.keys(v) : "vehiculo is null/undefined"));
    console.log("=== VEHICULO DATA ===");
    console.log(JSON.stringify(v, null, 2));
    console.log("=== CLIENTE ===");
    const c = r[0].cliente;
    console.log(JSON.stringify(c ? Object.keys(c) : "cliente is null"));
  }
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
