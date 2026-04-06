const Vehicles = require('./vehiculos.dao');
const Cliente = require('../clientes/clientes.dao');
const Cotizaciones = require('../cotizaciones/cotizaciones.dao');
const Inventarios = require('../inventarios/inventarios.dao');
const PreInventarios = require('../inventarioIniciales/inventarioIniciales.dao');
const Tramites = require('../tramites/tramites.dao');
const Creditos = require('../creditos/creditos.dao');
const OrderDeTrabajo = require('../ordenDeTrabajo/ordenDeTrabajo.dao');
const { uploadFileToS3, deleteFileFromS3 } = require('../s3');

exports.create = async (req, res) => {
    try {
        const existingVehicle = await Vehicles.findOne({ placa: req.body.placa });

        if (existingVehicle) {
            return res.status(409).send({ message: 'La placa ya existe en la base de datos.' });
        }

        let imageUrl = null;
        if (req.file) {
            const uploadResult = await uploadFileToS3(req.file);
            imageUrl = uploadResult.Location;
        }

        const newVehicle = new Vehicles({
            ...req.body,
            imagenVehiculo: imageUrl,
        });

        await newVehicle.save();
        res.status(201).send(newVehicle);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.getAll = async (req, res) => {
    try {
        const filter = req.query.includeArchived === 'true' ? {} : { archivado: { $ne: true } };
        if (req.query.page) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const skip = (page - 1) * limit;
            const [vehicles, total] = await Promise.all([
                Vehicles.find(filter).sort({ _id: -1 }).skip(skip).limit(limit),
                Vehicles.countDocuments(filter)
            ]);
            return res.status(200).send({ data: vehicles, total, page, pages: Math.ceil(total / limit) });
        }
        const vehicles = await Vehicles.find(filter);
        res.status(200).send(vehicles);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getAllPlaca = async (req, res) => {
    try {
        const vehicles = await Vehicles.find({}).select('placa -_id');
        const placa = vehicles.map(vehiculo => vehiculo.placa);
        res.status(200).send(placa);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getAllMarca = async (req, res) => {
    try {
        const vehicles = await Vehicles.find({}).select('marca createdAt -_id');
        const results = vehicles.map(vehiculo => {
            return {
                marca: vehiculo.marca,
                createdAt: vehiculo.createdAt
            };
        });
        res.status(200).send(results);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getByPlaca = async (req, res) => {
    try {
        const vehicle = await Vehicles.findOne({ placa: req.params.placa });
        if (!vehicle) {
            return res.status(404).send();
        }
        res.send(vehicle);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getOne = async (req, res) => {
    try {
        const vehicles = await Vehicles.findById(req.params.id);
        if (!vehicles) {
            return res.status(404).send();
        }
        res.send(vehicles);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.update = async (req, res) => {
    try {
        const vehicleId = req.params.id;
        const existingVehicle = await Vehicles.findById(vehicleId);

        if (!existingVehicle) {
            return res.status(404).send('Vehículo no encontrado.');
        }

        const oldImageUrl = existingVehicle.imagenVehiculo;

        let imageUrl = oldImageUrl;

        if (req.file) {
            if (oldImageUrl) {
                try {
                    await deleteFileFromS3(oldImageUrl);
                } catch (deleteErr) {
                    console.error('Error eliminando foto anterior:', deleteErr.message);
                }
            }

            const uploadResult = await uploadFileToS3(req.file);
            imageUrl = uploadResult.Location;
        }

        const updatedData = {
            ...req.body,
            imagenVehiculo: imageUrl
        };

        const updatedVehicle = await Vehicles.findByIdAndUpdate(vehicleId, updatedData, {
            new: true,
            runValidators: true
        });

        res.send(updatedVehicle);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.updateInventory = async (req, res) => {
    const { vehiculoId } = req.params;
    const { inventoryId } = req.body;

    try {
        // Solo aceptar IDs numericos (max 6 chars), rechazar ObjectIds
        const cleanId = String(inventoryId);
        if (cleanId.length > 6) {
            return res.status(200).send({ message: 'ObjectId ignorado, solo se aceptan inventoryId numericos' });
        }

        const vehicle = await Vehicles.findById(vehiculoId);

        if (!vehicle) {
            return res.status(404).send('Vehículo no encontrado.');
        }

        if (!vehicle.inventarios.includes(cleanId)) {
            vehicle.inventarios.push(cleanId);
            await vehicle.save();
        }

        res.status(200).send(vehicle);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

exports.updateCotizaciones = async (req, res) => {
    const { vehiculoId } = req.params;
    const { noCotizacion } = req.body;

    try {
        const vehicle = await Vehicles.findById(vehiculoId);

        if (!vehicle) {
            return res.status(404).send('Vehículo no encontrado.');
        }

        if (!vehicle.cotizaciones.includes(noCotizacion)) {
            vehicle.cotizaciones.push(noCotizacion);
            await vehicle.save();
        }

        res.status(200).send(vehicle);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

exports.updateCreditos = async (req, res) => {
    const { vehiculoId } = req.params;
    const { numeroSolicitud } = req.body;

    try {
        const vehicle = await Vehicles.findById(vehiculoId);

        if (!vehicle) {
            return res.status(404).send('Vehículo no encontrado.');
        }

        if (!vehicle.creditos.includes(numeroSolicitud)) {
            vehicle.creditos.push(numeroSolicitud);
            await vehicle.save();
        }

        res.status(200).send(vehicle);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

exports.updateTramites = async (req, res) => {

    const { vehiculoId } = req.params;
    const { numeroInventario } = req.body;

    try {
        const vehicle = await Vehicles.findById(vehiculoId);

        if (!vehicle) {
            return res.status(404).send('Vehículo no encontrado.');
        }

        if (!vehicle.tramites.includes(numeroInventario)) {
            vehicle.tramites.push(numeroInventario);
            await vehicle.save();
        }

        res.status(200).send(vehicle);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

exports.getCotizacionesByPlaca = async (req, res) => {
    try {
        const placa = req.params.placa;

        const vehiculo = await Vehicles.findOne({ placa: placa });
        if (!vehiculo) {
            return res.status(404).send({ message: 'Vehículo no encontrado' });
        }

        const cotizaciones = await Cotizaciones.find({ vehiculo: vehiculo._id })
            .populate({
                path: 'vehiculo',
                select: 'marca linea'
            });

        const resultado = cotizaciones.map(cotizacion => ({
            noCotizacion: cotizacion.noCotizacion,
            nombre: cotizacion.nombre,
            marcaVehiculo: cotizacion.vehiculo?.marca,
            lineaVehiculo: cotizacion.vehiculo?.linea,
            totalNegocio: cotizacion.totalNegocio
        }));

        res.status(200).json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al buscar cotizaciones por placa de vehículo' });
    }
};

exports.getInventariosByPlaca = async (req, res) => {
    try {
        const placa = req.params.placa;

        const vehiculo = await Vehicles.findOne({ placa: placa });
        if (!vehiculo) {
            return res.status(404).send({ message: 'Vehículo no encontrado' });
        }

        const inventarios = await Inventarios.find({ vehiculo: vehiculo._id })
            .populate({
                path: 'cliente',
                select: 'primerNombre primerApellido numeroIdentificacion'
            })

        const resultado = inventarios.map(inventario => ({
            inventoryId: inventario.inventoryId,
            createdAt: inventario.createdAt,
            primerNombreCliente: inventario.cliente?.primerNombre,
            primerApellidoCliente: inventario.cliente?.primerApellido,
            numeroIdentificacionCliente: inventario.cliente?.numeroIdentificacion,
        }));

        res.status(200).json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al buscar cotizaciones por placa de vehículo' });
    }
};

exports.getPreInventariosByPlaca = async (req, res) => {
    try {
        const placa = req.params.placa;

        const vehiculo = await Vehicles.findOne({ placa: placa });
        if (!vehiculo) {
            return res.status(404).send({ message: 'Vehículo no encontrado' });
        }

        const preinventarios = await PreInventarios.find({ vehiculo: vehiculo._id })
            .populate({
                path: 'cliente',
                select: 'primerNombre primerApellido numeroIdentificacion'
            })

        const resultado = preinventarios.map(inventario => ({
            _id: inventario._id,
            inventoryId: inventario.inventoryId,
            createdAt: inventario.createdAt,
            primerNombreCliente: inventario.cliente?.primerNombre,
            primerApellidoCliente: inventario.cliente?.primerApellido,
            numeroIdentificacionCliente: inventario.cliente?.numeroIdentificacion,
        }));

        res.status(200).json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al buscar cotizaciones por placa de vehículo' });
    }
};

exports.getTramitesByPlaca = async (req, res) => {
    try {
        const placa = req.params.placa;

        const vehiculo = await Vehicles.findOne({ placa: placa });
        if (!vehiculo) {
            return res.status(404).send({ message: 'Vehículo no encontrado' });
        }

        const tramites = await Tramites.find({ vehiculo: vehiculo._id })
            .populate({
                path: 'cliente',
                select: 'primerNombre primerApellido'
            })

        const resultado = tramites.map(tramite => ({
            numeroInventario: tramite.numeroInventario,
            createdAt: tramite.createdAt,
            estadoTramite: tramite.estadoTramite,
            primerNombreCliente: tramite.cliente?.primerNombre,
            primerApellidoCliente: tramite.cliente?.primerApellido,
        }));

        res.status(200).json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al buscar tramites por placa de vehículo' });
    }
};

exports.getCreditosByPlaca = async (req, res) => {
    try {
        const placa = req.params.placa;

        const vehiculo = await Vehicles.findOne({ placa: placa });
        if (!vehiculo) {
            return res.status(404).send({ message: 'Vehículo no encontrado' });
        }

        const creditos = await Creditos.find({ vehiculo: vehiculo._id })
            .populate({
                path: 'cliente',
                select: 'primerNombre primerApellido'
            })

        const resultado = creditos.map(credito => ({
            numeroSolicitud: credito.numeroSolicitud,
            createdAt: credito.createdAt,
            primerNombreCliente: credito.cliente?.primerNombre,
            primerApellidoCliente: credito.cliente?.primerApellido,
            nombreBanco: credito.nombreBanco,
            valorSolicitado: credito.valorSolicitado
        }));

        res.status(200).json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al buscar creditos por placa de vehículo' });
    }
};

exports.getOrdenByPlaca = async (req, res) => {
    try {
        const placa = req.params.placa;
        const vehiculo = await Vehicles.findOne({ placa: placa });
        if (!vehiculo) {
            return res.status(404).send({ message: 'Vehículo no encontrado' });
        }
        const ordenDeTrabajo = await OrderDeTrabajo.find({ vehiculo: vehiculo._id})
            .populate({
                path: 'vehiculo',
                select: 'marca linea version'
            }).populate({
                path: 'cliente',
                select: 'primerNombre segundoNombre primerApellido segundoApellido numeroIdentificacion'
            });
        const resultado = ordenDeTrabajo.map(orden => ({
            numeroOrden: orden.numeroOrden,
            createdAt: orden.createdAt,
            vehiculo: orden.vehiculo?.marca + ' ' + orden.vehiculo?.linea + ' ' + orden.vehiculo?.version,
            cliente: orden.cliente,
            estado: orden.estado,
        }));
        res.status(200).json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al buscar ordenes de trabajo por placa de vehículo' });
    }
};

exports.checkObservations = async (socketInstance) => {
    try {
        const vehicles = await Vehicles.find({});
        vehicles.forEach(vehicle => {
            if (vehicle.observaciones && vehicle.observaciones.trim() !== '') {
                socketInstance.emit('observationNotice', {
                    title: 'Observación del Vehículo',
                    message: `El vehículo ${vehicle.marca} con placa ${vehicle.placa} tiene la siguiente observación: ${vehicle.observaciones}.`,
                    vehiculoId: vehicle.marca + ' ' + vehicle.linea + ' ' + vehicle.version + ': ' + vehicle.placa
                });
            }
        });
    } catch (error) {
        console.error(error);
    }
};