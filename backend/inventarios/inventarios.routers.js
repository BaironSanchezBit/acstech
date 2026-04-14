const Inventories = require('./inventarios.controller');
const vehiclesController = require('../vehiculos/vehiculos.controller');

module.exports = (router) => {
    router.post('/postInventories', Inventories.create);
    router.put('/updateInventoryPhotos/:id', Inventories.updatePhotos);
    router.post('/updateMondayCom', Inventories.updateMondayCom);
    router.delete('/deleteInventoryPhoto', Inventories.deletePhoto);
    router.get('/getInventoriesAll', Inventories.getAll);
    /* se borro: router.get('/getInventoriesAllPrueba:', Inventories.getAllPrueba); */
    router.post('/inventories/addActivityLog/:id', Inventories.addActivityLog);
    router.put('/updateInventories/:id', Inventories.update);
    router.get('/getInventories/idInventories/:idInventory', Inventories.getByIdInventory);
    router.get('/vehicles/inventarios/:placa', vehiclesController.getInventariosByPlaca);
    router.get('/checkSoatExpiration', Inventories.checkExpirations);
    router.put('/updateInfoExtra/:id', Inventories.updateInfoExtra);
    router.post('/inventories/migrate/:id', Inventories.migratePreInventoryToInventory);
    router.put('/updateSpecificFields/:id', Inventories.updateSpecificFields);

    /*Nuevas rutas 17/02/2025 contar total de datos en la BD*/
    router.get('/getInventoriesAllPopulated', Inventories.getAllPopulated);
    router.get('/getInventoriesCount', Inventories.getAllCount);
    router.get("/getInventoriesByPage", Inventories.getInventoriesByPage);
    router.get("/getInventoriesByPageF", Inventories.getInventoriesByPageF);

};