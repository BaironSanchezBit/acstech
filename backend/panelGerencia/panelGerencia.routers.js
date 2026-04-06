const panelControlador = require('./panelGerencia.controller');

module.exports = (router) => {
    // Rutas existentes (se mantienen igual)
    router.get('/carros/tablatipos/todos', panelControlador.getTiposAll);
    router.put('/carros/tablatipos/actualizar', panelControlador.updateTipos);

    // Rutas para filtros_acs (se mantienen igual)
    router.get('/filtrosacs/todos', panelControlador.getFiltros);
    router.get('/filtrosacs/:id', panelControlador.getFiltroById);
    router.post('/filtrosacs/crear', panelControlador.createFiltro);
    router.put('/filtrosacs/actualizar', panelControlador.updateFiltro);

    router.get('/marcas', panelControlador.getMarcas); // Ruta para obtener todas las marcas

    // Rutas modificadas para referencias (vehículos)
    router.get('/vehiculos/marca/:nombreMarca', panelControlador.getReferenciasByMarca);
    router.put('/vehiculos/:id/estado', panelControlador.updateEstadoReferencia);
    router.put('/vehiculos/:id/tipo-negocio', panelControlador.updateTipoNegocio);
    
    // Nueva ruta para búsqueda filtrada
    router.get('/vehiculos/paginados', panelControlador.getVehiculosPaginados);
    router.get('/vehiculos/marcas', panelControlador.getAllMarcas);
    router.get('/vehiculos/modelos', panelControlador.getAllModelos);
    router.get('/vehiculos/referencias', panelControlador.getAllReferencias);
    router.get('/vehiculos/tipos', panelControlador.getAllTipos);

    // Rutas existentes (se mantienen igual)
    router.get('/departamentos/todos', panelControlador.getDepartamentos);
    router.get('/departamentos/:id', panelControlador.getDepartamentoById);
    router.get('/ciudades/:id_dep', panelControlador.getCiudadesByDepartamento);
    router.put('/ciudades/:id/ubicaciones', panelControlador.updateUbicaciones);
    router.put('/ciudades/:id/placas', panelControlador.updatePlacas);
};