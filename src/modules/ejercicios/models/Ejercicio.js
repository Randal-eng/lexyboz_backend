const pool = require('../../../db/connection');
const Joi = require('joi');

// Esquema de validación para crear ejercicio
const ejercicioSchema = Joi.object({
    titulo: Joi.string().min(3).max(100).required().messages({
        'string.base': 'El título debe ser un texto',
        'string.min': 'El título debe tener al menos 3 caracteres',
        'string.max': 'El título no puede exceder 100 caracteres',
        'any.required': 'El título es requerido'
    }),
    descripcion: Joi.string().max(500).optional().allow('').messages({
        'string.base': 'La descripción debe ser un texto',
        'string.max': 'La descripción no puede exceder 500 caracteres'
    }),
    tipo_ejercicio: Joi.string().max(50).optional().messages({
        'string.base': 'El tipo de ejercicio debe ser un texto',
        'string.max': 'El tipo de ejercicio no puede exceder 50 caracteres'
    }),
    tipo_reactivo: Joi.number().integer().positive().required().messages({
        'number.base': 'El tipo de reactivo debe ser un número',
        'number.integer': 'El tipo de reactivo debe ser un número entero',
        'number.positive': 'El tipo de reactivo debe ser positivo',
        'any.required': 'El tipo de reactivo es requerido'
    }),
    creado_por: Joi.number().integer().positive().required().messages({
        'number.base': 'El ID del creador debe ser un número',
        'number.integer': 'El ID del creador debe ser un número entero',
        'number.positive': 'El ID del creador debe ser positivo',
        'any.required': 'El ID del creador es requerido'
    })
});

// Esquema de validación para actualizar ejercicio
const ejercicioUpdateSchema = Joi.object({
    titulo: Joi.string().min(3).max(100).optional().messages({
        'string.base': 'El título debe ser un texto',
        'string.min': 'El título debe tener al menos 3 caracteres',
        'string.max': 'El título no puede exceder 100 caracteres'
    }),
    descripcion: Joi.string().max(500).optional().allow('').messages({
        'string.base': 'La descripción debe ser un texto',
        'string.max': 'La descripción no puede exceder 500 caracteres'
    }),
    tipo_ejercicio: Joi.string().max(50).optional().messages({
        'string.base': 'El tipo de ejercicio debe ser un texto',
        'string.max': 'El tipo de ejercicio no puede exceder 50 caracteres'
    }),
    tipo_reactivo: Joi.number().integer().positive().optional().messages({
        'number.base': 'El tipo de reactivo debe ser un número',
        'number.integer': 'El tipo de reactivo debe ser un número entero',
        'number.positive': 'El tipo de reactivo debe ser positivo'
    })
});

class Ejercicio {
    /**
     * Crear un nuevo ejercicio
     * @param {Object} ejercicioData - Datos del ejercicio
     * @returns {Object} - Ejercicio creado
     */
    static async createEjercicio(ejercicioData) {
        // Validar datos
        const { error, value } = ejercicioSchema.validate(ejercicioData);
        if (error) {
            throw new Error(`Error de validación: ${error.details[0].message}`);
        }

        const { titulo, descripcion, tipo_ejercicio, tipo_reactivo, creado_por } = value;

        try {
            const query = `
                INSERT INTO Ejercicios (titulo, descripcion, tipo_ejercicio, tipo_reactivo, creado_por)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING ejercicio_id, titulo, descripcion, tipo_ejercicio, tipo_reactivo, 
                         creado_por, fecha_creacion, fecha_actualizacion
            `;
            const result = await pool.query(query, [titulo, descripcion, tipo_ejercicio, tipo_reactivo, creado_por]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23503') {
                if (error.constraint?.includes('fk_ejercicio_tipo')) {
                    throw new Error('El tipo de reactivo especificado no existe');
                }
                throw new Error('El usuario creador especificado no existe');
            }
            throw error;
        }
    }

    /**
     * Obtener todos los ejercicios con información completa
     * @param {Object} filters - Filtros opcionales
     * @returns {Array} - Lista de ejercicios
     */
    static async getAllEjercicios(filters = {}) {
        try {
            let query = `
                SELECT 
                    e.ejercicio_id,
                    e.titulo,
                    e.descripcion,
                    e.tipo_ejercicio,
                    e.tipo_reactivo,
                    e.creado_por,
                    e.fecha_creacion,
                    e.fecha_actualizacion,
                    t.tipo_nombre,
                    u.nombre as creador_nombre,
                    COUNT(er.id_reactivo) as total_reactivos
                FROM Ejercicios e
                LEFT JOIN Tipos t ON e.tipo_reactivo = t.id_tipo
                LEFT JOIN Usuario u ON e.creado_por = u.usuario_id
                LEFT JOIN Ejercicio_Reactivos er ON e.ejercicio_id = er.ejercicio_id
            `;
            
            const params = [];
            const conditions = [];

            // Filtro por tipo de reactivo
            if (filters.tipo_reactivo) {
                conditions.push(`e.tipo_reactivo = $${params.length + 1}`);
                params.push(filters.tipo_reactivo);
            }

            // Filtro por creador
            if (filters.creado_por) {
                conditions.push(`e.creado_por = $${params.length + 1}`);
                params.push(filters.creado_por);
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }

            query += ` GROUP BY e.ejercicio_id, e.titulo, e.descripcion, e.tipo_ejercicio, e.tipo_reactivo, 
                       e.creado_por, e.fecha_creacion, e.fecha_actualizacion, t.tipo_nombre, u.nombre
                       ORDER BY e.fecha_creacion DESC`;

            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener ejercicio por ID con información completa
     * @param {number} ejercicio_id - ID del ejercicio
     * @returns {Object} - Ejercicio encontrado
     */
    static async getEjercicioById(ejercicio_id) {
        try {
            const query = `
                SELECT 
                    e.ejercicio_id,
                    e.titulo,
                    e.descripcion,
                    e.tipo_ejercicio,
                    e.tipo_reactivo,
                    e.creado_por,
                    e.fecha_creacion,
                    e.fecha_actualizacion,
                    t.tipo_nombre,
                    u.nombre as creador_nombre,
                    COUNT(er.id_reactivo) as total_reactivos
                FROM Ejercicios e
                LEFT JOIN Tipos t ON e.tipo_reactivo = t.id_tipo
                LEFT JOIN Usuario u ON e.creado_por = u.usuario_id
                LEFT JOIN Ejercicio_Reactivos er ON e.ejercicio_id = er.ejercicio_id
                WHERE e.ejercicio_id = $1
                GROUP BY e.ejercicio_id, e.titulo, e.descripcion, e.tipo_ejercicio, e.tipo_reactivo, 
                         e.creado_por, e.fecha_creacion, e.fecha_actualizacion, t.tipo_nombre, u.nombre
            `;
            const result = await pool.query(query, [ejercicio_id]);
            
            if (result.rows.length === 0) {
                throw new Error('Ejercicio no encontrado');
            }
            
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualizar ejercicio
     * @param {number} ejercicio_id - ID del ejercicio
     * @param {Object} updateData - Datos a actualizar
     * @returns {Object} - Ejercicio actualizado
     */
    static async updateEjercicio(ejercicio_id, updateData) {
        // Validar datos
        const { error, value } = ejercicioUpdateSchema.validate(updateData);
        if (error) {
            throw new Error(`Error de validación: ${error.details[0].message}`);
        }

        // Verificar que el ejercicio existe
        await this.getEjercicioById(ejercicio_id);

        const { titulo, descripcion, tipo_ejercicio, tipo_reactivo } = value;

        try {
            const query = `
                UPDATE Ejercicios 
                SET titulo = COALESCE($1, titulo),
                    descripcion = COALESCE($2, descripcion),
                    tipo_ejercicio = COALESCE($3, tipo_ejercicio),
                    tipo_reactivo = COALESCE($4, tipo_reactivo),
                    fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE ejercicio_id = $5
                RETURNING ejercicio_id, titulo, descripcion, tipo_ejercicio, tipo_reactivo, 
                         creado_por, fecha_creacion, fecha_actualizacion
            `;
            const result = await pool.query(query, [titulo, descripcion, tipo_ejercicio, tipo_reactivo, ejercicio_id]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23503' && error.constraint?.includes('fk_ejercicio_tipo')) {
                throw new Error('El tipo de reactivo especificado no existe');
            }
            throw error;
        }
    }

    /**
     * Eliminar ejercicio
     * @param {number} ejercicio_id - ID del ejercicio
     * @returns {boolean} - Éxito de la operación
     */
    static async deleteEjercicio(ejercicio_id) {
        // Verificar que el ejercicio existe
        await this.getEjercicioById(ejercicio_id);

        try {
            const query = `DELETE FROM Ejercicios WHERE ejercicio_id = $1`;
            const result = await pool.query(query, [ejercicio_id]);
            return result.rowCount > 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Buscar ejercicios por título
     * @param {string} termino - Término de búsqueda
     * @returns {Array} - Ejercicios encontrados
     */
    static async searchEjercicios(termino) {
        try {
            const query = `
                SELECT 
                    e.ejercicio_id,
                    e.titulo,
                    e.descripcion,
                    e.tipo_ejercicio,
                    e.tipo_reactivo,
                    e.creado_por,
                    e.fecha_creacion,
                    t.tipo_nombre,
                    u.nombre as creador_nombre,
                    COUNT(er.id_reactivo) as total_reactivos
                FROM Ejercicios e
                LEFT JOIN Tipos t ON e.tipo_reactivo = t.id_tipo
                LEFT JOIN Usuario u ON e.creado_por = u.usuario_id
                LEFT JOIN Ejercicio_Reactivos er ON e.ejercicio_id = er.ejercicio_id
                WHERE LOWER(e.titulo) ILIKE LOWER($1) 
                   OR LOWER(e.descripcion) ILIKE LOWER($1)
                GROUP BY e.ejercicio_id, e.titulo, e.descripcion, e.tipo_ejercicio, e.tipo_reactivo, 
                         e.creado_por, e.fecha_creacion, t.tipo_nombre, u.nombre
                ORDER BY e.fecha_creacion DESC
            `;
            const result = await pool.query(query, [`%${termino}%`]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener ejercicios por tipo de reactivo
     * @param {number} tipo_reactivo - ID del tipo de reactivo
     * @returns {Array} - Ejercicios del tipo especificado
     */
    static async getEjerciciosByTipo(tipo_reactivo) {
        try {
            const query = `
                SELECT 
                    e.ejercicio_id,
                    e.titulo,
                    e.descripcion,
                    e.tipo_ejercicio,
                    e.tipo_reactivo,
                    e.creado_por,
                    e.fecha_creacion,
                    t.tipo_nombre,
                    u.nombre as creador_nombre,
                    COUNT(er.id_reactivo) as total_reactivos
                FROM Ejercicios e
                LEFT JOIN Tipos t ON e.tipo_reactivo = t.id_tipo
                LEFT JOIN Usuario u ON e.creado_por = u.usuario_id
                LEFT JOIN Ejercicio_Reactivos er ON e.ejercicio_id = er.ejercicio_id
                WHERE e.tipo_reactivo = $1
                GROUP BY e.ejercicio_id, e.titulo, e.descripcion, e.tipo_ejercicio, e.tipo_reactivo, 
                         e.creado_por, e.fecha_creacion, t.tipo_nombre, u.nombre
                ORDER BY e.fecha_creacion DESC
            `;
            const result = await pool.query(query, [tipo_reactivo]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener estadísticas generales de ejercicios
     * @returns {Object} - Estadísticas
     */
    static async getEjerciciosStats() {
        try {
            const query = `
                SELECT 
                    COUNT(e.ejercicio_id) as total_ejercicios,
                    COUNT(CASE WHEN er.ejercicio_id IS NOT NULL THEN 1 END) as ejercicios_con_reactivos,
                    COUNT(CASE WHEN er.ejercicio_id IS NULL THEN 1 END) as ejercicios_sin_reactivos,
                    COUNT(DISTINCT e.tipo_reactivo) as tipos_diferentes,
                    ROUND(AVG(reactivos_por_ejercicio.total), 2) as promedio_reactivos_por_ejercicio
                FROM Ejercicios e
                LEFT JOIN Ejercicio_Reactivos er ON e.ejercicio_id = er.ejercicio_id
                LEFT JOIN (
                    SELECT ejercicio_id, COUNT(*) as total
                    FROM Ejercicio_Reactivos
                    GROUP BY ejercicio_id
                ) reactivos_por_ejercicio ON e.ejercicio_id = reactivos_por_ejercicio.ejercicio_id
            `;
            const result = await pool.query(query);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Ejercicio;
