const pool = require('../../../db/connection');
const Joi = require('joi');

// Esquema de validación para Tipo
const tipoSchema = Joi.object({
    tipo_nombre: Joi.string().max(100).required().messages({
        'string.empty': 'El nombre del tipo es requerido',
        'string.max': 'El nombre del tipo no puede exceder 100 caracteres',
        'any.required': 'El nombre del tipo es requerido'
    })
});

// Esquema de validación para actualización (campos opcionales)
const tipoUpdateSchema = Joi.object({
    tipo_nombre: Joi.string().max(100).optional().messages({
        'string.empty': 'El nombre del tipo no puede estar vacío',
        'string.max': 'El nombre del tipo no puede exceder 100 caracteres'
    })
});

class Tipo {
    /**
     * Crear un nuevo tipo
     * @param {Object} tipoData - Datos del tipo
     * @returns {Object} - Tipo creado
     */
    static async createTipo(tipoData) {
        // Validar datos
        const { error, value } = tipoSchema.validate(tipoData);
        if (error) {
            throw new Error(`Error de validación: ${error.details[0].message}`);
        }

        const { tipo_nombre } = value;

        try {
            const query = `
                INSERT INTO Tipos (tipo_nombre) 
                VALUES ($1) 
                RETURNING id_tipo, tipo_nombre, created_at, updated_at
            `;
            const result = await pool.query(query, [tipo_nombre]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                throw new Error('Ya existe un tipo con ese nombre');
            }
            throw error;
        }
    }

    /**
     * Obtener todos los tipos
     * @returns {Array} - Lista de tipos
     */
    static async getAllTipos() {
        try {
            const query = `
                SELECT id_tipo, tipo_nombre, created_at, updated_at 
                FROM Tipos 
                ORDER BY tipo_nombre ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener tipo por ID
     * @param {number} id_tipo - ID del tipo
     * @returns {Object} - Tipo encontrado
     */
    static async getTipoById(id_tipo) {
        try {
            const query = `
                SELECT id_tipo, tipo_nombre, created_at, updated_at 
                FROM Tipos 
                WHERE id_tipo = $1
            `;
            const result = await pool.query(query, [id_tipo]);
            
            if (result.rows.length === 0) {
                throw new Error('Tipo no encontrado');
            }
            
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener tipo con sus sub-tipos
     * @param {number} id_tipo - ID del tipo
     * @returns {Object} - Tipo con sus sub-tipos
     */
    static async getTipoWithSubTipos(id_tipo) {
        try {
            const query = `
                SELECT 
                    t.id_tipo,
                    t.tipo_nombre,
                    t.created_at,
                    t.updated_at,
                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id_sub_tipo', st.id_sub_tipo,
                                'sub_tipo_nombre', st.sub_tipo_nombre,
                                'created_at', st.created_at,
                                'updated_at', st.updated_at
                            ) ORDER BY st.sub_tipo_nombre
                        ) FILTER (WHERE st.id_sub_tipo IS NOT NULL), 
                        '[]'
                    ) as sub_tipos
                FROM Tipos t
                LEFT JOIN Sub_tipo st ON t.id_tipo = st.tipo
                WHERE t.id_tipo = $1
                GROUP BY t.id_tipo, t.tipo_nombre, t.created_at, t.updated_at
            `;
            const result = await pool.query(query, [id_tipo]);
            
            if (result.rows.length === 0) {
                throw new Error('Tipo no encontrado');
            }
            
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener todos los tipos con sus sub-tipos
     * @returns {Array} - Lista de tipos con sus sub-tipos
     */
    static async getAllTiposWithSubTipos() {
        try {
            const query = `
                SELECT 
                    t.id_tipo,
                    t.tipo_nombre,
                    t.created_at as tipo_created_at,
                    t.updated_at as tipo_updated_at,
                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id_sub_tipo', st.id_sub_tipo,
                                'sub_tipo_nombre', st.sub_tipo_nombre,
                                'created_at', st.created_at,
                                'updated_at', st.updated_at
                            ) ORDER BY st.sub_tipo_nombre
                        ) FILTER (WHERE st.id_sub_tipo IS NOT NULL), 
                        '[]'
                    ) as sub_tipos
                FROM Tipos t
                LEFT JOIN Sub_tipo st ON t.id_tipo = st.tipo
                GROUP BY t.id_tipo, t.tipo_nombre, t.created_at, t.updated_at
                ORDER BY t.tipo_nombre ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualizar tipo
     * @param {number} id_tipo - ID del tipo
     * @param {Object} updateData - Datos a actualizar
     * @returns {Object} - Tipo actualizado
     */
    static async updateTipo(id_tipo, updateData) {
        // Validar datos
        const { error, value } = tipoUpdateSchema.validate(updateData);
        if (error) {
            throw new Error(`Error de validación: ${error.details[0].message}`);
        }

        // Verificar que el tipo existe
        await this.getTipoById(id_tipo);

        const { tipo_nombre } = value;

        try {
            const query = `
                UPDATE Tipos 
                SET tipo_nombre = COALESCE($1, tipo_nombre),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id_tipo = $2
                RETURNING id_tipo, tipo_nombre, created_at, updated_at
            `;
            const result = await pool.query(query, [tipo_nombre, id_tipo]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                throw new Error('Ya existe un tipo con ese nombre');
            }
            throw error;
        }
    }

    /**
     * Eliminar tipo
     * @param {number} id_tipo - ID del tipo
     * @returns {boolean} - Éxito de la operación
     */
    static async deleteTipo(id_tipo) {
        // Verificar que el tipo existe
        await this.getTipoById(id_tipo);

        try {
            const query = `DELETE FROM Tipos WHERE id_tipo = $1`;
            const result = await pool.query(query, [id_tipo]);
            return result.rowCount > 0;
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('No se puede eliminar el tipo porque tiene sub-tipos o ejercicios asociados');
            }
            throw error;
        }
    }

    /**
     * Buscar tipos por nombre
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Array} - Tipos encontrados
     */
    static async searchTipos(searchTerm) {
        try {
            const query = `
                SELECT id_tipo, tipo_nombre, created_at, updated_at 
                FROM Tipos 
                WHERE tipo_nombre ILIKE $1
                ORDER BY tipo_nombre ASC
            `;
            const result = await pool.query(query, [`%${searchTerm}%`]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Tipo;
