
const mongoose = require("mongoose");
require("dotenv").config({ path: "config.env" });
mongoose.connect(process.env.DB_MONGO).then(async () => {
  const estadosActivos = ["DISPONIBLE A LA VENTA","ASIGNADO EN INICIALES","SEPARADO DISPONIBLE A LA VENTA"];
  const fechaDesde = "2026-03-30T05:00:00.000Z";
  const r = await mongoose.connection.db.collection("inventarios").aggregate([
    { $match: Object.assign({ "filtroBaseDatos.estadoInventario": { $in: estadosActivos } }, fechaDesde ? { createdAt: { $gt: new Date(fechaDesde) } } : {}) },
    { $sort: { createdAt: -1 } },
    { $lookup: { from: "vehiculos", localField: "vehiculo", foreignField: "_id", as: "v" } },
    { $lookup: { from: "clientes", localField: "cliente", foreignField: "_id", as: "c" } },
    { $unwind: { path: "$v", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$c", preserveNullAndEmptyArrays: true } }
  ]).toArray();
  const result = r.map(i => {
    const v = i.v || {};
    const c = i.c || {};
    const fb = i.filtroBaseDatos || {};
    const gc = i.generadorContratos || {};
    const fpc = i.formaPagoCompra || {};
    return {
      inventoryId: i.inventoryId,
      marca: v.marca || null,
      linea: v.linea || null,
      version: v.version || null,
      modelo: v.modelo || null,
      cilindraje: v.cilindraje || null,
      color: v.color || null,
      combustible: v.combustible || null,
      carroceria: v.carroceria || null,
      placa: v.placa || null,
      clase: v.clase || null,
      vin: v.vin || null,
      pasajeros: v.pasajeros || null,
      servicio: v.servicio || null,
      imagenVehiculo: v.imagenVehiculo || null,
      precioCompra: fpc.valorCompraNumero || 0,
      precioPublicacion: i.precioPublicacion || 0,
      numeroDuenos: i.numeroDuenos || null,
      kilometraje: gc.kilometraje || null,
      estadoInventario: fb.estadoInventario || null,
      ubicacion: fb.ubicacion || null,
      tipoNegocio: fb.tipoNegocio || null,
      fechaIngreso: fb.fechaIngreso || null,
      linkDrive: i.link || null,
      vehiculoId: v._id ? v._id.toString() : null,
      primerNombre: c.primerNombre || "",
      segundoNombre: c.segundoNombre || "",
      primerApellido: c.primerApellido || "",
      segundoApellido: c.segundoApellido || "",
      celular: c.celularOne || c.celularTwo || null,
      correo: c.correoElectronico || null,
      ciudad: c.ciudadResidencia || null,
      createdAt: i.createdAt
    };
  });
  console.log(JSON.stringify(result));
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
