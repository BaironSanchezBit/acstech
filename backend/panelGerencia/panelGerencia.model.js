
const pool = require('../config/dbSQL'); // Ajusta la ruta según la ubicación del archivo

class TablaTipos {
    static async getAll() {
        const [rows] = await pool.execute('SELECT * FROM tablatipos');
        return rows;
    }

    static async getByTipo(tipo_negocio) {
        const [rows] = await pool.execute('SELECT * FROM tablatipos WHERE tipo_negocio = ?', [tipo_negocio]);
        return rows[0] || null;
    }

    // Método para obtener datos paginados
    //static async getTiposPaginados(limit = 3, offset = 1) {
    //    const [rows] = await pool.execute(
    //        "SELECT tipo_negocio, oferta_rapida, oferta_estandar, oferta_flexible FROM tablatipos LIMIT ? OFFSET ?",
    //        [limit, offset]
    //    );
    //    return rows;
    //}

    static async getTiposPaginados(limit = 3, offset = 1) {
        try {
            const [rows] = await pool.execute(
                `SELECT tipo_negocio, oferta_rapida, oferta_estandar, oferta_flexible FROM tablatipos LIMIT ${limit} OFFSET ${offset}`,
            );
            return rows;
        } catch (error) {
            console.error("---Error in getTiposPaginados:---", error);
            throw new Error("Failed to fetch paginated tipos");
        }
    }

    // Nuevo método para actualizar registros
    static async updateTipos(data) {
        const sql = `
            UPDATE tablatipos 
            SET oferta_rapida = ?, oferta_estandar = ?, oferta_flexible = ?
            WHERE tipo_negocio = ?`;
        await pool.execute(sql, [data.oferta_rapida, data.oferta_estandar, data.oferta_flexible, data.tipo_negocio]);
        // Retornamos el registro actualizado
        return await this.getByTipo(data.tipo_negocio);
    }
}

class FiltrosACS {
    // Método para obtener todos los datos de la tabla filtros_acs
    static async getAll() {
        const [rows] = await pool.execute('SELECT modelo, kilometraje, valorMin, valorMax FROM filtros_acs');
        return rows;
    }

    // Método para obtener un registro específico por id
    static async getById(id) {
        const [rows] = await pool.execute('SELECT modelo, kilometraje, valorMin, valorMax FROM filtros_acs WHERE id = ?', [id]);
        return rows[0] || null; // Retorna el registro o null si no se encuentra
    }

    // Método para actualizar los valores de la fila por id
        static async update(data) {
            const sql = `
                UPDATE filtros_acs 
                SET modelo = ?, kilometraje = ?, valorMin = ?, valorMax = ?
                WHERE id = 1`;
            await pool.execute(sql, [data.modelo, data.kilometraje, data.valorMin, data.valorMax]);
            return { message: 'Registro actualizado exitosamente', ...data };
        }

        // Método para insertar un nuevo registro en la tabla filtros_acs
        static async create(data) {
            const sql = `
                INSERT INTO filtros_acs (modelo, kilometraje, valor)
                VALUES (?, ?, ?)`;
            const [result] = await pool.execute(sql, [data.modelo, data.kilometraje, data.valor]);
            // Retorna el registro recién insertado
            return { id: result.insertId, ...data };
        }
}

class Marcas {
    // Método para obtener todos los registros de la tabla marcas
    static async getAll() {
        const sql = `
            SELECT DISTINCT marca AS nombre 
            FROM carro 
            ORDER BY marca ASC`;
        const [rows] = await pool.execute(sql);
        return rows;
    }
}

class Referencias {
    // Método para obtener todas las referencias de una marca específica por id_marca
    static async getByMarca(nombreMarca) {
        const sql = `
            SELECT id, referencia, linea, version, ref3, modelo, marca, estado 
            FROM carro 
            WHERE marca = ? 
            ORDER BY referencia`;
        const [rows] = await pool.execute(sql, [nombreMarca]);
        return rows;
    }

    static async getAllModelos() {
        const sql = `
            SELECT DISTINCT  modelo 
            FROM carro 
            ORDER BY modelo DESC`;
        const [rows] = await pool.execute(sql);
        return rows;
    }

    static async getAllMarcas(modelo = null) {
        const sql = modelo 
            ? `SELECT DISTINCT marca FROM carro WHERE modelo = ? ORDER BY marca`
            : `SELECT DISTINCT marca FROM carro ORDER BY marca`;
        
        const [rows] = await pool.execute(sql, modelo ? [modelo] : []);
        return rows;
    }

    static async getAllReferencias(marca = null, modelo = null) {
        const sql = `SELECT DISTINCT referencia FROM carro 
                    WHERE (marca = ? OR ? IS NULL) 
                    AND (modelo = ? OR ? IS NULL) 
                    ORDER BY referencia`;
                    
        const [rows] = await pool.execute(sql, [marca, marca, modelo, modelo]);
        return rows;
    }

    static async getAllTipos(modelo = null, marca = null, referencia = null) {
        const sql = `SELECT DISTINCT tipo_negocio FROM carro 
                    WHERE (modelo = ? OR ? IS NULL)
                    AND (marca = ? OR ? IS NULL) 
                    AND (referencia = ? OR ? IS NULL) 
                    ORDER BY tipo_negocio`;
                    
        const [rows] = await pool.execute(sql, [modelo, modelo, marca, marca, referencia, referencia]);
        return rows;
    }

    static async getFiltradasPaginadas(filtros = {}) {
        const { 
            marca = null, 
            modelo = null, 
            referencia = null, 
            tipo_negocio = null,
            estado = null,
            id = null,
            page = 1,
            limit = 20
        } = filtros;
    
        const offset = (page - 1) * limit;
    
        // Consulta para los datos paginados
        const sqlData = `
            SELECT imagen_url, modelo, marca, referencia, linea, version, ref3, valor, tipo_negocio, estado, id 
            FROM carro 
            WHERE (modelo >= (Select modelo from filtros_acs) )  
            AND ( cast(replace(valor, '.','') as DECIMAL) >= (select valorMin from filtros_acs))
            AND ( cast(replace(valor, '.','') as DECIMAL) <= (select valorMax from filtros_acs))
            AND (marca = ? OR ? IS NULL) 
            AND (modelo = ? OR ? IS NULL) 
            AND (referencia = ? OR ? IS NULL) 
            AND (tipo_negocio = ? OR ? IS NULL)
            AND (estado = ? OR ? IS NULL)
            AND (id = ? OR ? IS NULL)
            ORDER BY marca, modelo, referencia,valor
            LIMIT ${20} offset ${offset}`;
        
        // Consulta para el conteo total
        const sqlCount = `
            SELECT COUNT(*) as total 
            FROM carro 
            WHERE (modelo >= (Select modelo from filtros_acs) )  
            AND ( cast(replace(valor, '.','') as Decimal) >= (select valorMin from filtros_acs))
            AND ( cast(replace(valor, '.','') as DECIMAL) <= (select valorMax from filtros_acs))
            AND (marca = ? OR ? IS NULL) 
            AND (modelo = ? OR ? IS NULL) 
            AND (referencia = ? OR ? IS NULL) 
            AND (tipo_negocio = ? OR ? IS NULL)
            AND (estado = ? OR ? IS NULL)
            AND (id = ? OR ? IS NULL)`;
    
        // Ejecutar ambas consultas
        const [rowsData] = await pool.execute(sqlData, [
            marca, marca,
            modelo, modelo,
            referencia, referencia,
            tipo_negocio, tipo_negocio,
            estado, estado,
            id, id,
        ]);
    
        const [rowsCount] = await pool.execute(sqlCount, [
            marca, marca,
            modelo, modelo,
            referencia, referencia,
            tipo_negocio, tipo_negocio,
            estado, estado,
            id, id
        ]);
    
        // Aseguramos que tenemos un número válido para el total
        const total = rowsCount[0].total || 0;
    
        return {
            resultados: rowsData,
            total: total
        };
    }
    // Método para actualizar únicamente el campo estado por id
    static async updateEstado(id, estado) {
        const sql = `
            UPDATE carro 
            SET estado = ? 
            WHERE id = ?`;
        const [result] = await pool.execute(sql, [estado, id]);
        if (result.affectedRows === 0) {
            throw new Error(`No se encontró ninguna referencia con ID ${id}`);
        }
        return { message: `Campo 'estado' de la referencia con ID ${id} actualizado exitosamente`, id, estado };
    }
    // Método para actualizar únicamente el campo tipo negocio por id
    static async updateTipoNegocio(id, tipo_negocio) {
        const sql = `
            UPDATE carro 
            SET tipo_negocio = ? 
            WHERE id = ?`;
        const [result] = await pool.execute(sql, [tipo_negocio, id]);
        if (result.affectedRows === 0) {
            throw new Error(`No se encontró ninguna referencia con ID ${id}`);
        }
        return { message: `Campo 'tipo negocio' de la referencia con ID ${id} actualizado exitosamente`, id, tipo_negocio };
    }

}

class Departamentos {
    // Método para obtener todos los registros de la tabla departamentos
    static async getAll() {
        const [rows] = await pool.execute('SELECT id, nombre FROM departamentos ORDER BY nombre');
        return rows;
    }

    // Método para obtener un registro específico por id
    static async getById(id) {
        const [rows] = await pool.execute('SELECT id, nombre FROM departamentos WHERE id = ?', [id]);
        return rows[0] || null; // Retorna el registro o null si no se encuentra
    }
}

class Ciudades {
    // Método para obtener todas las ciudades de un departamento específico
    static async getByDepartamento(id_dep) {
        const sql = `
            SELECT id, nombre, id_dep, ubicaciones, placas 
            FROM ciudades 
            WHERE id_dep = ? 
            ORDER BY nombre`;
        const [rows] = await pool.execute(sql, [id_dep]);
        return rows;
    }

    // Método para actualizar únicamente el campo ubicaciones por id
    static async updateUbicaciones(id, ubicaciones) {
        const sql = `
            UPDATE ciudades 
            SET ubicaciones = ? 
            WHERE id = ?`;
        const [result] = await pool.execute(sql, [ubicaciones, id]);
        if (result.affectedRows === 0) {
            throw new Error(`No se encontró ninguna ciudad con ID ${id}`);
        }
        return { message: `Campo 'ubicaciones' de la ciudad con ID ${id} actualizado exitosamente`, id, ubicaciones };
    }

    // Método para actualizar únicamente el campo placas por id
    static async updatePlacas(id, placas) {
        const sql = `
            UPDATE ciudades 
            SET placas = ? 
            WHERE id = ?`;
        const [result] = await pool.execute(sql, [placas, id]);
        if (result.affectedRows === 0) {
            throw new Error(`No se encontró ninguna ciudad con ID ${id}`);
        }
        return { message: `Campo 'placas' de la ciudad con ID ${id} actualizado exitosamente`, id, placas };
    }

    // Método para actualizar ambos campos ubicaciones y placas por id (opcional)
    static async updateBooleanFields(id, ubicaciones, placas) {
        const sql = `
            UPDATE ciudades 
            SET ubicaciones = ?, placas = ? 
            WHERE id = ?`;
        const [result] = await pool.execute(sql, [ubicaciones, placas, id]);
        if (result.affectedRows === 0) {
            throw new Error(`No se encontró ninguna ciudad con ID ${id}`);
        }
        return { message: `Ciudad con ID ${id} actualizada exitosamente`, id, ubicaciones, placas };
    }
}

//module.exports = { Carro, FiltrosACS, TablaTipos };
module.exports = { TablaTipos, FiltrosACS, Departamentos, Ciudades, Marcas, Referencias };
