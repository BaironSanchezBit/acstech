require('dotenv').config({ path: 'config.env' });
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_MONGO).then(async () => {
  const db = mongoose.connection.db;

  // Verify it's empty before dropping
  const count = await db.collection('inventories').countDocuments();
  console.log("inventories count:", count);

  if (count === 0) {
    await db.collection('inventories').drop();
    console.log("OK: coleccion 'inventories' (vacia) eliminada");
  } else {
    console.log("ABORT: tiene " + count + " docs, no se elimina");
  }

  // Verify remaining collections
  const cols = await db.listCollections().toArray();
  const names = cols.map(c => c.name).sort();
  console.log("\nColecciones restantes (" + names.length + "):");
  names.forEach(n => console.log("  " + n));

  mongoose.disconnect();
});
