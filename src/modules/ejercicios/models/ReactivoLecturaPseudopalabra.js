const pool = require('../../../db/connection');
const Joi = require('joi');

// Esquema de validación para ReactivoLecturaPseudopalabra
const reactivoSchema = Joi.object({
    id_sub_tipo: Joi.number().integer().positive().required().messages({
        'number.base': 'El ID del sub-tipo debe ser un número',
        'number.integer': 'El ID del sub-tipo debe ser un número entero',
        'number.positive': 'El ID del sub-tipo debe ser positivo',
        'any.required': 'El ID del sub-tipo es requerido'
    }),
    tiempo_duracion: Joi.number().integer().min(1000).max(30000).optional().messages({
        'number.base': 'El tiempo de duración debe ser un número',
        'number.integer': 'El tiempo de duración debe ser un número entero',
        'number.min': 'El tiempo de duración debe ser al menos 1000ms (1 segundo)',
        'number.max': 'El tiempo de duración no puede exceder 30000ms (30 segundos)'
    }),
    pseudopalabra: Joi.string().max(100).required().messages({
        'string.empty': 'La pseudopalabra es requerida',
        'string.max': 'La pseudopalabra no puede exceder 100 caracteres',
        'any.required': 'La pseudopalabra es requerida'
    }),
    ejercicio_id: Joi.number().integer().positive().optional().allow(null).messages({
        'number.base': 'El ID del ejercicio debe ser un número',
        'number.integer': 'El ID del ejercicio debe ser un número entero',
        'number.positive': 'El ID del ejercicio debe ser positivo'
    }),
    orden_reactivo: Joi.number().integer().min(1).optional().messages({
        'number.base': 'El orden debe ser un número',
        'number.integer': 'El orden debe ser un número entero',
        'number.min': 'El orden debe ser mayor a 0'
    })
});

// Esquema de validación para actualización
const reactivoUpdateSchema = Joi.object({
    id_sub_tipo: Joi.number().integer().positive().optional().messages({
        'number.base': 'El ID del sub-tipo debe ser un número',
        'number.integer': 'El ID del sub-tipo debe ser un número entero',
        'number.positive': 'El ID del sub-tipo debe ser positivo'
    }),
    tiempo_duracion: Joi.number().integer().min(1000).max(30000).optional().messages({
        'number.base': 'El tiempo de duración debe ser un número',
        'number.integer': 'El tiempo de duración debe ser un número entero',
        'number.min': 'El tiempo de duración debe ser al menos 1000ms (1 segundo)',
        'number.max': 'El tiempo de duración no puede exceder 30000ms (30 segundos)'
    }),
    pseudopalabra: Joi.string().max(100).optional().messages({
        'string.empty': 'La pseudopalabra no puede estar vacía',
        'string.max': 'La pseudopalabra no puede exceder 100 caracteres'
    }),
    ejercicio_id: Joi.number().integer().positive().optional().allow(null).messages({
        'number.base': 'El ID del ejercicio debe ser un número',
        'number.integer': 'El ID del ejercicio debe ser un número entero',
        'number.positive': 'El ID del ejercicio debe ser positivo'
    }),
    orden_reactivo: Joi.number().integer().min(1).optional().messages({
        'number.base': 'El orden debe ser un número',
        'number.integer': 'El orden debe ser un número entero',
        'number.min': 'El orden debe ser mayor a 0'
    })
});

class ReactivoLecturaPseudopalabra {
    /**
     * Crear un nuevo reactivo
     * @param {Object} reactivoData - Datos del reactivo
     * @returns {Object} - Reactivo creado
     */
    static async createReactivo(reactivoData) {
        // Validar datos
        const { error, value } = reactivoSchema.validate(reactivoData);
        if (error) {
            throw new Error(`Error de validación: ${error.details[0].message}`);
        }

        const { id_sub_tipo, tiempo_duracion, pseudopalabra, ejercicio_id, orden_reactivo } = value;

        try {
            const query = `
                INSERT INTO reactivo_lectura_pseudopalabras 
                (id_sub_tipo, tiempo_duracion, pseudopalabra, ejercicio_id, orden_reactivo) 
                VALUES ($1, $2, $3, $4, COALESCE($5, 1)) 
                RETURNING id_reactivo, id_sub_tipo, tiempo_duracion, pseudopalabra, 
                         ejercicio_id, orden_reactivo, created_at, updated_at
            `;
            const result = await pool.query(query, [id_sub_tipo, tiempo_duracion, pseudopalabra, ejercicio_id, orden_reactivo]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                if (error.constraint?.includes('fk_reactivo_ejercicio')) {
                    throw new Error('El ejercicio especificado no existe');
                }
                throw new Error('El sub-tipo especificado no existe');
            }
            if (error.message.includes('no puede agregarse al ejercicio')) {
                throw new Error(error.message);
            }
            throw error;
        }
    }

    /**
     * Obtener todos los reactivos
     * @param {Object} filters - Filtros opcionales
     * @returns {Array} - Lista de reactivos
     */
    static async getAllReactivos(filters = {}) {
        try {
            let query = `
                SELECT 
                    r.id_reactivo,
                    r.id_sub_tipo,
                    r.tiempo_duracion,
                    r.pseudopalabra,
                    r.created_at,
                    r.updated_at,
                    st.sub_tipo_nombre,
                    t.tipo_nombre
                FROM reactivo_lectura_pseudopalabras r
                JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
                JOIN Tipos t ON st.tipo = t.id_tipo
            `;
            
            const params = [];
            const conditions = [];

            // Filtro por sub-tipo
            if (filters.id_sub_tipo) {
                conditions.push(`r.id_sub_tipo = $${params.length + 1}`);
                params.push(filters.id_sub_tipo);
            }

            // Filtro por tipo
            if (filters.tipo) {
                conditions.push(`t.id_tipo = $${params.length + 1}`);
                params.push(filters.tipo);
            }

            // Filtro por duración
            if (filters.min_duracion) {
                conditions.push(`r.tiempo_duracion >= $${params.length + 1}`);
                params.push(filters.min_duracion);
            }
            if (filters.max_duracion) {
                conditions.push(`r.tiempo_duracion <= $${params.length + 1}`);
                params.push(filters.max_duracion);
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }

            query += ` ORDER BY r.id_reactivo ASC`;

            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener reactivo por ID
     * @param {number} id_reactivo - ID del reactivo
     * @returns {Object} - Reactivo encontrado
     */
    static async getReactivoById(id_reactivo) {
        try {
            const query = `
                SELECT 
                    r.id_reactivo,
                    r.id_sub_tipo,
                    r.tiempo_duracion,
                    r.pseudopalabra,
                    r.created_at,
                    r.updated_at,
                    st.sub_tipo_nombre,
                    t.tipo_nombre
                FROM reactivo_lectura_pseudopalabras r
                JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
                JOIN Tipos t ON st.tipo = t.id_tipo
                WHERE r.id_reactivo = $1
            `;
            const result = await pool.query(query, [id_reactivo]);
            
            if (result.rows.length === 0) {
                throw new Error('Reactivo no encontrado');
            }
            
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener reactivos por sub-tipo
     * @param {number} id_sub_tipo - ID del sub-tipo
     * @returns {Array} - Lista de reactivos del sub-tipo
     */
    static async getReactivosBySubTipo(id_sub_tipo) {
        try {
            const query = `
                SELECT 
                    r.id_reactivo,
                    r.id_sub_tipo,
                    r.tiempo_duracion,
                    r.pseudopalabra,
                    r.created_at,
                    r.updated_at,
                    st.sub_tipo_nombre,
                    t.tipo_nombre
                FROM reactivo_lectura_pseudopalabras r
                JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
                JOIN Tipos t ON st.tipo = t.id_tipo
                WHERE r.id_sub_tipo = $1
                ORDER BY r.pseudopalabra ASC
            `;
            const result = await pool.query(query, [id_sub_tipo]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualizar reactivo
     * @param {number} id_reactivo - ID del reactivo
     * @param {Object} updateData - Datos a actualizar
     * @returns {Object} - Reactivo actualizado
     */
    static async updateReactivo(id_reactivo, updateData) {
        // Validar datos
        const { error, value } = reactivoUpdateSchema.validate(updateData);
        if (error) {
            throw new Error(`Error de validación: ${error.details[0].message}`);
        }

        // Verificar que el reactivo existe
        await this.getReactivoById(id_reactivo);

        const { id_sub_tipo, tiempo_duracion, pseudopalabra } = value;

        try {
            const query = `
                UPDATE reactivo_lectura_pseudopalabras 
                SET id_sub_tipo = COALESCE($1, id_sub_tipo),
                    tiempo_duracion = COALESCE($2, tiempo_duracion),
                    pseudopalabra = COALESCE($3, pseudopalabra),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id_reactivo = $4
                RETURNING id_reactivo, id_sub_tipo, tiempo_duracion, pseudopalabra, created_at, updated_at
            `;
            const result = await pool.query(query, [id_sub_tipo, tiempo_duracion, pseudopalabra, id_reactivo]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('El sub-tipo especificado no existe');
            }
            throw error;
        }
    }

    /**
     * Eliminar reactivo
     * @param {number} id_reactivo - ID del reactivo
     * @returns {boolean} - Éxito de la operación
     */
    static async deleteReactivo(id_reactivo) {
        // Verificar que el reactivo existe
        await this.getReactivoById(id_reactivo);

        try {
            const query = `DELETE FROM reactivo_lectura_pseudopalabras WHERE id_reactivo = $1`;
            const result = await pool.query(query, [id_reactivo]);
            return result.rowCount > 0;
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('No se puede eliminar el reactivo porque tiene resultados asociados');
            }
            throw error;
        }
    }

    /**
     * Buscar reactivos por pseudopalabra
     * @param {string} searchTerm - Término de búsqueda
     * @param {Object} filters - Filtros adicionales
     * @returns {Array} - Reactivos encontrados
     */
    static async searchReactivos(searchTerm, filters = {}) {
        try {
            let query = `
                SELECT 
                    r.id_reactivo,
                    r.id_sub_tipo,
                    r.tiempo_duracion,
                    r.pseudopalabra,
                    r.created_at,
                    r.updated_at,
                    st.sub_tipo_nombre,
                    t.tipo_nombre
                FROM reactivo_lectura_pseudopalabras r
                JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
                JOIN Tipos t ON st.tipo = t.id_tipo
                WHERE r.pseudopalabra ILIKE $1
            `;
            
            const params = [`%${searchTerm}%`];

            // Filtro por sub-tipo
            if (filters.id_sub_tipo) {
                query += ` AND r.id_sub_tipo = $${params.length + 1}`;
                params.push(filters.id_sub_tipo);
            }

            query += ` ORDER BY r.pseudopalabra ASC`;
            
            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener estadísticas de reactivos
     * @returns {Object} - Estadísticas completas
     */
    static async getReactivosStats() {
        try {
            const statsQuery = `
                SELECT 
                    COUNT(r.id_reactivo) as total_reactivos,
                    AVG(r.tiempo_duracion) as tiempo_promedio,
                    MIN(r.tiempo_duracion) as tiempo_minimo,
                    MAX(r.tiempo_duracion) as tiempo_maximo,
                    COUNT(DISTINCT r.id_sub_tipo) as subtipos_con_reactivos
                FROM reactivo_lectura_pseudopalabras r
            `;
            
            const reactivosPorSubTipoQuery = `
                SELECT 
                    st.sub_tipo_nombre,
                    t.tipo_nombre,
                    COUNT(r.id_reactivo) as cantidad_reactivos,
                    AVG(r.tiempo_duracion) as tiempo_promedio_subtipo
                FROM reactivo_lectura_pseudopalabras r
                JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
                JOIN Tipos t ON st.tipo = t.id_tipo
                GROUP BY st.id_sub_tipo, st.sub_tipo_nombre, t.tipo_nombre
                ORDER BY cantidad_reactivos DESC
            `;

            const [statsResult, subTipoResult] = await Promise.all([
                pool.query(statsQuery),
                pool.query(reactivosPorSubTipoQuery)
            ]);

            return {
                general: statsResult.rows[0],
                por_subtipo: subTipoResult.rows
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener reactivos aleatorios para un ejercicio
     * @param {number} id_sub_tipo - ID del sub-tipo
     * @param {number} cantidad - Cantidad de reactivos a obtener
     * @returns {Array} - Reactivos aleatorios
     */
    static async getReactivosAleatorios(id_sub_tipo, cantidad = 10) {
        try {
            const query = `
                SELECT 
                    r.id_reactivo,
                    r.id_sub_tipo,
                    r.tiempo_duracion,
                    r.pseudopalabra,
                    r.created_at,
                    r.updated_at,
                    st.sub_tipo_nombre,
                    t.tipo_nombre
                FROM reactivo_lectura_pseudopalabras r
                JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
                JOIN Tipos t ON st.tipo = t.id_tipo
                WHERE r.id_sub_tipo = $1
                ORDER BY RANDOM()
                LIMIT $2
            `;
            const result = await pool.query(query, [id_sub_tipo, cantidad]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Asignar reactivo a un ejercicio
     * @param {number} id_reactivo - ID del reactivo
     * @param {number} ejercicio_id - ID del ejercicio
     * @param {number} orden_reactivo - Orden del reactivo en el ejercicio
     * @returns {Object} - Reactivo actualizado
     */
    static async asignarReactivoAEjercicio(id_reactivo, ejercicio_id, orden_reactivo = 1) {
        try {
            const query = `
                UPDATE reactivo_lectura_pseudopalabras 
                SET ejercicio_id = $1, orden_reactivo = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id_reactivo = $3
                RETURNING id_reactivo, id_sub_tipo, pseudopalabra, tiempo_duracion, 
                         ejercicio_id, orden_reactivo, created_at, updated_at
            `;
            const result = await pool.query(query, [ejercicio_id, orden_reactivo, id_reactivo]);
            
            if (result.rows.length === 0) {
                throw new Error('Reactivo no encontrado');
            }
            
            return result.rows[0];
        } catch (error) {
            if (error.code === '23503') {
                throw new Error('El ejercicio especificado no existe');
            }
            if (error.message.includes('no puede agregarse al ejercicio')) {
                throw new Error(error.message);
            }
            throw error;
        }
    }

    /**
     * Quitar reactivo de un ejercicio
     * @param {number} id_reactivo - ID del reactivo
     * @returns {Object} - Reactivo actualizado
     */
    static async quitarReactivoDeEjercicio(id_reactivo) {
        try {
            const query = `
                UPDATE reactivo_lectura_pseudopalabras 
                SET ejercicio_id = NULL, orden_reactivo = 1, updated_at = CURRENT_TIMESTAMP
                WHERE id_reactivo = $1
                RETURNING id_reactivo, id_sub_tipo, pseudopalabra, tiempo_duracion, 
                         ejercicio_id, orden_reactivo, created_at, updated_at
            `;
            const result = await pool.query(query, [id_reactivo]);
            
            if (result.rows.length === 0) {
                throw new Error('Reactivo no encontrado');
            }
            
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener reactivos de un ejercicio específico
     * @param {number} ejercicio_id - ID del ejercicio
     * @returns {Array} - Lista de reactivos del ejercicio
     */
    static async getReactivosPorEjercicio(ejercicio_id) {
        try {
            const query = `
                SELECT 
                    r.id_reactivo,
                    r.id_sub_tipo,
                    r.pseudopalabra,
                    r.tiempo_duracion,
                    r.ejercicio_id,
                    r.orden_reactivo,
                    r.created_at,
                    r.updated_at,
                    st.sub_tipo_nombre,
                    t.tipo_nombre,
                    e.titulo as ejercicio_titulo
                FROM reactivo_lectura_pseudopalabras r
                JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
                JOIN Tipos t ON st.tipo = t.id_tipo
                LEFT JOIN Ejercicios e ON r.ejercicio_id = e.ejercicio_id
                WHERE r.ejercicio_id = $1
                ORDER BY r.orden_reactivo ASC, r.created_at ASC
            `;
            const result = await pool.query(query, [ejercicio_id]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener reactivos sin asignar a ningún ejercicio
     * @param {Object} filters - Filtros opcionales
     * @returns {Array} - Lista de reactivos libres
     */
    static async getReactivosLibres(filters = {}) {
        try {
            let query = `
                SELECT 
                    r.id_reactivo,
                    r.id_sub_tipo,
                    r.pseudopalabra,
                    r.tiempo_duracion,
                    r.created_at,
                    r.updated_at,
                    st.sub_tipo_nombre,
                    t.tipo_nombre
                FROM reactivo_lectura_pseudopalabras r
                JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
                JOIN Tipos t ON st.tipo = t.id_tipo
                WHERE r.ejercicio_id IS NULL
            `;
            
            const params = [];
            const conditions = [];

            // Filtro por sub-tipo
            if (filters.id_sub_tipo) {
                conditions.push(`r.id_sub_tipo = $${params.length + 1}`);
                params.push(filters.id_sub_tipo);
            }

            // Filtro por tipo
            if (filters.tipo) {
                conditions.push(`t.id_tipo = $${params.length + 1}`);
                params.push(filters.tipo);
            }

            if (conditions.length > 0) {
                query += ` AND ${conditions.join(' AND ')}`;
            }

            query += ` ORDER BY r.created_at DESC`;

            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualizar orden de reactivos en un ejercicio
     * @param {number} ejercicio_id - ID del ejercicio
     * @param {Array} ordenReactivos - Array de {id_reactivo, orden_reactivo}
     * @returns {boolean} - Éxito de la operación
     */
    static async actualizarOrdenReactivos(ejercicio_id, ordenReactivos) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            
            for (const item of ordenReactivos) {
                const query = `
                    UPDATE reactivo_lectura_pseudopalabras 
                    SET orden_reactivo = $1, updated_at = CURRENT_TIMESTAMP
                    WHERE id_reactivo = $2 AND ejercicio_id = $3
                `;
                await client.query(query, [item.orden_reactivo, item.id_reactivo, ejercicio_id]);
            }
            
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Obtener reactivos aleatorios de un ejercicio específico
     * @param {number} ejercicio_id - ID del ejercicio
     * @param {number} cantidad - Cantidad de reactivos aleatorios
     * @returns {Array} - Reactivos aleatorios del ejercicio
     */
    static async getReactivosAleatoriosDeEjercicio(ejercicio_id, cantidad = 5) {
        try {
            const query = `
                SELECT 
                    r.id_reactivo,
                    r.id_sub_tipo,
                    r.pseudopalabra,
                    r.tiempo_duracion,
                    r.ejercicio_id,
                    r.orden_reactivo,
                    st.sub_tipo_nombre,
                    t.tipo_nombre
                FROM reactivo_lectura_pseudopalabras r
                JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
                JOIN Tipos t ON st.tipo = t.id_tipo
                WHERE r.ejercicio_id = $1
                ORDER BY RANDOM()
                LIMIT $2
            `;
            const result = await pool.query(query, [ejercicio_id, cantidad]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ReactivoLecturaPseudopalabra;
