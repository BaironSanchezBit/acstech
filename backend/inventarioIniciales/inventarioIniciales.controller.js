const Inventories = require('./inventarioIniciales.dao');
const multer = require('multer');
const { uploadFileToS3, deleteFileFromS3 } = require('../s3');
// Monday.com deshabilitado - servicios cloud ya no activos (2026-03-20)
// const mondaySdk = require("monday-sdk-js");
// const monday = mondaySdk();
// monday.setToken(process.env.MONDAY_API_KEY);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadMultiple = upload.fields([
    { name: 'fotosCedulaPropietario', maxCount: 10 },
    { name: 'fotosTarjetaPropietario', maxCount: 10 },
    { name: 'fotosSoat', maxCount: 10 },
    { name: 'fotosCertificadoTradicion', maxCount: 10 },
    { name: 'fotosEstadoCuentaImpuesto', maxCount: 10 },
    { name: 'fotosSimitPropietario', maxCount: 10 },
    { name: 'fotosLiquidacionDeudaFinanciera', maxCount: 10 },
    { name: 'fotosTecnoMecanica', maxCount: 10 },
    { name: 'fotosManifiestoFactura', maxCount: 10 },
    { name: 'fotosSoatIniciales', maxCount: 10 },
    { name: 'fotosImpuestoAno', maxCount: 10 },
    { name: 'fotosCopiaLlave', maxCount: 10 },
    { name: 'fotosGato', maxCount: 10 },
    { name: 'fotosLlavePernos', maxCount: 10 },
    { name: 'fotosCopaSeguridad', maxCount: 10 },
    { name: 'fotosTiroArrastre', maxCount: 10 },
    { name: 'fotosHistorialMantenimiento', maxCount: 10 },
    { name: 'fotosManual', maxCount: 10 },
    { name: 'fotosPalomera', maxCount: 10 },
    { name: 'fotosTapetes', maxCount: 10 },
    { name: 'fotosLlantaRepuesto', maxCount: 10 },
    { name: 'fotosKitCarretera', maxCount: 10 },
    { name: 'fotosElementosPersonales', maxCount: 10 },
    { name: 'fotosAntena', maxCount: 10 },

    { name: 'fotosTresCuartosFrente', maxCount: 10},
    { name: 'fotosFrente', maxCount: 10},
    { name: 'fotosFrenteCapoAbierto', maxCount: 10},
    { name: 'fotosMotor', maxCount: 10},
    { name: 'fotosLateralDerecho', maxCount: 10},
    { name: 'fotosTrasera', maxCount: 10},
    { name: 'fotosTraseraBaulAbierto', maxCount: 10},
    { name: 'fotosBaul', maxCount: 10},
    { name: 'fotosTresCuartosTrasera', maxCount: 10},
    { name: 'fotosLateralIzquierdo', maxCount: 10},
    { name: 'fotosAsientosTraseros', maxCount: 10},
    { name: 'fotosAsientosDelanteros', maxCount: 10},
    { name: 'fotosPanelCompleto', maxCount: 10},
]);

exports.create = async (req, res) => {
    uploadMultiple(req, res, async (err) => {
        if (err) {
            return res.status(400).send({ error: err.message });
        }

        try {
            const inventoryData = req.body;

            const inventory = await Inventories.create(inventoryData)
            if (req.files && Object.keys(req.files).length > 0) {
                const filesGroupedByField = req.files;
                for (const [field, files] of Object.entries(filesGroupedByField)) {
                    const uploadedFiles = await Promise.all(files.map(file => uploadFileToS3(file)));
                    const uploadedUrls = uploadedFiles.map(upload => upload.Location);
                    // Routing de fotos por seccion (misma logica que updatePhotos)
                    const section =
                        ["fotosCopiaLlave", "fotosGato", "fotosLlavePernos", "fotosCopaSeguridad",
                        "fotosTiroArrastre", "fotosHistorialMantenimiento", "fotosManual", "fotosPalomera",
                        "fotosTapetes", "fotosLlantaRepuesto", "fotosKitCarretera", "fotosElementosPersonales",
                        "fotosAntena"].includes(field)
                            ? "controlAccesorios"
                        : ["fotosCertificadoTradicion", "fotosEstadoCuentaImpuesto", "fotosSimitPropietario",
                        "fotosLiquidacionDeudaFinanciera", "fotosTecnoMecanica", "fotosManifiestoFactura",
                        "fotosSoatIniciales", "fotosImpuestoAno", "fotosOficioDesembargo"].includes(field)
                            ? "documentosValoresIniciales"
                        : ["fotosTresCuartosFrente", "fotosFrente", "fotosFrenteCapoAbierto", "fotosMotor",
                            "fotosLateralDerecho", "fotosTrasera", "fotosTraseraBaulAbierto", "fotosBaul",
                            "fotosTresCuartosTrasera", "fotosLateralIzquierdo", "fotosAsientosTraseros",
                            "fotosAsientosDelanteros", "fotosPanelCompleto"].includes(field)
                            ? "ImagenesIngreso"
                        : "documentosTraspasos";
                    inventory[section][field] = uploadedUrls;
                }
            }

            await inventory.save();

            /*
            const boardId = 6859306637;
            const itemName = inventoryData.elemento;

            const columnValues = JSON.stringify({
                person: {
                    personsAndTeams: [
                        {
                            id: 59504128,
                            kind: "person"
                        },
                        {
                            id: 60120131,
                            kind: "person"
                        },
                        {
                            id: 59901835,
                            kind: "person"
                        }
                    ]
                },
                texto__1: inventoryData.placa,
                estado_11__1: inventoryData.filtroBaseDatos.proveedor,
                status: inventoryData.filtroBaseDatos.tipoNegocio,
                estado_1__1: inventoryData.filtroBaseDatos.estadoInventario,
            });

            const response = await monday.api(`
                mutation {
                    create_item (board_id: ${boardId}, item_name: "${itemName}", column_values: "${columnValues.replace(/"/g, '\\"')}") {
                        id
                    }
                }
            `);

            */
            res.status(201).send(inventory);
        } catch (error) {
            res.status(400).send(error);
            console.error(error);
        }
    });
};

exports.updatePhotos = async (req, res) => {
    uploadMultiple(req, res, async (err) => {
        if (err) {
            console.error('Error uploading files:', err);
            return res.status(400).send({ message: 'Error al subir archivos' });
        }

        const inventoryId = req.params.id;
        let retries = 3;

        const executeUpdate = async () => {
            console.log("updatePhotos Pre-Inventario")

            try {
                const inventory = await Inventories.findById(inventoryId);
                if (!inventory) {
                    console.error('Inventory not found:', inventoryId);
                    return res.status(404).send({ message: 'Inventario no encontrado' });
                }

                const updateData = {};

                // List of fields to update
                const fotosFields = [
                    'fotosCedulaPropietario', 'fotosTarjetaPropietario', 'fotosSoat',
                    'fotosCertificadoTradicion', 'fotosEstadoCuentaImpuesto', 'fotosSimitPropietario',
                    'fotosLiquidacionDeudaFinanciera', 'fotosTecnoMecanica', 'fotosManifiestoFactura',
                    'fotosSoatIniciales', 'fotosImpuestoAno', 'fotosOficioDesembargo', 'fotosCopiaLlave', 'fotosGato',
                    'fotosLlavePernos', 'fotosCopaSeguridad', 'fotosTiroArrastre',
                    'fotosHistorialMantenimiento', 'fotosManual', 'fotosPalomera',
                    'fotosTapetes', 'fotosLlantaRepuesto', 'fotosKitCarretera','fotosElementosPersonales', 'fotosAntena',
                    'fotosTresCuartosFrente','fotosFrente','fotosFrenteCapoAbierto','fotosMotor', 'fotosLateralDerecho',
                    'fotosTrasera','fotosTraseraBaulAbierto','fotosBaul','fotosTresCuartosTrasera','fotosLateralIzquierdo',
                    'fotosAsientosTraseros','fotosAsientosDelanteros','fotosPanelCompleto'
                ];

                for (const field of fotosFields) {
                    if (req.files[field]) {
                        const uploadedFiles = await Promise.all(req.files[field].map(file => uploadFileToS3(file)));
                        const s3Locations = uploadedFiles.map(upload => upload.Location);
                        // Check if the field is under `controlAccesorios` or another section
                        const section = 
                            // Campos bajo `controlAccesorios`
                            ['fotosCopiaLlave', 'fotosGato', 'fotosLlavePernos', 'fotosCopaSeguridad', 
                            'fotosTiroArrastre', 'fotosHistorialMantenimiento', 'fotosManual', 'fotosPalomera', 
                            'fotosTapetes', 'fotosLlantaRepuesto', 'fotosKitCarretera', 'fotosElementosPersonales', 
                            'fotosAntena'].includes(field)
                                ? 'controlAccesorios'
                            // Campos bajo `documentosValoresIniciales`
                            :['fotosCertificadoTradicion', 'fotosEstadoCuentaImpuesto', 'fotosSimitPropietario', 
                            'fotosLiquidacionDeudaFinanciera', 'fotosTecnoMecanica', 'fotosManifiestoFactura', 
                            'fotosSoatIniciales', 'fotosImpuestoAno', 'fotosOficioDesembargo'].includes(field)
                                ? 'documentosValoresIniciales'
                            // Campos bajo `ImagenesIngreso` (nueva sección)
                            : ['fotosTresCuartosFrente', 'fotosFrente','fotosFrenteCapoAbierto','fotosMotor',
                                'fotosLateralDerecho','fotosTrasera','fotosTraseraBaulAbierto','fotosBaul',
                                'fotosTresCuartosTrasera','fotosLateralIzquierdo','fotosAsientosTraseros', 
                                'fotosAsientosDelanteros','fotosPanelCompleto' ].includes(field)
                                ? 'ImagenesIngreso'
                            // Por defecto, asignar a `documentosTraspasos`
                            : 'documentosTraspasos';
                        console.log(section,field,s3Locations)
                        updateData[`${section}.${field}`] = [
                            ...inventory[section][field],
                            ...s3Locations
                        ];
                    }
                }

                const updatedInventory = await Inventories.findByIdAndUpdate(inventoryId, updateData, { new: true, useFindAndModify: false });
                return res.status(200).send(updatedInventory);
            } catch (error) {
                console.error('Error updating inventory:', error);
                if (error.name === 'VersionError') {
                    retries--;
                    console.error(`Version conflict, retrying operation (remaining retries: ${retries})`);
                    if (retries > 0) {
                        return executeUpdate();
                    }
                } else {
                    throw error;
                }
            }
        };

        try {
            const result = await executeUpdate();
            if (!result) {
                return res.status(500).send({ message: 'Max retries reached. Operation failed.' });
            }
        } catch (error) {
            return res.status(500).send({ message: 'Error al actualizar inventario', error });
        }
    });
};

exports.deletePhoto = async (req, res) => {
    try {
        
        const { inventoryId, field, photoUrl } = req.body;
        console.log("deletePhoto Pre-Inventario", req.body);
        if (!photoUrl) {
            return res.status(400).send({ message: 'URL de la imagen no proporcionada' });
        }

        const photoName = photoUrl.split('/').pop();

        await deleteFileFromS3(photoName);

        const inventory = await Inventories.findById(inventoryId);
        if (!inventory) {
            return res.status(404).send({ message: 'Inventario no encontrado' });
        }

        if (field === 'fotosCedulaPropietario') {
            inventory.documentosTraspasos.fotosCedulaPropietario = inventory.documentosTraspasos.fotosCedulaPropietario.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosTarjetaPropietario') {
            inventory.documentosTraspasos.fotosTarjetaPropietario = inventory.documentosTraspasos.fotosTarjetaPropietario.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosSoat') {
            inventory.documentosTraspasos.fotosSoat = inventory.documentosTraspasos.fotosSoat.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosCertificadoTradicion') {
            inventory.documentosValoresIniciales.fotosCertificadoTradicion = inventory.documentosValoresIniciales.fotosCertificadoTradicion.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosEstadoCuentaImpuesto') {
            inventory.documentosValoresIniciales.fotosEstadoCuentaImpuesto = inventory.documentosValoresIniciales.fotosEstadoCuentaImpuesto.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosSimitPropietario') {
            inventory.documentosValoresIniciales.fotosSimitPropietario = inventory.documentosValoresIniciales.fotosSimitPropietario.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosLiquidacionDeudaFinanciera') {
            inventory.documentosValoresIniciales.fotosLiquidacionDeudaFinanciera = inventory.documentosValoresIniciales.fotosLiquidacionDeudaFinanciera.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosTecnoMecanica') {
            inventory.documentosValoresIniciales.fotosTecnoMecanica = inventory.documentosValoresIniciales.fotosTecnoMecanica.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosManifiestoFactura') {
            inventory.documentosValoresIniciales.fotosManifiestoFactura = inventory.documentosValoresIniciales.fotosManifiestoFactura.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosSoatIniciales') {
            inventory.documentosValoresIniciales.fotosSoatIniciales = inventory.documentosValoresIniciales.fotosSoatIniciales.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosImpuestoAno') {
            inventory.documentosValoresIniciales.fotosImpuestoAno = inventory.documentosValoresIniciales.fotosImpuestoAno.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosOficioDesembargo') {
            inventory.documentosValoresIniciales.fotosOficioDesembargo = inventory.documentosValoresIniciales.fotosOficioDesembargo.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosCopiaLlave') {
            inventory.controlAccesorios.fotosCopiaLlave = inventory.controlAccesorios.fotosCopiaLlave.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosGato') {
            inventory.controlAccesorios.fotosGato = inventory.controlAccesorios.fotosGato.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosLlavePernos') {
            inventory.controlAccesorios.fotosLlavePernos = inventory.controlAccesorios.fotosLlavePernos.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosCopaSeguridad') {
            inventory.controlAccesorios.fotosCopaSeguridad = inventory.controlAccesorios.fotosCopaSeguridad.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosTiroArrastre') {
            inventory.controlAccesorios.fotosTiroArrastre = inventory.controlAccesorios.fotosTiroArrastre.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosHistorialMantenimiento') {
            inventory.controlAccesorios.fotosHistorialMantenimiento = inventory.controlAccesorios.fotosHistorialMantenimiento.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosManual') {
            inventory.controlAccesorios.fotosManual = inventory.controlAccesorios.fotosManual.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosPalomera') {
            inventory.controlAccesorios.fotosPalomera = inventory.controlAccesorios.fotosPalomera.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosTapetes') {
            inventory.controlAccesorios.fotosTapetes = inventory.controlAccesorios.fotosTapetes.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosLlantaRepuesto') {
            inventory.controlAccesorios.fotosLlantaRepuesto = inventory.controlAccesorios.fotosLlantaRepuesto.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosKitCarretera') {
            inventory.controlAccesorios.fotosKitCarretera = inventory.controlAccesorios.fotosKitCarretera.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosElementosPersonales') {
            inventory.controlAccesorios.fotosElementosPersonales = inventory.controlAccesorios.fotosElementosPersonales.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosAntena') {
            inventory.controlAccesorios.fotosAntena = inventory.controlAccesorios.fotosAntena.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosTresCuartosFrente') {
            console.log("fotosTresCuartosFrente")
            inventory.ImagenesIngreso.fotosTresCuartosFrente = inventory.ImagenesIngreso.fotosTresCuartosFrente.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosFrente') {
            inventory.ImagenesIngreso.fotosFrente = inventory.ImagenesIngreso.fotosFrente.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosFrenteCapoAbierto') {
            inventory.ImagenesIngreso.fotosFrenteCapoAbierto = inventory.ImagenesIngreso.fotosFrenteCapoAbierto.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosMotor') {
            inventory.ImagenesIngreso.fotosMotor = inventory.ImagenesIngreso.fotosMotor.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosLateralDerecho') {
            inventory.ImagenesIngreso.fotosLateralDerecho = inventory.ImagenesIngreso.fotosLateralDerecho.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosTrasera') {
            inventory.ImagenesIngreso.fotosTrasera = inventory.ImagenesIngreso.fotosTrasera.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosTraseraBaulAbierto') {
            inventory.ImagenesIngreso.fotosTraseraBaulAbierto = inventory.ImagenesIngreso.fotosTraseraBaulAbierto.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosBaul') {
            inventory.ImagenesIngreso.fotosBaul = inventory.ImagenesIngreso.fotosBaul.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosTresCuartosTrasera') {
            inventory.ImagenesIngreso.fotosTresCuartosTrasera = inventory.ImagenesIngreso.fotosTresCuartosTrasera.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosLateralIzquierdo') {
            inventory.ImagenesIngreso.fotosLateralIzquierdo = inventory.ImagenesIngreso.fotosLateralIzquierdo.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosAsientosTraseros') {
            inventory.ImagenesIngreso.fotosAsientosTraseros = inventory.ImagenesIngreso.fotosAsientosTraseros.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosAsientosDelanteros') {
            inventory.ImagenesIngreso.fotosAsientosDelanteros = inventory.ImagenesIngreso.fotosAsientosDelanteros.filter(foto => foto !== photoUrl);
        } else if (field === 'fotosPanelCompleto') {
            inventory.ImagenesIngreso.fotosPanelCompleto = inventory.ImagenesIngreso.fotosPanelCompleto.filter(foto => foto !== photoUrl);
        } else {
            return res.status(400).send({ message: 'Campo no válido' });
        }

        await inventory.save();

        res.status(200).send({ message: 'Foto eliminada correctamente' });
    } catch (error) {
        res.status(500).send({ message: 'Error al eliminar la foto', error });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const inventoryData = req.body;

        const inventory = await Inventories.findById(id);
        if (!inventory) {
            return res.status(404).send({ message: 'Inventario no encontrado.' });
        }

        for (let key in inventoryData.documentosTraspasos) {
            if (inventoryData.documentosTraspasos.hasOwnProperty(key)) {
                inventory.documentosTraspasos[key] = inventoryData.documentosTraspasos[key];
            }
        }

        for (let key in inventoryData.documentosValoresIniciales) {
            if (inventoryData.documentosValoresIniciales.hasOwnProperty(key)) {
                inventory.documentosValoresIniciales[key] = inventoryData.documentosValoresIniciales[key];
            }
        }
        console.log(inventoryData.controlAccesorios)
        for (let key in inventoryData.controlAccesorios) {
            if (inventoryData.controlAccesorios.hasOwnProperty(key)) {
                inventory.controlAccesorios[key] = inventoryData.controlAccesorios[key];
            }
        }

        for (let key in inventoryData.ImagenesIngreso) {
            if (inventoryData.ImagenesIngreso.hasOwnProperty(key)) {
                console.log(key, inventoryData.ImagenesIngreso[key]);
                inventory.ImagenesIngreso[key] = inventoryData.ImagenesIngreso[key];
            }
        }

        // Excluir campos anidados que ya se mergearon arriba
        const nestedKeys = ['documentosTraspasos', 'documentosValoresIniciales', 'controlAccesorios', 'ImagenesIngreso'];
        Object.keys(inventoryData).forEach(key => {
            if (!nestedKeys.includes(key)) {
                inventory[key] = inventoryData[key];
            }
        });

        await inventory.save();
        res.status(200).send(inventory);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.getAll = async (req, res) => {
    try {
        const inventories = await Inventories.find({});
        res.status(200).send(inventories);
    } catch (error) {
        res.status(500).send(error);
    }
};



exports.getAllPopulated = async (req, res) => {
    try {
        const inventories = await Inventories.find({})
            .populate('vehiculo', 'imagenVehiculo marca linea version modelo placa ciudadPlaca combustible')
            .populate('cliente', 'primerNombre segundoNombre primerApellido segundoApellido celularOne')
            .populate({ path: 'comprador', model: 'Clientes', select: 'primerNombre segundoNombre primerApellido segundoApellido celularOne' })
            .lean();
        res.status(200).send(inventories);
    } catch (error) {
        console.error("Error al obtener pre-inventarios populados:", error);
        res.status(500).send({ error: "Error interno del servidor" });
    }
};

exports.getByIdInventory = async (req, res) => {
    try {
        const inventory = await Inventories.findOne({ inventoryId: req.params.idInventory });
        if (!inventory) {
            return res.status(404).send();
        }
        res.send(inventory);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Primera version de addActivityLog eliminada (duplicada)
// La version activa esta mas abajo

exports.getOne = async (req, res) => {
    try {
        const inventories = await Inventories.findById(req.params.id);
        if (!inventories) {
            return res.status(404).send();
        }
        res.send(inventories);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.updateInfoExtra = async (req, res) => {
    const inventoryId = req.params.id;
    const { infoExtra } = req.body;

    try {
        const inventory = await Inventories.findOneAndUpdate(
            { inventoryId: inventoryId },
            { infoExtra: infoExtra },
            { new: true, runValidators: true }
        );

        if (!inventory) {
            return res.status(404).send();
        }

        res.send(inventory);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.addActivityLog = async (req, res) => {
    try {
        const { id } = req.params;
        const newActivity = req.body;

        const inventory = await Inventories.findById(id);
        if (!inventory) {
            return res.status(404).send({ message: 'Inventario no encontrado.' });
        }

        if (!Array.isArray(inventory.controlAccesorios.registroActividad)) {
            inventory.controlAccesorios.registroActividad = [];
        }

        inventory.controlAccesorios.registroActividad.push(newActivity);
        await inventory.save();

        res.status(200).send({ registroActividad: inventory.controlAccesorios.registroActividad });
    } catch (error) {
        res.status(500).send({ message: 'Error al registrar la actividad', error });
    }
};