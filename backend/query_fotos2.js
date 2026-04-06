const mongoose = require("mongoose");
require("dotenv").config({ path: "config.env" });
mongoose.connect(process.env.DB_MONGO).then(async () => {
  // Todos los inventarios - contar fotos
  const r = await mongoose.connection.db.collection("inventarios").aggregate([
    { $lookup: { from: "vehiculos", localField: "vehiculo", foreignField: "_id", as: "v" } },
    { $unwind: { path: "$v", preserveNullAndEmptyArrays: true } }
  ]).toArray();

  let conFotoPrincipal = 0;
  let conFotosPeritaje = 0;
  let sinNingunaFoto = 0;
  let totalFotosPeritaje = 0;
  let maxFotos = 0;
  let maxFotosId = "";

  r.forEach(i => {
    const v = i.v || {};
    const imgs = i.ImagenesIngreso || {};
    let fotos = 0;
    Object.keys(imgs).forEach(k => {
      if (Array.isArray(imgs[k])) fotos += imgs[k].length;
    });

    if (v.imagenVehiculo) conFotoPrincipal++;
    if (fotos > 0) {
      conFotosPeritaje++;
      totalFotosPeritaje += fotos;
    }
    if (!v.imagenVehiculo && fotos === 0) sinNingunaFoto++;
    if (fotos > maxFotos) {
      maxFotos = fotos;
      maxFotosId = "#" + i.inventoryId + " " + (v.marca||"") + " " + (v.linea||"");
    }
  });

  console.log("=== RESUMEN FOTOS (198 inventarios) ===");
  console.log("Con foto principal: " + conFotoPrincipal);
  console.log("Con fotos peritaje: " + conFotosPeritaje + " (total fotos: " + totalFotosPeritaje + ")");
  console.log("SIN ninguna foto: " + sinNingunaFoto);
  console.log("Mas fotos: " + maxFotosId + " con " + maxFotos + " fotos");

  // Mostrar los que SÍ tienen fotos de peritaje
  console.log("\n=== CARROS CON FOTOS DE PERITAJE ===");
  r.forEach(i => {
    const v = i.v || {};
    const imgs = i.ImagenesIngreso || {};
    let fotos = 0;
    Object.keys(imgs).forEach(k => {
      if (Array.isArray(imgs[k])) fotos += imgs[k].length;
    });
    if (fotos > 0) {
      console.log("#" + i.inventoryId + " | " + (v.marca||"?") + " " + (v.linea||"") + " " + (v.modelo||"") + " | " + fotos + " fotos | principal: " + (v.imagenVehiculo ? "SI" : "NO"));
    }
  });

  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
