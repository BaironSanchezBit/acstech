// Script para archivar vehiculos sin inventario asociado
const mongoose = require('mongoose');

const DB_URI = process.env.DB_MONGO || 'mongodb+srv://comunicaciones:QRPz8FRC9oJsSGy6@bdautomagno.m8npupc.mongodb.net/automagno';

async function main() {
    await mongoose.connect(DB_URI);
    console.log('Conectado a MongoDB');

    const db = mongoose.connection.db;
    const vehiculosCol = db.collection('vehiculos');
    const inventariosCol = db.collection('inventarios');

    // Obtener todos los vehiculo IDs referenciados en inventarios
    const inventarios = await inventariosCol.find({}, { projection: { vehiculo: 1 } }).toArray();
    const vehiculoIdsConInventario = new Set(
        inventarios
            .filter(i => i.vehiculo)
            .map(i => i.vehiculo.toString())
    );

    console.log(`Vehiculos con inventario: ${vehiculoIdsConInventario.size}`);

    // Buscar vehiculos sin inventario (no referenciados y con array inventarios vacio)
    const todosVehiculos = await vehiculosCol.find({}).toArray();
    console.log(`Total vehiculos: ${todosVehiculos.length}`);

    const sinInventario = todosVehiculos.filter(v => {
        const tieneRef = vehiculoIdsConInventario.has(v._id.toString());
        const tieneArray = v.inventarios && v.inventarios.length > 0;
        return !tieneRef && !tieneArray;
    });

    console.log(`Vehiculos sin inventario: ${sinInventario.length}`);

    if (sinInventario.length === 0) {
        console.log('No hay vehiculos para archivar');
        await mongoose.disconnect();
        return;
    }

    // Archivar
    const ids = sinInventario.map(v => v._id);
    const result = await vehiculosCol.updateMany(
        { _id: { $in: ids } },
        { $set: { archivado: true, fechaArchivado: new Date() } }
    );

    console.log(`\nArchivados: ${result.modifiedCount} vehiculos`);

    // Verificar
    const archivados = await vehiculosCol.countDocuments({ archivado: true });
    const activos = await vehiculosCol.countDocuments({ archivado: { $ne: true } });
    console.log(`\nEstado final:`);
    console.log(`  Archivados: ${archivados}`);
    console.log(`  Activos: ${activos}`);
    console.log(`  Total: ${archivados + activos}`);

    await mongoose.disconnect();
    console.log('Desconectado');
}

main().catch(err => { console.error(err); process.exit(1); });
