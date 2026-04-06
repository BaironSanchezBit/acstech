const Cotizaciones = require('./cotizaciones.controller');
const vehiclesController = require('../vehiculos/vehiculos.controller');

module.exports = (router) => {
    router.post('/postCotizaciones', Cotizaciones.create);
    router.get('/getCotizaciones', Cotizaciones.getAll);
    router.get('/getCotizaciones/:id', Cotizaciones.getOne);
    router.put('/updateCotizaciones/:id', Cotizaciones.update);
    router.get('/getCotizaciones/cotizacion/:noCotizacion', Cotizaciones.getByPlaca);
    router.put('/agregarCotizaciones/:id', Cotizaciones.updateInventory);
    router.get('/vehicles/cotizaciones/:placa', vehiclesController.getCotizacionesByPlaca);
};