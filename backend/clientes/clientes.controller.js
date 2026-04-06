const Clients = require('./clientes.dao');
// Monday.com deshabilitado - servicios cloud ya no activos (2026-03-20)
// const mondaySdk = require("monday-sdk-js");
// const monday = mondaySdk();
// monday.setToken(process.env.MONDAY_API_KEY);

exports.create = async (req, res) => {
    try {
        const { numeroIdentificacion } = req.body;
        const existingClient = await Clients.findOne({ numeroIdentificacion });

        if (existingClient) {
            return res.status(409).send({ message: 'El número de identificación ya existe en la base de datos.' });
        }

        const newClient = new Clients(req.body);
        await newClient.save();

        // Monday.com deshabilitado - servicio cloud ya no activo

        res.status(201).send(newClient);
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
        if (req.query.page) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const skip = (page - 1) * limit;
            const [clients, total] = await Promise.all([
                Clients.find({}).sort({ _id: -1 }).skip(skip).limit(limit),
                Clients.countDocuments({})
            ]);
            return res.status(200).send({ data: clients, total, page, pages: Math.ceil(total / limit) });
        }
        const clients = await Clients.find({});
        res.status(200).send(clients);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getAllNumerosIdent = async (req, res) => {
    try {
        const clients = await Clients.find({}).select('numeroIdentificacion -_id');
        const numerosIdentificacion = clients.map(client => client.numeroIdentificacion);
        res.status(200).send(numerosIdentificacion);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getClientsByName = async (req, res) => {
    try {
        const searchTerm = req.params.client;
        const regex = new RegExp(searchTerm, 'i');
        const clients = await Clients.find({
            $or: [
                { primerNombre: regex },
                { segundoNombre: regex },
                { primerApellido: regex },
                { segundoApellido: regex }
            ]
        });
        if (!clients || clients.length === 0) {
            return res.status(404).send();
        }
        res.send(clients);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getClientsById = async (req, res) => {
    try {
        const client = await Clients.findOne({ numeroIdentificacion: req.params.client });
        if (!client) {
            return res.status(404).send();
        }
        res.send(client);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getOne = async (req, res) => {
    try {
        const clients = await Clients.findById(req.params.id);
        if (!clients) {
            return res.status(404).send();
        }
        res.send(clients);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.update = async (req, res) => {
    try {
        const clients = await Clients.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!clients) {
            return res.status(404).send();
        }
        res.send(clients);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.delete = async (req, res) => {
    try {
        const clients = await Clients.findByIdAndDelete(req.params.id);
        if (!clients) {
            return res.status(404).send();
        }
        res.send(clients);
    } catch (error) {
        res.status(500).send(error);
    }
};