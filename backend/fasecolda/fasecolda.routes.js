const express = require('express');
const router = express.Router();
const FasecoldaController = require('./fasecolda.controller');

module.exports = (router) => {
    router.get('/fasecolda/modelos', FasecoldaController.getAllModelos);
    router.get('/fasecolda/marcas', FasecoldaController.getAllMarcas);
    router.get('/fasecolda/marcas/:modelo', FasecoldaController.getMarcasByModelo);
    router.get('/fasecolda/referencias/:modelo/:marca', FasecoldaController.getReferenciasByModeloAndMarca);
    router.get('/fasecolda/detalles/:modelo/:marca/:referencia', FasecoldaController.getDetallesByModeloMarcaReferencia);
};