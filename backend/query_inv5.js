const mongoose = require("mongoose");
require("dotenv").config({ path: "config.env" });
mongoose.connect(process.env.DB_MONGO).then(async () => {
  const d = new Date(Date.now() - 15*24*60*60*1000);
  const r = await mongoose.connection.db.collection("inventarios").aggregate([
    { $match: { createdAt: { $gte: d } } },
    { $sort: { createdAt: -1 } },
    { $limit: 3 },
    { $lookup: { from: "vehiculos", localField: "vehiculo", foreignField: "_id", as: "v" } },
    { $unwind: { path: "$v", preserveNullAndEmptyArrays: true } }
  ]).toArray();

  r.forEach(i => {
    console.log("=== INV #" + i.inventoryId + " - " + (i.v ? i.v.marca + " " + i.v.linea : "sin vehiculo") + " ===");
    // Imagen del vehiculo
    console.log("Imagen vehiculo:", i.v ? i.v.imagenVehiculo : "N/A");
    // ImagenesIngreso
    const imgs = i.ImagenesIngreso;
    if (imgs && typeof imgs === "object") {
      const keys = Object.keys(imgs);
      console.log("ImagenesIngreso keys:", keys.length, "| Primeras 5:", keys.slice(0,5));
      if (keys.length > 0) console.log("Sample:", JSON.stringify(imgs[keys[0]]).substring(0,200));
    } else {
      console.log("ImagenesIngreso:", imgs);
    }
    // Ficha técnica
    console.log("Ficha: cilindraje=" + (i.v?i.v.cilindraje:"") + " | combustible=" + (i.v?i.v.combustible:"") + " | carroceria=" + (i.v?i.v.carroceria:"") + " | pasajeros=" + (i.v?i.v.pasajeros:""));
    console.log("Extra: potencia=" + i.potencia + " | torque=" + i.torque + " | tanque=" + i.capacidadTanque + " | consumo=" + i.consumo + " | duenos=" + i.numeroDuenos);
    console.log("Link publicacion:", i.link);
    console.log("");
  });
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
