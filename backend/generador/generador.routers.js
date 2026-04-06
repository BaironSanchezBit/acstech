const Generator = require('./generador.controller');

module.exports = (router) => {
    router.post('/create-folder', Generator.createFolder);

    //router.post('/contrato-compra2', Generator.contratoCompraPrueba);
    router.post('/funt-natural', Generator.funtNatural);
    router.post('/funt-venta', Generator.funtVenta);
    router.post('/mandato-natural', Generator.contratoMandatoNatural);
    router.post('/mandato-juridica', Generator.contratoMandatoJuridica);
    router.post('/contrato-compraventa', Generator.contratoCompraVenta);

    router.post('/acta-recepcion', Generator.actaRecepcion);
    router.post('/generar-cotizacion', Generator.cotizacion);
    router.post('/liquidacion-compra', Generator.liquidacionCompra);
    router.post('/transito-adquisicion', Generator.transitoAdquisicion);
    router.post('/liquidacion-venta', Generator.liquidacionVenta);
    router.post('/tramites-salida', Generator.tramitesSalida);
    router.post('/cruce-documental', Generator.DocCruceDocumental);
    router.post('/ordenTrabajo', Generator.ordenTrabajo);

    // ADQUISICIÓN NUEVO
    router.post('/contrato-mandato-repre', Generator.contratoMandatoRepre);
    router.post('/proceso-iniciales', Generator.procesoIniciales);

    // ADQUISICIÓN NUEVO
    router.post('/orden-compra', Generator.ordenCompra);
    router.post('/acta-entrega', Generator.actaEntrega);
};
