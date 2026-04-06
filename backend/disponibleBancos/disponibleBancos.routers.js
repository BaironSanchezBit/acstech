const Disponible = require('./disponibleBancos.controller');

module.exports = (router) => {
    router.post('/postDisponible', Disponible.create);
    router.get('/getDisponible', Disponible.getAll);
    router.get('/getDisponible/:id', Disponible.getOne);
    router.put('/updateDisponible/:id', Disponible.update);
    router.get('/getDisponibleById/disponible/:id', Disponible.getDisponibleById);
    router.get('/getDisponibleByName/disponible/:id', Disponible.getDisponibleByName);
    router.delete('/deleteDisponible/:id', Disponible.delete);
};