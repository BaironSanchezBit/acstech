require('dotenv').config({ path: 'config.env' });
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_MONGO).then(async () => {
  const col = mongoose.connection.db.collection('inventarios');

  // Find inventories without vehiculo reference
  const all = await col.find({}).toArray();
  const broken = all.filter(inv => !inv.vehiculo);

  console.log("Inventarios sin vehículo:", broken.length);
  broken.forEach(b => {
    console.log("  #" + b.inventoryId + " creado:" + b.createdAt + " estado:" + (b.filtroBaseDatos ? b.filtroBaseDatos.estadoInventario : "SIN ESTADO"));
  });

  if (broken.length > 0) {
    // Delete broken records
    const ids = broken.map(b => b._id);
    const result = await col.deleteMany({ _id: { $in: ids } });
    console.log("\nEliminados:", result.deletedCount, "registros rotos");
  }

  // Verify
  const remaining = await col.countDocuments();
  console.log("Inventarios restantes:", remaining);

  mongoose.disconnect();
});
