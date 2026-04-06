const Bancos = require('./bancos.controller');

module.exports = (router) => {
    router.post('/postBancos', Bancos.create);
    router.get('/getBancos', Bancos.getAll);
    router.put('/updateBancos/:id', Bancos.update);
    router.get('/getBancos/bancos/:id', Bancos.getByIdInventory);
    router.delete('/deleteBancos/:id', Bancos.delete);
};