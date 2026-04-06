const Tramites = require('./tramites.controller');
const vehiclesController = require('../vehiculos/vehiculos.controller');

module.exports = (router) => {
    router.post('/postTramites', Tramites.create);
    router.get('/getTramites', Tramites.getAll);
    router.get('/getAllTramites', Tramites.getAllTramites);
    router.put('/updateTramites/:id', Tramites.update);
    router.get('/getTramites/tramites/:numeroInventario', Tramites.getByIdTramite);
    router.delete('/deleteTramites/:id', Tramites.delete);
    router.get('/vehicles/tramites/:placa', vehiclesController.getTramitesByPlaca);
};