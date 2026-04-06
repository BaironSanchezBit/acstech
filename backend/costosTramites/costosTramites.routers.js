const CostosTramites = require('./costosTramites.controller');

module.exports = (router) => {
    router.post('/postCostosTramites', CostosTramites.create);
    router.get('/getCostosTramites', CostosTramites.getAll);
    router.put('/updateCostosTramites/:id', CostosTramites.update);
    router.get('/getCostosTramites/costosTramites/:id', CostosTramites.getByIdInventory);
};