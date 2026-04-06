const Comisiones = require('./comisiones.dao');

exports.create = async (req, res) => {
    const comisiones = new Comisiones(req.body);
    try {
        await comisiones.save();
        res.status(201).send(comisiones);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.getAll = async (req, res) => {
    try {
        const comisiones = await Comisiones.find({});
        res.status(200).send(comisiones);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getByName = async (req, res) => {
    try {
        const comisiones = await Comisiones.findOne({ name: req.params.name });
        if (!comisiones) {
            return res.status(404).send();
        }
        res.send(comisiones);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getOne = async (req, res) => {
    try {
        const comisiones = await Comisiones.findById(req.params.id);
        if (!comisiones) {
            return res.status(404).send();
        }
        res.send(comisiones);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.update = async (req, res) => {
    try {
        const comisiones = await Comisiones.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!comisiones) {
            return res.status(404).send();
        }
        res.send(comisiones);
    } catch (error) {
        res.status(400).send(error);
    }
};