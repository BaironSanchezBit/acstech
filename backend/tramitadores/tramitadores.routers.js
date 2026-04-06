const Tramitadores = require('./tramitadores.controller');

module.exports = (router) => {
    router.post('/postTramitadores', Tramitadores.create);
    router.get('/getTramitadores', Tramitadores.getAll);
    router.put('/updateTramitadores/:id', Tramitadores.update);
    router.get('/getCTramitadores/tramitador/:id', Tramitadores.getByIdInventory);
    router.delete('/deleteTramitadores/:id', Tramitadores.delete);
};