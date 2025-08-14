const pool = require('../../db/connection');
const Joi = require('joi');

// =====================================================
// SCHEMAS DE VALIDACIÓN
// =====================================================

const kitSchema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    descripcion: Joi.string().max(1000).optional(),
    creado_por: Joi.number().integer().required(),
    activo: Joi.boolean().optional().default(true)
});

const kitUpdateSchema = Joi.object({
    name: Joi.string().min(3).max(255).optional(),
    descripcion: Joi.string().max(1000).optional(),
    activo: Joi.boolean().optional()
});

const validateKit = (data) => {
    const { error } = kitSchema.validate(data);
    if (error) {
        throw new Error(`Datos del kit inválidos: ${error.details[0].message}`);
    }
};

const validateKitUpdate = (data) => {
    const { error } = kitUpdateSchema.validate(data);
    if (error) {
        throw new Error(`Datos de actualización del kit inválidos: ${error.details[0].message}`);
    }
};

// =====================================================
// FUNCIONES DEL MODELO
// =====================================================

/**
 * Crear un nuevo kit
 */
const crearKit = async ({ name, descripcion, creado_por, activo = true }) => {
    validateKit({ name, descripcion, creado_por, activo });

    const query = `
        INSERT INTO kits (name, descripcion, creado_por, activo)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [name, descripcion, creado_por, activo];
    const result = await pool.query(query, values);
    return result.rows[0];
};

/**
 * Obtener todos los kits con información del creador
 */
const obtenerKits = async ({ 
    limit = 20, 
    offset = 0, 
    activo = null, 
    creado_por = null,
    buscar = null 
} = {}) => {
    let conditions = [];
    let values = [];
    let valueIndex = 1;

    // Filtros opcionales
    if (activo !== null) {
        conditions.push(`k.activo = $${valueIndex}`);
        values.push(activo);
        valueIndex++;
    }

    if (creado_por) {
        conditions.push(`k.creado_por = $${valueIndex}`);
        values.push(creado_por);
        valueIndex++;
    }

    if (buscar) {
        conditions.push(`(k.name ILIKE $${valueIndex} OR k.descripcion ILIKE $${valueIndex})`);
        values.push(`%${buscar}%`);
        valueIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
        SELECT 
            k.kit_id,
            k.name,
            k.descripcion,
            k.creado_por,
            k.fecha_creacion,
            k.updated_at,
            k.activo,
            u.nombre as creador_nombre,
            u.correo as creador_correo,
            COUNT(ek.ejercicio_id) as total_ejercicios,
            COUNT(*) OVER() as total_count
        FROM kits k
        INNER JOIN Usuario u ON k.creado_por = u.usuario_id
        LEFT JOIN ejercicios_kits ek ON k.kit_id = ek.kit_id
        ${whereClause}
        GROUP BY k.kit_id, u.nombre, u.correo
        ORDER BY k.fecha_creacion DESC
        LIMIT $${valueIndex} OFFSET $${valueIndex + 1};
    `;
    
    values.push(limit, offset);
    const result = await pool.query(query, values);
    
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const kits = result.rows.map(row => {
        const { total_count, ...kit } = row;
        return kit;
    });

    return { kits, total };
};

/**
 * Obtener un kit por ID con sus ejercicios
 */
const obtenerKitPorId = async (kitId) => {
    // Obtener información del kit
    const kitQuery = `
        SELECT 
            k.kit_id,
            k.name,
            k.descripcion,
            k.creado_por,
            k.fecha_creacion,
            k.updated_at,
            k.activo,
            u.nombre as creador_nombre,
            u.correo as creador_correo
        FROM kits k
        INNER JOIN Usuario u ON k.creado_por = u.usuario_id
        WHERE k.kit_id = $1;
    `;
    const kitResult = await pool.query(kitQuery, [kitId]);
    
    if (kitResult.rows.length === 0) {
        return null;
    }

    const kit = kitResult.rows[0];

    // Obtener ejercicios del kit
    const ejerciciosQuery = `
        SELECT 
            e.ejercicio_id,
            e.titulo,
            e.descripcion,
            e.creado_por,
            e.created_at,
            e.activo,
            ek.orden_en_kit,
            u.nombre as creador_ejercicio_nombre
        FROM ejercicios_kits ek
        INNER JOIN ejercicios e ON ek.ejercicio_id = e.ejercicio_id
        INNER JOIN Usuario u ON e.creado_por = u.usuario_id
        WHERE ek.kit_id = $1
        ORDER BY ek.orden_en_kit ASC;
    `;
    const ejerciciosResult = await pool.query(ejerciciosQuery, [kitId]);

    return {
        ...kit,
        ejercicios: ejerciciosResult.rows
    };
};

/**
 * Actualizar un kit
 */
const actualizarKit = async (kitId, datosActualizacion) => {
    validateKitUpdate(datosActualizacion);

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
        UPDATE kits 
        SET ${fields.join(', ')}
        WHERE kit_id = $${valueIndex}
        RETURNING *;
    `;
    values.push(kitId);

    const result = await pool.query(query, values);
    return result.rows[0];
};

/**
 * Eliminar un kit (soft delete)
 */
const eliminarKit = async (kitId) => {
    const query = `
        UPDATE kits 
        SET activo = false
        WHERE kit_id = $1
        RETURNING *;
    `;
    const result = await pool.query(query, [kitId]);
    return result.rows[0];
};

/**
 * Agregar ejercicio a un kit
 */
const agregarEjercicioAKit = async (kitId, ejercicioId, ordenEnKit = null) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Verificar que el kit y ejercicio existan
        const kitExists = await client.query('SELECT kit_id FROM kits WHERE kit_id = $1 AND activo = true', [kitId]);
        if (kitExists.rows.length === 0) {
            throw new Error('Kit no encontrado o inactivo');
        }

        const ejercicioExists = await client.query('SELECT ejercicio_id FROM ejercicios WHERE ejercicio_id = $1 AND activo = true', [ejercicioId]);
        if (ejercicioExists.rows.length === 0) {
            throw new Error('Ejercicio no encontrado o inactivo');
        }

        // Si no se especifica orden, obtener el siguiente disponible
        if (!ordenEnKit) {
            const maxOrdenResult = await client.query(
                'SELECT COALESCE(MAX(orden_en_kit), 0) + 1 as siguiente_orden FROM ejercicios_kits WHERE kit_id = $1',
                [kitId]
            );
            ordenEnKit = maxOrdenResult.rows[0].siguiente_orden;
        }

        // Insertar la relación
        const insertQuery = `
            INSERT INTO ejercicios_kits (kit_id, ejercicio_id, orden_en_kit)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await client.query(insertQuery, [kitId, ejercicioId, ordenEnKit]);

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
 * Remover ejercicio de un kit
 */
const removerEjercicioDeKit = async (kitId, ejercicioId) => {
    const query = `
        DELETE FROM ejercicios_kits 
        WHERE kit_id = $1 AND ejercicio_id = $2
        RETURNING *;
    `;
    const result = await pool.query(query, [kitId, ejercicioId]);
    return result.rows[0];
};

/**
 * Reordenar ejercicios en un kit
 */
const reordenarEjerciciosEnKit = async (kitId, nuevosOrdenes) => {
    // nuevosOrdenes es un array de objetos: [{ ejercicio_id, orden_en_kit }]
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        for (const item of nuevosOrdenes) {
            await client.query(
                'UPDATE ejercicios_kits SET orden_en_kit = $1 WHERE kit_id = $2 AND ejercicio_id = $3',
                [item.orden_en_kit, kitId, item.ejercicio_id]
            );
        }

        await client.query('COMMIT');
        return { success: true, message: 'Ejercicios reordenados correctamente' };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    crearKit,
    obtenerKits,
    obtenerKitPorId,
    actualizarKit,
    eliminarKit,
    agregarEjercicioAKit,
    removerEjercicioDeKit,
    reordenarEjerciciosEnKit
};
