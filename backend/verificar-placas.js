const mongoose = require('mongoose');
const DB_URI = 'mongodb+srv://comunicaciones:QRPz8FRC9oJsSGy6@bdautomagno.m8npupc.mongodb.net/automagno';

const placas = [
    'BXX559', 'MTP962', 'JWT207', 'EFS337', 'FYN786',
    'KVQ733', 'FOS095', 'UUK516', 'KXO000', 'DZV726',
    'FNR447', 'HKV983', 'JWY519', 'KXK565', 'JXN010',
    'LKR455', 'JWZ243', 'FYQ421', 'LOY272', 'LQY941',
    'JKG768', 'JLU278', 'DZX375', 'NJM675', 'GLS750',
    'KWZ504', 'AJC654'
];

async function main() {
    await mongoose.connect(DB_URI);
    const db = mongoose.connection.db;
    const vehiculosCol = db.collection('vehiculos');
    const inventariosCol = db.collection('inventarios');

    console.log('=== VERIFICACION DE PLACAS ===\n');

    const encontrados = [];
    const noEncontrados = [];

    for (const placa of placas) {
        // Buscar en vehiculos (case insensitive)
        const veh = await vehiculosCol.findOne({
            placa: { $regex: new RegExp('^' + placa + '$', 'i') }
        });

        if (veh) {
            // Buscar si tiene inventario asociado
            const inv = await inventariosCol.findOne({ vehiculo: veh._id });
            const tieneInv = inv ? 'CON inventario' : 'SIN inventario';
            const archivado = veh.archivado ? ' [ARCHIVADO]' : '';
            encontrados.push(`  ✓ ${placa} - ${veh.marca || ''} ${veh.linea || ''} ${veh.modelo || ''} - ${tieneInv}${archivado}`);
        } else {
            noEncontrados.push(`  ✗ ${placa}`);
        }
    }

    console.log(`ENCONTRADOS en BD (${encontrados.length}/${placas.length}):`);
    encontrados.forEach(e => console.log(e));

    console.log(`\nNO ENCONTRADOS en BD (${noEncontrados.length}/${placas.length}):`);
    noEncontrados.forEach(e => console.log(e));

    // Estadisticas adicionales
    const totalVeh = await vehiculosCol.countDocuments({});
    const totalInv = await inventariosCol.countDocuments({});
    console.log(`\nTotal vehiculos en BD: ${totalVeh}`);
    console.log(`Total inventarios en BD: ${totalInv}`);

    await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
