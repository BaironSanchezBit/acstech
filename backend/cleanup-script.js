// Script de limpieza de datos ACStech
// Ejecutar con: node /app/cleanup-script.js [--execute]
// Sin --execute hace dry-run (solo reporta, no modifica)

const mongoose = require('mongoose');
const DB = process.env.DB_MONGO;

const DRY_RUN = !process.argv.includes('--execute');

async function main() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    
    console.log(`\n========================================`);
    console.log(`  LIMPIEZA DE DATOS ACStech`);
    console.log(`  Modo: ${DRY_RUN ? 'DRY-RUN (solo reporta)' : 'EJECUCION REAL'}`);
    console.log(`========================================\n`);

    const vehiculosCol = db.collection('vehiculos');
    const inventariosCol = db.collection('inventarios');
    
    // ============================================
    // 3.1 Limpiar arrays inventarios en vehiculos
    // ============================================
    console.log('--- 3.1 LIMPIAR ARRAYS INVENTARIOS EN VEHICULOS ---');
    
    const vehiculos = await vehiculosCol.find({}).toArray();
    let cleanedCount = 0;
    let dupCount = 0;
    let orphanRefCount = 0;
    
    // Obtener todos los inventoryId existentes
    const allInventarios = await inventariosCol.find({}, { projection: { inventoryId: 1 } }).toArray();
    const existingIds = new Set(allInventarios.map(i => String(i.inventoryId)));
    
    for (const v of vehiculos) {
        if (!v.inventarios || v.inventarios.length === 0) continue;
        
        const original = [...v.inventarios];
        
        // Paso 1: filtrar ObjectIds (strings > 6 chars)
        let cleaned = original.filter(id => String(id).length <= 6);
        const objectIdsRemoved = original.length - cleaned.length;
        
        // Paso 2: remover duplicados
        const beforeDedup = cleaned.length;
        cleaned = [...new Set(cleaned.map(String))];
        const dupsRemoved = beforeDedup - cleaned.length;
        
        // Paso 3: verificar que cada ID existe en inventarios
        const orphans = cleaned.filter(id => !existingIds.has(String(id)));
        cleaned = cleaned.filter(id => existingIds.has(String(id)));
        
        if (objectIdsRemoved > 0 || dupsRemoved > 0 || orphans.length > 0) {
            console.log(`  ${v.placa || 'SIN PLACA'} (${v._id}): [${original.join(',')}] -> [${cleaned.join(',')}]`);
            if (objectIdsRemoved > 0) console.log(`    - ${objectIdsRemoved} ObjectIds removidos`);
            if (dupsRemoved > 0) { console.log(`    - ${dupsRemoved} duplicados removidos`); dupCount++; }
            if (orphans.length > 0) { console.log(`    - ${orphans.length} refs huerfanas: ${orphans.join(',')}`); orphanRefCount += orphans.length; }
            
            if (!DRY_RUN) {
                await vehiculosCol.updateOne({ _id: v._id }, { $set: { inventarios: cleaned } });
            }
            cleanedCount++;
        }
    }
    
    console.log(`\n  RESUMEN 3.1: ${cleanedCount} vehiculos limpiados, ${dupCount} con duplicados, ${orphanRefCount} refs huerfanas\n`);

    // ============================================
    // 3.2 Reconciliar inventarios desvinculados
    // ============================================
    console.log('--- 3.2 RECONCILIAR INVENTARIOS DESVINCULADOS ---');
    
    let reconnected = 0;
    
    for (const inv of allInventarios) {
        if (!inv.inventoryId) continue;
        const invId = String(inv.inventoryId);
        
        // Buscar el vehiculo que deberia tener este inventario
        // Primero por referencia directa en el inventario
        const fullInv = await inventariosCol.findOne({ _id: inv._id });
        if (!fullInv || !fullInv.vehiculo) continue;
        
        const vehiculo = await vehiculosCol.findOne({ _id: new mongoose.Types.ObjectId(fullInv.vehiculo) });
        if (!vehiculo) {
            console.log(`  INV#${invId}: vehiculo ref ${fullInv.vehiculo} NO EXISTE en BD`);
            continue;
        }
        
        const vehiculoInvs = (vehiculo.inventarios || []).map(String);
        if (!vehiculoInvs.includes(invId)) {
            console.log(`  INV#${invId} -> ${vehiculo.placa || 'SIN PLACA'} (${vehiculo._id}): DESVINCULADO - agregando`);
            if (!DRY_RUN) {
                await vehiculosCol.updateOne({ _id: vehiculo._id }, { $addToSet: { inventarios: invId } });
            }
            reconnected++;
        }
    }
    
    console.log(`\n  RESUMEN 3.2: ${reconnected} inventarios reconectados\n`);

    // ============================================
    // 3.4 Reporte de inconsistencias
    // ============================================
    console.log('--- 3.4 REPORTE DE INCONSISTENCIAS ---');
    
    // Inventarios sin vehiculo
    const sinVehiculo = await inventariosCol.find({ $or: [{ vehiculo: null }, { vehiculo: { $exists: false } }] }).toArray();
    console.log(`\n  Inventarios sin vehiculo: ${sinVehiculo.length}`);
    sinVehiculo.forEach(i => console.log(`    INV#${i.inventoryId}: ${i.elemento || 'sin nombre'}`));
    
    // Vehiculos sin inventario
    const sinInventario = await vehiculosCol.find({ $or: [{ inventarios: { $size: 0 } }, { inventarios: { $exists: false } }] }).toArray();
    console.log(`\n  Vehiculos sin inventario: ${sinInventario.length}`);
    sinInventario.slice(0, 20).forEach(v => console.log(`    ${v.placa || 'SIN PLACA'}: ${v.marca || ''} ${v.linea || ''}`));
    if (sinInventario.length > 20) console.log(`    ... y ${sinInventario.length - 20} mas`);
    
    // Clientes duplicados
    const clientesCol = db.collection('clientes');
    const dupClientes = await clientesCol.aggregate([
        { $match: { numeroIdentificacion: { $ne: null, $ne: '' } } },
        { $group: { _id: '$numeroIdentificacion', count: { $sum: 1 }, nombres: { $push: '$primerNombre' } } },
        { $match: { count: { $gt: 1 } } },
        { $sort: { count: -1 } }
    ]).toArray();
    console.log(`\n  Clientes duplicados (mismo numeroIdentificacion): ${dupClientes.length}`);
    dupClientes.slice(0, 10).forEach(d => console.log(`    ID ${d._id}: ${d.count} registros (${d.nombres.join(', ')})`));
    if (dupClientes.length > 10) console.log(`    ... y ${dupClientes.length - 10} mas`);
    
    console.log(`\n========================================`);
    console.log(`  LIMPIEZA ${DRY_RUN ? 'DRY-RUN' : 'REAL'} COMPLETADA`);
    console.log(`========================================\n`);
    
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
