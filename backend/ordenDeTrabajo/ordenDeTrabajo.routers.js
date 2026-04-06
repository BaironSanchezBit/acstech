const Ordenes = require('./ordenDeTrabajo.controller');
const vehiclesController = require('../vehiculos/vehiculos.controller');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = (router) => {
    router.post('/postOrdenes', upload.any(), Ordenes.create);
    router.get('/getOrdenes', Ordenes.getAll);
    router.get('/getOrdenes/:id', Ordenes.getOne);
    router.put('/updateOrdenes/:id', upload.any(), Ordenes.update);
    router.get('/getOrdenes/ordenes/:numeroOrden', Ordenes.getByPlaca);
    router.post('/deleteImage', Ordenes.deleteImage);
    router.post('/uploadImages', upload.any(), Ordenes.uploadImages);
    router.get('/vehicles/ordenes/:placa', vehiclesController.getOrdenByPlaca);
};
