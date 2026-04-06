const Creditos = require('./creditos.dao');


exports.create = async (req, res) => {
    const creditos = new Creditos(req.body);
    try {
        await creditos.save();
        res.status(201).send(creditos);
    } catch (error) {
        res.status(400).send(error);
    }
};

// exports.create = async (req, res) => {
//     try {
//         const costosTramitesArray = req.body;

//         for (const item of costosTramitesArray) {
//             const tramitadores = new Tramitadores(item);
//             await tramitadores.save();
//         }

//         res.status(201).send('Todos los costos de trámites han sido creados exitosamente');
//     } catch (error) {
//         res.status(400).send(error);
//     }
// };


exports.getAll = async (req, res) => {
    try {
        const creditos = await Creditos.find({});
        res.status(200).send(creditos);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getByIdCreditos = async (req, res) => {
    try {
        const creditos = await Creditos.findOne({ numeroSolicitud: req.params.solicitudId });
        if (!creditos) {
            return res.status(404).send();
        }
        res.send(creditos);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getOne = async (req, res) => {
    try {
        const creditos = await Creditos.findById(req.params.id);
        if (!creditos) {
            return res.status(404).send();
        }
        res.send(creditos);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.update = async (req, res) => {
    try {
        const creditos = await Creditos.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!creditos) {
            return res.status(404).send();
        }
        res.send(creditos);
    } catch (error) {
        res.status(400).send(error);
    }
};


exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await Creditos.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Credito not found' });
        }

        res.status(200).json({ success: true, message: 'Credito deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


exports.getAllCreditos = async (req, res) => {
    try {
        const creditos = await Creditos.find()
            .populate({
                path: 'cliente',
                select: 'primerNombre primerApellido numeroIdentificacion digitoVerificacion'
            })
            .populate({
                path: 'vehiculo',
                select: 'placa marca linea version modelo'
            });

        const resultado = creditos.map(credito => {
            let identificacionCliente = credito.cliente?.numeroIdentificacion;
            if (credito.cliente?.digitoVerificacion) {
                identificacionCliente += `-${credito.cliente?.digitoVerificacion}`;
            }

            return {
                placa: credito.vehiculo?.placa,
                marca: credito.vehiculo?.marca,
                linea: credito.vehiculo?.linea,
                version: credito.vehiculo?.version,
                modelo: credito.vehiculo?.modelo,
                primerNombreCliente: credito.cliente?.primerNombre,
                apellidoCliente: credito.cliente?.primerApellido,
                identificacionCliente: identificacionCliente,
                numeroSolicitud: credito.numeroSolicitud,
                estadoSolicitud: credito.estadoSolicitud,
                createdAt: credito.createdAt
            };
        });

        res.status(200).json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al buscar todos los trámites' });
    }
};
