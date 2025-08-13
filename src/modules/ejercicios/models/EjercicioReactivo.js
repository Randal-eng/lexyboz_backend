const pool = require('../../../db/connection');
const Joi = require('joi');

// Esquema de validación para agregar reactivo a ejercicio
const ejercicioReactivoSchema = Joi.object({
    ejercicio_id: Joi.number().integer().positive().required().messages({
        'number.base': 'El ID del ejercicio debe ser un número',
        'number.integer': 'El ID del ejercicio debe ser un número entero',
        'number.positive': 'El ID del ejercicio debe ser positivo',
        'any.required': 'El ID del ejercicio es requerido'
    }),
    id_reactivo: Joi.number().integer().positive().required().messages({
        'number.base': 'El ID del reactivo debe ser un número',
        'number.integer': 'El ID del reactivo debe ser un número entero',
        'number.positive': 'El ID del reactivo debe ser positivo',
        'any.required': 'El ID del reactivo es requerido'
    }),
    orden_reactivo: Joi.number().integer().min(1).optional().messages({
        'number.base': 'El orden debe ser un número',
        'number.integer': 'El orden debe ser un número entero',
        'number.min': 'El orden debe ser mayor a 0'
    })
});

// Esquema para agregar múltiples reactivos
const ejercicioReactivosMultipleSchema = Joi.object({
    ejercicio_id: Joi.number().integer().positive().required(),
    reactivos: Joi.array().items(
        Joi.object({
            id_reactivo: Joi.number().integer().positive().required(),
            orden_reactivo: Joi.number().integer().min(1).optional()
        })
    ).min(1).required().messages({
        'array.min': 'Debe incluir al menos un reactivo'
    })
});

class EjercicioReactivo {
    /**
     * Agregar un reactivo a un ejercicio
     * @param {Object} data - Datos del ejercicio-reactivo
     * @returns {Object} - Relación creada
     */
    static async agregarReactivoAEjercicio(data) {
        // Validar datos
        const { error, value } = ejercicioReactivoSchema.validate(data);
        if (error) {
            throw new Error(`Error de validación: ${error.details[0].message}`);
        }

        const { ejercicio_id, id_reactivo, orden_reactivo } = value;

        try {
            const query = `
                INSERT INTO Ejercicio_Reactivos (ejercicio_id, id_reactivo, orden_reactivo)
                VALUES ($1, $2, COALESCE($3, 1))
                RETURNING ejercicio_reactivo_id, ejercicio_id, id_reactivo, orden_reactivo, created_at, updated_at
            `;
            const result = await pool.query(query, [ejercicio_id, id_reactivo, orden_reactivo]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23503') {
                throw new Error('El ejercicio o reactivo especificado no existe');
            }
            if (error.code === '23505') {
                throw new Error('Este reactivo ya está asignado al ejercicio');
            }
            if (error.message.includes('no coincide con el tipo')) {
                throw new Error(error.message);
            }
            throw error;
        }
    }

    /**
     * Agregar múltiples reactivos a un ejercicio
     * @param {Object} data - Ejercicio y array de reactivos
     * @returns {Array} - Relaciones creadas
     */
    static async agregarMultiplesReactivosAEjercicio(data) {
        // Validar datos
        const { error, value } = ejercicioReactivosMultipleSchema.validate(data);
        if (error) {
            throw new Error(`Error de validación: ${error.details[0].message}`);
        }

        const { ejercicio_id, reactivos } = value;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            
            const resultados = [];
            for (let i = 0; i < reactivos.length; i++) {
                const reactivo = reactivos[i];
                const orden = reactivo.orden_reactivo || (i + 1);
                
                const query = `
                    INSERT INTO Ejercicio_Reactivos (ejercicio_id, id_reactivo, orden_reactivo)
                    VALUES ($1, $2, $3)
                    RETURNING ejercicio_reactivo_id, ejercicio_id, id_reactivo, orden_reactivo, created_at, updated_at
                `;
                const result = await client.query(query, [ejercicio_id, reactivo.id_reactivo, orden]);
                resultados.push(result.rows[0]);
            }
            
            await client.query('COMMIT');
            return resultados;
        } catch (error) {
            await client.query('ROLLBACK');
            if (error.code === '23503') {
                throw new Error('El ejercicio o algún reactivo especificado no existe');
            }
            if (error.code === '23505') {
                throw new Error('Uno o más reactivos ya están asignados al ejercicio');
            }
            if (error.message.includes('no coincide con el tipo')) {
                throw new Error(error.message);
            }
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Quitar reactivo de un ejercicio
     * @param {number} ejercicio_id - ID del ejercicio
     * @param {number} id_reactivo - ID del reactivo
     * @returns {boolean} - Éxito de la operación
     */
    static async quitarReactivoDeEjercicio(ejercicio_id, id_reactivo) {
        try {
            const query = `
                DELETE FROM Ejercicio_Reactivos 
                WHERE ejercicio_id = $1 AND id_reactivo = $2
                RETURNING ejercicio_reactivo_id
            `;
            const result = await pool.query(query, [ejercicio_id, id_reactivo]);
            
            if (result.rows.length === 0) {
                throw new Error('La relación ejercicio-reactivo no existe');
            }
            
            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener todos los reactivos de un ejercicio
     * @param {number} ejercicio_id - ID del ejercicio
     * @returns {Array} - Lista de reactivos del ejercicio
     */
    static async getReactivosPorEjercicio(ejercicio_id) {
        try {
            const query = `
                SELECT 
                    er.ejercicio_reactivo_id,
                    er.ejercicio_id,
                    er.id_reactivo,
                    er.orden_reactivo,
                    er.created_at as fecha_agregado,
                    r.pseudopalabra,
                    r.tiempo_duracion,
                    st.sub_tipo_nombre,
                    t.tipo_nombre,
                    e.titulo as ejercicio_titulo,
                    e.descripcion as ejercicio_descripcion
                FROM Ejercicio_Reactivos er
                JOIN reactivo_lectura_pseudopalabras r ON er.id_reactivo = r.id_reactivo
                JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
                JOIN Tipos t ON st.tipo = t.id_tipo
                JOIN Ejercicios e ON er.ejercicio_id = e.ejercicio_id
                WHERE er.ejercicio_id = $1
                ORDER BY er.orden_reactivo ASC, er.created_at ASC
            `;
            const result = await pool.query(query, [ejercicio_id]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener ejercicios que contienen un reactivo específico
     * @param {number} id_reactivo - ID del reactivo
     * @returns {Array} - Lista de ejercicios que contienen el reactivo
     */
    static async getEjerciciosPorReactivo(id_reactivo) {
        try {
            const query = `
                SELECT 
                    er.ejercicio_reactivo_id,
                    er.ejercicio_id,
                    er.id_reactivo,
                    er.orden_reactivo,
                    er.created_at as fecha_agregado,
                    e.titulo as ejercicio_titulo,
                    e.descripcion as ejercicio_descripcion,
                    e.tipo_ejercicio,
                    t.tipo_nombre
                FROM Ejercicio_Reactivos er
                JOIN Ejercicios e ON er.ejercicio_id = e.ejercicio_id
                LEFT JOIN Tipos t ON e.tipo_reactivo = t.id_tipo
                WHERE er.id_reactivo = $1
                ORDER BY e.titulo ASC
            `;
            const result = await pool.query(query, [id_reactivo]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualizar el orden de los reactivos en un ejercicio
     * @param {number} ejercicio_id - ID del ejercicio
     * @param {Array} reactivos_orden - Array con {id_reactivo, orden_reactivo}
     * @returns {boolean} - Éxito de la operación
     */
    static async actualizarOrdenReactivos(ejercicio_id, reactivos_orden) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            
            for (const item of reactivos_orden) {
                const query = `
                    UPDATE Ejercicio_Reactivos 
                    SET orden_reactivo = $1, updated_at = CURRENT_TIMESTAMP
                    WHERE ejercicio_id = $2 AND id_reactivo = $3
                `;
                await client.query(query, [item.orden_reactivo, ejercicio_id, item.id_reactivo]);
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
     * Obtener estadísticas de reactivos por ejercicio
     * @param {number} ejercicio_id - ID del ejercicio
     * @returns {Object} - Estadísticas del ejercicio
     */
    static async getEstadisticasEjercicio(ejercicio_id) {
        try {
            const query = `
                SELECT 
                    e.ejercicio_id,
                    e.titulo as ejercicio_titulo,
                    e.descripcion as ejercicio_descripcion,
                    t.tipo_nombre,
                    COUNT(er.id_reactivo) as total_reactivos,
                    COUNT(DISTINCT st.id_sub_tipo) as total_subtipos,
                    AVG(r.tiempo_duracion) as tiempo_promedio_reactivos,
                    MIN(r.tiempo_duracion) as tiempo_minimo,
                    MAX(r.tiempo_duracion) as tiempo_maximo
                FROM Ejercicios e
                LEFT JOIN Ejercicio_Reactivos er ON e.ejercicio_id = er.ejercicio_id
                LEFT JOIN reactivo_lectura_pseudopalabras r ON er.id_reactivo = r.id_reactivo
                LEFT JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
                LEFT JOIN Tipos t ON e.tipo_reactivo = t.id_tipo
                WHERE e.ejercicio_id = $1
                GROUP BY e.ejercicio_id, e.titulo, e.descripcion, t.tipo_nombre
            `;
            const result = await pool.query(query, [ejercicio_id]);
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verificar si un ejercicio tiene reactivos
     * @param {number} ejercicio_id - ID del ejercicio
     * @returns {boolean} - True si tiene reactivos
     */
    static async ejercicioTieneReactivos(ejercicio_id) {
        try {
            const query = `
                SELECT COUNT(*) as total
                FROM Ejercicio_Reactivos
                WHERE ejercicio_id = $1
            `;
            const result = await pool.query(query, [ejercicio_id]);
            return parseInt(result.rows[0].total) > 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener reactivos aleatorios de un ejercicio
     * @param {number} ejercicio_id - ID del ejercicio
     * @param {number} cantidad - Cantidad de reactivos a obtener
     * @returns {Array} - Reactivos aleatorios del ejercicio
     */
    static async getReactivosAleatoriosDeEjercicio(ejercicio_id, cantidad = 5) {
        try {
            const query = `
                SELECT 
                    er.ejercicio_reactivo_id,
                    er.id_reactivo,
                    er.orden_reactivo,
                    r.pseudopalabra,
                    r.tiempo_duracion,
                    st.sub_tipo_nombre,
                    t.tipo_nombre
                FROM Ejercicio_Reactivos er
                JOIN reactivo_lectura_pseudopalabras r ON er.id_reactivo = r.id_reactivo
                JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
                JOIN Tipos t ON st.tipo = t.id_tipo
                WHERE er.ejercicio_id = $1
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

module.exports = EjercicioReactivo;
