const CostosTramites = require('./costosTramites.dao');

exports.create = async (req, res) => {
    const costosTramite = new CostosTramites(req.body);
    try {
        await costosTramite.save();
        res.status(201).send(costosTramite);
    } catch (error) {
        res.status(400).send(error);
    }
};

/*
exports.create = async (req, res) => {
    try {
        const costosTramitesArray = req.body; // Asegúrate de que esto sea un array

        for (const item of costosTramitesArray) {
            const costosTramite = new CostosTramites(item);
            await costosTramite.save();
        }

        res.status(201).send('Todos los costos de trámites han sido creados exitosamente');
    } catch (error) {
        res.status(400).send(error);
    }
};
*/

exports.getAll = async (req, res) => {
    try {
        const costosTramite = await CostosTramites.find({});
        res.status(200).send(costosTramite);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getByIdInventory = async (req, res) => {
    try {
        const costosTramite = await CostosTramites.findOne({ id: req.params.id });
        if (!costosTramite) {
            return res.status(404).send();
        }
        res.send(costosTramite);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getOne = async (req, res) => {
    try {
        const costosTramite = await CostosTramites.findById(req.params.id);
        if (!costosTramite) {
            return res.status(404).send();
        }
        res.send(costosTramite);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.update = async (req, res) => {
    try {
        const costosTramite = await CostosTramites.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!costosTramite) {
            return res.status(404).send();
        }
        res.send(costosTramite);
    } catch (error) {
        res.status(400).send(error);
    }
};