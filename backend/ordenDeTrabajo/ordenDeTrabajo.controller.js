const mongoose = require('mongoose');
const Ordenes = require('./ordenDeTrabajo.dao');
const Inventarios = require('../inventarios/inventarios.dao');
const { uploadFileToS3, deleteFileFromS3 } = require('../s3');

exports.create = async (req, res) => {
    try {
        const { vehiculo, cliente, estadoOrden, pruebaDeRuta, numeroInventario, modificacion, trabajos } = req.body;

        // Verificar si vehiculo está definido y es un ObjectId válido
        if (!vehiculo || !mongoose.Types.ObjectId.isValid(vehiculo)) {
            return res.status(400).json({ error: "Vehículo es requerido y debe ser un ObjectId válido" });
        }

        const nuevaOrden = new Ordenes({
            vehiculo,
            cliente,
            estadoOrden,
            pruebaDeRuta,
            numeroInventario,
            modificacion: JSON.parse(modificacion),
            trabajos: JSON.parse(trabajos)
        });

        const ordenGuardada = await nuevaOrden.save();
        res.status(201).json(ordenGuardada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteImage = async (req, res) => {
    try {
        const { path: imageUrl, ordenId, trabajoIndex, imageIndex } = req.body;

        if (!imageUrl) {
            return res.status(400).send({ message: 'URL de la imagen no proporcionado' });
        }

        const imageName = imageUrl.split('/').pop();
        await deleteFileFromS3(imageName);

        const orden = await Ordenes.findById(ordenId);
        if (!orden) {
            return res.status(404).send({ message: 'Orden no encontrada' });
        }

        if (orden.trabajos[trabajoIndex] && orden.trabajos[trabajoIndex].imagenes) {
            orden.trabajos[trabajoIndex].imagenes.splice(imageIndex, 1);
        } else {
            return res.status(400).send({ message: 'Trabajo o imagen no encontrados' });
        }

        await orden.save();
        res.status(200).send({ message: 'Imagen eliminada correctamente' });
    } catch (error) {
        res.status(500).send({ message: 'Error al eliminar la imagen' });
    }
};

exports.uploadImages = async (req, res) => {
    try {
        const { ordenId, trabajoIndex } = req.body;
        const files = req.files;

        if (!ordenId || !mongoose.Types.ObjectId.isValid(ordenId)) {
            return res.status(400).json({ error: "Orden de trabajo es requerida y debe ser un ObjectId válido" });
        }

        const orden = await Ordenes.findById(ordenId);
        if (!orden) {
            return res.status(404).json({ error: "Orden de trabajo no encontrada" });
        }

        const uploadedFiles = await Promise.all(files.map(file => uploadFileToS3(file)));
        const imagePaths = uploadedFiles.map(upload => upload.Location);

        if (orden.trabajos[trabajoIndex] && orden.trabajos[trabajoIndex].imagenes) {
            orden.trabajos[trabajoIndex].imagenes.push(...imagePaths);
        } else {
            return res.status(400).json({ error: "Trabajo no encontrado" });
        }

        await orden.save();
        res.status(200).json({ message: 'Imágenes subidas correctamente', nuevasImagenes: imagePaths });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const ordenes = await Ordenes.find({});
        res.status(200).send(ordenes);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getByPlaca = async (req, res) => {
    try {
        const orden = await Ordenes.findOne({ numeroOrden: req.params.numeroOrden }).populate('vehiculo').populate('cliente');
        if (!orden) {
            return res.status(404).send({ message: 'Orden no encontrada.' });
        }

        const inventario = await Inventarios.findOne({ inventoryId: orden.numeroInventario });
        if (inventario) {
            orden.adjuntos = {
                fotosCedulaPropietario: inventario.documentosTraspasos.fotosCedulaPropietario,
                fotosTarjetaPropietario: inventario.documentosTraspasos.fotosTarjetaPropietario,
                fotosSoat: inventario.documentosTraspasos.fotosSoat,
                fotosCertificadoTradicion: inventario.documentosValoresIniciales.fotosCertificadoTradicion,
                fotosEstadoCuentaImpuesto: inventario.documentosValoresIniciales.fotosEstadoCuentaImpuesto,
                fotosSimitPropietario: inventario.documentosValoresIniciales.fotosSimitPropietario,
                fotosLiquidacionDeudaFinanciera: inventario.documentosValoresIniciales.fotosLiquidacionDeudaFinanciera,
                fotosTecnoMecanica: inventario.documentosValoresIniciales.fotosTecnoMecanica,
                fotosManifiestoFactura: inventario.documentosValoresIniciales.fotosManifiestoFactura,
                fotosSoatIniciales: inventario.documentosValoresIniciales.fotosSoatIniciales,
                fotosImpuestoAno: inventario.documentosValoresIniciales.fotosImpuestoAno
            };
        }

        // Asegúrate de convertir a objeto JSON antes de enviar
        const ordenJson = orden.toObject();
        if (inventario) {
            ordenJson.adjuntos = {
                fotosCedulaPropietario: inventario.documentosTraspasos.fotosCedulaPropietario,
                fotosTarjetaPropietario: inventario.documentosTraspasos.fotosTarjetaPropietario,
                fotosSoat: inventario.documentosTraspasos.fotosSoat,
                fotosCertificadoTradicion: inventario.documentosValoresIniciales.fotosCertificadoTradicion,
                fotosEstadoCuentaImpuesto: inventario.documentosValoresIniciales.fotosEstadoCuentaImpuesto,
                fotosSimitPropietario: inventario.documentosValoresIniciales.fotosSimitPropietario,
                fotosLiquidacionDeudaFinanciera: inventario.documentosValoresIniciales.fotosLiquidacionDeudaFinanciera,
                fotosTecnoMecanica: inventario.documentosValoresIniciales.fotosTecnoMecanica,
                fotosManifiestoFactura: inventario.documentosValoresIniciales.fotosManifiestoFactura,
                fotosSoatIniciales: inventario.documentosValoresIniciales.fotosSoatIniciales,
                fotosImpuestoAno: inventario.documentosValoresIniciales.fotosImpuestoAno
            };
        }

        res.send(ordenJson);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener la orden por placa', error: error.message });
    }
};

exports.getOne = async (req, res) => {
    try {
        const ordenes = await Ordenes.findById(req.params.id);
        if (!ordenes) {
            return res.status(404).send();
        }
        res.send(ordenes);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { vehiculo, modificacion, estadoOrden, pruebaDeRuta, numeroInventario, trabajos } = req.body;

    try {
        const updatedOrden = await Ordenes.findById(id);
        if (!updatedOrden) {
            return res.status(404).send({ message: 'Orden no encontrada.' });
        }

        if (modificacion) {
            const nuevaModificacion = JSON.parse(modificacion);
            updatedOrden.modificacion.push(nuevaModificacion[0]);
        }

        if (vehiculo) updatedOrden.vehiculo = vehiculo;
        if (estadoOrden) updatedOrden.estadoOrden = estadoOrden;
        if (pruebaDeRuta) updatedOrden.pruebaDeRuta = pruebaDeRuta;
        if (numeroInventario) updatedOrden.numeroInventario = Number(numeroInventario);

        let trabajosData = [];
        if (trabajos) {
            try {
                trabajosData = JSON.parse(trabajos);
                if (!Array.isArray(trabajosData)) {
                    trabajosData = [trabajosData];
                }
            } catch (error) {
                console.error("Error al parsear trabajos:", error);
                return res.status(400).send({ message: "Formato de trabajos inválido." });
            }
        }

        // Sobrescribir completamente los trabajos
        updatedOrden.trabajos = trabajosData;

        await updatedOrden.save();
        res.status(200).send(updatedOrden);
    } catch (error) {
        res.status(400).send(error);
    }
};