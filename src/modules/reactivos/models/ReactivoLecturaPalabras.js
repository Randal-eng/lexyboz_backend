const pool = require('../../../db/connection');
const Joi = require('joi');

// =====================================================
// ESQUEMA DE VALIDACIÓN PARA REACTIVOS DE PALABRAS NORMALES
// =====================================================

const reactivoPalabraNormalSchema = Joi.object({
    palabra: Joi.string().required().min(1).max(100),
    id_sub_tipo: Joi.number().integer().required(),
    tiempo_duracion: Joi.number().integer().min(1).optional()
});

const actualizarReactivoPalabraNormalSchema = Joi.object({
    palabra: Joi.string().min(1).max(100).optional(),
    id_sub_tipo: Joi.number().integer().optional(),
    tiempo_duracion: Joi.number().integer().min(1).optional()
});

// =====================================================
// FUNCIONES DEL MODELO
// =====================================================

/**
 * Crear un nuevo reactivo de palabra normal
 */
const crearReactivoPalabraNormal = async (datosReactivo) => {
    const { error, value } = reactivoPalabraNormalSchema.validate(datosReactivo);
    if (error) {
        throw new Error(`Datos inválidos: ${error.details[0].message}`);
    }

    const { palabra, id_sub_tipo, tiempo_duracion } = value;

    try {
        const result = await pool.query(`
            INSERT INTO reactivo_lectura_palabras 
            (palabra, id_sub_tipo, tiempo_duracion) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `, [palabra, id_sub_tipo, tiempo_duracion || null]);

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error al crear reactivo de palabra normal: ${error.message}`);
    }
};

/**
 * Obtener reactivos de palabras normales con filtros y paginación
 */
const obtenerReactivosPalabrasNormales = async (filtros = {}) => {
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
            whereConditions.push(`st.tipo = $${paramCount}`);
            queryParams.push(tipo_id);
        }

        // Búsqueda en palabra
        if (buscar) {
            paramCount++;
            whereConditions.push(`r.palabra ILIKE $${paramCount}`);
            queryParams.push(`%${buscar}%`);
        }

        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        // Query para obtener reactivos con información de tipos
        const reactivosQuery = `
            SELECT 
                r.id_reactivo,
                r.palabra,
                r.id_sub_tipo,
                r.tiempo_duracion,
                r.created_at,
                r.updated_at,
                st.sub_tipo_nombre as sub_tipo_nombre,
                st.tipo,
                t.tipo_nombre as tipo_nombre
            FROM reactivo_lectura_palabras r
            LEFT JOIN sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
            LEFT JOIN tipos t ON st.tipo = t.id_tipo
            ${whereClause}
            ORDER BY r.created_at DESC
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;

        queryParams.push(limit, offset);

        // Query para contar total
        const countQuery = `
            SELECT COUNT(*) as total
            FROM reactivo_lectura_palabras r
            LEFT JOIN sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
            LEFT JOIN tipos t ON st.tipo = t.id_tipo
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
        throw new Error(`Error al obtener reactivos de palabras normales: ${error.message}`);
    }
};

/**
 * Obtener un reactivo de palabra normal por ID
 */
const obtenerReactivoPalabraNormalPorId = async (idReactivo) => {
    try {
        const result = await pool.query(`
            SELECT 
                r.id_reactivo,
                r.palabra,
                r.id_sub_tipo,
                r.tiempo_duracion,
                r.created_at,
                r.updated_at,
                st.sub_tipo_nombre as sub_tipo_nombre,
                st.tipo,
                t.tipo_nombre as tipo_nombre
            FROM reactivo_lectura_palabras r
            LEFT JOIN sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
            LEFT JOIN tipos t ON st.tipo = t.id_tipo
            WHERE r.id_reactivo = $1
        `, [idReactivo]);

        return result.rows[0] || null;
    } catch (error) {
        throw new Error(`Error al obtener reactivo de palabra normal: ${error.message}`);
    }
};

/**
 * Actualizar un reactivo de palabra normal
 */
const actualizarReactivoPalabraNormal = async (idReactivo, datosActualizacion) => {
    const { error, value } = actualizarReactivoPalabraNormalSchema.validate(datosActualizacion);
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
            UPDATE reactivo_lectura_palabras 
            SET ${setClauses.join(', ')}, updated_at = NOW()
            WHERE id_reactivo = $1 
            RETURNING *
        `;

        const valores = [idReactivo, ...campos.map(campo => value[campo])];
        const result = await pool.query(query, valores);

        if (result.rows.length === 0) {
            throw new Error('Reactivo de palabra normal no encontrado');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error al actualizar reactivo de palabra normal: ${error.message}`);
    }
};

/**
 * Eliminar un reactivo de palabra normal
 */
const eliminarReactivoPalabraNormal = async (idReactivo) => {
    try {
        const result = await pool.query(`
            DELETE FROM reactivo_lectura_palabras 
            WHERE id_reactivo = $1 
            RETURNING *
        `, [idReactivo]);

        if (result.rows.length === 0) {
            throw new Error('Reactivo de palabra normal no encontrado');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error al eliminar reactivo de palabra normal: ${error.message}`);
    }
};

module.exports = {
    crearReactivoPalabraNormal,
    obtenerReactivosPalabrasNormales,
    obtenerReactivoPalabraNormalPorId,
    actualizarReactivoPalabraNormal,
    eliminarReactivoPalabraNormal
};
