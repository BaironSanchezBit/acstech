// Script para limpiar clientes duplicados por numeroIdentificacion
// Mantiene el más reciente, reasigna inventarios, elimina los viejos

const mongoose = require('mongoose');

const DB_URI = process.env.DB_MONGO || 'mongodb+srv://comunicaciones:QRPz8FRC9oJsSGy6@bdautomagno.m8npupc.mongodb.net/automagno';

async function main() {
    await mongoose.connect(DB_URI);
    console.log('Conectado a MongoDB');

    const db = mongoose.connection.db;
    const clientesCol = db.collection('clientes');
    const inventariosCol = db.collection('inventarios');
    const inventarioInicialesCol = db.collection('inventarioinicials');

    // Encontrar duplicados agrupados por numeroIdentificacion
    const dupes = await clientesCol.aggregate([
        { $match: { numeroIdentificacion: { $ne: null, $ne: '' } } },
        { $group: { _id: '$numeroIdentificacion', count: { $sum: 1 }, ids: { $push: '$_id' }, nombres: { $push: '$primerNombre' } } },
        { $match: { count: { $gt: 1 } } },
        { $sort: { count: -1 } }
    ]).toArray();

    console.log(`\nGrupos duplicados encontrados: ${dupes.length}`);

    let totalEliminados = 0;
    let totalReasignados = 0;

    for (const group of dupes) {
        const cedula = group._id;
        const clientes = await clientesCol.find({ numeroIdentificacion: cedula }).sort({ _id: -1 }).toArray();

        const sobrevive = clientes[0]; // El más reciente (por _id desc)
        const aEliminar = clientes.slice(1);
        const idsAEliminar = aEliminar.map(c => c._id);

        console.log(`\n--- Cédula: ${cedula} (${group.count} registros) ---`);
        console.log(`  Sobrevive: ${sobrevive.primerNombre || 'SIN NOMBRE'} (${sobrevive._id})`);

        // Reasignar inventarios que referencien los duplicados viejos
        for (const viejo of aEliminar) {
            // Buscar en inventarios normales
            const invNormales = await inventariosCol.find({ cliente: viejo._id }).toArray();
            if (invNormales.length > 0) {
                await inventariosCol.updateMany(
                    { cliente: viejo._id },
                    { $set: { cliente: sobrevive._id } }
                );
                console.log(`  Reasignados ${invNormales.length} inventarios de ${viejo._id} -> ${sobrevive._id}`);
                totalReasignados += invNormales.length;
            }

            // Buscar en inventarioIniciales
            const invIniciales = await inventarioInicialesCol.find({ cliente: viejo._id }).toArray();
            if (invIniciales.length > 0) {
                await inventarioInicialesCol.updateMany(
                    { cliente: viejo._id },
                    { $set: { cliente: sobrevive._id } }
                );
                console.log(`  Reasignados ${invIniciales.length} inventarioIniciales de ${viejo._id} -> ${sobrevive._id}`);
                totalReasignados += invIniciales.length;
            }

            // También buscar por campo comprador
            const invComprador = await inventariosCol.find({ comprador: viejo._id }).toArray();
            if (invComprador.length > 0) {
                await inventariosCol.updateMany(
                    { comprador: viejo._id },
                    { $set: { comprador: sobrevive._id } }
                );
                console.log(`  Reasignados ${invComprador.length} inventarios (comprador) de ${viejo._id} -> ${sobrevive._id}`);
                totalReasignados += invComprador.length;
            }
        }

        // Eliminar duplicados viejos
        const result = await clientesCol.deleteMany({ _id: { $in: idsAEliminar } });
        console.log(`  Eliminados: ${result.deletedCount} clientes duplicados`);
        totalEliminados += result.deletedCount;
    }

    console.log(`\n========== RESUMEN ==========`);
    console.log(`Grupos procesados: ${dupes.length}`);
    console.log(`Clientes eliminados: ${totalEliminados}`);
    console.log(`Inventarios reasignados: ${totalReasignados}`);

    // Verificar que no quedan duplicados
    const check = await clientesCol.aggregate([
        { $match: { numeroIdentificacion: { $ne: null, $ne: '' } } },
        { $group: { _id: '$numeroIdentificacion', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
    ]).toArray();
    console.log(`Duplicados restantes: ${check.length}`);

    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
}

main().catch(err => { console.error(err); process.exit(1); });
