const multer = require('multer');
const path = require('path');
const fs = require('fs');

// S3 deshabilitado - almacenamiento local (2026-03-20)
// Las fotos se guardan en /opt/proyectos/acstech/uploads/fotos/

const UPLOADS_DIR = '/opt/proyectos/acstech/uploads/fotos';

// Asegurar que el directorio existe
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadFileToS3 = async (file) => {
    const fileName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    fs.writeFileSync(filePath, file.buffer);

    // Retornar URL local compatible con el formato anterior
    const url = `/uploads/fotos/${fileName}`;
    return { Location: url };
};

const deleteFileFromS3 = async (key) => {
    // key puede ser un nombre de archivo o una ruta completa
    const fileName = key.includes('/') ? key.split('/').pop() : key;
    const filePath = path.join(UPLOADS_DIR, fileName);

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.error('Error eliminando archivo local:', err);
    }
    return {};
};

module.exports = {
    upload,
    uploadFileToS3,
    deleteFileFromS3,
};
