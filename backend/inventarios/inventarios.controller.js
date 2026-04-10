const Inventories = require('./inventarios.dao');
const PreInventories = require('../inventarioIniciales/inventarioIniciales.dao');
const multer = require('multer');
const { uploadFileToS3, deleteFileFromS3 } = require('../s3');
const DIFERENCIA_DIAS_NOTIFICACION = 5;
const fechaPorDefecto = new Date('1970-01-01T00:00:00.000+00:00');

// Monday.com deshabilitado - servicios cloud ya no activos (2026-03-20)
// const mondaySdk = require('monday-sdk-js');
const dotenv = require('dotenv');

dotenv.config();

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
    { name: 'fotosOficioDesembargo', maxCount: 10 },
    { name: 'fotosReciboCaja', maxCount: 10 },
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

exports.migratePreInventoryToInventory = async (req, res) => {
    try {
        const preInventoryId = req.params.id;

        const preInventory = await PreInventories.findById(preInventoryId).lean();
        if (!preInventory) {
            return res.status(404).send({ message: 'Pre-Inventario no encontrado.' });
        }

        const inventoryData = {
            cliente: preInventory.cliente,
            vehiculo: preInventory.vehiculo,
            comprador: preInventory.comprador,
            filtroBaseDatos: preInventory.filtroBaseDatos,
            peritajeProveedor: preInventory.peritajeProveedor,
            documentosTraspasos: preInventory.documentosTraspasos,
            link: preInventory.link,
            observacionGlobal: preInventory.observacionGlobal,
            documentosValoresIniciales: preInventory.documentosValoresIniciales,
            obsFase3: preInventory.obsFase3,
            controlAccesorios: preInventory.controlAccesorios,
            tramitesIngreso: preInventory.tramitesIngreso,
            tramitesSalidaAutonal: preInventory.tramitesSalidaAutonal,
            deudaFinanciera: preInventory.deudaFinanciera,
            otrosTramitesAccesorios: preInventory.otrosTramitesAccesorios,
            otrosTramitesVendedor: preInventory.otrosTramitesVendedor,
            otrosTramitesAccesoriosVentas: preInventory.otrosTramitesAccesoriosVentas,
            otrosTramitesVendedorVentas: preInventory.otrosTramitesVendedorVentas,
            variablesLiquidacion: preInventory.variablesLiquidacion,
            variablesLiquidacionVentas: preInventory.variablesLiquidacionVentas,
            formaPagoCompra: preInventory.formaPagoCompra,
            formaPagoVenta: preInventory.formaPagoVenta,
            formadePago: preInventory.formadePago,
            formadePagoVenta2: preInventory.formadePagoVenta2,
            cruceDocumental: preInventory.cruceDocumental,
            liquidaciones: preInventory.liquidaciones,
            liquidacionesVenta: preInventory.liquidacionesVenta,
            generadorContratos: preInventory.generadorContratos,
            generadorContratosVentas: preInventory.generadorContratosVentas,
            infoExtra: preInventory.infoExtra
        };

        const inventory = new Inventories(inventoryData);
        await inventory.save();

        await PreInventories.findByIdAndDelete(preInventoryId);

        res.status(201).send(inventory);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.create = async (req, res) => {
    uploadMultiple(req, res, async (err) => {
        if (err) {
            return res.status(400).send({ error: err.message });
        }

        try {
            const inventoryData = req.body;

            const inventory = await Inventories.create(inventoryData);

            if (req.files && Object.keys(req.files).length > 0) {
                const filesGroupedByField = req.files;

                for (const [field, files] of Object.entries(filesGroupedByField)) {
                    const uploadedFiles = await Promise.all(files.map(file => uploadFileToS3(file)));
                    inventory.documentosTraspasos[field] = uploadedFiles.map(upload => upload.Location);
                }
            }

            await inventory.save();

            res.status(201).send(inventory);
        } catch (error) {
            res.status(400).send(error);
            console.error(error);
        }
    });
};

exports.updatePhotos = async (req, res) => {
    console.log("updatePhotos Inventario")
    uploadMultiple(req, res, async (err) => {
        if (err) {
            console.error('Error uploading files:', err);
            return res.status(400).send({ message: 'Error al subir archivos' });
        }

        const inventoryId = req.params.id;
        let retries = 3;

        const executeUpdate = async () => {
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

exports.deletePhoto = async (req, res) => {
    try {
        console.log("deletePhoto Inventario")
        const { inventoryId, field, photoUrl } = req.body;

        if (!photoUrl || !field) {
            return res.status(400).send({ message: 'URL o campo no proporcionado' });
        }

        const inventory = await Inventories.findById(inventoryId);
        if (!inventory) {
            return res.status(404).send({ message: 'Inventario no encontrado' });
        }

        // Lookup table: campo -> seccion
        const fieldSectionMap = {};
        // documentosTraspasos
        ['fotosCedulaPropietario', 'fotosTarjetaPropietario', 'fotosSoat'].forEach(f => fieldSectionMap[f] = 'documentosTraspasos');
        // documentosValoresIniciales
        ['fotosCertificadoTradicion', 'fotosEstadoCuentaImpuesto', 'fotosSimitPropietario',
         'fotosLiquidacionDeudaFinanciera', 'fotosTecnoMecanica', 'fotosManifiestoFactura',
         'fotosSoatIniciales', 'fotosImpuestoAno', 'fotosOficioDesembargo', 'fotosReciboCaja'].forEach(f => fieldSectionMap[f] = 'documentosValoresIniciales');
        // controlAccesorios
        ['fotosCopiaLlave', 'fotosGato', 'fotosLlavePernos', 'fotosCopaSeguridad',
         'fotosTiroArrastre', 'fotosHistorialMantenimiento', 'fotosManual', 'fotosPalomera',
         'fotosTapetes', 'fotosLlantaRepuesto', 'fotosKitCarretera', 'fotosAntena',
         'fotosElementosPersonales'].forEach(f => fieldSectionMap[f] = 'controlAccesorios');
        // ImagenesIngreso
        ['fotosTresCuartosFrente', 'fotosFrente', 'fotosFrenteCapoAbierto', 'fotosMotor',
         'fotosLateralDerecho', 'fotosTrasera', 'fotosTraseraBaulAbierto', 'fotosBaul',
         'fotosTresCuartosTrasera', 'fotosLateralIzquierdo', 'fotosAsientosTraseros',
         'fotosAsientosDelanteros', 'fotosPanelCompleto'].forEach(f => fieldSectionMap[f] = 'ImagenesIngreso');

        const section = fieldSectionMap[field];
        if (!section) {
            return res.status(400).send({ message: 'Campo no valido: ' + field });
        }

        // Validar que el array existe ANTES de borrar archivo
        if (!inventory[section] || !inventory[section][field]) {
            return res.status(400).send({ message: 'Seccion o campo no existe en el inventario' });
        }

        // Ahora si borrar archivo del disco
        const photoName = photoUrl.split('/').pop();
        await deleteFileFromS3(photoName);

        // Filtrar URL del array
        inventory[section][field] = inventory[section][field].filter(foto => foto !== photoUrl);
        await inventory.save();

        res.status(200).send({ message: 'Foto eliminada correctamente' });
    } catch (error) {
        res.status(500).send({ message: 'Error al eliminar la foto', error });
    }
};

exports.updateSpecificFields = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Campos protegidos: no se puede cambiar vehiculo/cliente
        ['vehiculo', 'cliente'].forEach(field => {
            if (updateData[field]) {
                delete updateData[field];
                console.log('[PROTECCION] Intento de cambiar ' + field + ' bloqueado via updateSpecificFields');
            }
        });

        // Actualización de los campos específicos
        const updatedInventory = await Inventories.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedInventory) {
            return res.status(404).send({ message: 'Inventario no encontrado.' });
        }

        // Retorno de la información actualizada
        res.status(200).send(updatedInventory);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};

exports.updateMondayColumn = async (req, res) => {
    // Monday.com deshabilitado - servicio cloud ya no activo (2026-03-20)
    res.status(503).send({ message: 'Servicio Monday.com deshabilitado - operacion solo local' });
};

exports.getMondayByPlaca = async (req, res) => {
    // Monday.com deshabilitado - servicio cloud ya no activo (2026-03-20)
    res.status(503).send({ message: 'Servicio Monday.com deshabilitado - operacion solo local' });
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const inventoryData = req.body;
        const inventory = await Inventories.findById(id);
        if (!inventory) {
            return res.status(404).send({ message: 'Inventario no encontrado.' });
        }

        // Secciones anidadas que requieren merge especial (sin sobrescribir fotos)
        const nestedSections = ['documentosTraspasos', 'documentosValoresIniciales', 'controlAccesorios', 'ImagenesIngreso'];

        // Campos protegidos: no se puede cambiar vehiculo/cliente de un inventario existente
        const protectedFields = ['vehiculo', 'cliente'];
        protectedFields.forEach(field => {
            if (inventoryData[field] && inventory[field] && 
                inventoryData[field].toString() !== inventory[field].toString()) {
                delete inventoryData[field];
                console.log('[PROTECCION] Intento de cambiar ' + field + ' bloqueado en inventario ' + inventory.inventoryId);
            }
        });

        // 1. Actualizar campos de nivel superior (excepto secciones anidadas)
        Object.keys(inventoryData).forEach(key => {
            if (!nestedSections.includes(key)) {
                inventory[key] = inventoryData[key];
            }
        });

        // 2. Merge de cada seccion anidada: solo campos que NO son fotos
        for (const section of nestedSections) {
            if (inventoryData[section]) {
                Object.keys(inventoryData[section]).forEach(key => {
                    if (!key.startsWith('fotos')) {
                        inventory[section][key] = inventoryData[section][key];
                    }
                });
            }
        }

        await inventory.save();
        res.status(200).send(inventory);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.updateMondayCom = async (req, res) => {
    // Monday.com deshabilitado - servicio cloud ya no activo (2026-03-20)
    res.status(503).send({ message: 'Servicio Monday.com deshabilitado - operacion solo local' });
};

exports.getAll = async (req, res) => {
    try {
        if (req.query.page) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const skip = (page - 1) * limit;
            const [inventories, total] = await Promise.all([
                Inventories.find({}).sort({ inventoryId: -1 }).skip(skip).limit(limit),
                Inventories.countDocuments({})
            ]);
            return res.status(200).send({ data: inventories, total, page, pages: Math.ceil(total / limit) });
        }
        const inventories = await Inventories.find({});
        res.status(200).send(inventories);
    } catch (error) {
        res.status(500).send(error);
    }
};

/**
 * crecion de un metodo para obtener todos los inventarios por partes
 * fecha: 2025-02-15
 * autor: brayan
 * motivo: se necesita obtener los inventarios por partes para mayor velocidad en la carga
 * impacto: ninguno
 * notas: modulo que se implentara en sustitucion de getAll
 * */
exports.getInventoriesByPage = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1; // Si no se envía, usa la página 1
        const limit = Number(req.query.limit) || 12; // Si no se envía, usa 12 elementos por página
        
        const inventories = await Inventories.find({})
            .sort({ "estadoInventario": -1, "_id": 1 }) // Ordenar por valor de venta de mayor
            .limit(limit) // Límite de elementos por página
            .skip((page - 1) * limit); // Saltar los anteriores
        res.status(200).send(inventories); // Mantiene el formato esperado en el front
    } catch (error) {
        console.error("Error al obtener los inventarios:", error);
        res.status(500).send({ error: "Error interno del servidor" });
    }
};

exports.getInventoriesByPageF = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1; // Si no se envía, usa la página 1
        const limit = Number(req.query.limit) || 12; // Si no se envía, usa 12 elementos por página
        
        const inventories = await Inventories.find({})
            .limit(limit) // Límite de elementos por página
            .skip((page - 1) * limit); // Saltar los anteriores
        res.status(200).send(inventories); // Mantiene el formato esperado en el front
    } catch (error) {
        console.error("Error al obtener los inventarios:", error);
        res.status(500).send({ error: "Error interno del servidor" });
    }
};
//--fin de la creacion.

/**
 * 
 * @param {*} req 
 * @param {*total} res 
 */
exports.getAllCount = async (req, res) => {
    try {
        const total = await Inventories.estimatedDocumentCount(); // ⚡ Más rápido con índices
        res.status(200).json({ total });
    } catch (error) {
        console.error("Error al obtener el total de inventarios:", error);
        res.status(500).json({ error: "Error interno del servidor" });
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

exports.checkExpirations = async (socket) => {
    // v3 - 2026-03-25: Notificaciones por estado de inventario
    try {
        const inventories = await Inventories.find({}).populate('vehiculo');
        const estadosExcluidos = ['VENDIDO', 'TERMINADO', 'DECLINADO'];

        inventories.forEach(inventory => {
            const estado = inventory.filtroBaseDatos.estadoInventario;
            if (!estado || estadosExcluidos.includes(estado)) return;
            if (!inventory.vehiculo) return;

            const veh = inventory.vehiculo;
            const vehiculoId = veh.marca + ' ' + veh.linea + ' ' + veh.version + ': ' + veh.placa;
            const dvi = inventory.documentosValoresIniciales || {};
            const dt = inventory.documentosTraspasos || {};
            const esIniciales = (estado === 'ASIGNADO EN INICIALES');
            const esVenta = (estado === 'DISPONIBLE A LA VENTA' || estado === 'SEPARADO DISPONIBLE A LA VENTA');

            // =============================================
            // ASIGNADO EN INICIALES: pendientes documentación
            // =============================================
            if (esIniciales) {
                // Impuestos con deuda
                if (dvi.estadoCuentaImpuesto === 'REVISADO CON DEUDA') {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] Impuestos con deuda',
                        message: `${veh.marca} ${veh.placa}: Estado de cuenta impuestos ${dvi.estadoCuentaImpuesto}.`,
                        vehiculoId
                    });
                }

                // SIMIT con multas
                if (dvi.simitPropietario === 'PAGAR MULTAS') {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] SIMIT con multas',
                        message: `${veh.marca} ${veh.placa}: SIMIT Propietario ${dvi.simitPropietario}.`,
                        vehiculoId
                    });
                }

                // Retención por liquidar
                if (dvi.estadoValorRetencion === 'POR LIQUIDAR') {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] Retención pendiente',
                        message: `${veh.marca} ${veh.placa}: Retención ${dvi.estadoValorRetencion}.`,
                        vehiculoId
                    });
                }

                // Impuesto año en curso
                if (dvi.estadoImpAnoEnCurso === 'PARA PAGO' || dvi.estadoImpAnoEnCurso === 'LIQUIDAR' || dvi.estadoImpAnoEnCurso === 'PROVISIONAL') {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] Impuesto año en curso',
                        message: `${veh.marca} ${veh.placa}: Impuesto año en curso ${dvi.estadoImpAnoEnCurso}.`,
                        vehiculoId
                    });
                }

                // SOAT vencido
                if (dvi.estadoValorTotalSoat === 'VENCIDO COMPRAR' || dvi.estadoValorTotalSoat === 'PROVISIONAL') {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] SOAT pendiente',
                        message: `${veh.marca} ${veh.placa}: SOAT ${dvi.estadoValorTotalSoat}.`,
                        vehiculoId
                    });
                }

                // Manifiesto/Factura con problema
                if (dvi.manifiestoFactura && dvi.manifiestoFactura !== 'DISPONIBLE EN CARPETA') {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] Manifiesto/Factura',
                        message: `${veh.marca} ${veh.placa}: Manifiesto y Factura ${dvi.manifiestoFactura}.`,
                        vehiculoId
                    });
                }

                // Oficio de desembargo
                if (dvi.oficioDesembargo === 'NO') {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] Desembargo faltante',
                        message: `${veh.marca} ${veh.placa}: Oficio de Desembargo NO se encuentra en carpeta.`,
                        vehiculoId
                    });
                }

                // Impronta incompleta
                if (inventory.peritajeProveedor && inventory.peritajeProveedor.impronta === 'INCOMPLETO') {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] Impronta incompleta',
                        message: `${veh.marca} ${veh.placa}: Impronta incompleta.`,
                        vehiculoId
                    });
                }

                // Peritaje pendiente
                if (inventory.peritajeProveedor && (inventory.peritajeProveedor.estado === 'NO ASEGURABLE' || inventory.peritajeProveedor.estado === 'POR SOLICITAR')) {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] Peritaje pendiente',
                        message: `${veh.marca} ${veh.placa}: Peritaje ${inventory.peritajeProveedor.estado}.`,
                        vehiculoId
                    });
                }
            }

            // =============================================
            // DISPONIBLE A LA VENTA / SEPARADO: pendientes venta
            // =============================================
            if (esVenta) {
                // Vencimientos próximos
                verificarYNotificar(inventory, socket);

                // Documentos de traspaso
                if (dt.contratoVenta && dt.contratoVenta !== 'FIRMADO EN CARPETA' && dt.contratoVenta !== 'A NOMBRE DE AUTOMAGNO') {
                    socket.emit('expirationNotice', {
                        title: '[VENTA] Contrato pendiente',
                        message: `${veh.marca} ${veh.placa}: Contrato de Venta ${dt.contratoVenta}.`,
                        vehiculoId
                    });
                }
                if (dt.funt && dt.funt !== 'FIRMADO EN CARPETA' && dt.funt !== 'A NOMBRE DE AUTOMAGNO') {
                    socket.emit('expirationNotice', {
                        title: '[VENTA] FUNT pendiente',
                        message: `${veh.marca} ${veh.placa}: FUNT ${dt.funt}.`,
                        vehiculoId
                    });
                }
                if (dt.mandato && dt.mandato !== 'FIRMADO EN CARPETA' && dt.mandato !== 'A NOMBRE DE AUTOMAGNO' && inventory.filtroBaseDatos.proveedor !== 'AUTONAL') {
                    socket.emit('expirationNotice', {
                        title: '[VENTA] Mandato pendiente',
                        message: `${veh.marca} ${veh.placa}: Mandato ${dt.mandato}.`,
                        vehiculoId
                    });
                }

                // SOAT vencido (crítico para venta)
                if (dvi.estadoValorTotalSoat === 'VENCIDO COMPRAR') {
                    socket.emit('expirationNotice', {
                        title: '[VENTA] SOAT vencido',
                        message: `${veh.marca} ${veh.placa}: SOAT VENCIDO - debe comprarse antes de vender.`,
                        vehiculoId
                    });
                }

                // Deuda financiera
                if (inventory.deudaFinanciera && inventory.deudaFinanciera.fechaLimitePagoDeudaFinan) {
                    const d = new Date(inventory.deudaFinanciera.fechaLimitePagoDeudaFinan);
                    const fechaDef = new Date('1970-01-01T00:00:00.000+00:00');
                    if (d.getTime() !== fechaDef.getTime()) {
                        const dias = Math.round((d - new Date()) / 86400000);
                        if (dias <= 15) {
                            socket.emit('expirationNotice', {
                                title: '[VENTA] Deuda financiera próxima',
                                message: `${veh.marca} ${veh.placa}: Deuda financiera vence en ${dias} días.`,
                                vehiculoId
                            });
                        }
                    }
                }
            }

            // === AMBOS ESTADOS: Vehículo en taller ===
            if (inventory.filtroBaseDatos && inventory.filtroBaseDatos.ubicacion === 'TALLER') {
                socket.emit('tallerNotice', {
                    title: 'Vehículo en Taller',
                    message: `${veh.marca} ${veh.placa} se encuentra en el taller: ${inventory.filtroBaseDatos.tallerProveedor}.`,
                    vehiculoId
                });
            }
        });
    } catch (error) {
        console.error(error);
        socket.emit('errorCheckingExpiration', { error: 'Error al verificar las fechas de vencimiento' });
    }
};

exports.checkContractExpirations = async (socket) => {
    const DIAS_DURACION_CONTRATO = 60;
    try {
        const inventories = await Inventories.find({}).populate('vehiculo');
        const hoy = new Date();
        inventories.forEach(inventory => {
            const fechaCreacion = new Date(inventory.createdAt);
            const fechaVencimiento = new Date(fechaCreacion);
            fechaVencimiento.setDate(fechaCreacion.getDate() + DIAS_DURACION_CONTRATO);

            const diasRestantes = calcularDiasRestantes(hoy, fechaVencimiento);

            if (diasRestantes === 8) {
                const fechaVencimientoFormateada = fechaVencimiento.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                if (inventory.filtroBaseDatos.estadoInventario !== 'VENDIDO' && inventory.filtroBaseDatos.estadoInventario !== 'TERMINADO' && inventory.filtroBaseDatos.estadoInventario !== 'DECLINADO') {
                    socket.emit('contractExpirationNotice', {
                        title: 'Vencimiento de Contrato Próximo',
                        message: `El contrato para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa} vencerá en 8 días. La fecha de vencimiento es ${fechaVencimientoFormateada}.`,
                        vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                    });
                }
            }
        });
    } catch (error) {
        console.error(error);
        socket.emit('errorCheckingContractExpiration', { error: 'Error al verificar las fechas de vencimiento de los contratos' });
    }
};

exports.checkProvAlerts = async (socket) => {
    try {
        const inventories = await Inventories.find({}).populate('vehiculo'); // Asegúrate de tener la referencia al vehículo si es necesaria para el mensaje de alerta.
        inventories.forEach(inventory => {
            if (inventory.tramitesSalidaAutonal.provTraspaso) {
                socket.emit('provNotice', {
                    title: 'Alerta de Traspaso Provicional',
                    message: `El Traspaso está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
            if (inventory.tramitesSalidaAutonal.provServicioFueraBogota) {
                socket.emit('provNotice', {
                    title: 'Alerta de Servicio Fuera de Bogotá Provicional',
                    message: `El Servicio Fuera de Bogotá está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
            if (inventory.tramitesSalidaAutonal.provRetefuenteS) {
                socket.emit('provNotice', {
                    title: 'Alerta de Retefuente Provicional',
                    message: `La Retefuente está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
            if (inventory.tramitesSalidaAutonal.provLevantaPrenda) {
                socket.emit('provNotice', {
                    title: 'Alerta de Levantamiento de Prenda Provicional',
                    message: `El Levantamiento de Prenda está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
            if (inventory.tramitesSalidaAutonal.provGarantiaMobiliaria) {
                socket.emit('provNotice', {
                    title: 'Alerta de Garantia Mobiliaria Provicional',
                    message: `La Garantia Mobiliaria está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
            if (inventory.tramitesSalidaAutonal.provImpuestos) {
                socket.emit('provNotice', {
                    title: 'Alerta de Impuestos Provicional',
                    message: `Los Impuestos está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
            if (inventory.tramitesSalidaAutonal.provLiquidacionImpuesto) {
                socket.emit('provNotice', {
                    title: 'Alerta de Liquidación de Impuesto Provicional',
                    message: `La Liquidación de Impuesto está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
            if (inventory.tramitesSalidaAutonal.provDerechosMunicipales) {
                socket.emit('provNotice', {
                    title: 'Alerta de Derechos Municipales Provicional',
                    message: `Los Derechos Municipales está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
            if (inventory.tramitesSalidaAutonal.provSoat) {
                socket.emit('provNotice', {
                    title: 'Alerta de SOAT Provicional',
                    message: `El SOAT está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
            if (inventory.tramitesSalidaAutonal.provRevTecnoMeca) {
                socket.emit('provNotice', {
                    title: 'Alerta de Rev. TecnoMecánica Provicional',
                    message: `La Rev. TecnoMecánica está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
            if (inventory.tramitesSalidaAutonal.provComparendos) {
                socket.emit('provNotice', {
                    title: 'Alerta de Comparendos Provicional',
                    message: `Los Comparendos está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
            if (inventory.tramitesSalidaAutonal.provDocumentosIniciales) {
                socket.emit('provNotice', {
                    title: 'Alerta de Documentos Iniciales Provicional',
                    message: `Los Documentos Iniciales está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
            if (inventory.tramitesSalidaAutonal.provDocumentacion) {
                socket.emit('provNotice', {
                    title: 'Alerta de Documentación Provicional',
                    message: `La Documentación está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
            if (inventory.tramitesSalidaAutonal.provManifiestoFactura) {
                socket.emit('provNotice', {
                    title: 'Alerta de Manifiesto y Factura Provicional',
                    message: `El Manifiesto y Factura está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
            if (inventory.tramitesSalidaAutonal.provCtci) {
                socket.emit('provNotice', {
                    title: 'Alerta de CT. CI Provicional',
                    message: `La CT. CI está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
            if (inventory.tramitesSalidaAutonal.provSemaforizacion) {
                socket.emit('provNotice', {
                    title: 'Alerta de Semaforización Provicional',
                    message: `La Semaforización está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
            if (inventory.tramitesSalidaAutonal.provImpuestoAnoActual) {
                socket.emit('provNotice', {
                    title: 'Alerta de Impuesto Año Actual Provicional',
                    message: `El Impuesto Año Actual está provicional para el vehículo ${inventory.vehiculo.marca} con placa ${inventory.vehiculo.placa}.`,
                    vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                });
            }
        });
    } catch (error) {
        console.error(error);
        socket.emit('errorCheckingProv', { error: 'Error al verificar alertas de provisión' });
    }
};

function verificarYNotificar(inventario, socket) {
    if (inventario.filtroBaseDatos.estadoInventario !== 'VENDIDO' && inventario.filtroBaseDatos.estadoInventario !== 'TERMINADO') {
        const hoy = new Date();

        verificarFecha(inventario.documentosValoresIniciales.fechaFinSoat, 'SOAT', inventario.vehiculo.placa, inventario.vehiculo.marca, inventario.vehiculo.linea, inventario.vehiculo.version, hoy, socket);
        verificarFecha(inventario.deudaFinanciera.fechaLimitePagoDeudaFinan, 'Pago Deuda Financiera', inventario.vehiculo.placa, inventario.vehiculo.marca, inventario.vehiculo.linea, inventario.vehiculo.version, hoy, socket);

        if (inventario.documentosValoresIniciales.estadoTecnicoMecanica === 'VIGENTE') {
            verificarFecha(inventario.documentosValoresIniciales.dateTecnicoMecanica, 'Técnico-Mecánica', inventario.vehiculo.placa, inventario.vehiculo.marca, inventario.vehiculo.linea, inventario.vehiculo.version, hoy, socket);
        }

        // Verificación de fecha de creación para "ASIGNADO EN INICIALES"
        if (inventario.filtroBaseDatos.estadoInventario === 'ASIGNADO EN INICIALES') {
            const diasDesdeCreacion = calcularDiasRestantes(new Date(inventario.createdAt), hoy);
            if (diasDesdeCreacion >= DIFERENCIA_DIAS_NOTIFICACION) {
                socket.emit('expirationNotice', {
                    title: 'Estado ASIGNADO EN INICIALES prolongado',
                    message: `El inventario del vehículo ${inventario.vehiculo.marca} con placa ${inventario.vehiculo.placa} lleva ${diasDesdeCreacion} días en estado ASIGNADO EN INICIALES.`,
                    vehiculoId: `${inventario.vehiculo.marca} ${inventario.vehiculo.linea} ${inventario.vehiculo.version}: ${inventario.vehiculo.placa}`
                });
            }
        }
    }
}

function verificarFecha(fecha, tipo, placa, marca, linea, version, hoy, socket) {
    const fechaPorDefecto = new Date('1970-01-01T00:00:00.000+00:00');
    const fechaVencimiento = new Date(fecha);
    if (fechaVencimiento.getTime() === fechaPorDefecto.getTime()) {
        return;
    }

    const diasRestantes = calcularDiasRestantes(hoy, fechaVencimiento);
    if (diasRestantes <= DIFERENCIA_DIAS_NOTIFICACION) {
        socket.emit('expirationNotice', {
            title: `Vencimiento de ${tipo}`,
            message: `Quedan ${diasRestantes} días para el vencimiento del ${tipo} del vehículo ${marca} con placa ${placa}`,
            vehiculoId: marca + ' ' + linea + ' ' + version + ': ' + placa
        });
    }
}

function calcularDiasRestantes(fechaInicio, fechaFin) {
    const unDiaEnMs = 24 * 60 * 60 * 1000;
    return Math.round((fechaFin - fechaInicio) / unDiaEnMs);
}
