
const Suppliers = require('./proveedores.dao');
// Monday.com deshabilitado - servicios cloud ya no activos (2026-03-20)
// const mondaySdk = require("monday-sdk-js");
// const monday = mondaySdk();
// monday.setToken(process.env.MONDAY_API_KEY);

exports.create = async (req, res) => {
    const suppliers = new Suppliers(req.body);
    try {
        await suppliers.save();

        // Monday.com deshabilitado - servicio cloud ya no activo

        res.status(201).send(suppliers);
    } catch (error) {
        res.status(400).send(error);
    }
};

/*
exports.create = async (req, res) => {
    try {
        const vehiclesarray = req.body;

        console.log(vehiclesarray)
        
        for (const item of vehiclesarray) {
            const vehicle = new Suppliers(item);
            await vehicle.save();
        }

        res.status(201).send('Todos los Suppliers han sido creados exitosamente');
    } catch (error) {
        res.status(400).send(error);
    }
};
*/

exports.getAll = async (req, res) => {
    try {
        const suppliers = await Suppliers.find({});
        res.status(200).send(suppliers);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getByName = async (req, res) => {
    try {
        const suppliers = await Suppliers.findOne({ name: req.params.name });
        if (!suppliers) {
            return res.status(404).send();
        }
        res.send(suppliers);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getOne = async (req, res) => {
    try {
        const suppliers = await Suppliers.findById(req.params.id);
        if (!suppliers) {
            return res.status(404).send();
        }
        res.send(suppliers);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.update = async (req, res) => {
    try {
        const suppliers = await Suppliers.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!suppliers) {
            return res.status(404).send();
        }
        res.send(suppliers);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await Suppliers.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Suppliers not found' });
        }

        res.status(200).json({ success: true, message: 'Suppliers deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};