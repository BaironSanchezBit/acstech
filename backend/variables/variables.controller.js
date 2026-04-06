const Variables = require('./variables.dao');

exports.create = async (req, res) => {
    const variable = new Variables(req.body);
    try {
        await variable.save();
        res.status(201).send(variable);
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
        const variable = await Variables.find({});
        res.status(200).send(variable);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getVariableByName = async (req, res) => {
    try {
        const variable = await Variables.findOne({ nombre: req.params.id });
        if (!variable) {
            return res.status(404).send();
        }
        res.send(variable);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getVariableById = async (req, res) => {
    try {
        const variable = await Variables.findOne({ id: req.params.id });
        if (!variable) {
            return res.status(404).send();
        }
        res.send(variable);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getOne = async (req, res) => {
    try {
        const variable = await Variables.findById(req.params.id);
        if (!variable) {
            return res.status(404).send();
        }
        res.send(variable);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.update = async (req, res) => {
    try {
        const variable = await Variables.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!variable) {
            return res.status(404).send();
        }
        res.send(variable);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.delete = async (req, res) => {
    try {
        const variable = await Variables.findByIdAndDelete(req.params.id);
        if (!variable) {
            return res.status(404).send();
        }
        res.send(variable);
    } catch (error) {
        res.status(500).send(error);
    }
};