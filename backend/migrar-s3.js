// Script para migrar fotos de S3 a almacenamiento local
// Descarga cada foto de S3 y actualiza la URL en MongoDB

const mongoose = require('mongoose');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DB_URI = process.env.DB_MONGO || 'mongodb+srv://comunicaciones:QRPz8FRC9oJsSGy6@bdautomagno.m8npupc.mongodb.net/automagno';
const UPLOAD_DIR = '/opt/proyectos/acstech/uploads/fotos';
const S3_PREFIX = 'https://my-app-images-bucket.s3.us-east-1.amazonaws.com/';

function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const proto = url.startsWith('https') ? https : http;
        const req = proto.get(url, { timeout: 15000 }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                // Follow redirect
                return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode} for ${url}`));
                return;
            }
            const stream = fs.createWriteStream(destPath);
            res.pipe(stream);
            stream.on('finish', () => { stream.close(); resolve(true); });
            stream.on('error', reject);
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

async function main() {
    await mongoose.connect(DB_URI);
    console.log('Conectado a MongoDB');

    const db = mongoose.connection.db;
    const inventariosCol = db.collection('inventarios');
    const inventarioInicialesCol = db.collection('inventarioinicials');

    // Ensure upload dir exists
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const sections = ['documentosTraspasos', 'documentosValoresIniciales', 'controlAccesorios', 'ImagenesIngreso'];

    let totalUrls = 0;
    let downloaded = 0;
    let failed = 0;
    let alreadyLocal = 0;
    const failedUrls = [];

    // Process inventarios
    for (const colName of ['inventarios', 'inventarioinicials']) {
        const col = colName === 'inventarios' ? inventariosCol : inventarioInicialesCol;
        const docs = await col.find({}).toArray();
        console.log(`\nProcesando ${colName}: ${docs.length} documentos`);

        for (const doc of docs) {
            let docModified = false;
            const updateOps = {};

            for (const section of sections) {
                if (!doc[section]) continue;

                for (const [field, value] of Object.entries(doc[section])) {
                    if (!field.startsWith('fotos')) continue;
                    if (!Array.isArray(value)) continue;

                    const newUrls = [];
                    let fieldModified = false;

                    for (const url of value) {
                        if (typeof url !== 'string') {
                            newUrls.push(url);
                            continue;
                        }

                        if (!url.includes('s3.') && !url.includes('amazonaws.com')) {
                            newUrls.push(url);
                            alreadyLocal++;
                            continue;
                        }

                        totalUrls++;
                        const filename = url.split('/').pop();
                        const localPath = path.join(UPLOAD_DIR, filename);
                        const localUrl = '/uploads/fotos/' + filename;

                        // Check if already downloaded
                        if (fs.existsSync(localPath)) {
                            newUrls.push(localUrl);
                            fieldModified = true;
                            downloaded++;
                            continue;
                        }

                        try {
                            await downloadFile(url, localPath);
                            newUrls.push(localUrl);
                            fieldModified = true;
                            downloaded++;
                            if (downloaded % 50 === 0) {
                                console.log(`  Descargados: ${downloaded}/${totalUrls} (${failed} fallos)`);
                            }
                        } catch (err) {
                            // Keep original URL if download fails
                            newUrls.push(url);
                            failed++;
                            failedUrls.push({ url, error: err.message });
                        }
                    }

                    if (fieldModified) {
                        updateOps[`${section}.${field}`] = newUrls;
                        docModified = true;
                    }
                }
            }

            if (docModified) {
                await col.updateOne({ _id: doc._id }, { $set: updateOps });
            }
        }
    }

    // Also check vehiculos for main photos
    const vehiculosCol = db.collection('vehiculos');
    const vehiculos = await vehiculosCol.find({}).toArray();
    console.log(`\nProcesando vehiculos: ${vehiculos.length} documentos`);

    for (const veh of vehiculos) {
        const updateOps = {};
        let modified = false;

        // Check imagen field
        for (const field of ['imagen', 'foto', 'image']) {
            if (veh[field] && typeof veh[field] === 'string' && (veh[field].includes('s3.') || veh[field].includes('amazonaws.com'))) {
                totalUrls++;
                const filename = veh[field].split('/').pop();
                const localPath = path.join(UPLOAD_DIR, filename);
                const localUrl = '/uploads/fotos/' + filename;

                if (fs.existsSync(localPath)) {
                    updateOps[field] = localUrl;
                    modified = true;
                    downloaded++;
                } else {
                    try {
                        await downloadFile(veh[field], localPath);
                        updateOps[field] = localUrl;
                        modified = true;
                        downloaded++;
                    } catch (err) {
                        failed++;
                        failedUrls.push({ url: veh[field], error: err.message });
                    }
                }
            }
        }

        if (modified) {
            await vehiculosCol.updateOne({ _id: veh._id }, { $set: updateOps });
        }
    }

    console.log(`\n========== RESUMEN ==========`);
    console.log(`URLs S3 encontradas: ${totalUrls}`);
    console.log(`Descargadas exitosamente: ${downloaded}`);
    console.log(`Fallidas: ${failed}`);
    console.log(`Ya locales (sin cambio): ${alreadyLocal}`);

    if (failedUrls.length > 0) {
        console.log(`\nURLs fallidas:`);
        failedUrls.forEach(f => console.log(`  ${f.url} -> ${f.error}`));
    }

    // Final verification - count remaining S3 URLs
    let remainingS3 = 0;
    for (const colName of ['inventarios', 'inventarioinicials']) {
        const col = colName === 'inventarios' ? inventariosCol : inventarioInicialesCol;
        const docs = await col.find({}).toArray();
        for (const doc of docs) {
            for (const section of sections) {
                if (!doc[section]) continue;
                for (const [field, value] of Object.entries(doc[section])) {
                    if (!Array.isArray(value)) continue;
                    for (const url of value) {
                        if (typeof url === 'string' && (url.includes('s3.') || url.includes('amazonaws.com'))) {
                            remainingS3++;
                        }
                    }
                }
            }
        }
    }
    console.log(`\nURLs S3 restantes en BD: ${remainingS3}`);

    await mongoose.disconnect();
    console.log('Desconectado');
}

main().catch(err => { console.error(err); process.exit(1); });
