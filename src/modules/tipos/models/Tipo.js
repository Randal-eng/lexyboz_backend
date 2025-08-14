const pool = require('../../../db/connection');

class Tipo {
    // Obtener todos los tipos con opción de incluir subtipos
    static async obtenerTodos(includeSubtipos = false) {
        try {
            if (includeSubtipos) {
                const query = `
                    SELECT 
                        t.id_tipo,
                        t.tipo_nombre,
                        t.created_at as tipo_created_at,
                        t.updated_at as tipo_updated_at,
                        JSON_AGG(
                            CASE 
                                WHEN st.id_sub_tipo IS NOT NULL THEN
                                    JSON_BUILD_OBJECT(
                                        'id_sub_tipo', st.id_sub_tipo,
                                        'sub_tipo_nombre', st.sub_tipo_nombre,
                                        'created_at', st.created_at,
                                        'updated_at', st.updated_at
                                    )
                                ELSE NULL
                            END
                        ) FILTER (WHERE st.id_sub_tipo IS NOT NULL) as sub_tipos
                    FROM tipos t
                    LEFT JOIN sub_tipo st ON t.id_tipo = st.tipo
                    GROUP BY t.id_tipo, t.tipo_nombre, t.created_at, t.updated_at
                    ORDER BY t.tipo_nombre ASC
                `;
                const result = await pool.query(query);
                return result.rows;
            } else {
                const query = `
                    SELECT 
                        id_tipo,
                        tipo_nombre,
                        created_at,
                        updated_at
                    FROM tipos
                    ORDER BY tipo_nombre ASC
                `;
                const result = await pool.query(query);
                return result.rows;
            }
        } catch (error) {
            console.error('Error al obtener tipos:', error);
            throw error;
        }
    }

    // Obtener tipo por ID
    static async obtenerPorId(id, includeSubtipos = false) {
        try {
            if (includeSubtipos) {
                const query = `
                    SELECT 
                        t.id_tipo,
                        t.tipo_nombre,
                        t.created_at as tipo_created_at,
                        t.updated_at as tipo_updated_at,
                        JSON_AGG(
                            CASE 
                                WHEN st.id_sub_tipo IS NOT NULL THEN
                                    JSON_BUILD_OBJECT(
                                        'id_sub_tipo', st.id_sub_tipo,
                                        'sub_tipo_nombre', st.sub_tipo_nombre,
                                        'created_at', st.created_at,
                                        'updated_at', st.updated_at
                                    )
                                ELSE NULL
                            END
                        ) FILTER (WHERE st.id_sub_tipo IS NOT NULL) as sub_tipos
                    FROM tipos t
                    LEFT JOIN sub_tipo st ON t.id_tipo = st.tipo
                    WHERE t.id_tipo = $1
                    GROUP BY t.id_tipo, t.tipo_nombre, t.created_at, t.updated_at
                `;
                const result = await pool.query(query, [id]);
                return result.rows[0] || null;
            } else {
                const query = `
                    SELECT 
                        id_tipo,
                        tipo_nombre,
                        created_at,
                        updated_at
                    FROM tipos
                    WHERE id_tipo = $1
                `;
                const result = await pool.query(query, [id]);
                return result.rows[0] || null;
            }
        } catch (error) {
            console.error('Error al obtener tipo por ID:', error);
            throw error;
        }
    }

    // Crear nuevo tipo
    static async crear(tipoNombre) {
        try {
            const query = `
                INSERT INTO tipos (tipo_nombre)
                VALUES ($1)
                RETURNING id_tipo, tipo_nombre, created_at, updated_at
            `;
            const result = await pool.query(query, [tipoNombre]);
            return result.rows[0];
        } catch (error) {
            console.error('Error al crear tipo:', error);
            throw error;
        }
    }

    // Actualizar tipo
    static async actualizar(id, tipoNombre) {
        try {
            const query = `
                UPDATE tipos 
                SET tipo_nombre = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id_tipo = $2
                RETURNING id_tipo, tipo_nombre, created_at, updated_at
            `;
            const result = await pool.query(query, [tipoNombre, id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error al actualizar tipo:', error);
            throw error;
        }
    }

    // Eliminar tipo
    static async eliminar(id) {
        try {
            const query = `
                DELETE FROM tipos 
                WHERE id_tipo = $1
                RETURNING id_tipo, tipo_nombre
            `;
            const result = await pool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error al eliminar tipo:', error);
            throw error;
        }
    }

    // Buscar tipos por nombre
    static async buscarPorNombre(termino) {
        try {
            const query = `
                SELECT 
                    id_tipo,
                    tipo_nombre,
                    created_at,
                    updated_at
                FROM tipos
                WHERE tipo_nombre ILIKE $1
                ORDER BY tipo_nombre ASC
            `;
            const result = await pool.query(query, [`%${termino}%`]);
            return result.rows;
        } catch (error) {
            console.error('Error al buscar tipos:', error);
            throw error;
        }
    }

    // Obtener estadísticas
    static async obtenerEstadisticas() {
        try {
            const query = `
                SELECT 
                    COUNT(t.id_tipo) as total_tipos,
                    COUNT(st.id_sub_tipo) as total_subtipos,
                    AVG(subtipo_count.count) as promedio_subtipos_por_tipo
                FROM tipos t
                LEFT JOIN sub_tipo st ON t.id_tipo = st.tipo
                LEFT JOIN (
                    SELECT tipo, COUNT(*) as count
                    FROM sub_tipo
                    GROUP BY tipo
                ) subtipo_count ON t.id_tipo = subtipo_count.tipo
            `;
            const result = await pool.query(query);
            return result.rows[0];
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }

    // Verificar si existe un tipo por nombre
    static async existePorNombre(nombre, excluirId = null) {
        try {
            let query = `
                SELECT id_tipo 
                FROM tipos 
                WHERE tipo_nombre = $1
            `;
            let params = [nombre];

            if (excluirId) {
                query += ` AND id_tipo != $2`;
                params.push(excluirId);
            }

            const result = await pool.query(query, params);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error al verificar existencia de tipo:', error);
            throw error;
        }
    }
}

module.exports = Tipo;
