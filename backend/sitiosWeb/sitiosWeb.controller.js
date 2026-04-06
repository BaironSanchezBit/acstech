const SitioWeb = require('./sitiosWeb.dao');

exports.create = async (req, res) => {
    const sitioWeb = new SitioWeb(req.body);
    try {
        await sitioWeb.save();
        res.status(201).send(sitioWeb);
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
        const sitioWeb = await SitioWeb.find({});
        res.status(200).send(sitioWeb);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getWebsiteByName = async (req, res) => {
    try {
        const sitioWeb = await SitioWeb.findOne({ id: req.params.id });
        if (!sitioWeb) {
            return res.status(404).send();
        }
        res.send(sitioWeb);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getWebsiteById = async (req, res) => {
    try {
        const sitioWeb = await SitioWeb.findOne({ id: req.params.id });
        if (!sitioWeb) {
            return res.status(404).send();
        }
        res.send(sitioWeb);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getOne = async (req, res) => {
    try {
        const sitioWeb = await SitioWeb.findById(req.params.id);
        if (!sitioWeb) {
            return res.status(404).send();
        }
        res.send(sitioWeb);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.update = async (req, res) => {
    try {
        const sitioWeb = await SitioWeb.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!sitioWeb) {
            return res.status(404).send();
        }
        res.send(sitioWeb);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.delete = async (req, res) => {
    try {
        const sitioWeb = await SitioWeb.findByIdAndDelete(req.params.id);
        if (!sitioWeb) {
            return res.status(404).send();
        }
        res.send(sitioWeb);
    } catch (error) {
        res.status(500).send(error);
    }
};