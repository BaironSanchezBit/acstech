const mongoose = require("mongoose");
require("dotenv").config({ path: "config.env" });
mongoose.connect(process.env.DB_MONGO).then(async () => {
  const d = new Date(Date.now() - 15*24*60*60*1000);
  const r = await mongoose.connection.db.collection("inventarios").aggregate([
    { $match: { createdAt: { $gte: d } } },
    { $sort: { createdAt: -1 } },
    { $limit: 1 },
    { $lookup: { from: "vehiculos", localField: "vehiculo", foreignField: "_id", as: "vehiculoData" } },
    { $unwind: { path: "$vehiculoData", preserveNullAndEmptyArrays: true } }
  ]).toArray();

  if (r.length > 0) {
    const v = r[0].vehiculoData || {};
    console.log("=== KEYS VEHICULO ===");
    console.log(JSON.stringify(Object.keys(v), null, 2));
    console.log("=== DATOS COMPLETOS VEHICULO ===");
    // Excluir _id y __v para limpieza
    const { _id, __v, ...rest } = v;
    console.log(JSON.stringify(rest, null, 2));
    console.log("=== IMAGENES INGRESO ===");
    const imgs = r[0].ImagenesIngreso;
    console.log("Tipo:", typeof imgs, "| Es array:", Array.isArray(imgs), "| Cantidad:", imgs ? imgs.length : 0);
    if (imgs && imgs.length > 0) console.log("Primera:", JSON.stringify(imgs[0]));
    console.log("=== KEYS INVENTARIO (sin vehiculo/cliente) ===");
    const invKeys = Object.keys(r[0]).filter(k => !["vehiculoData","_id","__v"].includes(k));
    console.log(JSON.stringify(invKeys));
  }
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
