const Tramitadores = require('./tramitadores.dao');


exports.create = async (req, res) => {
    const tramitadores = new Tramitadores(req.body);
    try {
        await tramitadores.save();
        res.status(201).send(tramitadores);
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
        const tramitadores = await Tramitadores.find({});
        res.status(200).send(tramitadores);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getByIdInventory = async (req, res) => {
    try {
        const tramitadores = await Tramitadores.findOne({ id: req.params.id });
        if (!tramitadores) {
            return res.status(404).send();
        }
        res.send(tramitadores);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getOne = async (req, res) => {
    try {
        const tramitadores = await Tramitadores.findById(req.params.id);
        if (!tramitadores) {
            return res.status(404).send();
        }
        res.send(tramitadores);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.update = async (req, res) => {
    try {
        const tramitadores = await Tramitadores.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!tramitadores) {
            return res.status(404).send();
        }
        res.send(tramitadores);
    } catch (error) {
        res.status(400).send(error);
    }
};


exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await Tramitadores.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Tramitador not found' });
        }

        res.status(200).json({ success: true, message: 'Tramitador deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};