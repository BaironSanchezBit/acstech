const Cotizaciones = require('./cotizaciones.dao');


exports.create = async (req, res) => {
    const existingCotizacion = await Cotizaciones.findOne({ noCotizacion: req.body.noCotizacion });

    if (existingCotizacion) {
        return res.status(409).send({ message: 'La cotización ya existe en la base de datos.' });
    }

    const newCotizacion = new Cotizaciones(req.body);

    try {
        await newCotizacion.save();

        res.status(201).send(newCotizacion);
    } catch (error) {
        res.status(400).send(error);
        console.error(error)
    }
};

/*
exports.create = async (req, res) => {
    try {
        const vehiclesarray = req.body;
        
        for (const item of vehiclesarray) {
            const vehicle = new Vehicles(item);
            await vehicle.save();
        }

        res.status(201).send('Todos los vehiculos han sido creados exitosamente');
    } catch (error) {
        res.status(400).send(error);
    }
};
*/
exports.getAll = async (req, res) => {
    try {
        const cotizaciones = await Cotizaciones.find({});
        res.status(200).send(cotizaciones);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getByPlaca = async (req, res) => {
    try {
        const cotizacion = await Cotizaciones.findOne({ noCotizacion: req.params.noCotizacion });
        if (!cotizacion) {
            return res.status(404).send();
        }
        res.send(cotizacion);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getOne = async (req, res) => {
    try {
        const cotizaciones = await Cotizaciones.findById(req.params.id);
        if (!cotizaciones) {
            return res.status(404).send();
        }
        res.send(cotizaciones);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.update = async (req, res) => {
    try {
        const cotizaciones = await Cotizaciones.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!cotizaciones) {
            return res.status(404).send();
        }
        res.send(cotizaciones);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.updateInventory = async (req, res) => {
    const { cotizacionId } = req.params;
    const { inventoryId } = req.body;

    try {
        const cotizacion = await Cotizaciones.findById(cotizacionId);

        if (!cotizacion) {
            return res.status(404).send('Vehículo no encontrado.');
        }

        if (!cotizacion.inventarios.includes(inventoryId)) {
            cotizacion.inventarios.push(inventoryId);
            await cotizacion.save();
        }

        res.status(200).send(cotizacion);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

