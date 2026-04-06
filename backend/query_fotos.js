const mongoose = require("mongoose");
require("dotenv").config({ path: "config.env" });
mongoose.connect(process.env.DB_MONGO).then(async () => {
  const d = new Date(Date.now() - 15*24*60*60*1000);
  const r = await mongoose.connection.db.collection("inventarios").aggregate([
    { $match: { createdAt: { $gte: d } } },
    { $sort: { createdAt: -1 } },
    { $lookup: { from: "vehiculos", localField: "vehiculo", foreignField: "_id", as: "v" } },
    { $unwind: { path: "$v", preserveNullAndEmptyArrays: true } }
  ]).toArray();

  r.forEach(i => {
    const v = i.v || {};
    const imgs = i.ImagenesIngreso || {};
    let totalFotos = 0;
    const detalle = {};
    
    // Contar fotos por categoría
    Object.keys(imgs).forEach(k => {
      const arr = imgs[k];
      if (Array.isArray(arr)) {
        detalle[k] = arr.length;
        totalFotos += arr.length;
      }
    });

    // Imagen principal del vehiculo
    const imgPrincipal = v.imagenVehiculo ? 1 : 0;
    
    console.log("#" + i.inventoryId + " | " + (v.marca||"") + " " + (v.linea||"") + " " + (v.modelo||""));
    console.log("  Foto principal: " + (v.imagenVehiculo || "NO"));
    console.log("  Fotos peritaje: " + totalFotos + " fotos en " + Object.keys(detalle).filter(k => detalle[k] > 0).length + " categorias");
    
    Object.keys(detalle).forEach(k => {
      if (detalle[k] > 0) {
        console.log("    " + k + ": " + detalle[k]);
        // Mostrar primera URL
        if (imgs[k].length > 0) console.log("      -> " + (imgs[k][0].url || imgs[k][0].image || JSON.stringify(imgs[k][0]).substring(0, 150)));
      }
    });
    
    if (totalFotos === 0 && !v.imagenVehiculo) console.log("  ⚠️ SIN FOTOS");
    console.log("");
  });
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
