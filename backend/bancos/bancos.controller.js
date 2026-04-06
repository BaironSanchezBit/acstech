const Bancos = require('./bancos.dao');


exports.create = async (req, res) => {
    const bancos = new Bancos(req.body);
    try {
        await bancos.save();
        res.status(201).send(bancos);
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
        const bancos = await Bancos.find({});
        res.status(200).send(bancos);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getByIdInventory = async (req, res) => {
    try {
        const bancos = await Bancos.findOne({ id: req.params.id });
        if (!bancos) {
            return res.status(404).send();
        }
        res.send(bancos);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getOne = async (req, res) => {
    try {
        const bancos = await Bancos.findById(req.params.id);
        if (!bancos) {
            return res.status(404).send();
        }
        res.send(bancos);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.update = async (req, res) => {
    try {
        const bancos = await Bancos.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!bancos) {
            return res.status(404).send();
        }
        res.send(bancos);
    } catch (error) {
        res.status(400).send(error);
    }
};


exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await Bancos.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Banco not found' });
        }

        res.status(200).json({ success: true, message: 'Banco deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};