const cron = require('node-cron');
const CuentaPagar = require('./cuentaPagar.dao');

cron.schedule('0 0 1 * *', async () => {
    await generarPagosRecurrentes();
});

exports.create = async (req, res) => {
    const cuentasPagar = new CuentaPagar(req.body);
    try {
        await cuentasPagar.save();
        res.status(201).send(cuentasPagar);
    } catch (error) {
        res.status(400).send(error);
    }
};

/*
exports.create = async (req, res) => {
    try {
        const costosTramitesArray = req.body;
        
        for (const item of costosTramitesArray) {
            const tramitadores = new CuentaPagar(item);
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
        const cuentasPagar = await CuentaPagar.find({});
        res.status(200).send(cuentasPagar);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getCuentaPagarByName = async (req, res) => {
    try {
        const cuentaPagar = await CuentaPagar.findOne({ numeroIdentificacion: req.params.cuentaPagar });
        if (!cuentaPagar) {
            return res.status(404).send();
        }
        res.send(cuentaPagar);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getCuentaPagarById = async (req, res) => {
    try {
        const cuentaPagar = await CuentaPagar.findOne({ id_: req.params.cuentaPagar });
        if (!cuentaPagar) {
            return res.status(404).send();
        }
        res.send(cuentaPagar);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getOne = async (req, res) => {
    try {
        const cuentasPagar = await CuentaPagar.findById(req.params.id);
        if (!cuentasPagar) {
            return res.status(404).send();
        }
        res.send(cuentasPagar);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.update = async (req, res) => {
    try {
        const cuentasPagar = await CuentaPagar.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!cuentasPagar) {
            return res.status(404).send();
        }
        res.send(cuentasPagar);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.updateApproval = async (req, res) => {
    try {
        const { aprueba } = req.body;

        const cuentaPagar = await CuentaPagar.findByIdAndUpdate(
            req.params.id,
            { aprueba: aprueba },
            { new: true, runValidators: true }
        );

        if (!cuentaPagar) {
            return res.status(404).send('Cuenta por pagar no encontrada');
        }

        res.send(cuentaPagar);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.delete = async (req, res) => {
    try {
        const cuentasPagar = await CuentaPagar.findByIdAndDelete(req.params.id);
        if (!cuentasPagar) {
            return res.status(404).send();
        }
        res.send(cuentasPagar);
    } catch (error) {
        res.status(500).send(error);
    }
};