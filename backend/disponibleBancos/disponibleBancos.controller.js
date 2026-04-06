const DisponibleBancos = require('./disponibleBancos.dao');

exports.create = async (req, res) => {
    const disponible = new DisponibleBancos(req.body);
    try {
        await disponible.save();
        res.status(201).send(disponible);
    } catch (error) {
        res.status(400).send(error);
    }
};


/*
exports.create = async (req, res) => {
    try {
        const costosTramitesArray = req.body;
        
        for (const item of costosTramitesArray) {
            const tramitadores = new Clients(item);
            await tramitadores.save();
        }

        res.status(201).send('Todos los costos de trámites han sido creados exitosamente');
    } catch (error) {
        res.status(400).send(error);
    }
};
*/

exports.getAll = async (req, res) => {
    try {
        const disponible = await DisponibleBancos.find({});
        res.status(200).send(disponible);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getDisponibleByName = async (req, res) => {
    try {
        const disponible = await DisponibleBancos.findOne({ id: req.params.id });
        if (!disponible) {
            return res.status(404).send();
        }
        res.send(disponible);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getDisponibleById = async (req, res) => {
    try {
        const disponible = await DisponibleBancos.findOne({ id: req.params.id });
        if (!disponible) {
            return res.status(404).send();
        }
        res.send(disponible);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getOne = async (req, res) => {
    try {
        const disponible = await DisponibleBancos.findById(req.params.id);
        if (!disponible) {
            return res.status(404).send();
        }
        res.send(disponible);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.update = async (req, res) => {
    try {
        const disponible = await DisponibleBancos.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!disponible) {
            return res.status(404).send();
        }
        res.send(disponible);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.delete = async (req, res) => {
    try {
        const disponible = await DisponibleBancos.findByIdAndDelete(req.params.id);
        if (!disponible) {
            return res.status(404).send();
        }
        res.send(disponible);
    } catch (error) {
        res.status(500).send(error);
    }
};