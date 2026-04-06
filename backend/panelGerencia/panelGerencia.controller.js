const db = require('../config/dbSQL');

const { TablaTiposDAO } = require('./panelGerencia.dao');
const { FiltrosACSDAO } = require('./panelGerencia.dao');
const { MarcasDAO } = require('./panelGerencia.dao');
const { ReferenciasDAO } = require('./panelGerencia.dao'); 
const { DepartamentosDAO } = require('./panelGerencia.dao');
const { CiudadesDAO } = require('./panelGerencia.dao');

exports.getTiposAll = async (req, res) => {
    try {
        // Se pueden recibir parámetros de query para controlar la paginación, por ejemplo
        const limit = req.query.limit ? parseInt(req.query.limit) : 3;
        const offset = req.query.offset ? parseInt(req.query.offset) : 0;
        
        console.log('Consulta getTiposAll con limit:', limit, 'offset:', offset);
        const rows = await TablaTiposDAO.getTiposPaginados(limit, offset);
        //console.log('Respuesta getTiposAll:', rows); // Agregar este log para ver el JSON
        res.status(200).json(rows);
    } catch (error) {
        console.error('❌ Error al obtener los tipos:', error);
        res.status(500).json({ error: error.message, message: 'Error al obtener los tipos.' });
    }
};

exports.updateTipos = async (req, res) => {
    try {
        // Se espera que en el cuerpo de la petición (req.body) se envíen:
        // { tipo_negocio, oferta_rapida, oferta_estandar, oferta_flexible }
        const data = req.body;
        //console.log('Datos para actualizar:', data);
        const updatedRecord = await TablaTiposDAO.updateTipos(data);
        res.status(200).json(updatedRecord);
    } catch (error) {
        console.error('❌ Error al actualizar los tipos:', error);
        res.status(500).json({ error: error.message, message: 'Error al actualizar los tipos.' });
    }
};

exports.getFiltros = async (req, res) => {
    try {
        const filtros = await FiltrosACSDAO.getAll();
        res.status(200).json(filtros);
    } catch (error) {
        console.error('Error al obtener los filtros:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getFiltroById = async (req, res) => {
    try {
        const id = req.params.id;
        const filtro = await FiltrosACSDAO.getById(id);
        if (!filtro) {
            return res.status(404).json({ message: 'Filtro no encontrado' });
        }
        res.status(200).json(filtro);
    } catch (error) {
        console.error('Error al obtener el filtro:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.createFiltro = async (req, res) => {
    try {
        const data = req.body;
        const nuevoFiltro = await FiltrosACSDAO.create(data);
        res.status(201).json(nuevoFiltro);
    } catch (error) {
        console.error('Error al crear el filtro:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateFiltro = async (req, res) => {
    try {
        const data = req.body;
        console.log('Datos para actualizar el filtro:', data);
        const filtroActualizado = await FiltrosACSDAO.update(data);
        res.status(200).json(filtroActualizado);
    } catch (error) {
        console.error('Error al actualizar el filtro:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getMarcas = async (req, res) => {
    try {
        // Llama al método getAll del DAO para obtener todas las marcas
        const marcas = await MarcasDAO.getAll();

        // Devuelve las marcas en la respuesta
        res.status(200).json(marcas);
    } catch (error) {
        console.error('Error al obtener las marcas:', error);
        res.status(500).json({ error: error.message, message: 'Error al obtener las marcas.' });
    }
};

// Obtener todas las referencias de una marca específica por nombre de marca
exports.getReferenciasByMarca = async (req, res) => {
    try {
        const nombreMarca = req.params.nombreMarca; // Cambiado de id_marca a nombreMarca
        const referencias = await ReferenciasDAO.getByMarca(nombreMarca);

        if (!referencias || referencias.length === 0) {
            return res.status(404).json({ 
                message: `No se encontraron vehículos para la marca ${nombreMarca}.` 
            });
        }

        res.status(200).json(referencias);
    } catch (error) {
        console.error('Error al obtener las referencias:', error);
        res.status(500).json({ 
            error: error.message, 
            message: 'Error al obtener los vehículos por marca.' 
        });
    }
};

// Actualizar el estado de un vehículo por ID
exports.updateEstadoReferencia = async (req, res) => {
    try {
        const id = req.params.id;
        const { estado } = req.body;

        // Validaciones
        if (estado === undefined) {
            return res.status(400).json({ message: 'El campo estado es requerido.' });
        }
        if (![0, 1].includes(estado)) {
            return res.status(400).json({ message: 'El valor de estado debe ser 0 o 1.' });
        }

        const result = await ReferenciasDAO.updateEstado(id, estado);
        
        res.status(200).json({
            ...result,
            message: `Estado del vehículo ID ${id} actualizado correctamente.`
        });
    } catch (error) {
        console.error('Error al actualizar el estado del vehículo:', error);
        res.status(500).json({ 
            error: error.message, 
            message: 'Error al actualizar el estado del vehículo.' 
        });
    }
};

// Actualizar el tipo de negocio de un vehículo por ID
exports.updateTipoNegocio = async (req, res) => {

    try {
        const id = req.params.id;
        const { tipo_negocio } = req.body;

        // Validaciones
        if (tipo_negocio === undefined) {
            return res.status(400).json({ message: 'El campo estado es requerido.' });
        }
        if (![1, 2, 3, 4, 5, 6, 7].includes(tipo_negocio)) {
            return res.status(400).json({ message: 'El valor de estado debe ser 1, 2, 3, 4, 5, 6, 7.' });
        }

        const result = await ReferenciasDAO.updateTipoNegocio(id, tipo_negocio);
        
        res.status(200).json({
            ...result,
            message: `Tipo de negocio del vehículo ID ${id} actualizado correctamente.`
        });
    } catch (error) {
        console.error('Error al actualizar el tipo de negocio del vehículo:', error);
        res.status(500).json({ 
            error: error.message, 
            message: 'Error al actualizar el tipo de negocio del vehículo.' 
        });
    }
};

exports.getDepartamentos = async (req, res) => {
    try {
        const departamentos = await DepartamentosDAO.getAll();
        res.status(200).json(departamentos);
    } catch (error) {
        console.error('Error al obtener los departamentos:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getDepartamentoById = async (req, res) => {
    try {
        const id = req.params.id;
        const departamento = await DepartamentosDAO.getById(id);
        if (!departamento) {
            return res.status(404).json({ message: 'Departamento no encontrado' });
        }
        res.status(200).json(departamento);
    } catch (error) {
        console.error('Error al obtener el departamento:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getCiudadesByDepartamento = async (req, res) => {
    try {
        const id_dep = req.params.id_dep; // Obtiene el id_dep de los parámetros de la URL
        const ciudades = await CiudadesDAO.getByDepartamento(id_dep);
        res.status(200).json(ciudades);
    } catch (error) {
        console.error('Error al obtener las ciudades:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateUbicaciones = async (req, res) => {
    try {
        const id = req.params.id;
        const { ubicaciones } = req.body;
        console.log("el id ", id);
        console.log("el ubicaciones ", ubicaciones);
        if (ubicaciones === undefined) {
            return res.status(400).json({ message: 'El campo ubicaciones es requerido.' });
        }
        if (![0, 1].includes(ubicaciones)) {
            return res.status(400).json({ message: 'El valor de ubicaciones debe ser 0 o 1.' });
        }

        const result = await CiudadesDAO.updateUbicaciones(id, ubicaciones);
        console.log("el result ", result);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error al actualizar el campo ubicaciones de la ciudad:', error);
        console.error('Error al actualizar el campo ubicaciones de la ciudad:', error);
        res.status(500).json({ error: error.message, message: 'Error al actualizar el campo ubicaciones de la ciudad.' });
    }
};

exports.updatePlacas = async (req, res) => {
    try {
        const id = req.params.id;
        const { placas } = req.body;

        if (placas === undefined) {
            return res.status(400).json({ message: 'El campo placas es requerido.' });
        }
        if (![0, 1].includes(placas)) {
            return res.status(400).json({ message: 'El valor de placas debe ser 0 o 1.' });
        }

        const result = await CiudadesDAO.updatePlacas(id, placas);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al actualizar el campo placas de la ciudad:', error);
        res.status(500).json({ error: error.message, message: 'Error al actualizar el campo placas de la ciudad.' });
    }
};

// Obtener todas las referencias, opcionalmente filtradas por marca
exports.getAllReferencias = async (req, res) => {
    try {
        const marca = req.query.marca || null; // Obtener el parámetro de query 'marca'
        const modelo = req.query.modelo || null; // Obtener el parámetro de query 'modelo'
        
        const referencias = await ReferenciasDAO.getAllReferencias(marca, modelo);
        
        if (!referencias || referencias.length === 0) {
            let message = "No se encontraron referencias disponibles.";
            if (marca && modelo) {
                message = `No se encontraron referencias para la marca ${marca} y modelo ${modelo}.`;
            } else if (marca) {
                message = `No se encontraron referencias para la marca ${marca}.`;
            } else if (modelo) {
                message = `No se encontraron referencias para el modelo ${modelo}.`;
            }
            
            return res.status(404).json({ message });
        }
        
        res.status(200).json(referencias);
    } catch (error) {
        console.error('Error al obtener todas las referencias:', error);
        res.status(500).json({ 
            error: error.message,
            message: 'Error al obtener todas las referencias.' 
        });
    }
};

exports.getAllTipos = async (req, res) => {
    try {
        const marca = req.query.marca || null; // Obtener el parámetro de query 'marca'
        const modelo = req.query.modelo || null; // Obtener el parámetro de query 'modelo'
        const referencia = req.query.referencia || null; // Obtener el parámetro de query 'modelo'
        
        const tipos = await ReferenciasDAO.getAllTipos(modelo, marca, referencia);
        console.log("los tipos ", tipos);
        
        if (!tipos || tipos.length === 0) {
            let message = "No se encontraron tipos disponibles.";
            if (marca && modelo && referencia) {
                message = `No se encontraron tipos para la marca ${marca} , modelo ${modelo} y referencia ${referencia}.`;
            } else if (marca) {
                message = `No se encontraron tipos para la marca ${marca}.`;
            } else if (modelo) {
                message = `No se encontraron tipos para el modelo ${modelo}.`;
            } else if (referencia) {
                message = `No se encontraron tipos para el modelo ${referencia}.`;
            }
            
            return res.status(404).json({ message });
        }
        
        res.status(200).json(tipos);
    } catch (error) {
        console.error('Error al obtener todas las referencias:', error);
        res.status(500).json({ 
            error: error.message,
            message: 'Error al obtener todas las referencias.' 
        });
    }
};

// Obtener todas las marcas, opcionalmente filtradas por modelo
exports.getAllMarcas = async (req, res) => {
    try {
        const modelo = req.query.modelo || null; // Obtener el parámetro de query 'modelo'
        const marcas = await ReferenciasDAO.getAllMarcas(modelo);

        if (!marcas || marcas.length === 0) {
            return res.status(404).json({ 
                message: modelo 
                    ? `No se encontraron marcas para el modelo ${modelo}.` 
                    : "No se encontraron marcas disponibles." 
            });
        }

        res.status(200).json(marcas);
    } catch (error) {
        console.error('Error al obtener las marcas:', error);
        res.status(500).json({ 
            error: error.message, 
            message: 'Error al obtener las marcas.' 
        });
    }
};

exports.getAllModelos = async (req, res) => {
    try {
        const modelos = await ReferenciasDAO.getAllModelos();

        if (!modelos || modelos.length === 0) {
            return res.status(404).json({ 
                message: "No se encontraron marcas disponibles." 
            });
        }

        res.status(200).json(modelos);
    } catch (error) {
        console.error('Error al obtener todas las marcas:', error);
        res.status(500).json({ 
            error: error.message, 
            message: 'Error al obtener todas las marcas.' 
        });
    }
};

// Obtener referencias filtradas por múltiples criterios o todas si no hay filtros
exports.getVehiculosPaginados = async (req, res) => {
    try {
        // Extraer parámetros de query (filtros + paginación)
        const { marca, modelo, referencia, tipo_negocio, estado, id } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // Crear objeto de filtros
        const filtros = {
            marca: marca || null,
            modelo: modelo || null,
            referencia: referencia || null,
            tipo_negocio: tipo_negocio || null,
            estado: estado || null,
            id: id || null,
            page,
            limit
        };

        // Obtener resultados paginados
        const { resultados, total } = await ReferenciasDAO.getFiltradasPaginadas(filtros);

        if (!resultados || resultados.length === 0) {
            return res.status(404).json({
                message: 'No se encontraron vehículos con los criterios especificados',
                ...filtros
            });
        }
        // Configurar headers y enviar respuesta
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            totalRegistros: total,
            paginaActual: page,
            totalPaginas: Math.ceil(total / limit),
            porPagina: limit,
            data: resultados
        });
        
    } catch (error) {
        console.error('Error al buscar referencias:', error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({
            error: error.message,
            message: 'Error al buscar referencias'
        });
    }
};
// panelGerencia.controller.js
exports.getTodosVehiculos = async (req, res) => {
    try {
        const [vehiculos] = await pool.query('SELECT * FROM carro');
        res.json(vehiculos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
