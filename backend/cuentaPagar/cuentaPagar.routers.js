const CuentasPagar = require('./cuentaPagar.controller');

module.exports = (router) => {
    router.post('/postCuentaPagar', CuentasPagar.create);
    router.get('/getCuentasPagar', CuentasPagar.getAll);
    router.get('/getCuentaPagar/:id', CuentasPagar.getOne);
    router.put('/updateCuentaPagar/:id', CuentasPagar.update);
    router.put('/apruebaCuentaPagar/:id', CuentasPagar.updateApproval);

};