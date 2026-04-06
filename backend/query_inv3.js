const mongoose = require("mongoose");
require("dotenv").config({ path: "config.env" });
mongoose.connect(process.env.DB_MONGO).then(async () => {
  const d = new Date(Date.now() - 15*24*60*60*1000);
  const r = await mongoose.connection.db.collection("inventarios").aggregate([
    { $match: { createdAt: { $gte: d } } },
    { $sort: { createdAt: -1 } },
    { $lookup: { from: "vehiculos", localField: "vehiculo", foreignField: "_id", as: "vehiculoData" } },
    { $lookup: { from: "clientes", localField: "cliente", foreignField: "_id", as: "clienteData" } },
    { $unwind: { path: "$vehiculoData", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$clienteData", preserveNullAndEmptyArrays: true } },
    { $project: {
      inventoryId: 1,
      precioPublicacion: 1,
      createdAt: 1,
      "vehiculoData.placa": 1,
      "vehiculoData.marca": 1,
      "vehiculoData.linea": 1,
      "vehiculoData.modelo": 1,
      "vehiculoData.color": 1,
      "vehiculoData.kilometraje": 1,
      "vehiculoData.combustible": 1,
      "vehiculoData.transmision": 1,
      "clienteData.nombre": 1,
      "clienteData.telefono": 1
    }}
  ]).toArray();

  console.log("Total ultimos 15 dias: " + r.length);
  console.log("---");
  r.forEach(i => {
    const v = i.vehiculoData || {};
    console.log(JSON.stringify({
      id: i.inventoryId,
      placa: v.placa,
      marca: v.marca,
      linea: v.linea,
      modelo: v.modelo,
      color: v.color,
      km: v.kilometraje,
      precio: i.precioPublicacion,
      fecha: String(i.createdAt).substring(0, 15)
    }));
  });
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
