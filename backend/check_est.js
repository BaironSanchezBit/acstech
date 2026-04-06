require('dotenv').config({ path: 'config.env' });
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_MONGO).then(async () => {
  const col = mongoose.connection.db.collection('inventarios');
  const all = await col.find({}).toArray();

  const estados = {};
  all.forEach(inv => {
    const e = inv.filtroBaseDatos && inv.filtroBaseDatos.estadoInventario;
    estados[e] = (estados[e] || 0) + 1;
  });

  console.log("=== ESTADOS DE INVENTARIO ===");
  Object.entries(estados).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => {
    console.log("  " + v + "x " + k);
  });

  mongoose.disconnect();
});
