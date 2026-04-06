const Creditos = require('./creditos.controller');
const vehiclesController = require('../vehiculos/vehiculos.controller');

module.exports = (router) => {
    router.post('/postCreditos', Creditos.create);
    router.get('/getCreditos', Creditos.getAll);
    router.get('/getAllCreditos', Creditos.getAllCreditos);
    router.put('/updateCreditos/:id', Creditos.update);
    router.get('/getCreditos/creditos/:solicitudId', Creditos.getByIdCreditos);
    router.delete('/deleteCreditos/:id', Creditos.delete);
    router.get('/vehicles/creditos/:placa', vehiclesController.getCreditosByPlaca);
};