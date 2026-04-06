const mongoose = require("mongoose");
require("dotenv").config({ path: "config.env" });
mongoose.connect(process.env.DB_MONGO).then(async () => {
  // Traer un inventario reciente con todos sus datos
  const r = await mongoose.connection.db.collection("inventarios").aggregate([
    { $sort: { createdAt: -1 } },
    { $limit: 1 },
    { $lookup: { from: "vehiculos", localField: "vehiculo", foreignField: "_id", as: "v" } },
    { $lookup: { from: "clientes", localField: "cliente", foreignField: "_id", as: "c" } },
    { $unwind: { path: "$v", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$c", preserveNullAndEmptyArrays: true } }
  ]).toArray();

  if (r.length > 0) {
    const i = r[0];
    const v = i.v || {};
    const c = i.c || {};
    console.log("=== MAPEO AUTOMAGNO -> SELLER_CARS ===");
    console.log(JSON.stringify({
      "marca": v.marca,
      "modelo(linea)": v.linea,
      "anio(modelo)": v.modelo,
      "color": v.color,
      "transmision": "NO DISPONIBLE",
      "kilometraje": "NO DISPONIBLE (campo no existe)",
      "combustible": v.combustible,
      "motor": v.cilindraje,
      "carroceria": v.carroceria,
      "placa": v.placa,
      "tipo_vehiculo": v.clase,
      "fotos_imagen_principal": v.imagenVehiculo,
      "fotos_ingreso_keys": i.ImagenesIngreso ? Object.keys(i.ImagenesIngreso) : [],
      "precio": i.precioPublicacion,
      "duenos": i.numeroDuenos,
      "seller_name(cliente)": c.nombre || c.razonSocial,
      "seller_phone": c.telefono || c.celular,
      "seller_email": c.correo,
      "seller_city": c.ciudad,
      "link_drive": i.link,
      "vin": v.vin,
      "version": v.version
    }, null, 2));

    // Ver estructura completa del cliente
    console.log("=== CLIENTE KEYS ===");
    console.log(JSON.stringify(Object.keys(c)));
    console.log("=== CLIENTE DATA ===");
    const { _id, __v, ...cRest } = c;
    console.log(JSON.stringify(cRest, null, 2));
  }
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
