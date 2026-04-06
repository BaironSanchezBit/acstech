const Comisiones = require('./comisiones.controller');

module.exports = (router) => {
    router.post('/postComisiones', Comisiones.create);
    router.get('/getComisiones', Comisiones.getAll);
    router.get('/getComisiones/:id', Comisiones.getOne);
    router.put('/updateComisiones/:id', Comisiones.update);
    router.get('/getComisiones/name/:name', Comisiones.getByName);
};