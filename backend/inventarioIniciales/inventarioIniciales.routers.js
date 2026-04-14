const preinventories = require('./inventarioIniciales.controller');
const vehiclesController = require('../vehiculos/vehiculos.controller');

module.exports = (router) => {
    router.post('/preinventories', preinventories.create);
    router.put('/updatePreInventoryPhotos/:id', preinventories.updatePhotos);
    router.delete('/deletePreInventoryPhoto', preinventories.deletePhoto);
    router.get('/getpreinventoriesAll', preinventories.getAll);
    router.get('/getpreinventoriesAllPopulated', preinventories.getAllPopulated);
    router.put('/updatepreinventories/:id', preinventories.update);
    router.post('/preinventarios/addActivityLog/:id', preinventories.addActivityLog);
    router.get('/getpreinventories/idpreinventories/:idInventory', preinventories.getByIdInventory);
    router.get('/vehicles/preinventarios/:placa', vehiclesController.getPreInventariosByPlaca);

};
//Prueba GitHUb
//Prueba GitHUb 2