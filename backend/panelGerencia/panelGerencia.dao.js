//const { Carro, FiltrosACS, TablaTipos } = require('./panelGerencia.model.js');
const { TablaTipos } = require('./panelGerencia.model.js');
const { FiltrosACS } = require('./panelGerencia.model.js');
const { Marcas } = require('./panelGerencia.model');
const { Referencias } = require('./panelGerencia.model');
const { Departamentos } = require('./panelGerencia.model');
const { Ciudades } = require('./panelGerencia.model');

const TablaTiposDAO = {
    getAll: async () => {
        return await TablaTipos.getAll();
    },

    getByTipo: async (tipo_negocio) => {
        return await TablaTipos.getByTipo(tipo_negocio);
    },
    
    getTiposPaginados: async (limit, offset) => {
        const rows = await TablaTipos.getTiposPaginados(limit, offset);
        return rows.map(item => ({
            ...item,
            oferta_rapida: parseFloat(item.oferta_rapida).toFixed(1),
            oferta_estandar: parseFloat(item.oferta_estandar).toFixed(1),
            oferta_flexible: parseFloat(item.oferta_flexible).toFixed(1)
        }));
    },

    updateTipos: async (data) => {
        return await TablaTipos.updateTipos(data);
    }
};

const FiltrosACSDAO = {
    // Obtener todos los registros de la tabla filtros_acs
    getAll: async () => {
        return await FiltrosACS.getAll();
    },

    // Obtener un registro específico por id
    getById: async (id) => {
        return await FiltrosACS.getById(id);
    },

    // Crear un nuevo registro en la tabla filtros_acs
    create: async (data) => {
        return await FiltrosACS.create(data);
    },

    // Actualizar un registro existente por id
    update: async (data) => {
        return await FiltrosACS.update(data);
    }
};

const MarcasDAO = {
    // Obtener todos los registros de la tabla marcas
    getAll: async () => {
        return await Marcas.getAll();
    }
};

const ReferenciasDAO = {
    // Obtener todas las referencias de una marca específica por nombre de marca (no por id)
    getByMarca: async (nombreMarca) => {
        return await Referencias.getByMarca(nombreMarca);
    },

    // Modificado para aceptar parámetro de marca opcional
    getAllReferencias: async (marca = null, modelo = null) => {
        return await Referencias.getAllReferencias(marca, modelo);
    },

    getAllTipos: async (modelo = null, marca = null, referencia = null) => {
        return await Referencias.getAllTipos(modelo, marca, referencia);
    },

    // Modificado para aceptar parámetro de modelo opcional
    getAllMarcas: async (modelo = null) => {
        return await Referencias.getAllMarcas(modelo);
    },

    // Obtener todas las referencias
    getAllModelos: async () => {
        return await Referencias.getAllModelos();
    },

    // Actualizar el campo estado en la tabla carro por id
    updateEstado: async (id, estado) => {
        return await Referencias.updateEstado(id, estado);
    },
    // Actualizar el campo estado en la tabla carro por id
    updateTipoNegocio: async (id, tipo_negocio) => {
        return await Referencias.updateTipoNegocio(id, tipo_negocio);
    },
    // Método mejorado para obtener referencias filtradas y paginadas
    getFiltradasPaginadas: async (filtros) => {
        try {
            // Cambia el nombre de la variable para mayor claridad
            const { resultados, total } = await Referencias.getFiltradasPaginadas(filtros);
            
            return {
                resultados: resultados,  // Array de objetos
                total: total             // Número total de registros
            };
        } catch (error) {
            console.error('Error en ReferenciasDAO.getFiltradasPaginadas:', error);
            throw error;
        }
    }
};
const DepartamentosDAO = {
    // Obtener todos los registros de la tabla departamentos
    getAll: async () => {
        return await Departamentos.getAll();
    },

    // Obtener un registro específico por id
    getById: async (id) => {
        return await Departamentos.getById(id);
    }
};
const CiudadesDAO = {
    // Obtener todas las ciudades de un departamento específico
    getByDepartamento: async (id_dep) => {
        return await Ciudades.getByDepartamento(id_dep);
    },

    // Actualizar únicamente el campo ubicaciones por id
    updateUbicaciones: async (id, ubicaciones) => {
        return await Ciudades.updateUbicaciones(id, ubicaciones);
    },

    // Actualizar únicamente el campo placas por id
    updatePlacas: async (id, placas) => {
        return await Ciudades.updatePlacas(id, placas);
    },

    // Actualizar ambos campos ubicaciones y placas por id (opcional)
    updateBooleanFields: async (id, ubicaciones, placas) => {
        return await Ciudades.updateBooleanFields(id, ubicaciones, placas);
    }
};


//module.exports = { CarroDAO, FiltrosACSDAO, TablaTiposDAO };
module.exports = { TablaTiposDAO, FiltrosACSDAO, MarcasDAO, ReferenciasDAO, DepartamentosDAO, CiudadesDAO };