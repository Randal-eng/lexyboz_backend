const pool = require('../../../db/connection');
const Joi = require('joi');

// =====================================================
// SCHEMAS DE VALIDACIÓN
// =====================================================

const reactivoSchema = Joi.object({
    pseudopalabra: Joi.string().required().min(1).max(100),
    id_sub_tipo: Joi.number().integer().required(),
    tiempo_duracion: Joi.number().integer().min(1).optional()
});

const actualizarReactivoSchema = Joi.object({
    pseudopalabra: Joi.string().min(1).max(100).optional(),
    id_sub_tipo: Joi.number().integer().optional(),
    tiempo_duracion: Joi.number().integer().min(1).optional()
});

const reactivosEjercicioSchema = Joi.object({
    reactivos: Joi.array().items(
        Joi.object({
            id_reactivo: Joi.number().integer().required(),
            orden: Joi.number().integer().min(1).default(1)
        })
    ).min(1).required()
});

// =====================================================
// FUNCIONES DEL MODELO
// =====================================================

/**
 * Crear un nuevo reactivo
 */
const crearReactivo = async (datosReactivo) => {
    const { error, value } = reactivoSchema.validate(datosReactivo);
    if (error) {
        throw new Error(`Datos inválidos: ${error.details[0].message}`);
    }

    const { pseudopalabra, id_sub_tipo, tiempo_duracion } = value;

    try {
        const result = await pool.query(`
            INSERT INTO reactivo_lectura_pseudopalabras 
            (pseudopalabra, id_sub_tipo, tiempo_duracion) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `, [pseudopalabra, id_sub_tipo, tiempo_duracion || null]);

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error al crear reactivo: ${error.message}`);
    }
};

/**
 * Obtener reactivos con filtros y paginación
 */
const obtenerReactivos = async (filtros = {}) => {
    const { 
        limit = 20, 
        offset = 0, 
        id_sub_tipo = null, 
        tipo_id = null,
        buscar = null 
    } = filtros;

    try {
        let whereConditions = [];
        let queryParams = [];
        let paramCount = 0;

        // Filtro por id_sub_tipo
        if (id_sub_tipo) {
            paramCount++;
            whereConditions.push(`r.id_sub_tipo = $${paramCount}`);
            queryParams.push(id_sub_tipo);
        }

        // Filtro por tipo_id (a través de sub_tipo)
        if (tipo_id) {
            paramCount++;
            whereConditions.push(`st.id_tipo = $${paramCount}`);
            queryParams.push(tipo_id);
        }

        // Búsqueda en pseudopalabra
        if (buscar) {
            paramCount++;
            whereConditions.push(`r.pseudopalabra ILIKE $${paramCount}`);
            queryParams.push(`%${buscar}%`);
        }

        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        // Query para obtener reactivos con información de tipos
        const reactivosQuery = `
            SELECT 
                r.id_reactivo,
                r.pseudopalabra,
                r.id_sub_tipo,
                r.tiempo_duracion,
                r.created_at,
                r.updated_at,
                st.nombre as sub_tipo_nombre,
                st.descripcion as sub_tipo_descripcion,
                st.id_tipo,
                t.tipo_nombre as tipo_nombre,
                t.descripcion as tipo_descripcion
            FROM reactivo_lectura_pseudopalabras r
            LEFT JOIN sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
            LEFT JOIN tipos t ON st.id_tipo = t.id_tipo
            ${whereClause}
            ORDER BY r.created_at DESC
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;

        queryParams.push(limit, offset);

        // Query para contar total
        const countQuery = `
            SELECT COUNT(*) as total
            FROM reactivo_lectura_pseudopalabras r
            LEFT JOIN sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
            LEFT JOIN tipos t ON st.id_tipo = t.id_tipo
            ${whereClause}
        `;

        const [reactivosResult, countResult] = await Promise.all([
            pool.query(reactivosQuery, queryParams),
            pool.query(countQuery, queryParams.slice(0, paramCount))
        ]);

        return {
            reactivos: reactivosResult.rows,
            total: parseInt(countResult.rows[0].total)
        };
    } catch (error) {
        throw new Error(`Error al obtener reactivos: ${error.message}`);
    }
};

/**
 * Obtener un reactivo por ID
 */
const obtenerReactivoPorId = async (idReactivo) => {
    try {
        const result = await pool.query(`
            SELECT 
                r.id_reactivo,
                r.pseudopalabra,
                r.id_sub_tipo,
                r.tiempo_duracion,
                r.created_at,
                r.updated_at,
                st.nombre as sub_tipo_nombre,
                st.descripcion as sub_tipo_descripcion,
                st.id_tipo,
                t.tipo_nombre as tipo_nombre,
                t.descripcion as tipo_descripcion
            FROM reactivo_lectura_pseudopalabras r
            LEFT JOIN sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
            LEFT JOIN tipos t ON st.id_tipo = t.id_tipo
            WHERE r.id_reactivo = $1
        `, [idReactivo]);

        return result.rows[0] || null;
    } catch (error) {
        throw new Error(`Error al obtener reactivo: ${error.message}`);
    }
};

/**
 * Actualizar un reactivo
 */
const actualizarReactivo = async (idReactivo, datosActualizacion) => {
    const { error, value } = actualizarReactivoSchema.validate(datosActualizacion);
    if (error) {
        throw new Error(`Datos inválidos: ${error.details[0].message}`);
    }

    const campos = Object.keys(value);
    if (campos.length === 0) {
        throw new Error('No se proporcionaron datos para actualizar');
    }

    try {
        const setClauses = campos.map((campo, index) => `${campo} = $${index + 2}`);
        const query = `
            UPDATE reactivo_lectura_pseudopalabras 
            SET ${setClauses.join(', ')}, updated_at = NOW()
            WHERE id_reactivo = $1 
            RETURNING *
        `;

        const valores = [idReactivo, ...campos.map(campo => value[campo])];
        const result = await pool.query(query, valores);

        if (result.rows.length === 0) {
            throw new Error('Reactivo no encontrado');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error al actualizar reactivo: ${error.message}`);
    }
};

/**
 * Eliminar un reactivo (hard delete - ya que no hay campo activo)
 */
const eliminarReactivo = async (idReactivo) => {
    try {
        const result = await pool.query(`
            DELETE FROM reactivo_lectura_pseudopalabras 
            WHERE id_reactivo = $1 
            RETURNING *
        `, [idReactivo]);

        if (result.rows.length === 0) {
            throw new Error('Reactivo no encontrado');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error al eliminar reactivo: ${error.message}`);
    }
};

/**
 * Obtener reactivos por sub_tipo
 */
const obtenerReactivosPorSubTipo = async (idSubTipo, filtros = {}) => {
    const { limit = 20, offset = 0 } = filtros;

    try {
        const query = `
            SELECT 
                r.id_reactivo,
                r.pseudopalabra,
                r.id_sub_tipo,
                r.tiempo_duracion,
                r.created_at,
                st.nombre as sub_tipo_nombre,
                st.descripcion as sub_tipo_descripcion
            FROM reactivo_lectura_pseudopalabras r
            LEFT JOIN sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
            WHERE r.id_sub_tipo = $1
            ORDER BY r.created_at ASC
            LIMIT $2 OFFSET $3
        `;

        // Query para contar total
        const countQuery = `
            SELECT COUNT(*) as total
            FROM reactivo_lectura_pseudopalabras r
            WHERE r.id_sub_tipo = $1
        `;

        const [reactivosResult, countResult] = await Promise.all([
            pool.query(query, [idSubTipo, limit, offset]),
            pool.query(countQuery, [idSubTipo])
        ]);

        return {
            reactivos: reactivosResult.rows,
            total: parseInt(countResult.rows[0].total)
        };
    } catch (error) {
        throw new Error(`Error al obtener reactivos por sub tipo: ${error.message}`);
    }
};

/**
 * Obtener reactivos por tipo (a través de sub_tipo)
 */
const obtenerReactivosPorTipo = async (tipoId, filtros = {}) => {
    const { limit = 20, offset = 0 } = filtros;

    try {
        const query = `
            SELECT 
                r.id_reactivo,
                r.pseudopalabra,
                r.id_sub_tipo,
                r.tiempo_duracion,
                r.created_at,
                st.nombre as sub_tipo_nombre,
                st.descripcion as sub_tipo_descripcion,
                st.id_tipo,
                t.tipo_nombre as tipo_nombre,
                t.descripcion as tipo_descripcion
            FROM reactivo_lectura_pseudopalabras r
            LEFT JOIN sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
            LEFT JOIN tipos t ON st.id_tipo = t.id_tipo
            WHERE st.id_tipo = $1
            ORDER BY r.created_at ASC
            LIMIT $2 OFFSET $3
        `;

        // Query para contar total
        const countQuery = `
            SELECT COUNT(*) as total
            FROM reactivo_lectura_pseudopalabras r
            LEFT JOIN sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
            WHERE st.id_tipo = $1
        `;

        const [reactivosResult, countResult] = await Promise.all([
            pool.query(query, [tipoId, limit, offset]),
            pool.query(countQuery, [tipoId])
        ]);

        return {
            reactivos: reactivosResult.rows,
            total: parseInt(countResult.rows[0].total)
        };
    } catch (error) {
        throw new Error(`Error al obtener reactivos por tipo: ${error.message}`);
    }
};

/**
 * Verificar si un ejercicio puede tener reactivos de un tipo específico
 */
const verificarCompatibilidadTipo = async (ejercicioId, tipoId = null) => {
    try {
        // Verificar si el ejercicio ya tiene reactivos
        const reactivosExistentes = await pool.query(`
            SELECT COUNT(*) as total_reactivos
            FROM ejercicio_reactivos er
            WHERE er.ejercicio_id = $1 AND er.activo = true
        `, [ejercicioId]);

        const totalReactivos = parseInt(reactivosExistentes.rows[0].total_reactivos);
        
        if (totalReactivos === 0) {
            // No hay reactivos, se puede agregar cualquier tipo
            return { compatible: true, mensaje: 'El ejercicio no tiene reactivos, se puede agregar cualquier tipo' };
        }

        // Si ya hay reactivos, permitir agregar más (sin verificar tipo por ahora)
        return { 
            compatible: true, 
            mensaje: `El ejercicio ya tiene ${totalReactivos} reactivos. Se pueden agregar más.`
        };
    } catch (error) {
        throw new Error(`Error al verificar compatibilidad: ${error.message}`);
    }
};

/**
 * Agregar reactivos a un ejercicio
 */
const agregarReactivosAEjercicio = async (ejercicioId, reactivosData) => {
    const { error, value } = reactivosEjercicioSchema.validate({ reactivos: reactivosData });
    if (error) {
        throw new Error(`Datos inválidos: ${error.details[0].message}`);
    }

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Verificar que el ejercicio existe
        const ejercicioResult = await client.query(
            'SELECT ejercicio_id FROM ejercicios WHERE ejercicio_id = $1',
            [ejercicioId]
        );

        if (ejercicioResult.rows.length === 0) {
            throw new Error('Ejercicio no encontrado');
        }

        // Verificar que todos los reactivos existen
        const reactivoIds = value.reactivos.map(r => r.id_reactivo);
        const reactivosResult = await client.query(`
            SELECT 
                r.id_reactivo,
                r.pseudopalabra
            FROM reactivo_lectura_pseudopalabras r
            WHERE r.id_reactivo = ANY($1)
        `, [reactivoIds]);

        if (reactivosResult.rows.length !== reactivoIds.length) {
            throw new Error('Algunos reactivos no existen');
        }

        // Verificar compatibilidad con reactivos existentes en el ejercicio
        const compatibilidad = await verificarCompatibilidadTipo(ejercicioId);
        if (!compatibilidad.compatible) {
            throw new Error(compatibilidad.mensaje);
        }

        // Insertar reactivos en el ejercicio
        const insertPromises = value.reactivos.map(reactivo => {
            return client.query(`
                INSERT INTO ejercicio_reactivos (ejercicio_id, reactivo_id, orden)
                VALUES ($1, $2, $3)
                ON CONFLICT (ejercicio_id, reactivo_id) 
                DO UPDATE SET orden = $3, activo = true, fecha_actualizacion = NOW()
                RETURNING *
            `, [ejercicioId, reactivo.id_reactivo, reactivo.orden]);
        });

        const insertResults = await Promise.all(insertPromises);
        
        await client.query('COMMIT');

        return {
            ejercicio_id: ejercicioId,
            reactivos_agregados: insertResults.map(result => result.rows[0]),
            total_reactivos: insertResults.length
        };

    } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Error al agregar reactivos al ejercicio: ${error.message}`);
    } finally {
        client.release();
    }
};

/**
 * Obtener reactivos de un ejercicio
 */
const obtenerReactivosDeEjercicio = async (ejercicioId) => {
    try {
        const result = await pool.query(`
            SELECT 
                er.ejercicio_reactivo_id,
                er.ejercicio_id,
                er.reactivo_id,
                er.orden,
                er.activo,
                r.pseudopalabra,
                r.tiempo_duracion,
                st.sub_tipo_id,
                st.nombre as sub_tipo_nombre,
                st.descripcion as sub_tipo_descripcion,
                st.tipo_id,
                t.nombre as tipo_nombre,
                t.descripcion as tipo_descripcion
            FROM ejercicio_reactivos er
            JOIN reactivo_lectura_pseudopalabras r ON er.reactivo_id = r.id_reactivo
            JOIN sub_tipo st ON r.id_sub_tipo = st.sub_tipo_id
            JOIN tipos t ON st.tipo_id = t.tipo_id
            WHERE er.ejercicio_id = $1 AND er.activo = true
            ORDER BY er.orden ASC
        `, [ejercicioId]);

        return result.rows;
    } catch (error) {
        throw new Error(`Error al obtener reactivos del ejercicio: ${error.message}`);
    }
};

/**
 * Remover un reactivo de un ejercicio
 */
const removerReactivoDeEjercicio = async (ejercicioId, reactivoId) => {
    try {
        const result = await pool.query(`
            UPDATE ejercicio_reactivos 
            SET activo = false, fecha_actualizacion = NOW()
            WHERE ejercicio_id = $1 AND reactivo_id = $2
            RETURNING *
        `, [ejercicioId, reactivoId]);

        if (result.rows.length === 0) {
            throw new Error('Relación ejercicio-reactivo no encontrada');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error al remover reactivo del ejercicio: ${error.message}`);
    }
};

/**
 * Reordenar reactivos en un ejercicio
 */
const reordenarReactivosEnEjercicio = async (ejercicioId, nuevosOrdenes) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        const updatePromises = nuevosOrdenes.map(({ reactivo_id, orden }) => {
            return client.query(`
                UPDATE ejercicio_reactivos 
                SET orden = $1, fecha_actualizacion = NOW()
                WHERE ejercicio_id = $2 AND reactivo_id = $3 AND activo = true
                RETURNING *
            `, [orden, ejercicioId, reactivo_id]);
        });

        const updateResults = await Promise.all(updatePromises);
        
        await client.query('COMMIT');

        return updateResults.map(result => result.rows[0]).filter(Boolean);

    } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Error al reordenar reactivos: ${error.message}`);
    } finally {
        client.release();
    }
};

module.exports = {
    crearReactivo,
    obtenerReactivos,
    obtenerReactivoPorId,
    actualizarReactivo,
    eliminarReactivo,
    obtenerReactivosPorSubTipo,
    obtenerReactivosPorTipo,
    verificarCompatibilidadTipo,
    agregarReactivosAEjercicio,
    obtenerReactivosDeEjercicio,
    removerReactivoDeEjercicio,
    reordenarReactivosEnEjercicio
};
