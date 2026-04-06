const mongoose = require("mongoose");
require("dotenv").config({ path: "config.env" });
mongoose.connect(process.env.DB_MONGO).then(async () => {
  const d = new Date(Date.now() - 15*24*60*60*1000);
  const r = await mongoose.connection.db.collection("inventarios").find({ createdAt: { $gte: d } }).sort({ createdAt: -1 }).toArray();
  console.log("Total ultimos 15 dias: " + r.length);
  r.forEach(i => {
    const v = i.vehiculo || {};
    console.log([i.inventoryId, v.placa, v.marca, v.linea, v.modelo, v.color, i.precioPublicacion, String(i.createdAt).substring(0,10)].join(" | "));
  });
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
