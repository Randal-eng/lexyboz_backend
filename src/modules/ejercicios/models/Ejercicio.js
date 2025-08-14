const pool = require('../../../db/connection');
const Joi = require('joi');

// =====================================================
// SCHEMAS DE VALIDACIÓN
// =====================================================

const ejercicioSchema = Joi.object({
    titulo: Joi.string().min(3).max(255).required(),
    descripcion: Joi.string().max(1000).optional(),
    creado_por: Joi.number().integer().required(),
    tipo_ejercicio: Joi.number().integer().optional(),
    activo: Joi.boolean().optional().default(true)
});

const ejercicioUpdateSchema = Joi.object({
    titulo: Joi.string().min(3).max(255).optional(),
    descripcion: Joi.string().max(1000).optional(),
    tipo_ejercicio: Joi.number().integer().optional(),
    activo: Joi.boolean().optional()
});

const validateEjercicio = (data) => {
    const { error } = ejercicioSchema.validate(data);
    if (error) {
        throw new Error(`Datos del ejercicio inválidos: ${error.details[0].message}`);
    }
};

const validateEjercicioUpdate = (data) => {
    const { error } = ejercicioUpdateSchema.validate(data);
    if (error) {
        throw new Error(`Datos de actualización del ejercicio inválidos: ${error.details[0].message}`);
    }
};

// =====================================================
// FUNCIONES DEL MODELO
// =====================================================

/**
 * Crear un nuevo ejercicio
 */
const crearEjercicio = async ({ titulo, descripcion, creado_por, tipo_ejercicio = null, activo = true }) => {
    validateEjercicio({ titulo, descripcion, creado_por, tipo_ejercicio, activo });

    const query = `
        INSERT INTO ejercicios (titulo, descripcion, creado_por, tipo_ejercicio, activo)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [titulo, descripcion, creado_por, tipo_ejercicio, activo];
    const result = await pool.query(query, values);
    return result.rows[0];
};

/**
 * Obtener todos los ejercicios con información del creador y tipo
 */
const obtenerEjercicios = async ({ 
    limit = 20, 
    offset = 0, 
    activo = null, 
    creado_por = null,
    tipo_ejercicio = null,
    buscar = null 
} = {}) => {
    let conditions = [];
    let values = [];
    let valueIndex = 1;

    // Filtros opcionales
    if (activo !== null) {
        conditions.push(`e.activo = $${valueIndex}`);
        values.push(activo);
        valueIndex++;
    }

    if (creado_por) {
        conditions.push(`e.creado_por = $${valueIndex}`);
        values.push(creado_por);
        valueIndex++;
    }

    if (tipo_ejercicio) {
        conditions.push(`e.tipo_ejercicio = $${valueIndex}`);
        values.push(tipo_ejercicio);
        valueIndex++;
    }

    if (buscar) {
        conditions.push(`(e.titulo ILIKE $${valueIndex} OR e.descripcion ILIKE $${valueIndex})`);
        values.push(`%${buscar}%`);
        valueIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
        SELECT 
            e.ejercicio_id,
            e.titulo,
            e.descripcion,
            e.creado_por,
            e.tipo_ejercicio,
            e.created_at,
            e.updated_at,
            e.activo,
            u.nombre as creador_nombre,
            u.correo as creador_correo,
            t.tipo_nombre as tipo_nombre,
            t.descripcion as tipo_descripcion,
            COUNT(er.reactivo_id) as total_reactivos,
            COUNT(ek.kit_id) as total_kits,
            COUNT(*) OVER() as total_count
        FROM ejercicios e
        INNER JOIN Usuario u ON e.creado_por = u.usuario_id
        LEFT JOIN tipos t ON e.tipo_ejercicio = t.id_tipo
        LEFT JOIN ejercicio_reactivos er ON e.ejercicio_id = er.ejercicio_id AND er.activo = true
        LEFT JOIN ejercicios_kits ek ON e.ejercicio_id = ek.ejercicio_id
        ${whereClause}
        GROUP BY e.ejercicio_id, u.nombre, u.correo, t.tipo_nombre, t.descripcion
        ORDER BY e.created_at DESC
        LIMIT $${valueIndex} OFFSET $${valueIndex + 1};
    `;
    
    values.push(limit, offset);
    const result = await pool.query(query, values);
    
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const ejercicios = result.rows.map(row => {
        const { total_count, ...ejercicio } = row;
        return ejercicio;
    });

    return { ejercicios, total };
};

/**
 * Obtener un ejercicio por ID con toda su información
 */
const obtenerEjercicioPorId = async (ejercicioId) => {
    const query = `
        SELECT 
            e.ejercicio_id,
            e.titulo,
            e.descripcion,
            e.creado_por,
            e.tipo_ejercicio,
            e.created_at,
            e.updated_at,
            e.activo,
            u.nombre as creador_nombre,
            u.correo as creador_correo,
            t.tipo_nombre as tipo_nombre,
            t.descripcion as tipo_descripcion
        FROM ejercicios e
        INNER JOIN Usuario u ON e.creado_por = u.usuario_id
        LEFT JOIN tipos t ON e.tipo_ejercicio = t.id_tipo
        WHERE e.ejercicio_id = $1;
    `;
    const result = await pool.query(query, [ejercicioId]);
    
    if (result.rows.length === 0) {
        return null;
    }

    const ejercicio = result.rows[0];

    // Obtener kits donde está incluido este ejercicio
    const kitsQuery = `
        SELECT 
            k.kit_id,
            k.name as kit_name,
            k.descripcion as kit_descripcion,
            ek.orden_en_kit,
            uk.nombre as kit_creador_nombre
        FROM ejercicios_kits ek
        INNER JOIN kits k ON ek.kit_id = k.kit_id
        INNER JOIN Usuario uk ON k.creado_por = uk.usuario_id
        WHERE ek.ejercicio_id = $1 AND k.activo = true
        ORDER BY ek.orden_en_kit ASC;
    `;
    const kitsResult = await pool.query(kitsQuery, [ejercicioId]);

    return {
        ...ejercicio,
        kits: kitsResult.rows
    };
};

/**
 * Actualizar un ejercicio
 */
const actualizarEjercicio = async (ejercicioId, datosActualizacion) => {
    validateEjercicioUpdate(datosActualizacion);

    const fields = [];
    const values = [];
    let valueIndex = 1;

    // Construir dinámicamente la query de actualización
    Object.keys(datosActualizacion).forEach(key => {
        if (datosActualizacion[key] !== undefined) {
            fields.push(`${key} = $${valueIndex}`);
            values.push(datosActualizacion[key]);
            valueIndex++;
        }
    });

    if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
    }

    const query = `
        UPDATE ejercicios 
        SET ${fields.join(', ')}
        WHERE ejercicio_id = $${valueIndex}
        RETURNING *;
    `;
    values.push(ejercicioId);

    const result = await pool.query(query, values);
    return result.rows[0];
};

/**
 * Eliminar un ejercicio (soft delete)
 */
const eliminarEjercicio = async (ejercicioId) => {
    const query = `
        UPDATE ejercicios 
        SET activo = false
        WHERE ejercicio_id = $1
        RETURNING *;
    `;
    const result = await pool.query(query, [ejercicioId]);
    return result.rows[0];
};

/**
 * Obtener ejercicios por tipo
 */
const obtenerEjerciciosPorTipo = async (tipoId, { limit = 20, offset = 0, activo = true } = {}) => {
    const query = `
        SELECT 
            e.ejercicio_id,
            e.titulo,
            e.descripcion,
            e.creado_por,
            e.created_at,
            e.activo,
            u.nombre as creador_nombre,
            t.tipo_nombre,
            COUNT(*) OVER() as total_count
        FROM ejercicios e
        INNER JOIN Usuario u ON e.creado_por = u.usuario_id
        INNER JOIN tipos t ON e.tipo_ejercicio = t.id_tipo
        WHERE e.tipo_ejercicio = $1 
        ${activo !== null ? 'AND e.activo = $4' : ''}
        ORDER BY e.created_at DESC
        LIMIT $2 OFFSET $3;
    `;
    
    const values = activo !== null 
        ? [tipoId, limit, offset, activo]
        : [tipoId, limit, offset];
    
    const result = await pool.query(query, values);
    
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const ejercicios = result.rows.map(row => {
        const { total_count, ...ejercicio } = row;
        return ejercicio;
    });

    return { ejercicios, total };
};

/**
 * Obtener ejercicios disponibles (no están en un kit específico)
 */
const obtenerEjerciciosDisponibles = async (kitId, { limit = 20, offset = 0, buscar = null } = {}) => {
    let conditions = ['e.activo = true'];
    let values = [kitId];
    let valueIndex = 2;

    if (buscar) {
        conditions.push(`(e.titulo ILIKE $${valueIndex} OR e.descripcion ILIKE $${valueIndex})`);
        values.push(`%${buscar}%`);
        valueIndex++;
    }

    const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

    const query = `
        SELECT 
            e.ejercicio_id,
            e.titulo,
            e.descripcion,
            e.creado_por,
            e.created_at,
            u.nombre as creador_nombre,
            t.tipo_nombre,
            COUNT(*) OVER() as total_count
        FROM ejercicios e
        INNER JOIN Usuario u ON e.creado_por = u.usuario_id
        LEFT JOIN tipos t ON e.tipo_ejercicio = t.id_tipo
        WHERE e.ejercicio_id NOT IN (
            SELECT ejercicio_id 
            FROM ejercicios_kits 
            WHERE kit_id = $1
        )
        ${whereClause}
        ORDER BY e.created_at DESC
        LIMIT $${valueIndex} OFFSET $${valueIndex + 1};
    `;
    
    values.push(limit, offset);
    const result = await pool.query(query, values);
    
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const ejercicios = result.rows.map(row => {
        const { total_count, ...ejercicio } = row;
        return ejercicio;
    });

    return { ejercicios, total };
};

/**
 * Obtener estadísticas de ejercicios
 */
const obtenerEstadisticasEjercicios = async () => {
    const query = `
        SELECT 
            COUNT(*) as total_ejercicios,
            COUNT(CASE WHEN activo = true THEN 1 END) as ejercicios_activos,
            COUNT(CASE WHEN activo = false THEN 1 END) as ejercicios_inactivos,
            COUNT(DISTINCT creado_por) as total_creadores,
            COUNT(DISTINCT tipo_ejercicio) as tipos_diferentes
        FROM ejercicios;
    `;
    const result = await pool.query(query);
    return result.rows[0];
};

/**
 * Duplicar un ejercicio
 */
const duplicarEjercicio = async (ejercicioId, nuevoTitulo, creadoPor) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Obtener el ejercicio original
        const ejercicioOriginal = await client.query(
            'SELECT * FROM ejercicios WHERE ejercicio_id = $1',
            [ejercicioId]
        );

        if (ejercicioOriginal.rows.length === 0) {
            throw new Error('Ejercicio no encontrado');
        }

        const original = ejercicioOriginal.rows[0];

        // Crear el duplicado
        const insertQuery = `
            INSERT INTO ejercicios (titulo, descripcion, creado_por, id_reactivo, tipo_ejercicio, activo)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const insertValues = [
            nuevoTitulo,
            `${original.descripcion} (Copia)`,
            creadoPor,
            original.id_reactivo,
            original.tipo_ejercicio,
            true
        ];
        
        const result = await client.query(insertQuery, insertValues);

        await client.query('COMMIT');
        return result.rows[0];

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Función helper para ejecutar queries
 */
const executeQuery = async (query, params = []) => {
    try {
        const result = await pool.query(query, params);
        return result;
    } catch (error) {
        throw new Error(`Error al ejecutar query: ${error.message}`);
    }
};

module.exports = {
    crearEjercicio,
    obtenerEjercicios,
    obtenerEjercicioPorId,
    actualizarEjercicio,
    eliminarEjercicio,
    obtenerEjerciciosPorTipo,
    obtenerEjerciciosDisponibles,
    obtenerEstadisticasEjercicios,
    duplicarEjercicio,
    executeQuery
};
