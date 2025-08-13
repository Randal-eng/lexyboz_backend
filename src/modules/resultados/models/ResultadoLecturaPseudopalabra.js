const pool = require('../../../db/connection');
const Joi = require('joi');

// Esquema de validación para ResultadoLecturaPseudopalabra
const resultadoSchema = Joi.object({
    usuario_ID: Joi.number().integer().positive().required().messages({
        'number.base': 'El ID del usuario debe ser un número',
        'number.integer': 'El ID del usuario debe ser un número entero',
        'number.positive': 'El ID del usuario debe ser positivo',
        'any.required': 'El ID del usuario es requerido'
    }),
    id_reactivo: Joi.number().integer().positive().required().messages({
        'number.base': 'El ID del reactivo debe ser un número',
        'number.integer': 'El ID del reactivo debe ser un número entero',
        'number.positive': 'El ID del reactivo debe ser positivo',
        'any.required': 'El ID del reactivo es requerido'
    }),
    voz_usuario_URL: Joi.string().uri().max(500).optional().allow(null, '').messages({
        'string.uri': 'La URL del audio debe ser válida',
        'string.max': 'La URL no puede exceder 500 caracteres'
    }),
    tiempo_respuesta: Joi.number().integer().min(0).max(60000).optional().messages({
        'number.base': 'El tiempo de respuesta debe ser un número',
        'number.integer': 'El tiempo de respuesta debe ser un número entero',
        'number.min': 'El tiempo de respuesta no puede ser negativo',
        'number.max': 'El tiempo de respuesta no puede exceder 60000ms (1 minuto)'
    }),
    es_correcto: Joi.boolean().required().messages({
        'boolean.base': 'El campo es_correcto debe ser verdadero o falso',
        'any.required': 'El campo es_correcto es requerido'
    }),
    fecha_realizacion: Joi.date().optional().messages({
        'date.base': 'La fecha de realización debe ser una fecha válida'
    })
});

// Esquema de validación para actualización
const resultadoUpdateSchema = Joi.object({
    voz_usuario_URL: Joi.string().uri().max(500).optional().allow(null, '').messages({
        'string.uri': 'La URL del audio debe ser válida',
        'string.max': 'La URL no puede exceder 500 caracteres'
    }),
    tiempo_respuesta: Joi.number().integer().min(0).max(60000).optional().messages({
        'number.base': 'El tiempo de respuesta debe ser un número',
        'number.integer': 'El tiempo de respuesta debe ser un número entero',
        'number.min': 'El tiempo de respuesta no puede ser negativo',
        'number.max': 'El tiempo de respuesta no puede exceder 60000ms (1 minuto)'
    }),
    es_correcto: Joi.boolean().optional().messages({
        'boolean.base': 'El campo es_correcto debe ser verdadero o falso'
    })
});

class ResultadoLecturaPseudopalabra {
    /**
     * Crear un nuevo resultado
     * @param {Object} resultadoData - Datos del resultado
     * @returns {Object} - Resultado creado
     */
    static async createResultado(resultadoData) {
        // Validar datos
        const { error, value } = resultadoSchema.validate(resultadoData);
        if (error) {
            throw new Error(`Error de validación: ${error.details[0].message}`);
        }

        const { usuario_ID, id_reactivo, voz_usuario_URL, tiempo_respuesta, es_correcto, fecha_realizacion } = value;

        try {
            const query = `
                INSERT INTO Resultados_Lectura_Pseudopalabras 
                (usuario_ID, id_reactivo, voz_usuario_URL, tiempo_respuesta, es_correcto, fecha_realizacion) 
                VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_TIMESTAMP)) 
                RETURNING resultado_reactivo_usuario_ID, usuario_ID, id_reactivo, voz_usuario_URL, 
                         tiempo_respuesta, es_correcto, fecha_realizacion, created_at, updated_at
            `;
            const result = await pool.query(query, [
                usuario_ID, id_reactivo, voz_usuario_URL, tiempo_respuesta, es_correcto, fecha_realizacion
            ]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('El usuario o reactivo especificado no existe');
            }
            if (error.code === '23505') { // Unique violation
                throw new Error('El usuario ya tiene un resultado registrado para este reactivo');
            }
            throw error;
        }
    }

    /**
     * Obtener todos los resultados con filtros
     * @param {Object} filters - Filtros opcionales
     * @returns {Array} - Lista de resultados
     */
    static async getAllResultados(filters = {}) {
        try {
            let query = `
                SELECT 
                    res.resultado_reactivo_usuario_ID,
                    res.usuario_ID,
                    res.id_reactivo,
                    res.voz_usuario_URL,
                    res.tiempo_respuesta,
                    res.es_correcto,
                    res.fecha_realizacion,
                    res.created_at,
                    res.updated_at,
                    r.pseudopalabra,
                    r.tiempo_duracion,
                    st.sub_tipo_nombre,
                    t.tipo_nombre,
                    u.nombre as usuario_nombre
                FROM Resultados_Lectura_Pseudopalabras res
                JOIN reactivo_lectura_pseudopalabras r ON res.id_reactivo = r.id_reactivo
                JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
                JOIN Tipos t ON st.tipo = t.id_tipo
                JOIN Usuario u ON res.usuario_ID = u.usuario_id
            `;
            
            const params = [];
            const conditions = [];

            // Filtro por usuario
            if (filters.usuario_ID) {
                conditions.push(`res.usuario_ID = $${params.length + 1}`);
                params.push(filters.usuario_ID);
            }

            // Filtro por reactivo
            if (filters.id_reactivo) {
                conditions.push(`res.id_reactivo = $${params.length + 1}`);
                params.push(filters.id_reactivo);
            }

            // Filtro por correcto/incorrecto
            if (filters.es_correcto !== undefined) {
                conditions.push(`res.es_correcto = $${params.length + 1}`);
                params.push(filters.es_correcto);
            }

            // Filtro por fecha desde
            if (filters.fecha_desde) {
                conditions.push(`res.fecha_realizacion >= $${params.length + 1}`);
                params.push(filters.fecha_desde);
            }

            // Filtro por fecha hasta
            if (filters.fecha_hasta) {
                conditions.push(`res.fecha_realizacion <= $${params.length + 1}`);
                params.push(filters.fecha_hasta);
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }

            query += ` ORDER BY res.fecha_realizacion DESC`;

            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener resultado por ID
     * @param {number} resultado_ID - ID del resultado
     * @returns {Object} - Resultado encontrado
     */
    static async getResultadoById(resultado_ID) {
        try {
            const query = `
                SELECT 
                    res.resultado_reactivo_usuario_ID,
                    res.usuario_ID,
                    res.id_reactivo,
                    res.voz_usuario_URL,
                    res.tiempo_respuesta,
                    res.es_correcto,
                    res.fecha_realizacion,
                    res.created_at,
                    res.updated_at,
                    r.pseudopalabra,
                    r.tiempo_duracion,
                    st.sub_tipo_nombre,
                    t.tipo_nombre,
                    u.nombre as usuario_nombre
                FROM Resultados_Lectura_Pseudopalabras res
                JOIN reactivo_lectura_pseudopalabras r ON res.id_reactivo = r.id_reactivo
                JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
                JOIN Tipos t ON st.tipo = t.id_tipo
                JOIN Usuario u ON res.usuario_ID = u.usuario_id
                WHERE res.resultado_reactivo_usuario_ID = $1
            `;
            const result = await pool.query(query, [resultado_ID]);
            
            if (result.rows.length === 0) {
                throw new Error('Resultado no encontrado');
            }
            
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener resultados por usuario
     * @param {number} usuario_ID - ID del usuario
     * @param {Object} options - Opciones adicionales
     * @returns {Array} - Resultados del usuario
     */
    static async getResultadosByUsuario(usuario_ID, options = {}) {
        try {
            let query = `
                SELECT 
                    res.resultado_reactivo_usuario_ID,
                    res.usuario_ID,
                    res.id_reactivo,
                    res.voz_usuario_URL,
                    res.tiempo_respuesta,
                    res.es_correcto,
                    res.fecha_realizacion,
                    r.pseudopalabra,
                    r.tiempo_duracion,
                    st.sub_tipo_nombre,
                    t.tipo_nombre
                FROM Resultados_Lectura_Pseudopalabras res
                JOIN reactivo_lectura_pseudopalabras r ON res.id_reactivo = r.id_reactivo
                JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
                JOIN Tipos t ON st.tipo = t.id_tipo
                WHERE res.usuario_ID = $1
            `;

            const params = [usuario_ID];

            if (options.limit) {
                query += ` ORDER BY res.fecha_realizacion DESC LIMIT $${params.length + 1}`;
                params.push(options.limit);
            } else {
                query += ` ORDER BY res.fecha_realizacion DESC`;
            }

            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualizar resultado
     * @param {number} resultado_ID - ID del resultado
     * @param {Object} updateData - Datos a actualizar
     * @returns {Object} - Resultado actualizado
     */
    static async updateResultado(resultado_ID, updateData) {
        // Validar datos
        const { error, value } = resultadoUpdateSchema.validate(updateData);
        if (error) {
            throw new Error(`Error de validación: ${error.details[0].message}`);
        }

        // Verificar que el resultado existe
        await this.getResultadoById(resultado_ID);

        const { voz_usuario_URL, tiempo_respuesta, es_correcto } = value;

        try {
            const query = `
                UPDATE Resultados_Lectura_Pseudopalabras 
                SET voz_usuario_URL = COALESCE($1, voz_usuario_URL),
                    tiempo_respuesta = COALESCE($2, tiempo_respuesta),
                    es_correcto = COALESCE($3, es_correcto),
                    updated_at = CURRENT_TIMESTAMP
                WHERE resultado_reactivo_usuario_ID = $4
                RETURNING resultado_reactivo_usuario_ID, usuario_ID, id_reactivo, voz_usuario_URL, 
                         tiempo_respuesta, es_correcto, fecha_realizacion, created_at, updated_at
            `;
            const result = await pool.query(query, [voz_usuario_URL, tiempo_respuesta, es_correcto, resultado_ID]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Eliminar resultado
     * @param {number} resultado_ID - ID del resultado
     * @returns {boolean} - Éxito de la operación
     */
    static async deleteResultado(resultado_ID) {
        // Verificar que el resultado existe
        await this.getResultadoById(resultado_ID);

        try {
            const query = `DELETE FROM Resultados_Lectura_Pseudopalabras WHERE resultado_reactivo_usuario_ID = $1`;
            const result = await pool.query(query, [resultado_ID]);
            return result.rowCount > 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener estadísticas por usuario
     * @param {number} usuario_ID - ID del usuario
     * @returns {Object} - Estadísticas del usuario
     */
    static async getEstadisticasUsuario(usuario_ID) {
        try {
            const query = `
                SELECT 
                    COUNT(res.resultado_reactivo_usuario_ID) as total_ejercicios,
                    COUNT(CASE WHEN res.es_correcto = true THEN 1 END) as respuestas_correctas,
                    COUNT(CASE WHEN res.es_correcto = false THEN 1 END) as respuestas_incorrectas,
                    ROUND(
                        (COUNT(CASE WHEN res.es_correcto = true THEN 1 END) * 100.0 / 
                         NULLIF(COUNT(res.resultado_reactivo_usuario_ID), 0)), 2
                    ) as porcentaje_acierto,
                    AVG(res.tiempo_respuesta) as tiempo_promedio_respuesta,
                    MIN(res.tiempo_respuesta) as tiempo_minimo,
                    MAX(res.tiempo_respuesta) as tiempo_maximo,
                    MIN(res.fecha_realizacion) as primera_fecha,
                    MAX(res.fecha_realizacion) as ultima_fecha
                FROM Resultados_Lectura_Pseudopalabras res
                WHERE res.usuario_ID = $1
                GROUP BY res.usuario_ID
            `;
            const result = await pool.query(query, [usuario_ID]);
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener estadísticas por reactivo
     * @param {number} id_reactivo - ID del reactivo
     * @returns {Object} - Estadísticas del reactivo
     */
    static async getEstadisticasReactivo(id_reactivo) {
        try {
            const query = `
                SELECT 
                    r.pseudopalabra,
                    r.tiempo_duracion,
                    COUNT(res.resultado_reactivo_usuario_ID) as total_intentos,
                    COUNT(CASE WHEN res.es_correcto = true THEN 1 END) as respuestas_correctas,
                    COUNT(CASE WHEN res.es_correcto = false THEN 1 END) as respuestas_incorrectas,
                    ROUND(
                        (COUNT(CASE WHEN res.es_correcto = true THEN 1 END) * 100.0 / 
                         NULLIF(COUNT(res.resultado_reactivo_usuario_ID), 0)), 2
                    ) as porcentaje_acierto,
                    AVG(res.tiempo_respuesta) as tiempo_promedio_respuesta,
                    MIN(res.tiempo_respuesta) as tiempo_minimo_respuesta,
                    MAX(res.tiempo_respuesta) as tiempo_maximo_respuesta
                FROM reactivo_lectura_pseudopalabras r
                LEFT JOIN Resultados_Lectura_Pseudopalabras res ON r.id_reactivo = res.id_reactivo
                WHERE r.id_reactivo = $1
                GROUP BY r.id_reactivo, r.pseudopalabra, r.tiempo_duracion
            `;
            const result = await pool.query(query, [id_reactivo]);
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener ranking de usuarios
     * @param {number} limit - Límite de resultados
     * @returns {Array} - Ranking de usuarios
     */
    static async getRankingUsuarios(limit = 10) {
        try {
            const query = `
                SELECT 
                    res.usuario_ID,
                    u.nombre as usuario_nombre,
                    COUNT(res.resultado_reactivo_usuario_ID) as total_ejercicios,
                    COUNT(CASE WHEN res.es_correcto = true THEN 1 END) as respuestas_correctas,
                    ROUND(
                        (COUNT(CASE WHEN res.es_correcto = true THEN 1 END) * 100.0 / 
                         NULLIF(COUNT(res.resultado_reactivo_usuario_ID), 0)), 2
                    ) as porcentaje_acierto,
                    AVG(res.tiempo_respuesta) as tiempo_promedio_respuesta
                FROM Resultados_Lectura_Pseudopalabras res
                JOIN Usuario u ON res.usuario_ID = u.usuario_id
                GROUP BY res.usuario_ID, u.nombre
                HAVING COUNT(res.resultado_reactivo_usuario_ID) >= 3
                ORDER BY porcentaje_acierto DESC, tiempo_promedio_respuesta ASC
                LIMIT $1
            `;
            const result = await pool.query(query, [limit]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener reactivos más difíciles
     * @param {number} limit - Límite de resultados
     * @returns {Array} - Reactivos más difíciles
     */
    static async getReactivosMasDificiles(limit = 10) {
        try {
            const query = `
                SELECT 
                    r.id_reactivo,
                    r.pseudopalabra,
                    r.tiempo_duracion,
                    COUNT(res.resultado_reactivo_usuario_ID) as total_intentos,
                    ROUND(
                        (COUNT(CASE WHEN res.es_correcto = true THEN 1 END) * 100.0 / 
                         NULLIF(COUNT(res.resultado_reactivo_usuario_ID), 0)), 2
                    ) as porcentaje_acierto,
                    AVG(res.tiempo_respuesta) as tiempo_promedio_respuesta
                FROM reactivo_lectura_pseudopalabras r
                LEFT JOIN Resultados_Lectura_Pseudopalabras res ON r.id_reactivo = res.id_reactivo
                GROUP BY r.id_reactivo, r.pseudopalabra, r.tiempo_duracion
                HAVING COUNT(res.resultado_reactivo_usuario_ID) >= 3
                ORDER BY porcentaje_acierto ASC, total_intentos DESC
                LIMIT $1
            `;
            const result = await pool.query(query, [limit]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ResultadoLecturaPseudopalabra;
