const Fasecolda = require('./fasecolda.model');

exports.getAllModelos = async (req, res) => {
    try {
        const modelos = await Fasecolda.distinct('modelo');
        res.status(200).json(modelos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllMarcas = async (req, res) => {
    try {
        const marcas = await Fasecolda.distinct('marca');
        console.log("Marcas:", marcas.length);
        res.status(200).json(marcas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMarcasByModelo = async (req, res) => {
    const { modelo } = req.params;
    try {
        const marcas = await Fasecolda.find({ modelo }).distinct('marca');
        res.status(200).json(marcas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getReferenciasByModeloAndMarca = async (req, res) => {
    const { modelo, marca } = req.params;
    try {
        const referencias = await Fasecolda.find({ modelo, marca }).distinct('referencia');
        res.status(200).json(referencias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDetallesByModeloMarcaReferencia = async (req, res) => {
    const { modelo, marca, referencia } = req.params;
    try {
        const detalles = await Fasecolda.find({ modelo, marca, referencia });
        res.status(200).json(detalles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
