const CuentaPagarFija = require('./cuentaPagarFija.controller');

module.exports = (router) => {
    router.post('/postCuentaPagarFija', CuentaPagarFija.create);
    router.get('/getCuentasPagarFija', CuentaPagarFija.getAll);
    router.get('/getCuentaPagarFija/:id', CuentaPagarFija.getOne);
    router.put('/updateCuentaPagarFija/:id', CuentaPagarFija.update);
    router.put('/updatePago/:_id', CuentaPagarFija.updatePago);
    router.put('/updatePagoGerencia/:_id', CuentaPagarFija.updatePagoGerencia);
    router.get('/verifyPayments', CuentaPagarFija.generateMonthlyPayments);
};