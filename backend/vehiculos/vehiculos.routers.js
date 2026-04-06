const Vehicles = require('./vehiculos.controller');
const { upload } = require('../s3');

module.exports = (router) => {
    router.post('/postVehicles', upload.single('imagenVehiculo'), Vehicles.create);
    router.get('/getVehicles', Vehicles.getAll);
    router.get('/getAllPlaca', Vehicles.getAllPlaca);
    router.get('/getAllMarca', Vehicles.getAllMarca);
    router.get('/getVehicles/:id', Vehicles.getOne);
    router.put('/updateVehicles/:id', upload.single('imagenVehiculo'), Vehicles.update);
    router.get('/getVehicles/placa/:placa', Vehicles.getByPlaca);
    router.put('/agregarInventario/:vehiculoId', Vehicles.updateInventory);
    router.put('/agregarCotizacion/:vehiculoId', Vehicles.updateCotizaciones);
    router.put('/agregarCredito/:vehiculoId', Vehicles.updateCreditos);
    router.put('/agregarTramite/:vehiculoId', Vehicles.updateTramites);
    // checkObservations es un handler de WebSocket, no HTTP (se llama desde socket.js)
    // router.get('/checkObservations', Vehicles.checkObservations);
};