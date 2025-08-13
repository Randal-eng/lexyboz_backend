const pool = require('../../../db/connection');
const Joi = require('joi');

// Esquema de validación para SubTipo
const subTipoSchema = Joi.object({
    tipo: Joi.number().integer().positive().required().messages({
        'number.base': 'El ID del tipo debe ser un número',
        'number.integer': 'El ID del tipo debe ser un número entero',
        'number.positive': 'El ID del tipo debe ser positivo',
        'any.required': 'El ID del tipo es requerido'
    }),
    sub_tipo_nombre: Joi.string().max(100).required().messages({
        'string.empty': 'El nombre del sub-tipo es requerido',
        'string.max': 'El nombre del sub-tipo no puede exceder 100 caracteres',
        'any.required': 'El nombre del sub-tipo es requerido'
    })
});

// Esquema de validación para actualización
const subTipoUpdateSchema = Joi.object({
    tipo: Joi.number().integer().positive().optional().messages({
        'number.base': 'El ID del tipo debe ser un número',
        'number.integer': 'El ID del tipo debe ser un número entero',
        'number.positive': 'El ID del tipo debe ser positivo'
    }),
    sub_tipo_nombre: Joi.string().max(100).optional().messages({
        'string.empty': 'El nombre del sub-tipo no puede estar vacío',
        'string.max': 'El nombre del sub-tipo no puede exceder 100 caracteres'
    })
});

class SubTipo {
    /**
     * Crear un nuevo sub-tipo
     * @param {Object} subTipoData - Datos del sub-tipo
     * @returns {Object} - Sub-tipo creado
     */
    static async createSubTipo(subTipoData) {
        // Validar datos
        const { error, value } = subTipoSchema.validate(subTipoData);
        if (error) {
            throw new Error(`Error de validación: ${error.details[0].message}`);
        }

        const { tipo, sub_tipo_nombre } = value;

        try {
            const query = `
                INSERT INTO Sub_tipo (tipo, sub_tipo_nombre) 
                VALUES ($1, $2) 
                RETURNING id_sub_tipo, tipo, sub_tipo_nombre, created_at, updated_at
            `;
            const result = await pool.query(query, [tipo, sub_tipo_nombre]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                throw new Error('Ya existe un sub-tipo con ese nombre para este tipo');
            }
            if (error.code === '23503') { // Foreign key violation
                throw new Error('El tipo especificado no existe');
            }
            throw error;
        }
    }

    /**
     * Obtener todos los sub-tipos
     * @returns {Array} - Lista de sub-tipos con información del tipo
     */
    static async getAllSubTipos() {
        try {
            const query = `
                SELECT 
                    st.id_sub_tipo,
                    st.tipo,
                    st.sub_tipo_nombre,
                    st.created_at,
                    st.updated_at,
                    t.tipo_nombre
                FROM Sub_tipo st
                JOIN Tipos t ON st.tipo = t.id_tipo
                ORDER BY t.tipo_nombre, st.sub_tipo_nombre ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener sub-tipo por ID
     * @param {number} id_sub_tipo - ID del sub-tipo
     * @returns {Object} - Sub-tipo encontrado
     */
    static async getSubTipoById(id_sub_tipo) {
        try {
            const query = `
                SELECT 
                    st.id_sub_tipo,
                    st.tipo,
                    st.sub_tipo_nombre,
                    st.created_at,
                    st.updated_at,
                    t.tipo_nombre
                FROM Sub_tipo st
                JOIN Tipos t ON st.tipo = t.id_tipo
                WHERE st.id_sub_tipo = $1
            `;
            const result = await pool.query(query, [id_sub_tipo]);
            
            if (result.rows.length === 0) {
                throw new Error('Sub-tipo no encontrado');
            }
            
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener sub-tipos por tipo
     * @param {number} tipo - ID del tipo
     * @returns {Array} - Lista de sub-tipos del tipo especificado
     */
    static async getSubTiposByTipo(tipo) {
        try {
            const query = `
                SELECT 
                    st.id_sub_tipo,
                    st.tipo,
                    st.sub_tipo_nombre,
                    st.created_at,
                    st.updated_at,
                    t.tipo_nombre
                FROM Sub_tipo st
                JOIN Tipos t ON st.tipo = t.id_tipo
                WHERE st.tipo = $1
                ORDER BY st.sub_tipo_nombre ASC
            `;
            const result = await pool.query(query, [tipo]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualizar sub-tipo
     * @param {number} id_sub_tipo - ID del sub-tipo
     * @param {Object} updateData - Datos a actualizar
     * @returns {Object} - Sub-tipo actualizado
     */
    static async updateSubTipo(id_sub_tipo, updateData) {
        // Validar datos
        const { error, value } = subTipoUpdateSchema.validate(updateData);
        if (error) {
            throw new Error(`Error de validación: ${error.details[0].message}`);
        }

        // Verificar que el sub-tipo existe
        await this.getSubTipoById(id_sub_tipo);

        const { tipo, sub_tipo_nombre } = value;

        try {
            const query = `
                UPDATE Sub_tipo 
                SET tipo = COALESCE($1, tipo),
                    sub_tipo_nombre = COALESCE($2, sub_tipo_nombre),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id_sub_tipo = $3
                RETURNING id_sub_tipo, tipo, sub_tipo_nombre, created_at, updated_at
            `;
            const result = await pool.query(query, [tipo, sub_tipo_nombre, id_sub_tipo]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                throw new Error('Ya existe un sub-tipo con ese nombre para este tipo');
            }
            if (error.code === '23503') { // Foreign key violation
                throw new Error('El tipo especificado no existe');
            }
            throw error;
        }
    }

    /**
     * Eliminar sub-tipo
     * @param {number} id_sub_tipo - ID del sub-tipo
     * @returns {boolean} - Éxito de la operación
     */
    static async deleteSubTipo(id_sub_tipo) {
        // Verificar que el sub-tipo existe
        await this.getSubTipoById(id_sub_tipo);

        try {
            const query = `DELETE FROM Sub_tipo WHERE id_sub_tipo = $1`;
            const result = await pool.query(query, [id_sub_tipo]);
            return result.rowCount > 0;
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('No se puede eliminar el sub-tipo porque tiene ejercicios asociados');
            }
            throw error;
        }
    }

    /**
     * Buscar sub-tipos por nombre
     * @param {string} searchTerm - Término de búsqueda
     * @param {number} tipo - ID del tipo (opcional)
     * @returns {Array} - Sub-tipos encontrados
     */
    static async searchSubTipos(searchTerm, tipo = null) {
        try {
            let query = `
                SELECT 
                    st.id_sub_tipo,
                    st.tipo,
                    st.sub_tipo_nombre,
                    st.created_at,
                    st.updated_at,
                    t.tipo_nombre
                FROM Sub_tipo st
                JOIN Tipos t ON st.tipo = t.id_tipo
                WHERE st.sub_tipo_nombre ILIKE $1
            `;
            
            const params = [`%${searchTerm}%`];
            
            if (tipo) {
                query += ` AND st.tipo = $2`;
                params.push(tipo);
            }
            
            query += ` ORDER BY t.tipo_nombre, st.sub_tipo_nombre ASC`;
            
            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Contar sub-tipos por tipo
     * @returns {Array} - Conteo de sub-tipos por tipo
     */
    static async countSubTiposByTipo() {
        try {
            const query = `
                SELECT 
                    t.id_tipo,
                    t.tipo_nombre,
                    COUNT(st.id_sub_tipo) as cantidad_subtipos
                FROM Tipos t
                LEFT JOIN Sub_tipo st ON t.id_tipo = st.tipo
                GROUP BY t.id_tipo, t.tipo_nombre
                ORDER BY t.tipo_nombre ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verificar si existe un sub-tipo con el mismo nombre en el tipo
     * @param {string} sub_tipo_nombre - Nombre del sub-tipo
     * @param {number} tipo - ID del tipo
     * @param {number} exclude_id - ID a excluir (para updates)
     * @returns {boolean} - Si existe o no
     */
    static async existsSubTipoInTipo(sub_tipo_nombre, tipo, exclude_id = null) {
        try {
            let query = `
                SELECT id_sub_tipo 
                FROM Sub_tipo 
                WHERE tipo = $1 AND sub_tipo_nombre = $2
            `;
            const params = [tipo, sub_tipo_nombre];
            
            if (exclude_id) {
                query += ` AND id_sub_tipo != $3`;
                params.push(exclude_id);
            }
            
            const result = await pool.query(query, params);
            return result.rows.length > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = SubTipo;
